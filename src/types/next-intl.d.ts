import enMessages from '@/messages/en.json';

type Messages = typeof enMessages;

declare module 'next-intl' {
  interface AppConfig {
    Messages: Messages;
  }
}
