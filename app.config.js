import 'dotenv/config';

export default {
  expo: {
    name: 'FitCoach',
    slug: 'manuchi',
    owner: 'eliantlm',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'light',
    splash: {
      image: './assets/splash-icon.png',
      resizeMode: 'contain',
      backgroundColor: '#ffffff',
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.manuchii.fitcoach',
      buildNumber: '1.0.0',
      infoPlist: {
        NSCameraUsageDescription: 'Esta app necesita acceso a la cámara para grabar videos de ejercicios.',
        NSPhotoLibraryUsageDescription: 'Esta app necesita acceso a la galería para seleccionar videos de ejercicios.',
        NSLocationWhenInUseUsageDescription: 'Esta app usa la ubicación para clases en vivo locales.'
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#ffffff',
      },
      edgeToEdgeEnabled: true,
      package: 'com.manuchii.fitcoach',
      versionCode: 1,
      permissions: [
        'android.permission.INTERNET',
        'android.permission.CAMERA',
        'android.permission.READ_EXTERNAL_STORAGE',
        'android.permission.WRITE_EXTERNAL_STORAGE',
        'android.permission.ACCESS_FINE_LOCATION'
      ]
    },
    web: {
      favicon: './assets/favicon.png',
      name: 'FitCoach - Tu Entrenador Personal',
      shortName: 'FitCoach',
      lang: 'es',
      scope: '/',
      themeColor: '#4c669f',
      description: 'Tu entrenador personal en el bolsillo',
      meta: {
        viewport: 'width=device-width, initial-scale=1'
      },
      template: './web.html'
    },
    plugins: [
      'expo-font',
      'expo-av',
      // Solo activar notificaciones en plataformas móviles (iOS/Android)
      process.env.EXPO_OS !== 'web' ? [
        'expo-notifications',
        {
          icon: './assets/icon.png',
          color: '#ffffff',
          defaultChannel: 'default',
          sounds: []
        }
      ] : null,
    ].filter(Boolean),
    assetBundlePatterns: ['**/*'],
    scheme: 'manuchi',
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
      eas: {
        projectId: '532506a6-a22b-4f82-92f4-c43ee41d6dde',
      },
    },
    updates: {
      url: 'https://u.expo.dev/532506a6-a22b-4f82-92f4-c43ee41d6dde',
    },
    runtimeVersion: {
      policy: 'appVersion',
    },
  },
};
