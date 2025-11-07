// Script to push database schema to Neon
// Run with: node scripts/push-db.js

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🚀 Pushing database schema to Neon...\n');

const child = spawn('pnpm', ['db:push'], {
  cwd: projectRoot,
  stdio: ['pipe', 'inherit', 'inherit'],
  shell: true
});

// Auto-send "y" after a delay to confirm the prompt
setTimeout(() => {
  child.stdin.write('y\n');
}, 3000);

child.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database schema pushed successfully!');
  } else {
    console.log('\n❌ Failed to push database schema');
    process.exit(code);
  }
});
