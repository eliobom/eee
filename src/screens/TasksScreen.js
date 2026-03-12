import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import { API_BASE_URL } from '../config';

const TasksScreen = () => {
  const [measurements, setMeasurements] = useState({
    legPerimeter: '',
    upperBodyPerimeter: '',
    armPerimeter: '',
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMeasurements, setSavingMeasurements] = useState(false);

  // Fetch tasks from backend
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${global.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
      } else {
        console.error('Error fetching tasks:', response.status);
        Alert.alert('Error', 'No se pudieron cargar las tareas');
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'Error de conexión al cargar tareas');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, completed) => {
    try {
      const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${global.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: completed ? 'completed' : 'pending',
          completed_at: completed ? new Date().toISOString() : null,
        }),
      });

      if (!response.ok) {
        console.error('Error updating task:', response.status);
        Alert.alert('Error', 'No se pudo actualizar la tarea');
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'Error de conexión al actualizar tarea');
      return false;
    }
  };

  const handleSave = async () => {
    if (!measurements.legPerimeter || !measurements.upperBodyPerimeter || !measurements.armPerimeter) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setSavingMeasurements(true);
    try {
      const measurementData = {
        user_id: global.user.id,
        thigh_perimeter: parseFloat(measurements.legPerimeter),
        chest_perimeter: parseFloat(measurements.upperBodyPerimeter),
        bicep_perimeter: parseFloat(measurements.armPerimeter),
        measured_at: new Date().toISOString(),
      };

      const response = await fetch(`${API_BASE_URL}/measurements`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${global.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(measurementData),
      });

      if (response.ok) {
        Alert.alert('Éxito', 'Medidas guardadas correctamente');
        setMeasurements({
          legPerimeter: '',
          upperBodyPerimeter: '',
          armPerimeter: '',
        });
      } else {
        console.error('Error saving measurements:', response.status);
        Alert.alert('Error', 'No se pudieron guardar las medidas');
      }
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'Error de conexión al guardar medidas');
    } finally {
      setSavingMeasurements(false);
    }
  };

  const toggleTaskCompletion = async (id) => {
    // Optimistically update UI
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, status: newCompleted ? 'completed' : 'pending' } : t
    ));

    // Update backend
    const success = await updateTaskStatus(id, newCompleted);
    if (!success) {
      // Revert on failure
      setTasks(tasks.map(t =>
        t.id === id ? { ...t, status: task.status } : t
      ));
    }
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const completionPercentage = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <LinearGradient colors={['#4ecdc4', '#44a08d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          <Header 
            title="Tareas" 
            subtitle="Gestiona tus objetivos diarios"
          />

          {/* Progress Overview */}
          <View style={styles.progressOverview}>
            <View style={styles.progressCard}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>{completionPercentage}%</Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Tareas Completadas</Text>
                <Text style={styles.progressValue}>{completedCount} de {tasks.length}</Text>
              </View>
            </View>
          </View>

          {/* Tasks List */}
          <View style={styles.tasksSection}>
            <Text style={styles.sectionTitle}>Mis Tareas</Text>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#4ecdc4" />
                <Text style={styles.loadingText}>Cargando tareas...</Text>
              </View>
            ) : tasks.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Ionicons name="checkmark-circle" size={48} color="#ccc" />
                <Text style={styles.emptyText}>No tienes tareas asignadas</Text>
              </View>
            ) : (
              tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  title={task.title}
                  dueDate={task.due_date ? new Date(task.due_date).toLocaleDateString('es-ES') : 'Sin fecha'}
                  priority={task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Media' : 'Baja'}
                  completed={task.status === 'completed'}
                  onPress={() => toggleTaskCompletion(task.id)}
                />
              ))
            )}
          </View>

          {/* Measurements Section */}
          <View style={styles.measurementsSection}>
            <View style={styles.measurementsHeader}>
              <Ionicons name="body" size={24} color="#fff" />
              <Text style={styles.sectionTitle}>Mediciones Corporales</Text>
            </View>
            <Text style={styles.measurementsSubtitle}>Registra tus medidas para seguimiento</Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Pierna (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="resize" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 50"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.legPerimeter}
                    onChangeText={(value) => setMeasurements({...measurements, legPerimeter: value})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Tren Superior (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="resize" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 90"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.upperBodyPerimeter}
                    onChangeText={(value) => setMeasurements({...measurements, upperBodyPerimeter: value})}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Brazo (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons name="resize" size={18} color="#999" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 30"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.armPerimeter}
                    onChangeText={(value) => setMeasurements({...measurements, armPerimeter: value})}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.saveButton, savingMeasurements && styles.disabledButton]}
                onPress={handleSave}
                disabled={savingMeasurements}
              >
                {savingMeasurements ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons name="checkmark" size={20} color="#fff" style={styles.buttonIcon} />
                )}
                <Text style={styles.saveButtonText}>
                  {savingMeasurements ? 'Guardando...' : 'Guardar Medidas'}
                </Text>
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
  progressOverview: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  progressCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  progressCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 20,
  },
  progressPercentage: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  progressInfo: {
    flex: 1,
  },
  progressLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  progressValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 5,
  },
  tasksSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 15,
  },
  measurementsSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  measurementsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  measurementsSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 15,
  },
  formContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8 },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 12,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  buttonIcon: {
    marginRight: 8,
  },
  saveButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  loadingContainer: {
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});

export default TasksScreen;