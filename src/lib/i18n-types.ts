import enMessages from '@/messages/en.json';

type Messages = typeof enMessages;

type PathInto<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? PathInto<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = PathInto<Messages>;

/**
 * Type guard that checks whether a string is a valid translation key.
 * Walks the English messages tree to verify each segment exists.
 *
 * @param key - A dot-delimited key such as "home.title".
 * @returns `true` when the key resolves to a leaf in the English messages,
 *          narrowing the type to `TranslationKey`.
 */
export function isTranslationKey(key: string): key is TranslationKey {
  const segments = key.split('.');
  let current: Record<string, unknown> = enMessages as Record<string, unknown>;

  for (const segment of segments) {
    if (current[segment] === undefined) return false;
    current = current[segment] as Record<string, unknown>;
  }

  // The resolved value must be a string leaf, not an intermediate object.
  return typeof current === 'string';
}
