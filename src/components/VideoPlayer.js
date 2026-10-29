import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Linking,
  Modal,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Video } from 'expo-av';
import { WebView } from 'react-native-webview';
import YouTubeIframe from 'react-native-youtube-iframe';


const VideoPlayer = ({ videoUrl, title, style, onOpen }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [paused, setPaused] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [fullscreenPaused, setFullscreenPaused] = useState(false);
  const videoRef = useRef(null);
  const fullscreenVideoRef = useRef(null);

  // Normalizar URL de Supabase Storage - mejorada
  const normalizeSupabaseUrl = (url) => {
    if (!url) return '';
    const normalized = String(url).trim();

    // Si ya tiene /storage/v1/object/public/, retornar tal cual
    if (normalized.includes('/storage/v1/object/public/')) return normalized;

    // Si tiene /storage/v1/object/ pero sin /public/, agregarlo
    if (normalized.includes('/storage/v1/object/')) {
      return normalized.replace('/storage/v1/object/', '/storage/v1/object/public/');
    }

    // Si es una URL relativa sin protocolo, intentar construir con base URL
    if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
      // Si parece ser una ruta relativa de storage, no la modificamos
      // El componente que recibe la URL debería asegurarse de que sea completa
      return normalized;
    }

    return normalized;
  };

  const normalizedUrl = normalizeSupabaseUrl(videoUrl);

  // Detectar si es GIF
  const isGif = normalizedUrl.toLowerCase().includes('.gif');

  // Detectar si es URL de Supabase Storage (con o sin /public/)
  const isSupabaseStorageUrl = /\/storage\/v1\/object(\/public)?\//.test(normalizedUrl);

  // Detectar si es video por extensión (solo formatos soportados por expo-av)
  // expo-av soporta: mp4, mov, m4v, webm (iOS), mkv (Android)
  // NO soporta: avi, m3u8 (requiere configuración especial)
  const isVideo =
    normalizedUrl.toLowerCase().includes('.mp4') ||
    normalizedUrl.toLowerCase().includes('.mov') ||
    normalizedUrl.toLowerCase().includes('.m4v') ||
    normalizedUrl.toLowerCase().includes('.webm') ||
    normalizedUrl.toLowerCase().includes('.mkv');

  const isYouTube = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//i.test(
    normalizedUrl
  );

  const getYouTubeVideoId = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes('youtu.be')) {
        return u.pathname.replace('/', '') || null;
      }
      if (u.hostname.includes('youtube.com')) {
        return u.searchParams.get('v');
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const openExternal = async () => {
    if (typeof onOpen === 'function') {
      try {
        onOpen(normalizedUrl);
      } catch {
        // ignore
      }
      return;
    }
    try {
      const can = await Linking.canOpenURL(normalizedUrl);
      if (!can) throw new Error('No se puede abrir este enlace');
      await Linking.openURL(normalizedUrl);
    } catch {
      // swallow
    }
  };

  const handleLoad = () => {
    setLoading(false);
    setError(false);
    setErrorMessage('');
    setRetryCount(0);
  };

  const handleError = (error) => {
    setLoading(false);
    setError(true);

    // Extraer mensaje de error específico
    let errorMsg = 'Error al cargar el video';

    if (error?.error?.errorDescription) {
      errorMsg = error.error.errorDescription;
    } else if (error?.error?.message) {
      errorMsg = error.error.message;
    } else if (error?.message) {
      errorMsg = error.message;
    } else if (typeof error === 'string') {
      errorMsg = error;
    }

    // Determinar tipo de error para dar mensaje más útil
    if (errorMsg.includes('network') || errorMsg.includes('Network')) {
      errorMsg = 'Error de conexión. Verifica tu internet.';
    } else if (errorMsg.includes('format') || errorMsg.includes('codec')) {
      errorMsg = 'Formato de video no compatible.';
    } else if (errorMsg.includes('404') || errorMsg.includes('not found')) {
      errorMsg = 'Video no encontrado. URL inválida.';
    } else if (errorMsg.includes('permission') || errorMsg.includes('403')) {
      errorMsg = 'No tienes permiso para ver este video.';
    }

    setErrorMessage(errorMsg);
    console.error('VideoPlayer error:', errorMsg, error);
  };

  const handleRetry = () => {
    if (retryCount < 3) {
      setRetryCount(prev => prev + 1);
      setError(false);
      setErrorMessage('');
      setLoading(true);
    }
  };

  const togglePlayPause = () => {
    setPaused(!paused);
  };

  const toggleFullscreen = () => {
    setIsFullscreen(true);
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
    setFullscreenPaused(false);
    setPaused(true);
  };

  // Video player con controles para videos nativos
  const renderNativeVideoPlayer = () => (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecdc4" />
          <Text style={styles.loadingText}>Cargando video...</Text>
        </View>
      )}

      {error ? (
        <View style={[styles.videoPlaceholder, styles.errorContainer]}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error al cargar el video</Text>
          {errorMessage && (
            <Text style={styles.errorDetail}>{errorMessage}</Text>
          )}
          <View style={styles.errorActions}>
            {retryCount < 3 && (
              <TouchableOpacity style={[styles.openButton, styles.retryButton]} onPress={handleRetry}>
                <Ionicons name="refresh" size={18} color="#fff" />
                <Text style={styles.openButtonText}>Reintentar ({retryCount + 1}/3)</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.openButton} onPress={openExternal}>
              <Ionicons name="open-outline" size={18} color="#fff" />
              <Text style={styles.openButtonText}>Abrir en navegador</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setShowControls(!showControls)}
          style={[styles.videoWrapper, style]}
        >
          <Video
            ref={videoRef}
            source={{ uri: normalizedUrl }}
            style={styles.video}
            resizeMode="contain"
            isPaused={paused}
            shouldPlay={false}
            useNativeControls={false}
            isLooping={false}
            progressUpdateIntervalMillis={500}
            onLoad={handleLoad}
            onError={handleError}
            onPlaybackStatusUpdate={(status) => {
              if (status.isLoaded) {
                setLoading(false);
              }
            }}
            // Configuración específica para Android
            progressUpdateIntervalMillis={1000}
            positionMillis={0}
          />

          {showControls && (
            <View style={styles.controlsOverlay}>
              <TouchableOpacity
                style={styles.playButtonLarge}
                onPress={togglePlayPause}
              >
                <Ionicons
                  name={paused ? 'play' : 'pause'}
                  size={50}
                  color="#fff"
                />
              </TouchableOpacity>

              <View style={styles.videoTitleContainer}>
                <Text style={styles.videoTitle} numberOfLines={1}>
                  {title || 'Video'}
                </Text>
              </View>

              {/* Botón de pantalla completa */}
              <TouchableOpacity
                style={styles.fullscreenButton}
                onPress={toggleFullscreen}
              >
                <Ionicons name="expand" size={24} color="#fff" />
                <Text style={styles.fullscreenText}>Pantalla completa</Text>
              </TouchableOpacity>
            </View>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // YouTube player con react-native-youtube-iframe (mejor manejo de errores)
  const renderYouTubePlayer = () => {
    const vid = getYouTubeVideoId(normalizedUrl);
    if (!vid) {
      return renderDefaultPlayer();
    }

    const [youtubeReady, setYoutubeReady] = useState(false);
    const [youtubeError, setYoutubeError] = useState(false);

    return (
      <View style={[styles.container, style]}>
        {!youtubeError ? (
          <>
            <YouTubeIframe
              videoId={vid}
              height={200}
              width={'100%'}
              play={false}
              webViewProps={{
                injectedJavaScript: `
                  document.documentElement.style.setProperty('--yt-live-chat-background-color', 'transparent');
                  true;
                `,
              }}
              onReady={() => setYoutubeReady(true)}
              onError={(e) => {
                console.error('YouTube error:', e);
                setYoutubeError(true);
              }}
              onChangeState={(e) => {
                console.log('YouTube state:', e.state);
              }}
            />
            <View style={styles.videoInfo}>
              <Text style={styles.videoTitle} numberOfLines={2}>
                {title || 'Video'}
              </Text>
              <View style={styles.badge}>
                <Ionicons name="logo-youtube" size={12} color="#fff" />
                <Text style={styles.badgeText}>YouTube</Text>
              </View>
            </View>
          </>
        ) : (
          <View style={[styles.videoPlaceholder, style]}>
            <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
            <Text style={styles.errorText}>Video no disponible</Text>
            <Text style={styles.errorDetail}>
              Este video no puede reproducirse en la app
            </Text>
            <TouchableOpacity style={styles.openButton} onPress={openExternal}>
              <Ionicons name="logo-youtube" size={18} color="#fff" />
              <Text style={styles.openButtonText}>Ver en YouTube</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  // GIF display
  const renderGifPlayer = () => (
    <View style={[styles.container, style]}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4ecdc4" />
          <Text style={styles.loadingText}>Cargando GIF...</Text>
        </View>
      )}
      <Image
        source={{ uri: videoUrl }}
        style={[styles.video, style]}
        onLoad={handleLoad}
        onError={handleError}
        resizeMode="contain"
      />
      {!loading && (
        <View style={styles.videoInfo}>
          <Text style={styles.videoTitle} numberOfLines={2}>
            {title || 'Ejercicio de demostración'}
          </Text>
          <View style={styles.badge}>
            <Ionicons name="images" size={12} color="#fff" />
            <Text style={styles.badgeText}>GIF</Text>
          </View>
        </View>
      )}
    </View>
  );

  // Default: mostrar placeholder con botón
  const renderDefaultPlayer = () => (
    <View style={[styles.container, style]}>
      <View style={[styles.videoPlaceholder, style]}>
        <Ionicons name="link" size={56} color="#4ecdc4" />
        <Text style={styles.placeholderText}>Enlace</Text>
        <Text style={styles.videoTitle}>{title || 'Contenido'}</Text>
        <TouchableOpacity style={styles.openButton} onPress={openExternal}>
          <Ionicons name="open-outline" size={18} color="#fff" />
          <Text style={styles.openButtonText}>Abrir enlace</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render according to URL type
  if (error) {
    return renderDefaultPlayer();
  }

  if (isYouTube) {
    return renderYouTubePlayer();
  }

  if (isGif) {
    return renderGifPlayer();
  }

  if (isVideo) {
    return (
      <>
        {renderNativeVideoPlayer()}

        {/* Modal de pantalla completa */}
        <Modal
          visible={isFullscreen}
          animationType="fade"
          presentationStyle="fullScreen"
          onRequestClose={closeFullscreen}
          statusBarTranslucent
        >
          <StatusBar hidden={isFullscreen} />
          <View style={styles.fullscreenContainer}>
            <Video
              ref={fullscreenVideoRef}
              source={{ uri: normalizedUrl }}
              style={styles.fullscreenVideo}
              resizeMode="contain"
              isPaused={fullscreenPaused}
              shouldPlay={!fullscreenPaused}
              useNativeControls={true}
              isLooping={false}
              progressUpdateIntervalMillis={500}
              onError={handleError}
              onLoad={handleLoad}
              onPlaybackStatusUpdate={(status) => {
                if (status.isLoaded) {
                  setLoading(false);
                }
              }}
              // Configuración específica para Android
              progressUpdateIntervalMillis={1000}
              positionMillis={0}
            />

            <TouchableOpacity
              style={styles.closeFullscreenButton}
              onPress={closeFullscreen}
            >
              <Ionicons name="close-circle" size={48} color="#fff" />
              <Text style={styles.closeFullscreenText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </>
    );
  }

  return renderDefaultPlayer();
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
  },
  videoWrapper: {
    width: '100%',
    height: 200,
    backgroundColor: '#000',
    position: 'relative',
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#fff',
    fontSize: 14,
  },
  errorContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffe6e6',
  },
  errorText: {
    fontSize: 16,
    color: '#ff6b6b',
    fontWeight: 'bold',
    marginTop: 10,
  },
  errorDetail: {
    fontSize: 12,
    color: '#ff6b6b',
    marginTop: 5,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  errorActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 15,
  },
  retryButton: {
    backgroundColor: '#f59e0b',
  },
  videoPlaceholder: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  placeholderText: {
    fontSize: 14,
    color: '#666',
    marginTop: 10,
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playButtonLarge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  videoTitleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
  },
  videoTitle: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  openButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    marginTop: 12,
  },
  openButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
  },
  videoInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 4,
  },
  // Fullscreen button styles
  fullscreenButton: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  fullscreenText: {
    color: '#fff',
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '600',
  },
  // Fullscreen modal styles
  fullscreenContainer: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenVideo: {
    width: '100%',
    height: '100%',
  },
  closeFullscreenButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 25,
  },
  closeFullscreenText: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
});

export default VideoPlayer;
