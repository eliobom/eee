import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

const VideoPlayer = ({ videoUrl, title, style }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Detectar si es GIF o video por la extensión
  const isGif = videoUrl.toLowerCase().includes('.gif');
  const isVideo = videoUrl.toLowerCase().includes('.mp4') || 
                  videoUrl.toLowerCase().includes('.mov') || 
                  videoUrl.toLowerCase().includes('.avi') ||
                  videoUrl.toLowerCase().includes('.webm');

  const handleLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleError = () => {
    setLoading(false);
    setError(true);
  };

  const renderContent = () => {
    if (error) {
      return (
        <View style={[styles.container, style, styles.errorContainer]}>
          <Ionicons name="alert-circle" size={48} color="#ff6b6b" />
          <Text style={styles.errorText}>Error al cargar el video</Text>
          <Text style={styles.errorSubtext}>No se pudo reproducir el contenido</Text>
        </View>
      );
    }

    if (isGif) {
      return (
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
    }

    if (isVideo) {
      return (
        <View style={[styles.container, style]}>
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#4ecdc4" />
              <Text style={styles.loadingText}>Cargando video...</Text>
            </View>
          )}
          {/* Para videos nativos, necesitaríamos react-native-video */}
          <View style={[styles.videoPlaceholder, style]}>
            <Ionicons name="play-circle" size={64} color="#4ecdc4" />
            <Text style={styles.placeholderText}>Video Exercise</Text>
            <Text style={styles.videoTitle}>{title || 'Ejercicio de demostración'}</Text>
            <TouchableOpacity 
              style={styles.playButton}
              onPress={() => {
                // Aquí podríamos abrir el video en un reproductor externo
                // o usar react-native-video para reproducción nativa
                console.log('Reproducir video:', videoUrl);
              }}
            >
              <Ionicons name="play" size={20} color="#fff" />
              <Text style={styles.playButtonText}>Reproducir</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    // Por defecto, mostrar como imagen si no es GIF ni video reconocido
    return (
      <View style={[styles.container, style]}>
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4ecdc4" />
            <Text style={styles.loadingText}>Cargando...</Text>
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
              <Ionicons name="link" size={12} color="#fff" />
              <Text style={styles.badgeText}>WEB</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  return renderContent();
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
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
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
  errorSubtext: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
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
  playButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4ecdc4',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    marginTop: 15,
  },
  playButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 14,
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
  videoTitle: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
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
});

export default VideoPlayer;
