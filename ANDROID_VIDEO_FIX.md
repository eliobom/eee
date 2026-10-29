# 🔧 Corrección de Videos en Android

## ✅ Cambios Implementados

### 1. app.config.js
**Archivo**: `/Users/eliantlm/Downloads/pa-app/app.config.js`

#### Cambio 1: Permiso INTERNET agregado
- **Ubicación**: Sección `android.permissions` (línea 35)
- **Cambios**: Agregado `'android.permission.INTERNET'` como primer permiso
- **Razón**: Android requiere este permiso explícitamente para cargar contenido desde URLs remotas (Supabase Storage)

#### Cambio 2: Plugin expo-av agregado
- **Ubicación**: Sección `plugins` (línea 55)
- **Cambios**: Agregado `'expo-av'` a la lista de plugins
- **Razón**: expo-av requiere configuración específica en Android para reproducir videos correctamente

### 2. VideoPlayer.js
**Archivo**: `/Users/eliantlm/Downloads/pa-app/src/components/VideoPlayer.js`

#### Cambio 1: Configuración específica para Android (video normal)
- **Ubicación**: Función `renderNativeVideoPlayer()` (líneas 207-223)
- **Cambios agregados**:
  - `isLooping={false}` - Prevenir bucle infinito
  - `progressUpdateIntervalMillis={500}` - Actualización de progreso
  - `positionMillis={0}` - Iniciar desde el principio
- **Razón**: Android requiere estos parámetros explícitos para estabilidad en la reproducción

#### Cambio 2: Configuración específica para Android (fullscreen)
- **Ubicación**: Modal de pantalla completa (líneas 392-408)
- **Cambios agregados**: Mismos parámetros que el video normal
- **Razón**: Mantener consistencia entre modos normal y fullscreen

## 📋 Pasos para Aplicar los Cambios

### Paso 1: Limpiar y reconstruir el proyecto
```bash
# Detener cualquier servidor en ejecución
# Limpiar la caché de prebuild
npx expo prebuild --clean

# O alternativamente, si usas development build:
npx expo run:android --clear-cache
```

### Paso 2: Reinstalar la app en Android
```bash
# Compilar e instalar en dispositivo/emulador
npx expo run:android

# O si usas EAS
eas build --platform android
```

**IMPORTANTE**: Los cambios de permisos en `app.config.js` solo se aplican cuando reinstalas la app. No se aplican con actualizaciones OTA.

### Paso 3: Verificar la instalación
Después de reinstalar:
1. Abre la app en el dispositivo Android
2. Navega a una tarea o clase con video
3. Intenta reproducir el video
4. Verifica que:
   - El video carga correctamente
   - No muestra error de conexión
   - Los controles funcionan

## 🔍 Verificación de Permisos

Para verificar que el permiso INTERNET se aplicó correctamente:

```bash
# Ver el AndroidManifest.xml generado
cat android/app/src/main/AndroidManifest.xml

# Deberías ver esta línea:
# <uses-permission android:name="android.permission.INTERNET"/>
```

## 🐛 Solución de Problemas

### Si los videos siguen sin funcionar:

1. **Verificar el codec del video**:
   - Android es más estricto que iOS
   - Recomendado: H.264 para video, AAC para audio
   - Contenedor: MP4
   - Puedes verificar con: `ffprobe tu-video.mp4`

2. **Verificar errores en logcat**:
```bash
# Ver logs de Android en tiempo real
adb logcat | grep -i "expo-av\|video\|network"
```

3. **Verificar que la URL sea accesible**:
   - Abre la URL del video en el navegador del dispositivo Android
   - Si no carga, el problema es de red/permisos, no del código

4. **Probar con un video de prueba**:
   - Usa una URL de video pública conocida (ej: https://www.w3schools.com/html/mov_bbb.mp4)
   - Si este funciona, el problema es específico de tus videos de Supabase

## 📊 Formatos de Video Soportados

### Recomendados (mejor compatibilidad):
- **Contenedor**: `.mp4`
- **Video codec**: H.264 (AVC)
- **Audio codec**: AAC
- **Bitrate**: 2-5 Mbps para 720p

### Soportados (pueden tener problemas en algunos dispositivos):
- `.mov` (iOS preferred, Android variable)
- `.m4v` (similar a MP4)
- `.webm` (Android mejor que iOS)
- `.mkv` (variable)

### NO soportados:
- `.avi` (no soportado por expo-av)
- `.m3u8` (requiere configuración especial de HLS)

## 🎯 Resultado Esperado

Después de aplicar estos cambios:
- ✅ Los videos deberían cargar en Android igual que en iOS
- ✅ No debería haber errores de red
- ✅ Los controles de reproducción deberían funcionar
- ✅ El modo pantalla completa debería funcionar

## 📝 Notas Adicionales

- Estos cambios NO afectan a iOS
- Los cambios de permisos requieren reinstalación completa de la app
- Si usas EAS Build, necesitas generar un nuevo build
- La configuración de expo-av plugin maneja automáticamente la configuración nativa necesaria
