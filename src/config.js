// API Configuration
import { NativeModules } from 'react-native';

const devHost = (() => {
  const scriptURL = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptURL !== 'string') return 'localhost';

  const match = scriptURL.match(/^https?:\/\/([^/:]+)(?::\d+)?\//);
  return match?.[1] || 'localhost';
})();

export const API_BASE_URL = __DEV__
  ? `http://localhost:3000`  // Development - use localhost for Expo simulator
  : 'https://your-production-api.com';  // Production URL

// For Expo development on physical device/simulator, replace localhost with your computer's IP
// Find your IP: ifconfig (macOS/Linux) or ipconfig (Windows)
// Example: 'http://192.168.1.100:3000' or 'http://10.0.0.100:3000'