import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const componentsDir = path.join(root, 'src', 'components');
const reportDir = path.join(root, 'reports');
const reportPath = path.join(reportDir, 'storybook-coverage.md');
const threshold = Number.parseFloat(process.env.STORYBOOK_COVERAGE_THRESHOLD ?? '50');

if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
  console.error('STORYBOOK_COVERAGE_THRESHOLD must be a number between 0 and 100.');
  process.exit(1);
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(entryPath));
    else files.push(entryPath);
  }
  return files;
}

const files = await walk(componentsDir);
const sourceFiles = files
  .filter((file) => /\.(tsx|jsx)$/.test(file))
  .filter((file) => !/\.stories\.[^.]+$/.test(file));

const stories = new Set(
  files
    .filter((file) => /\.stories\.(tsx|ts|jsx|js|mjs)$/.test(file))
    .map((file) => file.replace(/\.stories\.[^.]+$/, '')),
);

const componentKey = (file) => file.replace(/\.[^.]+$/, '');

const covered = sourceFiles.filter((file) => stories.has(componentKey(file)));
const missing = sourceFiles.filter((file) => !stories.has(componentKey(file)));
const coverage = sourceFiles.length === 0 ? 100 : (covered.length / sourceFiles.length) * 100;
const relative = (file) => path.relative(root, file).replaceAll(path.sep, '/');
const status = coverage >= threshold ? 'PASS' : 'FAIL';

const report = [
  '# Storybook coverage inventory',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  '| Metric | Value |',
  '| --- | ---: |',
  `| Components | ${sourceFiles.length} |`,
  `| Components with stories | ${covered.length} |`,
  `| Components without stories | ${missing.length} |`,
  `| Coverage | ${coverage.toFixed(1)}% |`,
  `| Minimum threshold | ${threshold.toFixed(1)}% |`,
  `| Status | **${status}** |`,
  '',
  '## Inventory',
  '',
  '| Component | Story | Status |',
  '| --- | --- | --- |',
  ...sourceFiles
    .sort()
    .map((file) => {
      const story = `${componentKey(file)}.stories`;
      return `| ${relative(file)} | ${stories.has(componentKey(file)) ? relative(story) + '.*' : '—'} | ${stories.has(componentKey(file)) ? 'Covered' : 'Missing'} |`;
    }),
  '',
  '## Missing stories',
  '',
  ...(missing.length > 0 ? missing.sort().map((file) => `- ${relative(file)}`) : ['- None']),
  '',
].join('\n');

await fs.mkdir(reportDir, { recursive: true });
await fs.writeFile(reportPath, report, 'utf8');

console.log(`Storybook coverage: ${covered.length}/${sourceFiles.length} components (${coverage.toFixed(1)}%)`);
console.log(`Minimum threshold: ${threshold.toFixed(1)}%`);
console.log(`Inventory report: ${relative(reportPath)}`);
if (missing.length > 0) {
  console.log('\nComponents missing stories:');
  for (const file of missing.sort()) console.log(`- ${relative(file)}`);
}

if (coverage < threshold) {
  console.error(`\nStorybook coverage is below the ${threshold.toFixed(1)}% minimum.`);
  process.exitCode = 1;
}
