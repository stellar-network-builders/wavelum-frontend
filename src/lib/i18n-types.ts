import enMessages from '@/messages/en.json';

type Messages = typeof enMessages;

type PathInto<T, Prefix extends string = ''> = {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? PathInto<T[K], `${Prefix}${K}.`>
    : `${Prefix}${K}`;
}[keyof T & string];

export type TranslationKey = PathInto<Messages>;

export function isTranslationKey(key: string): key is TranslationKey {
  const segments = key.split('.');
  let current: Record<string, unknown> = enMessages as Record<string, unknown>;

  for (const segment of segments) {
    if (current[segment] === undefined) return false;
    current = current[segment] as Record<string, unknown>;
  }

  return true;
}
