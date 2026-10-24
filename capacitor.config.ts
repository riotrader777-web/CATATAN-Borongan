import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.kalkulator.boronganproyek',
  appName: 'Kalkulator Borongan Proyek',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
