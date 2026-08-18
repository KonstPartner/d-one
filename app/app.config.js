import 'dotenv/config';

const appIcon = './src/assets/images/icon.png';
const splashIcon = './src/assets/images/splash-icon.png';

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
      googleServicesFile: process.env.GOOGLE_SERVICE_INFO_PLIST,

      supportsTablet: false,

      config: {
        usesNonExemptEncryption: false,
      },
    },

    android: {
      scheme: 'done.android.app',
      package: 'done.android.app',
      googleServicesFile: process.env.GOOGLE_SERVICES_JSON,
      permissions: ['com.android.alarm.permission.SET_ALARM'],
      allowBackup: false,

      icon: appIcon,

      adaptiveIcon: {
        foregroundImage: './src/assets/images/adaptive-icon-foreground.png',

        backgroundImage: './src/assets/images/adaptive-icon-background.png',

        monochromeImage: './src/assets/images/adaptive-icon-monochrome.png',
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
      [
        '@react-native-firebase/app',
        {
          ios: {
            disableSPM: true,
          },
        },
      ],
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
          image: splashIcon,
          imageWidth: 200,
          resizeMode: 'contain',
          backgroundColor: '#F9FAFB',

          dark: {
            image: splashIcon,
            backgroundColor: '#050505',
          },
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

      appCheck: {
        androidProvider: process.env.APP_CHECK_PROVIDER,
        androidDebugToken:
          process.env.APP_CHECK_PROVIDER === 'debug'
            ? process.env.ANDROID_APP_CHECK_DEBUG_TOKEN
            : undefined,
      },

      firebase: {
        apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
        measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
      },
    },
  },
};
