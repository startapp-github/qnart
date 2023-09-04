import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.communitychatmall.knc',
  appName: 'KN커채몰',
  webDir: 'www',
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      splashFullScreen: true,
      showSpinner: true,
      androidSpinnerStyle: 'small',
      iosSpinnerStyle: 'small',
      splashImmersive: true,
    },
  },
  ios: {
    preferredContentMode: 'mobile',
  },
};

export default config;
