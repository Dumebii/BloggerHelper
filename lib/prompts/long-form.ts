/**
 * Long-form content generation prompt builder
 * CRITICAL: This is separate from buildGenerationPrompt in lib/prompts.ts
 * DO NOT modify buildGenerationPrompt - this is an additive feature
 */

export interface LongFormParams {
  context: string;
  personaVoice?: string;
  tone: 'professional' | 'casual' | 'technical' | 'storytelling';
  targetLength: number; // word count target
  structure: 'narrative' | 'listicle' | 'how-to' | 'opinion' | 'analysis';
  additionalInstructions?: string;
}

export interface LongFormSection {
  heading: string;
  content: string;
  wordCount: number;
}

export interface LongFormOutput {
  title: string;
  subtitle?: string;
  sections: LongFormSection[];
  totalWordCount: number;
  metadata: {
    tone: string;
    structure: string;
    generatedAt: string;
  };
}

const TONE_INSTRUCTIONS: Record<LongFormParams['tone'], string> = {
  professional: `
    Write in a professional, authoritative tone. Use precise language and industry-standard terminology.
    Maintain objectivity while being engaging. Avoid casual language, contractions, or overly informal expressions.
    Structure arguments logically with clear transitions between ideas.
  `,
  casual: `
    Write in a conversational, approachable tone. Use contractions naturally and address the reader directly.
    Include relatable examples and analogies. Keep sentences varied in length for natural rhythm.
    It's okay to inject personality and light humor where appropriate.
  `,
  technical: `
    Write with technical precision and depth. Include specific details, data points, and technical terminology.
    Explain complex concepts clearly without oversimplifying. Use code examples or technical diagrams descriptions where relevant.
    Maintain accuracy above all else - don't speculate on technical matters.
  `,
  storytelling: `
    Write with narrative flair and emotional engagement. Open with a compelling hook that draws readers in.
    Use vivid descriptions, scene-setting, and character development where applicable.
    Build tension and resolution throughout the piece. Make abstract concepts concrete through stories and examples.
  `,
};

const STRUCTURE_INSTRUCTIONS: Record<LongFormParams['structure'], string> = {
  narrative: `
    Structure as a flowing narrative with:
    - A compelling opening that hooks the reader
    - Rising action that builds understanding or tension
    - Clear thesis or central argument
    - Supporting evidence woven throughout
    - A satisfying conclusion that ties everything together
    
    Use smooth transitions between ideas. Don't use numbered lists or bullet points as the primary structure.
  `,
  listicle: `
    Structure as a numbered list article:
    - Start with a brief introduction (100-150 words)
    - Each list item should be a self-contained mini-section
    - Number each main point clearly
    - Include a brief conclusion that summarizes key takeaways
    
    Each list item should have: a clear heading, explanation, and ideally an example or actionable insight.
  `,
  'how-to': `
    Structure as an instructional guide:
    - Start with what the reader will learn/achieve
    - Include any prerequisites or setup needed
    - Break into clear, sequential steps
    - Each step should be actionable and specific
    - Include tips, warnings, or common mistakes where helpful
    - End with next steps or further resources
    
    Be specific enough that someone could follow along successfully.
  `,
  opinion: `
    Structure as a persuasive opinion piece:
    - Lead with a clear, bold thesis statement
    - Acknowledge counterarguments fairly
    - Build your case with evidence and reasoning
    - Use rhetorical techniques effectively
    - Close with a call to action or memorable conclusion
    
    Be confident in your position while remaining intellectually honest.
  `,
  analysis: `
    Structure as a deep-dive analysis:
    - Start with context and why this topic matters
    - Present your analytical framework or methodology
    - Examine multiple facets or perspectives
    - Include data, research, or expert sources where relevant
    - Draw insights and identify patterns
    - Conclude with implications or predictions
    
    Prioritize depth over breadth. Go beyond surface-level observations.
  `,
};

export function buildLongFormPrompt({
  context,
  personaVoice,
  tone,
  targetLength,
  structure,
  additionalInstructions,
}: LongFormParams): string {
  const toneInstructions = TONE_INSTRUCTIONS[tone];
  const structureInstructions = STRUCTURE_INSTRUCTIONS[structure];

  const personaSection = personaVoice
    ? `## Your Voice: ${personaVoice.substring(0, 100)}`
    : '';

  return `# LONG-FORM ARTICLE (~${targetLength} words, ${structure})

${personaSection}

## Context:
${context}

## Tone: ${tone}
${toneInstructions}

## Structure: ${structure}
${structureInstructions}

## JSON Output (no intro text):
\`\`\`json
{"title":"","subtitle":"","sections":[{"heading":"","content":"","wordCount":0}],"totalWordCount":0}
\`\`\`

${additionalInstructions ? `## Requirements:\n${additionalInstructions}` : ''}

Return ONLY valid JSON. ~${targetLength} words total.`.trim();
}

/**
 * Parse the LLM response into structured long-form output
 */
export function parseLongFormResponse(response: string): LongFormOutput | null {
  try {
    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = response.trim();
    
    // Remove markdown code blocks if present
    const codeBlockMatch = jsonStr.match(/^```(?:json)?\s*([\s\S]*?)```\s*$/);
    if (codeBlockMatch) {
      jsonStr = codeBlockMatch[1].trim();
    }
    
    // Try to find the first complete JSON object
    const firstBrace = jsonStr.indexOf('{');
    if (firstBrace === -1) {
      console.error('[LongForm] No JSON object found in response');
      return null;
    }
    
    // Find matching closing brace by counting braces
    let braceCount = 0;
    let lastBrace = -1;
    for (let i = firstBrace; i < jsonStr.length; i++) {
      if (jsonStr[i] === '{') braceCount++;
      if (jsonStr[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          lastBrace = i;
          break;
        }
      }
    }
    
    if (lastBrace === -1) {
      console.error('[LongForm] Incomplete JSON object - missing closing brace');
      return null;
    }
    
    // Extract the complete JSON object
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    
    // Clean up common JSON issues
    // Remove trailing commas before closing braces/brackets
    jsonStr = jsonStr.replace(/,(\s*[}\]])/g, '$1');
    
    const parsed = JSON.parse(jsonStr);
    
    // Validate required fields
    if (!parsed.title || !Array.isArray(parsed.sections)) {
      console.error('[LongForm] Invalid response structure - missing title or sections');
      return null;
    }
    
    return {
      title: parsed.title,
      subtitle: parsed.subtitle || undefined,
      sections: parsed.sections.map((s: any) => ({
        heading: s.heading || '',
        content: s.content || '',
        wordCount: s.wordCount || s.content?.split(/\s+/).length || 0,
      })),
      totalWordCount: parsed.totalWordCount || parsed.sections.reduce(
        (sum: number, s: any) => sum + (s.wordCount || 0), 
        0
      ),
      metadata: {
        tone: parsed.metadata?.tone || 'unknown',
        structure: parsed.metadata?.structure || 'unknown',
        generatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    console.error('[LongForm] Failed to parse response:', error);
    return null;
  }
}
