# Guía de Despliegue de FitCoach en Expo

## 📋 Resumen del Proyecto
- **Nombre**: FitCoach
- **ID de Proyecto EAS**: 27c711a0-0eb8-426b-8a9c-90c239d6fc5d
- **Configuración**: Listo para despliegue en iOS, Android y Web
- **Estado**: ✅ Configuración completada

## 🔧 Configuraciones Realizadas

### 1. EAS Build Configuration (eas.json)
- ✅ CLI version: >= 19.0.8
- ✅ Development build con development client
- ✅ Preview build para iOS (simulator) y Android (APK)
- ✅ Production build con auto-increment

### 2. Configuración Web (app.config.js & app.json)
- ✅ Bundler: Metro
- ✅ Output: Static (para mejor rendimiento)
- ✅ Meta viewport para responsive design
- ✅ Project ID de EAS configurado

### 3. Corrección de Errores
- ✅ Variables no usadas eliminadas
- ✅ Imports no usados removidos
- ✅ Errores de lint corregidos

## 🚀 Pasos para Desplegar

### Opción 1: Despliegue Web (Recomendado para probar primero)

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor web de desarrollo
npm run web

# 3. Para construir versión de producción web
npx expo export:web

# 4. Los archivos estarán en la carpeta web-build/
# Puedes desplegarlos a cualquier hosting estático (Vercel, Netlify, etc.)
```

### Opción 2: Despliegue con EAS Build

#### Prerrequisitos
```bash
# Instalar EAS CLI (usando npx para evitar problemas de permisos)
npx eas-cli@latest --version

# Login en Expo
npx eas-cli@latest login
```

#### Build de Desarrollo
```bash
# Para probar en dispositivo/simulator
npx eas-cli@latest build --profile development --platform ios
npx eas-cli@latest build --profile development --platform android
```

#### Build de Preview
```bash
# Para compartir con testers
npx eas-cli@latest build --profile preview --platform ios
npx eas-cli@latest build --profile preview --platform android
```

#### Build de Producción
```bash
# Para App Store y Google Play
npx eas-cli@latest build --profile production --platform ios
npx eas-cli@latest build --profile production --platform android
```

### Opción 3: Despliegue Web con Expo Hosting

```bash
# Desplegar web a Expo Hosting
npx eas-cli@latest deploy

# O para un entorno específico
npx eas-cli@latest deploy --env production
```

## 📱 Configuración Responsive

El proyecto está configurado para ser responsive en web:

### Características Responsive
- **Viewport configurado**: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`
- **Layout adaptativo**: Usa Dimension API de React Native
- **Safe Area**: Implementado con react-native-safe-area-context
- **Gestures**: react-native-gesture-handler para interacciones táctiles

### Testing Responsive
```bash
# Iniciar web y abrir en navegador
npm run web

# Abrir DevTools del navegador (F12)
# Usar Device Toolbar para probar diferentes tamaños de pantalla
```

## 🔐 Variables de Entorno

Asegúrate de configurar las variables de entorno en tu archivo `.env`:

```env
EXPO_PUBLIC_SUPABASE_URL=tu_url_de_supabase
EXPO_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_de_supabase
```

Para EAS Build, también configura las variables en el dashboard de Expo:
1. Ve a https://expo.dev
2. Selecciona tu proyecto
3. Settings → Environment Variables
4. Agrega las mismas variables

## 📦 Estructura de Build

### Development
- iOS: Simulator only
- Android: APK (internal distribution)
- Development client habilitado

### Preview
- iOS: Simulator
- Android: APK
- Para testing interno

### Production
- iOS: IPA (para App Store)
- Android: APK/AAB (para Google Play)
- Auto-increment de versión habilitado

## 🧪 Testing Antes del Despliegue

```bash
# 1. Ejecutar lint
npm run lint

# 2. Corregir errores de lint automáticamente
npm run lint:fix

# 3. Formatear código
npm run format

# 4. Probar localmente
npm start

# 5. Probar web
npm run web
```

## 🌐 Despliegue Web a Hosting Externo

### Vercel
```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel
```

### Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Desplegar carpeta web-build
netlify deploy --prod --dir=web-build
```

### GitHub Pages
1. Exportar web: `npx expo export:web`
2. Subir carpeta `web-build` a tu repositorio
3. Configurar GitHub Pages en settings del repo

## 📊 Monitoreo

Después del despliegue:
- Usa Expo Dashboard para monitorear builds
- Configura Sentry o similar para error tracking
- Implementa analytics (puedes usar Expo Analytics)

## 🔧 Solución de Problemas Comunes

### Error de permisos al instalar EAS CLI
```bash
# Usa npx en lugar de instalación global
npx eas-cli@latest [comando]
```

### Build falla por variables de entorno
```bash
# Verifica que las variables estén configuradas en:
# 1. Archivo .env local
# 2. Expo Dashboard (para EAS Build)
```

### Web no funciona correctamente
```bash
# Limpia caché y reconstruye
rm -rf node_modules web-build
npm install
npx expo export:web
```

## ✅ Checklist de Despliegue

- [ ] Variables de entorno configuradas localmente
- [ ] Variables de entorno configuradas en Expo Dashboard
- [ ] Código sin errores de lint
- [ ] Testing local completado
- [ ] Configuración EAS verificada
- [ ] Assets (iconos, splash) presentes
- [ ] Permisos configurados correctamente
- [ ] Build de prueba exitoso
- [ ] Documentación actualizada

## 📞 Soporte

- Documentación oficial: https://docs.expo.dev
- EAS Build docs: https://docs.expo.dev/build/introduction/
- Foro de Expo: https://forums.expo.dev/

---

**Última actualización**: Mayo 2026
**Versión**: 1.0.0
