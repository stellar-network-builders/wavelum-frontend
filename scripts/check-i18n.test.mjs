import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const checker = fileURLToPath(new URL('./check-i18n.mjs', import.meta.url));

function check(reference, translated, configuredLocales = ['en', 'ja']) {
  const cwd = mkdtempSync(path.join(tmpdir(), 'sanctifier-i18n-'));
  try {
    mkdirSync(path.join(cwd, 'messages'));
    mkdirSync(path.join(cwd, 'i18n'));
    writeFileSync(path.join(cwd, 'messages/en.json'), JSON.stringify(reference));
    writeFileSync(path.join(cwd, 'messages/ja.json'), JSON.stringify(translated));
    writeFileSync(
      path.join(cwd, 'i18n/routing.ts'),
      `export const routing = defineRouting({ locales: ${JSON.stringify(configuredLocales)}, defaultLocale: 'en' });\n`,
    );
    return spawnSync(process.execPath, [checker], {
      cwd,
      encoding: 'utf8',
      env: { ...process.env, I18N_MIN_COVERAGE: '90' },
    });
  } finally {
    rmSync(cwd, { recursive: true, force: true });
  }
}

test('key parity cannot hide malformed or empty translation leaves', () => {
  for (const value of [null, [], ['text'], 0, false, '', '   ']) {
    const result = check({ common: { save: 'Save' } }, { common: { save: value } });
    assert.equal(result.status, 1, `unexpected success for ${JSON.stringify(value)}`);
    assert.match(result.stderr, /Translation "common\.save" must be a non-empty string/);
  }
});

test('reference catalog also requires real message strings', () => {
  const result = check({ common: { save: 123 } }, { common: { save: '保存' } });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Translation "common\.save"/);
});

test('valid nested locale strings still pass with complete coverage', () => {
  const result = check(
    { common: { save: 'Save', cancel: 'Cancel' } },
    { common: { save: '保存', cancel: 'キャンセル' } },
  );
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /i18n check passed/);
});

test('configured locale without a catalog fails closed', () => {
  const result = check(
    { common: { save: 'Save' } },
    { common: { save: 'Guardar' } },
    ['en', 'ja', 'ko'],
  );
  assert.equal(result.status, 1);
  assert.match(result.stderr, /missing messages\/ko\.json/);
});
