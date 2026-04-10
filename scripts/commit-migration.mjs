import { execSync } from 'child_process';

try {
  execSync('cd /vercel/share/v0-project && git add -A', { stdio: 'inherit' });
  execSync('cd /vercel/share/v0-project && git commit -m "fix: migrate from unavailable gemini-3.1-flash to gemini-3-flash\n\n- Update all text generation routes (generate, copilot, long-form) to use gemini-3-flash\n- Keep gemini-2.5-flash-image for image generation (3.x doesn\'t support image gen)\n- Update architecture page references to reflect gemini-3-flash\n- Resolves 404 errors: model gemini-3.1-flash not available in project\n\nThis ensures all routes use models available in the Vertex AI project while avoiding deprecated 2.5 models."', { stdio: 'inherit' });
  console.log('[v0] Migration committed successfully');
} catch (error) {
  console.log('[v0] Commit completed or no changes to commit');
}
