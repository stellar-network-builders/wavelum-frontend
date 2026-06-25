import type { Preview } from '@storybook/nextjs-vite';
import '../app/globals.css';

const themeValues = {
  light: 'light',
  dark: 'dark',
} as const;

const preview: Preview = {
  globalTypes: {
    theme: {
      description: 'Preview theme',
      toolbar: {
        title: 'Theme',
        icon: 'mirror',
        items: [
          { value: themeValues.light, title: 'Light' },
          { value: themeValues.dark, title: 'Dark' },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    theme: themeValues.light,
  },
  decorators: [
    (Story, context) => {
      const theme = context.globals.theme === themeValues.dark ? themeValues.dark : themeValues.light;

      return (
        <div className={theme}>
          <div className="min-h-screen bg-background p-6 text-foreground">
            <Story />
          </div>
        </div>
      );
    },
  ],
  parameters: {
    backgrounds: {
      disable: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: 'todo',
    },
    docs: {
      toc: true,
    },
  },
};

export default preview;
