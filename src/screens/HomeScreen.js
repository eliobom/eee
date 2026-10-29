import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import ProgressCard from '../components/ProgressCard';
import { apiClient } from '../apiClient';
import { useAuth } from '../contexts/AuthContext';

// Enable scroll on web
if (Platform.OS === 'web') {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = 'auto';
    document.body.style.height = 'auto';
  }
}


const HomeScreen = ({ navigation }) => {
  const { user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const [userProfile, setUserProfile] = useState(null);
  const [liveClasses, setLiveClasses] = useState([]);
  const [userStats, setUserStats] = useState({
    completedTasks: 0,
    totalTasks: 0,
    currentStreak: 0,
    totalMinutes: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
      fetchUserData();
    }

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);

      // Fetch user profile from Supabase
      try {
        const profileData = await apiClient.getSupabaseProfile();
        if (profileData) {
          setUserProfile(profileData);
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
      }

      // Fetch user tasks from Supabase
      let completedTasks = 0;
      let totalTasks = 0;
      try {
        const tasksData = await apiClient.getSupabaseTasks();
        totalTasks = tasksData.length;
        completedTasks = tasksData.filter(
          (task) => task.status === 'completed'
        ).length;
      } catch (tasksError) {
        console.log('No tasks from Supabase');
      }

      // Fetch live classes from Supabase
      try {
        const liveClassesData = await apiClient.getSupabaseLiveClasses();
        setLiveClasses(liveClassesData || []);
      } catch (liveError) {
        console.log('No live classes from Supabase');
        setLiveClasses([]);
      }

      // Calculate stats
      setUserStats({
        completedTasks,
        totalTasks,
        currentStreak: 0,
        totalMinutes: 0,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    {
      title: 'Mis Clases',
      icon: 'play-circle',
      screen: 'Classes',
      color: '#ff6b6b',
      gradient: ['#ff6b6b', '#ff5252'],
      shadowColor: '#ff6b6b',
      description: 'Accede a tus videos',
    },
    {
      title: 'Tareas',
      icon: 'checkmark-circle',
      screen: 'Tasks',
      color: '#00d4aa',
      gradient: ['#00d4aa', '#00b894'],
      shadowColor: '#00d4aa',
      description: 'Gestiona tus objetivos',
    },
    {
      title: 'Clases en Vivo',
      icon: 'videocam',
      screen: 'LiveClasses',
      color: '#667eea',
      gradient: ['#667eea', '#764ba2'],
      shadowColor: '#667eea',
      description: 'Únete a sesiones en vivo',
    },
    {
      title: 'Perfil',
      icon: 'person-circle',
      screen: 'Profile',
      color: '#f093fb',
      gradient: ['#f093fb', '#f5576c'],
      shadowColor: '#f093fb',
      description: 'Tu progreso personal',
    },
  ];

  return (
    <LinearGradient
      colors={['#0f0f23', '#1a1a2e', '#16213e']}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <Animated.ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          }}
        >
          {/* Welcome Section */}
          <Animated.View
            style={[
              styles.welcomeSection,
              { transform: [{ scale: scaleAnim }] },
            ]}
          >
            <View style={styles.welcomeContent}>
              <MaterialCommunityIcons
                name="dumbbell"
                size={60}
                color="#00d4aa"
              />
              <Text style={styles.welcomeTitle}>
                ¡Hola
                {userProfile
                  ? `, ${userProfile.full_name || userProfile.username}`
                  : ''}
                !
              </Text>
              <Text style={styles.welcomeSubtitle}>
                ¿Listo para conquistar tus objetivos hoy?
              </Text>
            </View>
          </Animated.View>

          {/* Quick Stats */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>📊 Tu Progreso Hoy</Text>
            <View style={styles.statsGrid}>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderColor: '#10b981',
                  },
                ]}
              >
                <View
                  style={[styles.statIconBg, { backgroundColor: '#10b981' }]}
                >
                  <Ionicons name="checkmark-circle" size={24} color="#fff" />
                </View>
                <Text style={styles.statValue}>{userStats.completedTasks}</Text>
                <Text style={styles.statLabel}>Completadas</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderColor: '#f59e0b',
                  },
                ]}
              >
                <View
                  style={[styles.statIconBg, { backgroundColor: '#f59e0b' }]}
                >
                  <Ionicons name="time" size={24} color="#fff" />
                </View>
                <Text style={styles.statValue}>{userStats.totalMinutes}</Text>
                <Text style={styles.statLabel}>Minutos</Text>
              </View>
              <View
                style={[
                  styles.statBox,
                  {
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderColor: '#ef4444',
                  },
                ]}
              >
                <View
                  style={[styles.statIconBg, { backgroundColor: '#ef4444' }]}
                >
                  <Ionicons name="flame" size={24} color="#fff" />
                </View>
                <Text style={styles.statValue}>{userStats.currentStreak}</Text>
                <Text style={styles.statLabel}>Racha</Text>
              </View>
            </View>
          </View>

          {/* Menu Grid */}
          <View style={styles.menuSection}>
            <Text style={styles.sectionTitle}>🚀 Acceso Rápido</Text>
            <View style={styles.menuGrid}>
              {menuItems.map((item, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.menuItemWrapper}
                  onPress={() => navigation.navigate(item.screen)}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={item.gradient}
                    style={styles.menuItem}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <View style={styles.menuIconContainer}>
                      <Ionicons name={item.icon} size={32} color="#fff" />
                    </View>
                    <Text style={styles.menuItemText}>{item.title}</Text>
                    <Text style={styles.menuItemDesc}>{item.description}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Progress Section */}
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>🎯 Objetivos de la Semana</Text>
            <View style={styles.progressCards}>
              <ProgressCard
                label="Tareas Completadas"
                value={userStats.completedTasks}
                max={userStats.totalTasks || 10}
                color="#667eea"
                icon="checkmark-circle"
              />
              <ProgressCard
                label="Tareas Totales"
                value={userStats.totalTasks}
                max={userStats.totalTasks || 10}
                color="#00d4aa"
                icon="list"
              />
              <ProgressCard
                label="Minutos de Ejercicio"
                value={userStats.totalMinutes}
                max={300}
                color="#f093fb"
                icon="time"
              />
            </View>
          </View>

          {/* Upcoming Classes */}
          <View style={styles.upcomingSection}>
            <View style={styles.upcomingHeader}>
              <Text style={styles.sectionTitle}>📅 Próximas Clases</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('LiveClasses')}
              >
                <Text style={styles.viewAll}>Ver todas →</Text>
              </TouchableOpacity>
            </View>
            {liveClasses.length > 0 ? (
              <View style={styles.upcomingCard}>
                <LinearGradient
                  colors={['#667eea', '#764ba2']}
                  style={styles.upcomingTime}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <Text style={styles.upcomingHour}>
                    {liveClasses[0].scheduled_at
                      ? new Date(
                          liveClasses[0].scheduled_at
                        ).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '--:--'}
                  </Text>
                  <Text style={styles.upcomingDate}>
                    {liveClasses[0].scheduled_at
                      ? new Date(
                          liveClasses[0].scheduled_at
                        ).toLocaleDateString('es-ES', { weekday: 'short' })
                      : 'Próxima'}
                  </Text>
                </LinearGradient>
                <View style={styles.upcomingInfo}>
                  <Text style={styles.upcomingTitle}>
                    🏋️ {liveClasses[0].title || 'Clase en Vivo'}
                  </Text>
                  <Text style={styles.upcomingInstructor}>
                    Con {liveClasses[0].trainer_name || 'Entrenador'}
                  </Text>
                  <View style={styles.upcomingTags}>
                    <Text style={styles.tag}>
                      {liveClasses[0].duration || 45} min
                    </Text>
                    <Text style={styles.tag}>
                      {liveClasses[0].status === 'live'
                        ? 'En Vivo'
                        : 'Programada'}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity style={styles.joinButton}>
                  <LinearGradient
                    colors={['#00d4aa', '#00b894']}
                    style={styles.joinButtonGradient}
                  >
                    <Ionicons name="play" size={20} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.emptyUpcoming}>
                <Text style={styles.emptyUpcomingText}>
                  No hay clases programadas
                </Text>
              </View>
            )}
          </View>

          {/* Motivational Quote */}
          <View style={styles.quoteSection}>
            <LinearGradient
              colors={['rgba(0, 212, 170, 0.1)', 'rgba(0, 184, 148, 0.1)']}
              style={styles.quoteCard}
            >
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={30}
                color="#00d4aa"
              />
              <Text style={styles.quoteText}>
                "La única forma de hacer un gran trabajo es amar lo que haces"
              </Text>
              <Text style={styles.quoteAuthor}>- Steve Jobs</Text>
            </LinearGradient>
          </View>
        </Animated.ScrollView>
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
    paddingBottom: 30,
  },
  welcomeSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
    marginTop: 10,
  },
  welcomeContent: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 20,
    padding: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 15,
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    textAlign: 'center',
    lineHeight: 22,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statBox: {
    borderRadius: 16,
    padding: 20,
    width: '31%',
    alignItems: 'center',
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  statIconBg: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  menuItemWrapper: {
    width: '48%',
    marginBottom: 20,
  },
  menuItem: {
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  menuIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  menuItemDesc: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
  },
  progressSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressCards: {
    gap: 15,
  },
  upcomingSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  upcomingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  viewAll: {
    color: '#00d4aa',
    fontSize: 14,
    fontWeight: '600',
  },
  upcomingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upcomingTime: {
    padding: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginRight: 15,
  },
  upcomingHour: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  upcomingDate: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 2,
    fontWeight: '600',
  },
  upcomingInfo: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 4,
  },
  upcomingInstructor: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  upcomingTags: {
    flexDirection: 'row',
    gap: 8,
  },
  tag: {
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    color: '#667eea',
    fontSize: 11,
    fontWeight: '600',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.2)',
  },
  joinButton: {
    marginLeft: 15,
  },
  joinButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quoteSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  quoteCard: {
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 212, 170, 0.3)',
  },
  quoteText: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 10,
    lineHeight: 22,
  },
  quoteAuthor: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 10,
    fontWeight: '600',
  },
  emptyUpcoming: {
    alignItems: 'center',
    padding: 20,
  },
  emptyUpcomingText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
  },
});

export default HomeScreen;
