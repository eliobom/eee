import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import CommentCard from '../components/CommentCard';

const ClassDetailScreen = ({ route, navigation }) => {
  const { classData } = route.params || {
    classData: {
      id: 1,
      title: 'Entrenamiento HIIT de 30 minutos',
      instructor: 'Juan Pérez',
      duration: 30,
      level: 'Intermedio',
      thumbnail: '#ff6b6b',
      rating: 4.5,
      reviews: 128,
      description: 'Un entrenamiento intenso de 30 minutos que combina ejercicios de alta intensidad con períodos de descanso. Perfecto para quemar calorías y mejorar tu resistencia cardiovascular.',
      requirements: ['Colchoneta de yoga', 'Botella de agua', 'Ropa cómoda'],
      benefits: ['Mejora cardiovascular', 'Quema de calorías', 'Aumento de resistencia', 'Tonificación muscular'],
    },
  };

  const [isFavorite, setIsFavorite] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'María García',
      rating: 5,
      text: 'Excelente clase, muy bien explicada y desafiante. Recomendado 100%',
      date: 'Hace 2 días',
    },
    {
      id: 2,
      author: 'Carlos López',
      rating: 4,
      text: 'Buena intensidad, aunque podría ser un poco más largo.',
      date: 'Hace 5 días',
    },
  ]);

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

  const renderStars = (rating) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <TouchableOpacity
          key={i}
          onPress={() => setNewRating(i + 1)}
        >
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
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
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

          {/* Thumbnail */}
          <View style={[styles.thumbnail, { backgroundColor: classData.thumbnail }]}>
            <Ionicons name="play-circle" size={80} color="#fff" />
          </View>

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
                      name={i < Math.floor(classData.rating) ? 'star' : 'star-outline'}
                      size={16}
                      color="#f59e0b"
                    />
                  ))}
              </View>
              <Text style={styles.ratingText}>
                {classData.rating} ({classData.reviews} reseñas)
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
            {classData.benefits.map((benefit, index) => (
              <View key={index} style={styles.benefitItem}>
                <Ionicons name="checkmark-circle" size={18} color="#10b981" />
                <Text style={styles.benefitText}>{benefit}</Text>
              </View>
            ))}
          </View>

          {/* Requirements */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lo que Necesitas</Text>
            {classData.requirements.map((req, index) => (
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

          {/* Comments Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Comentarios ({comments.length})</Text>

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
});

export default ClassDetailScreen;
