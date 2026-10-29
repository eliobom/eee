# Development Build Setup

## Why Development Build?

Expo Go no longer supports push notifications (remote notifications) starting from SDK 53. To use push notifications, you need to create a development build.

## Setup Instructions

### 1. Install Dependencies

```bash
cd mobile
npm install
```

### 2. Configure EAS Build

If you haven't already, configure EAS Build:

```bash
eas build:configure
```

### 3. Login to Expo

```bash
eas login
```

### 4. Create Development Build

#### For Android Emulator/Device:
```bash
eas build --platform android --profile development
```

#### For iOS Simulator:
```bash
eas build --platform ios --profile development
```

### 5. Install the Build

- **Android**: Download the APK from the EAS Build dashboard and install it on your device/emulator
- **iOS**: Download the .ipa file and install on your simulator or device

### 6. Run the App

Instead of using `expo start`, use:

```bash
npx expo start --dev-client
```

This will connect to your development build.

## Files Modified

- `package.json`: Added `expo-dev-client` dependency
- `app.json`: Added expo-notifications plugin configuration
- `eas.json`: Created with development, preview, and production build profiles

## Push Notifications Testing

Once you have the development build installed:

1. Open the app and log in
2. The app will request notification permissions
3. Push tokens will be automatically registered with your backend
4. You can test notifications from the admin dashboard

## Troubleshooting

- If you see the Expo Go warning, make sure you're using the development build, not Expo Go
- For Android, make sure you have a valid Google Cloud project with FCM enabled
- For iOS, make sure you have configured APNs properly in your Expo account
