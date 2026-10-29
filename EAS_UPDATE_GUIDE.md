# 📱 Guía de EAS Update - Actualizaciones OTA (Over-The-Air)

Esta guía explica cómo usar EAS Update para actualizar tu app en dispositivos Android físicos sin necesidad de rebuild completo.

## 🚀 Qué es EAS Update?

EAS Update te permite enviar actualizaciones instantáneas a tu app sin que los usuarios tengan que descargar una nueva versión de la app store. Es ideal para:
- Corregir bugs rápidos
- Agregar nuevas features
- Actualizar UI/UX
- Configuraciones y ajustes

## 📋 Configuración Actual

### Archivos Modificados
- ✅ `eas.json` - Configuración de ramas preview y production
- ✅ `app.config.js` - URL de updates configurada
- ✅ `package.json` - Scripts para facilitar updates

### Scripts Disponibles
```bash
npm run update:preview -- "Tu mensaje de commit"
npm run update:production -- "Tu mensaje de commit"
```

## 🔄 Flujo de Trabajo

### Primer Build Inicial (Solo una vez)

Antes de poder usar EAS Update, necesitas construir un build inicial:

```bash
# Build de preview para testing
npx eas build --platform android --profile preview

# Esto generará un APK que puedes instalar en tu dispositivo Android
```

### Actualizaciones OTA (Para cada cambio)

Después del build inicial, puedes actualizar la app con:

```bash
# Usando el script (recomendado)
npm run update:preview -- "Solucionado Error 153 de YouTube"

# O directamente
npx eas update --branch preview --message "Solucionado Error 153 de YouTube"
```

## 📱 En tu Dispositivo Android

### Cómo funciona:
1. Instala el APK del build preview en tu dispositivo
2. La app buscará automáticamente actualizaciones cuando se abra
3. Si hay una actualización disponible, la descargará y aplicará
4. La app se reiniciará con la nueva versión

### Forzar actualización manual:
```bash
# En tu dispositivo, si quieres forzar una actualización:
# 1. Cierra completamente la app
# 2. Vuelve a abrirla
# 3. La app buscará y aplicará la actualización automáticamente
```

## 🌿 Ramas de Actualización

### Preview Branch
- **Uso**: Testing y desarrollo
- **Dispositivos**: Tu dispositivo Android físico con build preview
- **Comando**: `npm run update:preview -- "mensaje"`
- **Canal**: `preview`

### Production Branch
- **Uso**: Usuarios finales
- **Dispositivos**: Apps de Play Store
- **Comando**: `npm run update:production -- "mensaje"`
- **Canal**: `production`

## 💡 Mejores Prácticas

### 1. Mensajes de Commit Claros
```bash
# ✅ Bueno
npm run update:preview -- "Fix: Error 153 en reproductor YouTube"

# ❌ Malo
npm run update:preview -- "fix"
```

### 2. Versionado Semántico
Usa prefijos en tus mensajes:
- `Fix:` - Corrección de bugs
- `Feat:` - Nueva feature
- `Refactor:` - Refactorización de código
- `Style:` - Cambios de estilo
- `Docs:` - Actualización de documentación

### 3. Testing en Preview Primero
1. Siempre testea en `preview` primero
2. Verifica que todo funcione en tu dispositivo Android
3. Cuando esté listo, haz update a `production`

### 4. Rollback si Algo Falla
```bash
# Para hacer rollback a una versión anterior
npx eas update:list --branch preview
# Nota el update ID de la versión anterior
npx eas update:rollback --branch preview --update-id <ID>
```

## 🔍 Ver Estado de Updates

```bash
# Ver lista de updates en preview
npx eas update:list --branch preview

# Ver lista de updates en production
npx eas update:list --branch production

# Ver detalles de un update específico
npx update:view <update-id>
```

## ⚠️ Limitaciones de EAS Update

EAS Update NO puede actualizar:
- Versión de nativa modules (requiere rebuild)
- Permisos de Android/iOS (requiere rebuild)
- Versión de Expo SDK (requiere rebuild)
- Configuración de app.json (requiere rebuild)

Para estos cambios, necesitas hacer un build completo:
```bash
npx eas build --platform android --profile preview
```

## 📊 Ejemplos de Uso

### Corregir un Bug
```bash
# Haces el cambio en el código
git add .
git commit -m "Fix: Error 153 en YouTube"

# Envías el update
npm run update:preview -- "Fix: Error 153 en YouTube"
```

### Agregar Nueva Feature
```bash
# Haces el cambio en el código
git add .
git commit -m "Feat: Agregar dark mode"

# Envías el update
npm run update:preview -- "Feat: Agregar dark mode"
```

### Actualizar Estilos
```bash
# Haces el cambio en el código
git add .
git commit -m "Style: Mejorar diseño de tarjeta de tareas"

# Envías el update
npm run update:preview -- "Style: Mejorar diseño de tarjeta de tareas"
```

## 🆘 Solución de Problemas

### El update no se aplica en mi dispositivo
1. Verifica que tu dispositivo tenga el build preview instalado
2. Cierra completamente la app y vuelve a abrirla
3. Verifica tu conexión a internet
4. Revisa los logs de la app con `expo logcat` (Android)

### Error: "No update available"
- Esto es normal si ya tienes la última versión
- Verifica que el message del update sea diferente al anterior

### Error: "Update failed"
- Verifica que tus cambios no afecten archivos nativos
- Revisa los logs en el dashboard de Expo
- Si el error persiste, haz un rebuild completo

## 📚 Recursos Adicionales

- [Documentación oficial de EAS Update](https://docs.expo.dev/eas-update/introduction/)
- [Dashboard de Expo](https://expo.dev)
- [Configuración de EAS](https://docs.expo.dev/eas/introduction/)

## ✅ Checklist Antes de Hacer Update

- [ ] Probar los cambios localmente con `expo start`
- [ ] Verificar que no hay errores en consola
- [ ] Commit y push de cambios a git
- [ ] Escribir un mensaje de commit claro
- [ ] Usar la rama correcta (preview o production)
- [ ] Verificar que el update se aplicó correctamente en el dispositivo

---

**Nota**: Esta configuración está lista para usar con tu dispositivo Android físico. Si tienes algún problema, revisa la documentación oficial de Expo o contacta soporte.
