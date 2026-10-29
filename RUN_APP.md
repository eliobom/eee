# Cómo ejecutar la app mobile

## Opción 1: Usar Web (sin necesidad de build)

```bash
cd mobile
npx expo start --web
```

Esto abrirá la app en el navegador. Esta opción NO requiere desarrollo build y funciona inmediatamente.

## Opción 2: Usar Expo Go (Android/iOS físico)

Necesitas tener la app "Expo Go" instalada en tu dispositivo desde App Store/Play Store.

```bash
cd mobile
npx expo start
```

Luego escanea el QR code con tu teléfono. **Nota:** Las notificaciones push NO funcionarán en Expo Go.

## Opción 3: Development Build (requiere eas build)

```bash
cd mobile
eas build --platform ios --profile development
```

Esto crea un archivo .ipa/.apk que puedes instalar directamente. Las notificaciones push SÍ funcionarán.

## Solución de problemas

Si ves el error "No development build for this project is installed":
- Usa la Opción 1 o 2 arriba
- O ejecuta `eas build` primero para crear el development build
