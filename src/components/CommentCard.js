import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const CommentCard = ({
  author = 'Usuario Anónimo',
  rating = 0,
  text = '',
  date = 'Fecha desconocida',
}) => {
  // Debug logs for potential null/undefined values
  console.log('CommentCard rendered with:', { author, rating, text, date });

  const avatarInitial = author ? author.charAt(0).toUpperCase() : 'U';

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Ionicons
          key={i}
          name={i < rating ? 'star' : 'star-outline'}
          size={14}
          color={i < rating ? '#f59e0b' : '#d1d5db'}
        />
      ));
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
          <View style={styles.authorDetails}>
            <Text style={styles.author}>{author}</Text>
            <Text style={styles.date}>{date}</Text>
          </View>
        </View>
        <View style={styles.stars}>{renderStars(rating)}</View>
      </View>
      <Text style={styles.text}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#667eea',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  avatarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  authorDetails: {
    flex: 1,
  },
  author: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1f2937',
  },
  date: {
    fontSize: 11,
    color: '#6b7280',
    marginTop: 2,
  },
  stars: {
    flexDirection: 'row',
    gap: 2,
  },
  text: {
    fontSize: 13,
    color: '#4b5563',
    lineHeight: 18,
  },
});

export default CommentCard;
