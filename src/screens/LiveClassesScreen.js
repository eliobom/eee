import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import { apiClient } from '../apiClient';
import { useAuth } from '../contexts/AuthContext';

const LiveClassesScreen = () => {
  const { user } = useAuth();
  const [selectedClass, setSelectedClass] = useState(null);

  const [liveClasses, setLiveClasses] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLiveClasses = async () => {
    setLoading(true);
    try {
      const classesData = await apiClient.getSupabaseLiveClasses();
      setLiveClasses(Array.isArray(classesData) ? classesData : []);
    } catch (error) {
      console.error('Error fetching live classes:', error);
      setLiveClasses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
      fetchLiveClasses();
    }
  }, [user]);

  const openMeeting = async (meetingUrl) => {
    if (!meetingUrl) {
      Alert.alert('Error', 'Esta clase no tiene link');
      return;
    }
    try {
      const canOpen = await Linking.canOpenURL(meetingUrl);
      if (!canOpen) {
        Alert.alert('Error', 'No se pudo abrir el link');
        return;
      }
      await Linking.openURL(meetingUrl);
    } catch (error) {
      console.error('Error opening meeting url:', error);
      Alert.alert('Error', 'No se pudo abrir el link');
    }
  };

  const uiClasses = useMemo(() => {
    const colors = ['#ff6b6b', '#667eea', '#4ecdc4', '#f59e0b', '#ec4899'];
    return liveClasses.map((c, idx) => {
      const scheduled = c?.scheduled_at ? new Date(c.scheduled_at) : null;
      const time =
        scheduled && !Number.isNaN(scheduled.getTime())
          ? scheduled.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })
          : '--:--';

      const status = c?.status === 'live' ? 'En Vivo' : 'Próxima';

      return {
        id: c.id,
        title: c.title || 'Clase en Vivo',
        instructor: c.trainer_name || 'Entrenador',
        startTime: time,
        duration: c.duration || 45,
        participants: Array.isArray(c.enrolled_users)
          ? c.enrolled_users.length
          : 0,
        status,
        color: colors[idx % colors.length],
        meeting_url: c.meeting_url,
      };
    });
  }, [liveClasses]);

  const upcomingClasses = useMemo(() => {
    return uiClasses.filter((c) => c.status === 'Próxima');
  }, [uiClasses]);

  return (
    <LinearGradient colors={['#667eea', '#764ba2']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header
            title="Clases en Vivo"
            subtitle="Únete a sesiones en tiempo real"
          />

          {/* Live Now Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="radio-button-on" size={20} color="#ef4444" />
              <Text style={styles.sectionTitle}>En Vivo Ahora</Text>
            </View>

            {loading ? (
              <Text style={styles.emptyText}>Cargando clases...</Text>
            ) : uiClasses.filter((c) => c.status === 'En Vivo').length === 0 ? (
              <Text style={styles.emptyText}>No hay clases en vivo</Text>
            ) : (
              uiClasses
                .filter((c) => c.status === 'En Vivo')
                .map((liveClass) => (
                  <TouchableOpacity
                    key={liveClass.id}
                    style={[
                      styles.liveCard,
                      { borderLeftColor: liveClass.color },
                    ]}
                    onPress={() => setSelectedClass(liveClass.id)}
                  >
                    <View
                      style={[
                        styles.liveIndicator,
                        { backgroundColor: liveClass.color },
                      ]}
                    >
                      <Text style={styles.liveText}>EN VIVO</Text>
                    </View>
                    <View style={styles.liveContent}>
                      <Text style={styles.liveTitle}>{liveClass.title}</Text>
                      <Text style={styles.liveInstructor}>
                        {liveClass.instructor}
                      </Text>
                      <View style={styles.liveFooter}>
                        <View style={styles.liveInfo}>
                          <Ionicons
                            name="people"
                            size={14}
                            color="rgba(255, 255, 255, 0.7)"
                          />
                          <Text style={styles.liveInfoText}>
                            {liveClass.participants} participantes
                          </Text>
                        </View>
                        <View style={styles.liveInfo}>
                          <Ionicons
                            name="time"
                            size={14}
                            color="rgba(255, 255, 255, 0.7)"
                          />
                          <Text style={styles.liveInfoText}>
                            {liveClass.duration} min
                          </Text>
                        </View>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.joinButton}
                      onPress={() => openMeeting(liveClass.meeting_url)}
                    >
                      <Ionicons name="play" size={24} color="#fff" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))
            )}
          </View>

          {/* Upcoming Classes Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Ionicons name="calendar" size={20} color="#667eea" />
              <Text style={styles.sectionTitle}>Próximas Clases</Text>
            </View>

            {loading ? (
              <Text style={styles.emptyText}>Cargando clases...</Text>
            ) : upcomingClasses.length === 0 ? (
              <Text style={styles.emptyText}>No hay clases programadas</Text>
            ) : (
              upcomingClasses.map((upcomingClass) => (
                <TouchableOpacity
                  key={upcomingClass.id}
                  style={styles.upcomingCard}
                  onPress={() => setSelectedClass(upcomingClass.id)}
                >
                  <View
                    style={[
                      styles.upcomingTime,
                      { backgroundColor: upcomingClass.color },
                    ]}
                  >
                    <Text style={styles.upcomingHour}>
                      {upcomingClass.startTime}
                    </Text>
                  </View>
                  <View style={styles.upcomingContent}>
                    <Text style={styles.upcomingTitle}>
                      {upcomingClass.title}
                    </Text>
                    <Text style={styles.upcomingInstructor}>
                      {upcomingClass.instructor}
                    </Text>
                  </View>
                  <View style={styles.upcomingDuration}>
                    <Ionicons
                      name="time"
                      size={16}
                      color="rgba(255, 255, 255, 0.6)"
                    />
                    <Text style={styles.upcomingDurationText}>
                      {upcomingClass.duration} min
                    </Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </View>

          {/* Reminder Section */}
          <View style={styles.reminderSection}>
            <View style={styles.reminderCard}>
              <Ionicons name="notifications" size={24} color="#667eea" />
              <View style={styles.reminderContent}>
                <Text style={styles.reminderTitle}>Activa notificaciones</Text>
                <Text style={styles.reminderSubtitle}>
                  Recibe recordatorios de tus clases favoritas
                </Text>
              </View>
              <TouchableOpacity style={styles.reminderButton}>
                <Ionicons name="chevron-forward" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 10,
  },
  liveCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  liveIndicator: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 12,
  },
  liveText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  liveContent: {
    flex: 1,
  },
  liveTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  liveInstructor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginBottom: 8,
  },
  liveFooter: {
    flexDirection: 'row',
    gap: 15,
  },
  liveInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  liveInfoText: {
    fontSize: 11,
    color: 'rgba(255, 255, 255, 0.7)',
    marginLeft: 4,
  },
  joinButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 10,
  },
  upcomingCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  upcomingTime: {
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  upcomingHour: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  upcomingContent: {
    flex: 1,
  },
  upcomingTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 3,
  },
  upcomingInstructor: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  upcomingDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  upcomingDurationText: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
    marginLeft: 4,
  },
  reminderSection: {
    paddingHorizontal: 20,
  },
  reminderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  reminderContent: {
    flex: 1,
    marginLeft: 12,
  },
  reminderTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  reminderSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 2,
  },
  reminderButton: {
    padding: 8,
  },
});

export default LiveClassesScreen;
