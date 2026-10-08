import { promises as fs } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const messagesDir = path.join(root, 'messages');
const routingConfigPath = path.join(root, 'i18n', 'routing.ts');
const scanDirs = ['app', 'src'];
const referenceLocale = 'en';
const coverageSetting = (process.env.I18N_MIN_COVERAGE ?? '90').trim();
const MIN_COVERAGE = Number(coverageSetting);

const TRANSLATOR_BINDING_PATTERN =
  /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\s*\(([^)]*)\)/g;
const TRANSLATOR_CALL_PATTERN = (name) =>
  new RegExp(`\\b${name}(?:\\s*\\.\\s*(?:rich|markup|raw))?\\s*\\(\\s*['"]([^'"]+)['"]`, 'g');

function flattenMessages(node, prefix, out) {
  // next-intl accepts nested namespaces with string message leaves. An array,
  // null, numeric or empty leaf is not a usable translation; merely counting
  // its key as present would let CI approve a broken runtime locale.
  if (node === null || Array.isArray(node) || typeof node !== 'object') {
    throw new Error(`Translation namespace "${prefix || '<root>'}" must be an object.`);
  }
  for (const [key, value] of Object.entries(node)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      flattenMessages(value, fullKey, out);
    } else {
      if (typeof value !== 'string' || value.trim().length === 0) {
        throw new Error(`Translation "${fullKey}" must be a non-empty string.`);
      }
      out.set(fullKey, value);
    }
  }
  return out;
}

async function loadConfiguredLocales() {
  const source = await fs.readFile(routingConfigPath, 'utf8');
  const localeList = source.match(/\blocales\s*:\s*\[([\s\S]*?)\]/);
  if (!localeList) {
    throw new Error('i18n/routing.ts must define a literal locales array.');
  }
  const locales = [...localeList[1].matchAll(/(['"])([^'"]+)\1/g)].map((match) => match[2]);
  if (locales.length === 0 || new Set(locales).size !== locales.length) {
    throw new Error('i18n/routing.ts locales must be a non-empty list of unique string literals.');
  }
  return locales;
}

async function loadLocales() {
  const entries = await fs.readdir(messagesDir);
  const locales = new Map();
  for (const file of entries.filter((f) => f.endsWith('.json')).sort()) {
    const locale = path.basename(file, '.json');
    const raw = await fs.readFile(path.join(messagesDir, file), 'utf8');
    const flat = flattenMessages(JSON.parse(raw), '', new Map());
    if (flat.size === 0) {
      throw new Error(`Locale messages/${file} must contain at least one translation key.`);
    }
    locales.set(locale, flat);
  }
  return locales;
}

async function walk(dir) {
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...await walk(fullPath));
    else if (/\.(tsx?|jsx?)$/.test(entry.name)) files.push(fullPath);
  }
  return files;
}

function collectUsedKeys(content) {
  const used = new Set();
  const bindings = new Map();
  for (const match of content.matchAll(TRANSLATOR_BINDING_PATTERN)) {
    const args = match[2] ?? '';
    const nsArg = args.match(/['"]([^'"]+)['"]/);
    const nsProp = args.match(/namespace\s*:\s*['"]([^'"]+)['"]/);
    bindings.set(match[1], (nsProp ?? nsArg)?.[1] ?? '');
  }
  for (const [name, namespace] of bindings) {
    for (const call of content.matchAll(TRANSLATOR_CALL_PATTERN(name))) {
      used.add(namespace ? `${namespace}.${call[1]}` : call[1]);
    }
  }
  return used;
}

async function main() {
  if (
    coverageSetting === '' ||
    !Number.isFinite(MIN_COVERAGE) ||
    MIN_COVERAGE < 0 ||
    MIN_COVERAGE > 100
  ) {
    throw new Error('I18N_MIN_COVERAGE must be a number between 0 and 100.');
  }

  const configuredLocales = await loadConfiguredLocales();
  const locales = await loadLocales();
  const configuredSet = new Set(configuredLocales);
  const missingCatalogs = configuredLocales.filter((locale) => !locales.has(locale));
  const unexpectedCatalogs = [...locales.keys()].filter((locale) => !configuredSet.has(locale));
  if (missingCatalogs.length > 0 || unexpectedCatalogs.length > 0) {
    const problems = [];
    if (missingCatalogs.length > 0) {
      problems.push(`missing ${missingCatalogs.map((locale) => `messages/${locale}.json`).join(', ')}`);
    }
    if (unexpectedCatalogs.length > 0) {
      problems.push(`not configured: ${unexpectedCatalogs.map((locale) => `messages/${locale}.json`).join(', ')}`);
    }
    throw new Error(`Locale catalog set must match i18n/routing.ts (${problems.join('; ')}).`);
  }
  if (!configuredSet.has(referenceLocale)) {
    throw new Error(`Reference locale ${referenceLocale} is not configured in i18n/routing.ts.`);
  }
  if (!locales.has(referenceLocale)) {
    console.error(`Reference locale messages/${referenceLocale}.json not found.`);
    process.exit(1);
  }

  const failures = [];
  const warnings = [];

  const allKeys = new Set();
  for (const flat of locales.values()) for (const key of flat.keys()) allKeys.add(key);

  console.log(`Locales: ${[...locales.keys()].join(', ')} (${allKeys.size} distinct keys)`);

  for (const [locale, flat] of locales) {
    const missing = [...allKeys].filter((k) => !flat.has(k)).sort();
    if (missing.length > 0) {
      failures.push(`${locale}: ${missing.length} missing key(s): ${missing.join(', ')}`);
    }
  }

  const reference = locales.get(referenceLocale);
  for (const [locale, flat] of locales) {
    if (locale === referenceLocale) continue;
    let untranslated = 0;
    for (const [key, refValue] of reference) {
      if (!flat.has(key)) continue;
      const value = flat.get(key);
      if (String(value).trim() === '' || value === refValue) untranslated += 1;
    }
    const coverage = ((flat.size - untranslated) / flat.size) * 100;
    console.log(`${locale}: ${flat.size} keys, ${untranslated} untranslated, coverage ${coverage.toFixed(1)}%`);
    if (coverage < MIN_COVERAGE) {
      failures.push(`${locale}: translation coverage ${coverage.toFixed(1)}% is below ${MIN_COVERAGE}%`);
    }
  }

  const sourceFiles = (await Promise.all(scanDirs.map((d) => walk(path.join(root, d))))).flat();
  const usedKeys = new Set();
  for (const file of sourceFiles) {
    for (const key of collectUsedKeys(await fs.readFile(file, 'utf8'))) usedKeys.add(key);
  }
  const unused = [...allKeys].filter((k) => !usedKeys.has(k)).sort();
  if (unused.length > 0) {
    warnings.push(`${unused.length} unused key(s) (not referenced by useTranslations/getTranslations call sites): ${unused.join(', ')}`);
  }

  for (const warning of warnings) console.warn(`warning: ${warning}`);
  if (failures.length > 0) {
    for (const failure of failures) console.error(`error: ${failure}`);
    console.error(`\ni18n check failed: ${failures.length} error(s), ${warnings.length} warning(s).`);
    process.exit(1);
  }
  console.log(`i18n check passed: ${locales.size} locales in parity, ${warnings.length} unused-key warning(s).`);
}

main().catch((err) => {
  console.error('i18n check failed:', err);
  process.exit(1);
});
