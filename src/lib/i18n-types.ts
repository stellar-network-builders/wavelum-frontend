import enMessages from '@/messages/en.json';

type Messages = typeof enMessages;

type PathInto<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? PathInto<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

/**
 * A type-safe translation key derived from the English message catalog.
 * Autocomplete will only suggest keys that actually exist.
 */
export type TranslationKey = PathInto<Messages>;

/**
 * Runtime type guard that checks whether a string is a valid translation key.
 * Walks the English message tree and returns `true` if the dotted path exists.
 *
 * @param key - A dotted path, e.g. "Common.buttons.submit".
 * @returns `true` if the key exists in the English message catalog.
 */
export function isTranslationKey(key: string): key is TranslationKey {
  const segments = key.split('.');
  let current: Record<string, unknown> = enMessages as Record<string, unknown>;

  for (const segment of segments) {
    if (current[segment] === undefined) return false;
    current = current[segment] as Record<string, unknown>;
  }

  return true;
}
