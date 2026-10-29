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
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import Header from '../components/Header';
import TaskCard from '../components/TaskCard';
import VideoPlayer from '../components/VideoPlayer';
import { apiClient } from '../apiClient';
import { useAuth } from '../contexts/AuthContext';

const TasksScreen = () => {
  const { user } = useAuth();

  const [measurements, setMeasurements] = useState({
    weight: '',
    height: '',
    chestPerimeter: '',
    waistPerimeter: '',
    hipPerimeter: '',
    legPerimeter: '',
    armPerimeter: '',
  });

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMeasurements, setSavingMeasurements] = useState(false);

  const [selectedTask, setSelectedTask] = useState(null);
  const [taskDetailOpen, setTaskDetailOpen] = useState(false);
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);

  const [webUrl, setWebUrl] = useState(null);
  const [webOpen, setWebOpen] = useState(false);

  // Fetch tasks from Supabase
  useEffect(() => {
    if (user) {
      apiClient.setCurrentUser(user);
      fetchTasks();
    }
  }, [user]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const tasksData = await apiClient.getSupabaseTasks();
      setTasks(tasksData);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      Alert.alert('Error', 'No se pudieron cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const updateTaskStatus = async (taskId, completed) => {
    try {
      await apiClient.updateSupabaseTaskStatus(
        taskId,
        completed ? 'completed' : 'pending'
      );
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      Alert.alert('Error', 'No se pudo actualizar la tarea');
      return false;
    }
  };

  const handleSave = async () => {
    // Validar campos obligatorios
    if (
      !measurements.weight ||
      !measurements.height ||
      !measurements.chestPerimeter ||
      !measurements.waistPerimeter ||
      !measurements.hipPerimeter ||
      !measurements.legPerimeter ||
      !measurements.armPerimeter
    ) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    // Validar rangos razonables
    const weight = parseFloat(measurements.weight);
    const height = parseFloat(measurements.height);
    
    if (weight < 20 || weight > 300) {
      Alert.alert('Error', 'El peso debe estar entre 20 y 300 kg');
      return;
    }
    
    if (height < 100 || height > 250) {
      Alert.alert('Error', 'La altura debe estar entre 100 y 250 cm');
      return;
    }

    setSavingMeasurements(true);
    try {
      // Save using the apiClient method
      await apiClient.saveMeasurement({
        weight: weight,
        height: height,
        chest_perimeter: parseFloat(measurements.chestPerimeter),
        waist_perimeter: parseFloat(measurements.waistPerimeter),
        hip_perimeter: parseFloat(measurements.hipPerimeter),
        thigh_perimeter: parseFloat(measurements.legPerimeter),
        bicep_perimeter: parseFloat(measurements.armPerimeter),
      });

      Alert.alert('Éxito', 'Medidas guardadas correctamente');
      setMeasurements({
        weight: '',
        height: '',
        chestPerimeter: '',
        waistPerimeter: '',
        hipPerimeter: '',
        legPerimeter: '',
        armPerimeter: '',
      });
    } catch (error) {
      console.error('Error saving measurements:', error);
      Alert.alert('Error', 'No se pudieron guardar las medidas');
    } finally {
      setSavingMeasurements(false);
    }
  };

  const toggleTaskCompletion = async (id) => {
    // Optimistically update UI
    const task = tasks.find((t) => t.id === id);
    if (!task) return;

    const newCompleted = task.status !== 'completed';
    setTasks(
      tasks.map((t) =>
        t.id === id
          ? { ...t, status: newCompleted ? 'completed' : 'pending' }
          : t
      )
    );

    // Update backend
    const success = await updateTaskStatus(id, newCompleted);
    if (!success) {
      // Revert on failure
      setTasks(
        tasks.map((t) => (t.id === id ? { ...t, status: task.status } : t))
      );
      if (selectedTask?.id === id) {
        setSelectedTask((prev) =>
          prev ? { ...prev, status: task.status } : prev
        );
      }
      return;
    }

    // Keep selectedTask in sync
    if (selectedTask?.id === id) {
      setSelectedTask((prev) =>
        prev
          ? { ...prev, status: newCompleted ? 'completed' : 'pending' }
          : prev
      );
    }

    // Refresh from backend to ensure we are consistent
    try {
      const tasksData = await apiClient.getSupabaseTasks();
      setTasks(tasksData);
      if (selectedTask?.id === id) {
        const updated = (tasksData || []).find((t) => t.id === id);
        if (updated) setSelectedTask(updated);
      }
    } catch {
      // ignore
    }
  };

  const openTaskDetail = async (task) => {
    setSelectedTask(task);
    setTaskDetailOpen(true);
    // Fetch task attachments
    try {
      setLoadingAttachments(true);
      const attachments = await apiClient.getTaskAttachments(task.id);
      setTaskAttachments(attachments);
    } catch (error) {
      console.error('Error fetching task attachments:', error);
      setTaskAttachments([]);
    } finally {
      setLoadingAttachments(false);
    }
  };

  const closeTaskDetail = () => {
    setTaskDetailOpen(false);
    setSelectedTask(null);
    setTaskAttachments([]);
  };

  const openInApp = (url) => {
    if (!url) return;
    setWebUrl(url);
    setWebOpen(true);
  };

  const closeWeb = () => {
    setWebOpen(false);
    setWebUrl(null);
  };

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const completionPercentage =
    tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <LinearGradient colors={['#4ecdc4', '#44a08d']} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Header title="Tareas" subtitle="Gestiona tus objetivos diarios" />

          {/* Progress Overview */}
          <View style={styles.progressOverview}>
            <View style={styles.progressCard}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressPercentage}>
                  {completionPercentage}%
                </Text>
              </View>
              <View style={styles.progressInfo}>
                <Text style={styles.progressLabel}>Tareas Completadas</Text>
                <Text style={styles.progressValue}>
                  {completedCount} de {tasks.length}
                </Text>
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
                  description={task.description}
                  dueDate={
                    task.due_date
                      ? new Date(task.due_date).toLocaleDateString('es-ES')
                      : 'Sin fecha'
                  }
                  priority={
                    task.priority === 'high'
                      ? 'Alta'
                      : task.priority === 'medium'
                        ? 'Media'
                        : 'Baja'
                  }
                  completed={task.status === 'completed'}
                  video_url={task.video_url || task.config?.video_url || null}
                  media={task.config?.media || null}
                  type={task.type}
                  onPress={() => openTaskDetail(task)}
                  onToggleComplete={() => toggleTaskCompletion(task.id)}
                />
              ))
            )}
          </View>

          {/* Task Detail Modal */}
          <Modal
            visible={taskDetailOpen}
            transparent
            animationType="slide"
            onRequestClose={closeTaskDetail}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle} numberOfLines={2}>
                    {selectedTask?.title || 'Tarea'}
                  </Text>
                  <TouchableOpacity
                    onPress={closeTaskDetail}
                    style={styles.modalClose}
                  >
                    <Ionicons name="close" size={22} color="#111" />
                  </TouchableOpacity>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  {selectedTask?.description ? (
                    <Text style={styles.modalDescription}>
                      {selectedTask.description}
                    </Text>
                  ) : null}

                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Estado:</Text>
                    <Text style={styles.modalMetaValue}>
                      {selectedTask?.status === 'completed'
                        ? 'Completada'
                        : 'Pendiente'}
                    </Text>
                  </View>

                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Prioridad:</Text>
                    <Text style={styles.modalMetaValue}>
                      {selectedTask?.priority === 'high'
                        ? 'Alta'
                        : selectedTask?.priority === 'medium'
                          ? 'Media'
                          : 'Baja'}
                    </Text>
                  </View>

                  <View style={styles.modalMetaRow}>
                    <Text style={styles.modalMetaLabel}>Fecha límite:</Text>
                    <Text style={styles.modalMetaValue}>
                      {selectedTask?.due_date
                        ? new Date(selectedTask.due_date).toLocaleDateString(
                            'es-ES'
                          )
                        : 'Sin fecha'}
                    </Text>
                  </View>

                  {/* Show video from video_url, config.video_url, or config.media array */}
                  {(selectedTask?.video_url || selectedTask?.config?.video_url || (selectedTask?.config?.media && selectedTask.config.media.length > 0)) ? (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalSectionTitle}>Contenido</Text>
                      
                      {/* Video directo desde video_url o config.video_url */}
                      {(selectedTask?.video_url || selectedTask?.config?.video_url) && (
                        <View
                          style={{
                            marginTop: 8,
                            borderRadius: 12,
                            overflow: 'hidden',
                          }}
                        >
                          <VideoPlayer
                            videoUrl={selectedTask.video_url || selectedTask.config?.video_url}
                            title={selectedTask.title}
                            style={{ height: 220 }}
                            onOpen={openInApp}
                          />
                        </View>
                      )}

                      {/* Videos desde config.media array */}
                      {selectedTask?.config?.media && selectedTask.config.media.length > 0 && (
                        selectedTask.config.media.map((media, index) => (
                          media.type === 'video' && media.url ? (
                            <View
                              key={index}
                              style={{
                                marginTop: 8,
                                borderRadius: 12,
                                overflow: 'hidden',
                              }}
                            >
                              <VideoPlayer
                                videoUrl={apiClient.normalizeSupabaseUrl(media.url)}
                                title={media.name || `Video ${index + 1}`}
                                style={{ height: 220 }}
                                onOpen={openInApp}
                              />
                            </View>
                          ) : null
                        ))
                      )}
                    </View>
                  ) : null}

                  {/* Show task attachments (videos uploaded by admin) */}
                  {taskAttachments.length > 0 && (
                    <View style={{ marginTop: 12 }}>
                      <Text style={styles.modalSectionTitle}>
                        Archivos Adjuntos ({taskAttachments.length})
                      </Text>
                      {loadingAttachments ? (
                        <ActivityIndicator size="small" color="#4ecdc4" style={{ marginTop: 10 }} />
                      ) : (
                        taskAttachments.map((attachment) => (
                          attachment.file_type === 'video' ? (
                            <View
                              key={attachment.id}
                              style={{
                                marginTop: 8,
                                borderRadius: 12,
                                overflow: 'hidden',
                              }}
                            >
                              <VideoPlayer
                                videoUrl={apiClient.normalizeSupabaseUrl(attachment.file_url)}
                                title={attachment.original_filename}
                                style={{ height: 220 }}
                                onOpen={openInApp}
                              />
                              {attachment.description && (
                                <Text style={styles.attachmentDescription}>
                                  {attachment.description}
                                </Text>
                              )}
                            </View>
                          ) : attachment.file_type === 'image' ? (
                            <View
                              key={attachment.id}
                              style={{
                                marginTop: 8,
                                borderRadius: 12,
                                overflow: 'hidden',
                                backgroundColor: '#f5f5f5',
                              }}
                            >
                              <Text style={styles.attachmentName}>
                                📎 {attachment.original_filename}
                              </Text>
                              <TouchableOpacity
                                onPress={() => openInApp(apiClient.normalizeSupabaseUrl(attachment.file_url))}
                                style={styles.viewAttachmentButton}
                              >
                                <Text style={styles.viewAttachmentText}>Ver archivo</Text>
                              </TouchableOpacity>
                            </View>
                          ) : null
                        ))
                      )}
                    </View>
                  )}
                </ScrollView>

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={[
                      styles.modalActionButton,
                      selectedTask?.status === 'completed'
                        ? styles.modalActionSecondary
                        : styles.modalActionPrimary,
                    ]}
                    onPress={async () => {
                      if (!selectedTask?.id) return;
                      await toggleTaskCompletion(selectedTask.id);
                    }}
                  >
                    <Text style={styles.modalActionText}>
                      {selectedTask?.status === 'completed'
                        ? 'Marcar como pendiente'
                        : 'Marcar como completada'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* In-app WebView */}
          <Modal
            visible={webOpen}
            animationType="slide"
            onRequestClose={closeWeb}
          >
            <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
              <View style={styles.webHeader}>
                <TouchableOpacity onPress={closeWeb} style={styles.webClose}>
                  <Ionicons name="chevron-back" size={24} color="#fff" />
                  <Text style={styles.webCloseText}>Volver</Text>
                </TouchableOpacity>
              </View>
              {webUrl ? (
                <WebView
                  source={{ uri: webUrl }}
                  startInLoadingState
                  renderLoading={() => (
                    <View
                      style={{
                        flex: 1,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <ActivityIndicator size="large" color="#10b981" />
                      <Text style={{ color: '#fff', marginTop: 12 }}>
                        Cargando...
                      </Text>
                    </View>
                  )}
                />
              ) : null}
            </SafeAreaView>
          </Modal>

          {/* Measurements Section */}
          <View style={styles.measurementsSection}>
            <View style={styles.measurementsHeader}>
              <Ionicons name="body" size={24} color="#fff" />
              <Text style={styles.sectionTitle}>Mediciones Corporales</Text>
            </View>
            <Text style={styles.measurementsSubtitle}>
              Registra tus medidas para seguimiento
            </Text>

            <View style={styles.formContainer}>
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Peso (kg)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="scale"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 70"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.weight}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, weight: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Altura (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 175"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.height}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, height: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Pecho (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 95"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.chestPerimeter}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, chestPerimeter: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Cintura (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 80"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.waistPerimeter}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, waistPerimeter: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Cadera (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 95"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.hipPerimeter}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, hipPerimeter: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Pierna (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 50"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.legPerimeter}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, legPerimeter: value })
                    }
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Perímetro de Brazo (cm)</Text>
                <View style={styles.inputWrapper}>
                  <Ionicons
                    name="resize"
                    size={18}
                    color="#999"
                    style={styles.inputIcon}
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Ej: 30"
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                    value={measurements.armPerimeter}
                    onChangeText={(value) =>
                      setMeasurements({ ...measurements, armPerimeter: value })
                    }
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  savingMeasurements && styles.disabledButton,
                ]}
                onPress={handleSave}
                disabled={savingMeasurements}
              >
                {savingMeasurements ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color="#fff"
                    style={styles.buttonIcon}
                  />
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    paddingRight: 12,
  },
  modalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalDescription: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalMetaLabel: {
    fontSize: 13,
    color: '#6b7280',
  },
  modalMetaValue: {
    fontSize: 13,
    color: '#111827',
    fontWeight: '600',
  },
  modalSectionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modalActions: {
    marginTop: 12,
  },
  modalActionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalActionPrimary: {
    backgroundColor: '#10b981',
  },
  modalActionSecondary: {
    backgroundColor: '#6b7280',
  },
  modalActionText: {
    color: '#fff',
    fontWeight: '700',
  },
  webHeader: {
    height: 48,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
  },
  webClose: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  webCloseText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 4,
  },
  attachmentDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  attachmentName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    padding: 12,
  },
  viewAttachmentButton: {
    backgroundColor: '#4ecdc4',
    padding: 10,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewAttachmentText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});

export default TasksScreen;
