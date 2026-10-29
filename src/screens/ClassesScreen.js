import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ClassCard from '../components/ClassCard';
import SearchBar from '../components/SearchBar';
import { apiClient } from '../apiClient';
import { useAuth } from '../contexts/AuthContext';

const ClassesScreen = ({ navigation }) => {
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const categories = ['Todos', 'Cardio', 'Fuerza', 'Flexibilidad', 'Yoga'];

  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
      fetchClasses();
    }
  }, [user]);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const classesData = await apiClient.getSupabaseClasses();

      // Transform Supabase data to match frontend format
      const transformedClasses = classesData.map((cls, index) => ({
        id: cls.id,
        title: cls.title || 'Clase sin título',
        instructor: cls.instructor_name || 'Entrenador',
        duration: cls.duration || 45,
        level: cls.level || 'Intermedio',
        thumbnail: ['#ff6b6b', '#4ecdc4', '#667eea', '#f59e0b', '#ec4899'][
          index % 5
        ],
        category: cls.category || 'General',
        video_url: cls.video_url || null,
      }));
      setClasses(transformedClasses);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = classes.filter((c) => {
    const matchesCategory =
      selectedCategory === 'Todos' || c.category === selectedCategory;
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.instructor.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFavorite = (classId) => {
    setFavorites((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  return (
    <LinearGradient colors={['#ff6b6b', '#ff8787']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <Header title="Mis Clases" subtitle="Elige una clase para comenzar" />

        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Buscar clases o instructores..."
          onClear={() => setSearchQuery('')}
        />

        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          {/* Categories */}
          <View style={styles.categoriesContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
            >
              {categories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.categoryButton,
                    selectedCategory === category &&
                      styles.categoryButtonActive,
                  ]}
                  onPress={() => setSelectedCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category &&
                        styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Classes List */}
          <View style={styles.classesContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b6b" />
                <Text style={styles.loadingText}>Cargando clases...</Text>
              </View>
            ) : filteredClasses.length > 0 ? (
              filteredClasses.map((classItem) => (
                <View key={classItem.id} style={styles.classCardWrapper}>
                  <ClassCard
                    title={classItem.title}
                    instructor={classItem.instructor}
                    duration={classItem.duration}
                    level={classItem.level}
                    thumbnail={classItem.thumbnail}
                    video_url={classItem.video_url}
                    onPress={() =>
                      navigation.navigate('ClassDetail', {
                        classData: classItem,
                      })
                    }
                  />
                  <TouchableOpacity
                    style={styles.favoriteIcon}
                    onPress={() => toggleFavorite(classItem.id)}
                  >
                    <Ionicons
                      name={
                        favorites.includes(classItem.id)
                          ? 'heart'
                          : 'heart-outline'
                      }
                      size={24}
                      color={
                        favorites.includes(classItem.id) ? '#ef4444' : '#fff'
                      }
                    />
                  </TouchableOpacity>
                </View>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Ionicons
                  name="search"
                  size={50}
                  color="rgba(255, 255, 255, 0.5)"
                />
                <Text style={styles.emptyStateText}>
                  {searchQuery
                    ? 'No se encontraron clases'
                    : 'No hay clases disponibles'}
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  categoriesContainer: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  categoriesScroll: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  categoryButtonActive: {
    backgroundColor: '#fff',
  },
  categoryText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 13,
    fontWeight: '600',
  },
  categoryTextActive: {
    color: '#ff6b6b',
  },
  classesContainer: {
    padding: 20,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    marginTop: 15,
  },
  classCardWrapper: {
    position: 'relative',
  },
  favoriteIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
});

export default ClassesScreen;
