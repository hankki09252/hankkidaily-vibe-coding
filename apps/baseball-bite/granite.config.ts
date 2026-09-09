import { defineConfig } from '@apps-in-toss/web-framework/config';

export default defineConfig({
  appName: 'baseball-bite',
  brand: {
    displayName: '야구한입',
    primaryColor: '#3182F6',
    icon: 'https://raw.githubusercontent.com/hankki09252/hankkidaily-vibe-coding/baseball-bite/apps/baseball-bite/public/logo.svg',
  },
  web: {
    host: 'localhost',
    port: 5173,
    commands: { dev: 'vite', build: 'vite build' },
  },
  permissions: [],
  outdir: 'dist',
  webViewProps: {
    type: 'partner',
    pullToRefreshEnabled: false,
    overScrollMode: 'never',
  },
});
