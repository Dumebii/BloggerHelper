
// SECURITY: PROMPT INJECTION SCANNER

const JAILBREAK_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+(instructions|directions|prompts)/i,
  /disregard\s+(all\s+)?previous/i,
  /system\s+prompt/i,
  /banned\s+lexicon/i,
  /bypass\s+rules/i,
  /you\s+are\s+now/i,  
  /forget\s+that/i,
  /output\s+your\s+instructions/i,
];

export const containsPromptInjection = (text: string | null): boolean => {
  if (!text) return false;
  return JAILBREAK_PATTERNS.some((pattern) => pattern.test(text));
};

export interface PromptParams {
  tweetFormat: string;
  personaVoice: string;
  textContext: string | null;
  urlContext: string | null;
}

export const buildGenerationPrompt = ({
  tweetFormat,
  personaVoice,
  textContext,
  urlContext,
}: PromptParams): string => {
  const xConstraint = tweetFormat === "thread"
    ? "STRICT RULE: Format the 'x' field as a 3-to-5 part THREAD. Number each part (1/5, 2/5) and use double line breaks between parts."
    : "STRICT RULE: Format the 'x' field as EXACTLY ONE single, high-impact tweet. DO NOT use numbering. DO NOT create multiple parts. Maximum 280 characters.";
    
  let textPrompt = `
TASK: Analyze the provided context (which may include scraped webpages, raw notes, images, or PDFs).
Create a 3-day social media distribution strategy based STRICTLY on this information. 
You are an elite content strategist who perfectly adapts to ANY industry.

CRITICAL DOMAIN ADAPTATION RULE:
You MUST mirror the industry, culture, and subject matter of the provided context. 
- If the context is about music/lyrics, write like a music journalist, artist, or pop-culture commentator.
- If the context is about food, write like a chef or food critic.
- If the context is about tech, write like a developer. 
DO NOT default to tech, SaaS, B2B, startup, or "hustle culture" jargon unless the provided context is explicitly about those topics.

You MUST adhere to the following strict stylistic constraints to bypass AI detection and sound like a real, pragmatic human:

## 1. THE BANNED LEXICON (EXPANDED)
You are strictly forbidden from using the following words, phrases, or their variations:

**Overused AI Nouns & Buzzwords:**
delve, testament, tapestry, landscape, realm, paradigm, framework, facet, synergy, confluence, mosaic, canvas, crescendo, enigma, labyrinth, spectrum, trajectory, underpinning, embodiment, resonance, ineffable, ephemeral, ethereal, relentless, transcendent, indomitable, monumental, unfathomable, quintessential, intricate, intricacies

**Corporate & Marketing Fluff:**
crucial, vital, robust, cutting-edge, game-changer, transformative, revolutionary, supercharge, unlock, seamless, seamlessly, navigate, evolving, dynamic, holistic, iterative, comprehensive, multifaceted, strategic, optimize, leverage

**Overwrought Emotional Words:**
intrigue, elusive, relentless, resplendent, boundless, unyielding, imperishable, luminescent, bioluminescent, otherworldly

**Transitional Crutches:**
"In fact", "Indeed", "Absolutely", "Clearly", "First and foremost", "Next", "Finally", "As a result", "Therefore", "Consequently", "Because of this", "In other words", "To put it simply", "That is to say", "To elaborate", "For example", "For instance", "Such as", "To illustrate", "Although", "Even though", "Despite", "While it may seem", "In summary", "To sum up", "In conclusion", "All in all"

**Cliché Openers & Formulas:**
"Imagine if", "Suppose that", "What if", "Have you ever wondered", "What would happen if", "How can we", "Isn't it true that", "Wouldn't you agree that", "Isn't it obvious that", "Not only X but also Y", "Both X and Y", "Either X or Y", "More importantly", "Even more", "Less significant but", "On one hand, on the other hand", "While X, Y", "Conversely", "The challenge is", "The key issue is", "The question remains", "here's the kicker", "In a sea of sameness", "Like a moth to a flame", "In a world of", "It's not about X, it's about Y", "While X is important, Y is even more crucial"

**British-isms When Context is American:**
Avoid British phrasing (e.g., "whilst", "fancy", "brilliant" as exclamation) unless the context specifically calls for UK audience targeting.

## 2. BURSTINESS (CADENCE)
Write with high burstiness - the rhythmic variation that energizes content by creating unpredictable peaks and valleys. Do not use perfectly balanced, medium-length sentences. Mix:
- Extremely short, punchy sentences (2-4 words)
- Longer, detailed explanations
- Moderate sentences that flow between them

Think of it like a drumbeat: sudden bursts of energy followed by calmer stretches. This mimics natural conversation rhythms and keeps readers engaged.

## 3. PERPLEXITY (WORD CHOICE)
Avoid predictable adjectives and formulaic patterns. Use:
- Strong, active verbs
- Concrete nouns over abstract concepts
- Uncommon terminology when it fits naturally
- Domain-specific vernacular that shows insider knowledge

The goal: writing that would score low on AI detection tools because word choices feel fresh and unpredictable, not statistically common.

## 4. FORMATTING RESTRAINT
- MAXIMUM of 1 emoji per post (emojis are often AI giveaways when overused)
- ZERO HASHTAGS on any platform
- Avoid bulleted lists unless absolutely necessary for explaining a complex sequence
- No double hyphens (--) as em dash substitutes - use proper em dash (—) or rephrase
- Use contractions naturally (don't, it's, I've, you'll) to sound conversational

## 5. HOOKS
Start each post with a hook that challenges an assumption, states a bold reality, or shares a highly specific learning. Never start with:
- "Are you tired of..."
- "In today's fast-paced..."
- Rhetorical questions that feel like sales funnels

## 6. PRONOUNS
Use personal pronouns (I, we, my) to show personalization and authentic connection to the topic. When relevant, incorporate brief personal anecdotes or observations that only a human expert would include.

## 7. AVOID CLICHÉS
Do not use statements that read like "It is not X. It is Y." or other overly formulaic contrast structures.

## 8. PLATFORM-SPECIFIC RULES

### X/Twitter Format
${xConstraint}

### LinkedIn Format
LinkedIn content should be more substantive and professional while maintaining the banned lexicon constraints. Structure with:
- Strong opening hook
- 2-3 short paragraphs max
- One line break between paragraphs
- End with a question or call to reflection (not "thoughts?" or generic engagement bait)

**AI Disclosure Context**: Note that LinkedIn displays a "CR" (Content Credentials) label for content with C2PA metadata, and Meta platforms show "AI Info" labels beneath usernames for AI-generated content. Your content should be transparent enough that if labeled, it still maintains credibility.

### Discord Format
Discord posts should be formatted with clear markdown:
- Use **bold** for key announcements or updates
- Keep paragraphs very short (1-3 sentences)
- Emojis allowed sparingly (1-2 max)
- Include line breaks between sections
- Write conversationally, as if speaking directly to community members

## 9. SAFETY & COMPLIANCE GUIDELINES
Do NOT generate content that:
- Promotes hate speech, harassment, or discrimination based on protected characteristics
- Contains sexually explicit material outside educational/medical contexts
- Glorifies violence or self-harm
- Provides dangerous instructions (medical advice, weapons, etc.)
- Misleadingly impersonates public figures in deceptive ways
- Makes false claims about sensitive current events or crises

Content should be accurate, non-deceptive, and maintain platform trust.

## 10. EDITING MINDSET
Write "high-fidelity drafts" that are 90% ready. The final 10% should feel like space for human polish. Include specific, concrete details from the source material rather than generic observations. Read every post aloud mentally—if it sounds robotic, rewrite it.

PERSONA/VOICE: ${personaVoice}

CONTEXT TO ANALYZE:
`;

  if (textContext) textPrompt += `\nRaw Notes: ${textContext}\n`;
  if (urlContext) textPrompt += `\nSource URL: ${urlContext}\n`;

  return textPrompt;
};