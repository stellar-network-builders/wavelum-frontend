import { readFileSync } from 'node:fs';

const path = '.env.example';
const lines = readFileSync(path, 'utf8').split(/\r?\n/);
const seen = new Set();
const errors = [];

for (let index = 0; index < lines.length; index += 1) {
  const match = lines[index].match(/^(NEXT_PUBLIC_[A-Z0-9_]+)=/);
  if (!match) continue;

  const variable = match[1];
  if (seen.has(variable)) {
    errors.push(`${variable}: duplicate declaration`);
  }
  seen.add(variable);

  const typeLine = lines[index - 1] ?? '';
  if (!typeLine.startsWith('# Type:')) {
    errors.push(`${variable}: expected a '# Type:' comment immediately above the declaration`);
  }
}

if (seen.size === 0) {
  errors.push('no NEXT_PUBLIC_* variables found');
}

if (errors.length > 0) {
  console.error(`.env.example validation failed:\n- ${errors.join('\n- ')}`);
  process.exit(1);
}

console.log(`.env.example documents types for ${seen.size} public variables.`);
