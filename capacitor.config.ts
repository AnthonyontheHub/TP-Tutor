import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.anthonyguera.tptutor',
  appName: 'TP Tutor',
  webDir: 'dist',
  plugins: {
    SocialLogin: {
      google: {
        webClientId: '784915926349-cfenp22743kln0kqm6q8rkchp3agup36.apps.googleusercontent.com',
      }
    }
  }
};

export default config;
