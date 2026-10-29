import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from './VideoPlayer';

const ClassCard = ({
  title,
  instructor,
  duration,
  level,
  video_url,
  thumbnail,
  onPress,
}) => {
  const getLevelColor = (level) => {
    switch (level) {
      case 'Principiante':
        return '#10b981';
      case 'Intermedio':
        return '#f59e0b';
      case 'Avanzado':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.thumbnailContainer}>
        {video_url ? (
          <VideoPlayer
            videoUrl={video_url}
            title={title}
            style={styles.videoPlayer}
          />
        ) : (
          <View style={[styles.thumbnail, { backgroundColor: thumbnail }]}>
            <Ionicons name="play-circle" size={50} color="#fff" />
          </View>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {title}
        </Text>
        <Text style={styles.instructor}>{instructor}</Text>
        <View style={styles.footer}>
          <View style={styles.infoRow}>
            <Ionicons name="time" size={14} color="#666" />
            <Text style={styles.info}>{duration} min</Text>
          </View>
          <View
            style={[
              styles.levelBadge,
              { backgroundColor: getLevelColor(level) },
            ]}
          >
            <Text style={styles.levelText}>{level}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  thumbnailContainer: {
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  videoPlayer: {
    height: 150,
  },
  thumbnail: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  instructor: {
    fontSize: 13,
    color: '#6b7280',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  info: {
    fontSize: 12,
    color: '#666',
    marginLeft: 5,
  },
  levelBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  levelText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});

export default ClassCard;
