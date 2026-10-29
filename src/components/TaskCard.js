import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import VideoPlayer from './VideoPlayer';
import { apiClient } from '../apiClient';

const TaskCard = ({
  title,
  description,
  dueDate,
  priority,
  completed,
  video_url,
  media,
  type,
  onPress,
  onToggleComplete,
}) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
      case 'Alta':
        return '#ef4444';
      case 'medium':
      case 'Media':
        return '#f59e0b';
      case 'low':
      case 'Baja':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'exercise':
        return 'fitness';
      case 'measurement':
        return 'resize';
      case 'habit':
        return 'repeat';
      case 'goal':
        return 'trophy';
      default:
        return 'checkmark-circle';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'exercise':
        return '#10b981';
      case 'measurement':
        return '#3b82f6';
      case 'habit':
        return '#f59e0b';
      case 'goal':
        return '#8b5cf6';
      default:
        return '#6b7280';
    }
  };

  return (
    <TouchableOpacity
      style={[styles.card, completed && styles.completedCard]}
      onPress={onPress}
    >
      <View style={styles.header}>
        <View style={styles.checkboxContainer}>
          <TouchableOpacity
            onPress={onToggleComplete}
            disabled={!onToggleComplete}
            style={[styles.checkbox, completed && styles.checkedBox]}
          >
            {completed && <Ionicons name="checkmark" size={16} color="#fff" />}
          </TouchableOpacity>
        </View>

        <View style={styles.typeIcon}>
          <Ionicons
            name={getTypeIcon(type)}
            size={20}
            color={getTypeColor(type)}
          />
        </View>
      </View>

      <View style={styles.content}>
        <Text
          style={[styles.title, completed && styles.completedTitle]}
          numberOfLines={2}
        >
          {title}
        </Text>

        {description && (
          <Text
            style={[
              styles.description,
              completed && styles.completedDescription,
            ]}
            numberOfLines={3}
          >
            {description}
          </Text>
        )}

        {/* Video Section */}
        {(video_url || (media && media.some(m => m.type === 'video'))) && !completed && (
          <View style={styles.videoContainer}>
            {video_url && (
              <VideoPlayer
                videoUrl={video_url}
                title={title}
                style={styles.videoPlayer}
              />
            )}
            {media && media.map((mediaItem, index) => (
              mediaItem.type === 'video' && mediaItem.url && (
                <VideoPlayer
                  key={index}
                  videoUrl={apiClient.normalizeSupabaseUrl(mediaItem.url)}
                  title={mediaItem.name || `Video ${index + 1}`}
                  style={styles.videoPlayer}
                />
              )
            ))}
          </View>
        )}

        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.date}>{dueDate}</Text>
          </View>
          <View
            style={[
              styles.priorityBadge,
              { backgroundColor: getPriorityColor(priority) },
            ]}
          >
            <Text style={styles.priorityText}>{priority}</Text>
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
    marginBottom: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: '#f9fafb',
    opacity: 0.8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxContainer: {
    marginRight: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  typeIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 6,
  },
  completedTitle: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
    lineHeight: 20,
  },
  completedDescription: {
    color: '#9ca3af',
  },
  videoContainer: {
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  videoPlayer: {
    height: 150,
    borderRadius: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TaskCard;
