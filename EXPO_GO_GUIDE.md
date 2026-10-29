# Guía de Despliegue en Expo Go

## 📱 ¿Qué es Expo Go?

Expo Go es una app pre-construida que permite ejecutar proyectos Expo sin necesidad de compilar código nativo. Es ideal para:
- Desarrollo rápido
- Prototipado
- Testing en dispositivos físicos

## ⚠️ Limitaciones Importantes

Antes de usar Expo Go, ten en cuenta estas limitaciones de tu proyecto:

### 1. Push Notifications
- **Local notifications**: ✅ Funcionan en Expo Go
- **Push notifications (remote)**: ❌ NO funcionan en Android con SDK 53+
- **Solución**: Para probar push notifications, necesitas un development build con `eas build`

### 2. Funcionalidades con Código Nativo Personalizado
El proyecto usa `expo-dev-client`, lo que indica que puede tener configuraciones nativas personalizadas. Expo Go tiene un conjunto fijo de librerías nativas.

## 🚀 Pasos para Desplegar en Expo Go

### Requisitos Previos
1. Tener la app **Expo Go** instalada en tu dispositivo:
   - iOS: Descargar desde App Store (soporta hasta SDK 54)
   - Android: Descargar desde Google Play o [expo.dev/go](https://expo.dev/go)

2. Tu proyecto usa **Expo SDK 54**, que es compatible con Expo Go en iOS

### Paso 1: Verificar la versión de Expo Go

```bash
# Revisar la versión de Expo en tu proyecto
npm list expo
```

El proyecto usa `expo ~54.0.35`, que es compatible con:
- ✅ iOS App Store (hasta SDK 54)
- ✅ Android Google Play (última versión)

### Paso 2: Iniciar el servidor de desarrollo

```bash
# Asegúrate de estar en el directorio del proyecto
cd /Users/eliantlm/Downloads/pa-app

# Instalar dependencias si es necesario
npm install

# Iniciar el servidor de desarrollo
npm start
# o
npx expo start
```

### Paso 3: Conectar con Expo Go

Opciones para conectar:

**Opción A: Escanear QR Code (Recomendado)**
1. En tu dispositivo, abre la app Expo Go
2. Toca "Scan QR code"
3. Escanea el QR code que aparece en tu terminal
4. La app se cargará automáticamente

**Opción B: Ingresar URL Manualmente**
1. En el terminal, presiona `w` para abrir en web, o `a` para Android, `i` para iOS
2. Ingresa la URL manualmente en Expo Go

**Opción C: Usar Expo Go desde el navegador**
1. En el terminal, presiona `w` para abrir en el navegador
2. La app se ejecutará en tu navegador (alternativa si no tienes dispositivo)

### Paso 4: Probar la App

Una vez cargada en Expo Go:
- Navega por las diferentes pantallas
- Prueba la autenticación con Supabase
- Verifica que los componentes se rendericen correctamente
- **NOTA**: Las push notifications remotas no funcionarán en Android

## 🔧 Configuración de Variables de Entorno

El proyecto usa variables de entorno en `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=https://mkljcmuoouoygkjtpsod.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Estas variables deberían cargarse automáticamente en Expo Go. Si hay problemas:

```bash
# Recargar las variables de entorno
# Detén el servidor (Ctrl+C)
# Reinicia
npm start
```

## ⚠️ Errores Comunes y Soluciones

### Error: "Project is incompatible with this version of Expo Go"

**Causa**: La versión de Expo Go instalada no coincide con el SDK del proyecto.

**Solución**:
1. Verifica que tu proyecto usa SDK 54 (compatible con iOS App Store)
2. Si usas Android, instala la versión específica desde [expo.dev/go](https://expo.dev/go)
3. O usa el comando:
   ```bash
   npx expo go
   ```

### Error: Las notificaciones push no funcionan

**Causa**: Expo Go no soporta push notifications en Android desde SDK 53.

**Solución**:
- Para probar push notifications, necesitas crear un development build:
  ```bash
  eas build --profile development --platform android
  ```
- O prueba en web (las notificaciones tienen comportamiento diferente)

### Error: Librerías nativas no funcionan

**Causa**: Algunas librerías con código nativo personalizado no están en Expo Go.

**Solución**:
- Verifica qué librerías causan el error
- Si es esencial, crea un development build con `eas build`
- Las librerías que SÍ funcionan en Expo Go:
  - ✅ @react-navigation/native
  - ✅ expo-linear-gradient
  - ✅ react-native-webview
  - ✅ react-native-reanimated
  - ✅ react-native-gesture-handler
  - ✅ expo-notifications (local notifications)

## 📊 Checklist para Expo Go

Antes de desplegar en Expo Go:

- [ ] Expo Go instalado en el dispositivo
- [ ] Versión de Expo Go compatible con SDK 54
- [ ] Dependencias instaladas (`npm install`)
- [ ] Variables de entorno configuradas en `.env`
- [ ] Servidor de desarrollo iniciado (`npm start`)
- [ ] Conexión estable con el dispositivo
- [ ] QR code escaneado o URL ingresada
- [ ] App cargando correctamente en Expo Go

## 🔄 Alternativa: Development Build

Si Expo Go tiene limitaciones que afectan tu app, considera crear un development build:

```bash
# Instalar EAS CLI
npx eas-cli@latest login

# Crear development build
eas build --profile development --platform ios
eas build --profile development --platform android
```

Esto crea una versión personalizada de Expo Go con todas tus librerías nativas.

## 📝 Resumen

- **Proyecto Compatible**: ✅ SDK 54 funciona con Expo Go en iOS y Android
- **Limitaciones**: ⚠️ Push notifications remotas en Android
- **Librerías Principales**: ✅ Funcionan en Expo Go
- **Recomendación**: Usa Expo Go para desarrollo y testing rápido, usa development build para funcionalidades avanzadas como push notifications

## 📞 Soporte

- Documentación oficial: https://docs.expo.dev/go
- Troubleshooting: https://docs.expo.dev/troubleshooting/expo-go-version-mismatch
- Foro: https://forums.expo.dev/

---

**Última actualización**: Octubre 2026
**Proyecto**: FitCoach (SDK 54)
