import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CommentCard from '../components/CommentCard';
import VideoPlayer from '../components/VideoPlayer';
import { apiClient } from '../apiClient';

const ClassDetailScreen = ({ route, navigation }) => {
  const { classData } = route.params || {};

  const normalizeStringArray = (value) => {
    if (Array.isArray(value)) return value;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return [];
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch {
        // ignore
      }
      return trimmed
        .split(/\r?\n|\s*,\s*/)
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [];
  };

  const [isFavorite, setIsFavorite] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  useEffect(() => {
    if (classData?.id) {
      loadAttachments();
    }
  }, [classData?.id]);

  const loadAttachments = async () => {
    setLoadingAttachments(true);
    try {
      const data = await apiClient.getClassAttachments(classData.id);
      setAttachments(data || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoadingAttachments(false);
    }
  };

  if (!classData) {
    return (
      <LinearGradient colors={['#ff6b6b', '#ff8787']} style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <View
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <Text
              style={{
                color: '#fff',
                fontSize: 18,
                fontWeight: 'bold',
                marginBottom: 12,
              }}
            >
              Clase no disponible
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>
    );
  }

  const benefits = normalizeStringArray(classData.benefits);
  const requirements = normalizeStringArray(classData.requirements);
  const ratingValue = Number.isFinite(Number(classData.rating))
    ? Number(classData.rating)
    : 0;
  const reviewsValue = Number.isFinite(Number(classData.reviews))
    ? Number(classData.reviews)
    : 0;

  const handleAddComment = () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Por favor escribe un comentario');
      return;
    }

    const comment = {
      id: comments.length + 1,
      author: 'Tu Nombre',
      rating: newRating,
      text: newComment,
      date: 'Ahora',
    };

    setComments([comment, ...comments]);
    setNewComment('');
    setNewRating(5);
    Alert.alert('Éxito', 'Comentario publicado');
  };

  const renderStars = () => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TouchableOpacity key={i} onPress={() => setNewRating(i + 1)}>
          <Ionicons
            name={i < newRating ? 'star' : 'star-outline'}
            size={24}
            color={i < newRating ? '#f59e0b' : '#d1d5db'}
          />
        </TouchableOpacity>
      ));
  };

  return (
    <LinearGradient colors={['#ff6b6b', '#ff8787']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <Ionicons name="chevron-back" size={28} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsFavorite(!isFavorite)}
              style={styles.favoriteButton}
            >
              <Ionicons
                name={isFavorite ? 'heart' : 'heart-outline'}
                size={28}
                color={isFavorite ? '#ef4444' : '#fff'}
              />
            </TouchableOpacity>
          </View>

          {/* Video Player */}
          {classData.video_url ? (
            <View style={styles.videoContainer}>
              <VideoPlayer
                videoUrl={classData.video_url}
                title={classData.title}
              />
            </View>
          ) : (
            <View
              style={[
                styles.thumbnail,
                { backgroundColor: classData.thumbnail || '#667eea' },
              ]}
            >
              <Ionicons name="play-circle" size={80} color="#fff" />
            </View>
          )}

          {/* Title and Info */}
          <View style={styles.titleSection}>
            <Text style={styles.title}>{classData.title}</Text>
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Ionicons name="person" size={16} color="#667eea" />
                <Text style={styles.infoText}>{classData.instructor}</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="time" size={16} color="#667eea" />
                <Text style={styles.infoText}>{classData.duration} min</Text>
              </View>
              <View style={styles.infoItem}>
                <Ionicons name="bar-chart" size={16} color="#667eea" />
                <Text style={styles.infoText}>{classData.level}</Text>
              </View>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
              <View style={styles.ratingStars}>
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Ionicons
                      key={i}
                      name={
                        i < Math.floor(ratingValue) ? 'star' : 'star-outline'
                      }
                      size={16}
                      color="#f59e0b"
                    />
                  ))}
              </View>
              <Text style={styles.ratingText}>
                {ratingValue} ({reviewsValue} reseñas)
              </Text>
            </View>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.description}>{classData.description}</Text>
          </View>

          {/* Benefits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Beneficios</Text>
            {benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lo que Necesitas</Text>
            {requirements.map((req, index) => (
              <View key={index} style={styles.requirementItem}>
                <Ionicons name="checkmark-circle" size={18} color="#667eea" />
                <Text style={styles.requirementText}>{req}</Text>
              </View>
            ))}
          </View>

          {/* Join Button */}
          <TouchableOpacity style={styles.joinButton}>
            <Ionicons name="play" size={20} color="#fff" />
            <Text style={styles.joinButtonText}>Unirse a la Clase</Text>
          </TouchableOpacity>

          {/* Attachments Section */}
          {attachments.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>
                Archivos Adjuntos ({attachments.length})
              </Text>
              {loadingAttachments ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="small" color="#4ecdc4" />
                  <Text style={styles.loadingText}>Cargando archivos...</Text>
                </View>
              ) : (
                <View style={styles.attachmentsContainer}>
                  {attachments.map((attachment) => {
                    const fileUrl = apiClient.normalizeSupabaseUrl(attachment.file_url);
                    const isVideo = attachment.file_type === 'video';
                    const isImage = attachment.file_type === 'image';

                    return (
                      <View key={attachment.id} style={styles.attachmentItem}>
                        <TouchableOpacity
                          onPress={() => {
                            if (isVideo) {
                              navigation.navigate('ClassDetail', {
                                classData: {
                                  ...classData,
                                  video_url: fileUrl,
                                  title: attachment.original_filename || 'Video adjunto'
                                }
                              });
                            } else {
                              Alert.alert('Abrir archivo', fileUrl, [
                                { text: 'Cancelar', style: 'cancel' },
                                { text: 'Abrir', onPress: () => Linking.openURL(fileUrl) }
                              ]);
                            }
                          }}
                        >
                          <View style={styles.attachmentCard}>
                            <Ionicons
                              name={isVideo ? 'videocam' : isImage ? 'image' : 'document'}
                              size={32}
                              color={isVideo ? '#ff6b6b' : isImage ? '#4ecdc4' : '#667eea'}
                            />
                            <Text style={styles.attachmentName} numberOfLines={1}>
                              {attachment.original_filename}
                            </Text>
                            <Text style={styles.attachmentType}>
                              {isVideo ? 'Video' : isImage ? 'Imagen' : 'Documento'}
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          )}

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Comentarios ({comments.length})
            </Text>

            {/* Add Comment */}
            <View style={styles.addCommentCard}>
              <Text style={styles.addCommentLabel}>Tu Calificación</Text>
              <View style={styles.starsInput}>{renderStars(newRating)}</View>

              <Text style={styles.addCommentLabel}>Tu Comentario</Text>
              <TextInput
                style={styles.commentInput}
                placeholder="Comparte tu experiencia..."
                placeholderTextColor="#999"
                value={newComment}
                onChangeText={setNewComment}
                multiline
                numberOfLines={3}
              />

              <TouchableOpacity
                style={styles.submitButton}
                onPress={handleAddComment}
              >
                <Text style={styles.submitButtonText}>Publicar Comentario</Text>
              </TouchableOpacity>
            </View>

            {/* Comments List */}
            {comments.map((comment) => (
              <CommentCard
                key={comment.id}
                author={comment.author}
                rating={comment.rating}
                text={comment.text}
                date={comment.date}
              />
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContainer: { flexGrow: 1, paddingBottom: 20 },
  videoContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  thumbnail: {
    height: 200,
    marginHorizontal: 20,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  titleSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  infoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingStars: {
    flexDirection: 'row',
    marginRight: 10,
  },
  ratingText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  description: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  benefitText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  requirementText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 10,
  },
  joinButton: {
    marginHorizontal: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  joinButtonText: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  addCommentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
  },
  addCommentLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  starsInput: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 15,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    color: '#333',
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 14,
  },
  attachmentsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  attachmentItem: {
    width: '48%',
    marginBottom: 10,
  },
  attachmentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  attachmentName: {
    color: '#fff',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
    fontWeight: '600',
  },
  attachmentType: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 10,
    marginTop: 4,
  },
});

export default ClassDetailScreen;
