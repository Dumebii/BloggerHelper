#!/usr/bin/env python3
import subprocess
import os

os.chdir('/vercel/share/v0-project')

# Stage all changes
subprocess.run(['git', 'add', '-A'], check=True)

# Commit with the migration message
commit_msg = """fix: migrate from unavailable gemini-3.1-flash to gemini-3-flash

- Update all text generation routes (generate, copilot, long-form) to use gemini-3-flash
- Keep gemini-2.5-flash-image for image generation (3.x doesn't support image gen)
- Update architecture page references to reflect gemini-3-flash
- Resolves 404 errors: model gemini-3.1-flash not available in project

This ensures all routes use models available in the Vertex AI project while avoiding deprecated 2.5 models."""

subprocess.run(['git', 'commit', '-m', commit_msg], check=True)

print("✓ Changes committed successfully")
