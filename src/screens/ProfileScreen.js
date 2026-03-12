import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import ProgressCard from '../components/ProgressCard';
import { API_BASE_URL } from '../config';

const ProfileScreen = () => {
  const [userProfile, setUserProfile] = useState(null);
  const [userStats, setUserStats] = useState([
    { label: 'Tareas Completadas', value: 0, max: 10, color: '#667eea' },
    { label: 'Racha Actual', value: 0, max: 30, color: '#10b981' },
    { label: 'Minutos Entrenados', value: 0, max: 300, color: '#f59e0b' },
  ]);
  const [loading, setLoading] = useState(true);

  const achievements = [
    { id: 1, icon: 'star', title: 'Principiante', description: 'Completa tu 1ª tarea' },
    { id: 2, icon: 'flame', title: 'En Racha', description: '7 días consecutivos' },
    { id: 3, icon: 'trophy', title: 'Campeón', description: '50 tareas completadas' },
    { id: 4, icon: 'heart', title: 'Dedicado', description: '100 horas entrenadas' },
  ];

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);

      // Fetch user profile
      const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          'Authorization': `Bearer ${global.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        setUserProfile(profileData);
      }

      // Fetch user tasks for stats
      const tasksResponse = await fetch(`${API_BASE_URL}/tasks`, {
        headers: {
          'Authorization': `Bearer ${global.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (tasksResponse.ok) {
        const tasksData = await tasksResponse.json();
        const completedTasks = tasksData.filter(task => task.status === 'completed').length;

        setUserStats([
          { label: 'Tareas Completadas', value: completedTasks, max: Math.max(tasksData.length, 10), color: '#667eea' },
          { label: 'Racha Actual', value: 0, max: 30, color: '#10b981' }, // TODO: calculate streak
          { label: 'Minutos Entrenados', value: 0, max: 300, color: '#f59e0b' }, // TODO: calculate from measurements
        ]);
      }

    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const menuItems = [
    { icon: 'settings', label: 'Configuración', color: '#667eea' },
    { icon: 'notifications', label: 'Notificaciones', color: '#10b981' },
    { icon: 'help-circle', label: 'Ayuda y Soporte', color: '#f59e0b' },
    { icon: 'log-out', label: 'Cerrar Sesión', color: '#ef4444' },
  ];

  return (
    <LinearGradient colors={['#f093fb', '#f5576c']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Header 
            title="Mi Perfil" 
            subtitle="Información personal y progreso"
          />

          {/* Profile Card */}
          <View style={styles.profileCard}>
            <View style={styles.avatarContainer}>
              <Ionicons name="person-circle" size={80} color="#fff" />
            </View>
            <Text style={styles.userName}>
              {userProfile ? userProfile.full_name || userProfile.username : 'Cargando...'}
            </Text>
            <Text style={styles.userEmail}>
              {userProfile ? userProfile.email || '' : ''}
            </Text>
            <View style={styles.memberBadge}>
              <Ionicons name="star" size={14} color="#f59e0b" />
              <Text style={styles.memberText}>Usuario Activo</Text>
            </View>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Tu Progreso</Text>
            {userStats.map((stat, index) => (
              <ProgressCard
                key={index}
                label={stat.label}
                value={stat.value}
                max={stat.max}
                color={stat.color}
              />
            ))}
          </View>

          {/* Achievements Section */}
          <View style={styles.achievementsSection}>
            <Text style={styles.sectionTitle}>Logros</Text>
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <View key={achievement.id} style={styles.achievementCard}>
                  <View style={styles.achievementIcon}>
                    <Ionicons name={achievement.icon} size={28} color="#f59e0b" />
                  </View>
                  <Text style={styles.achievementTitle}>{achievement.title}</Text>
                  <Text style={styles.achievementDescription}>{achievement.description}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Menu Section */}
          <View style={styles.menuSection}>
            {menuItems.map((item, index) => (
              <TouchableOpacity key={index} style={styles.menuItem}>
                <View style={[styles.menuIcon, { backgroundColor: item.color }]}>
                  <Ionicons name={item.icon} size={20} color="#fff" />
                </View>
                <Text style={styles.menuLabel}>{item.label}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
              </TouchableOpacity>
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
  profileCard: {
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 15,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 12,
  },
  memberBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  memberText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  statsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  achievementsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  achievementCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  achievementTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  achievementDescription: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  menuSection: {
    paddingHorizontal: 20,
  },
  menuItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
});

export default ProfileScreen;