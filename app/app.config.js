import 'dotenv/config';

const appIcon = './src/assets/images/icon.png';

export default {
  expo: {
    name: 'DOne',
    slug: 'd-one',
    version: '1.0.0',
    scheme: 'done',

    orientation: 'default',
    userInterfaceStyle: 'automatic',
    newArchEnabled: true,
    icon: appIcon,

    ios: {
      scheme: 'done.app.ios',
      bundleIdentifier: 'done.app.ios',
      googleServicesFile: './GoogleService-Info.plist',

      supportsTablet: false,

      config: {
        usesNonExemptEncryption: false,
      },
    },

    android: {
      scheme: 'done.android.app',
      package: 'done.android.app',
      googleServicesFile: './google-services.json',

      allowBackup: false,

      adaptiveIcon: {
        foregroundImage: appIcon,
        backgroundColor: '#ffffff',
      },

      userInterfaceStyle: 'automatic',
    },

    web: {
      bundler: 'metro',
      output: 'static',
      favicon: './src/assets/images/favicon.png',
      lang: 'en',
    },

    plugins: [
      '@react-native-firebase/app',
      '@react-native-firebase/app-check',
      [
        'expo-router',
        {
          root: './app',
        },
      ],

      [
        'expo-splash-screen',
        {
          image: appIcon,
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#ffffff',
        },
      ],

      [
        'expo-localization',
        {
          supportedLocales: {
            android: ['en', 'ru'],
            ios: ['en', 'ru'],
          },
        },
      ],

      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow D-One to select a diary photo from your photo library.',
          cameraPermission: 'Allow D-One to take a photo for a diary entry.',

          microphonePermission: false,
        },
      ],

      [
        'expo-screen-orientation',
        {
          initialOrientation: 'PORTRAIT_UP',
        },
      ],
      'expo-sqlite',
      'expo-secure-store',
      [
        'expo-build-properties',
        {
          ios: {
            deploymentTarget: '15.5',
            useFrameworks: 'static',
          },
        },
      ],
    ],

    experiments: {
      typedRoutes: true,
    },

    extra: {
      publicAppUrl: process.env.EXPO_PUBLIC_APP_URL,
      webGoogleClientId: process.env.WEB_GOOGLE_CLIENT_ID,
      androidGoogleClientId: process.env.ANDROID_GOOGLE_CLIENT_ID,
      iosGoogleClientId: process.env.IOS_GOOGLE_CLIENT_ID,

      apiBaseUrl: process.env.EXPO_PUBLIC_AI_API_URL,

      eas: {
        projectId: process.env.EXPO_PUBLIC_EAS_PROJECT_ID,
      },
    },
  },
};
