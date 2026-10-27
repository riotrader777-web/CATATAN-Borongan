import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.example.app',
  appName: 'riotrader777-web',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
