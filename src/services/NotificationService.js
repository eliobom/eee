import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient } from '../apiClient';

// Configure notification handler only on mobile platforms
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

class NotificationService {
  constructor() {
    // Only configure on mobile platforms
    if (Platform.OS !== 'web') {
      this.configure();
    }
  }

  configure = async () => {
    // Skip configuration on web
    if (Platform.OS === 'web') {
      return;
    }

    // Request permissions
    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }

    // Get push token
    const token = await Notifications.getExpoPushTokenAsync();
    console.log('Push token:', token.data);

    // Save token to backend (would be called when user logs in)
    this.pushToken = token.data;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }
  };

  // Register push token with backend
  registerPushToken = async (userId, token) => {
    try {
      await apiClient.registerPushToken({
        user_id: userId,
        push_token: token,
        platform: Platform.OS,
      });
      console.log('Push token registered successfully');
    } catch (error) {
      console.error('Error registering push token:', error);
    }
  };

  // Schedule local notification
  scheduleNotification = async (title, body, data = {}, delay = 0) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default',
      },
      trigger: delay > 0 ? { seconds: delay } : null,
    });
  };

  // Send push notification via backend
  sendPushNotification = async (userId, title, message, data = {}) => {
    try {
      await apiClient.sendPushNotification({
        user_id: userId,
        title,
        message,
        data,
      });
      console.log('Push notification sent successfully');
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  };

  // Task reminder notifications
  scheduleTaskReminder = async (task) => {
    const reminderTime = new Date(task.due_date);
    reminderTime.setHours(reminderTime.getHours() - 1); // 1 hour before

    if (reminderTime > new Date()) {
      await this.scheduleNotification(
        'Recordatorio de tarea',
        `No olvides completar: ${task.title}`,
        { type: 'task_reminder', taskId: task.id },
        Math.floor((reminderTime - new Date()) / 1000)
      );
    }
  };

  // Live class notifications
  scheduleLiveClassReminder = async (liveClass) => {
    const classTime = new Date(liveClass.scheduled_at);
    const reminderTime = new Date(classTime.getTime() - 15 * 60 * 1000); // 15 minutes before

    if (reminderTime > new Date()) {
      await this.scheduleNotification(
        'Clase en vivo próximamente',
        `${liveClass.title} comienza en 15 minutos`,
        { type: 'live_class', classId: liveClass.id },
        Math.floor((reminderTime - new Date()) / 1000)
      );
    }
  };

  // Achievement notifications
  showAchievementNotification = async (achievement) => {
    await this.scheduleNotification(
      '¡Nuevo logro desbloqueado!',
      `Felicitaciones: ${achievement.name}`,
      { type: 'achievement', achievementId: achievement.id }
    );
  };

  // Motivational notifications
  scheduleMotivationalNotification = async () => {
    const messages = [
      '¡Sigue adelante! Cada paso cuenta.',
      'Tu cuerpo te lo agradecerá mañana.',
      '¡Estás más cerca de tus objetivos!',
      'Recuerda: la consistencia es clave.',
      '¡Hoy es un gran día para entrenar!',
    ];

    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    // Schedule for tomorrow at 9 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    await this.scheduleNotification(
      'Motivación diaria',
      randomMessage,
      { type: 'motivation' },
      Math.floor((tomorrow - new Date()) / 1000)
    );
  };

  // Cancel all scheduled notifications
  cancelAllNotifications = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };
}

// Only instantiate on mobile platforms
const notificationService = Platform.OS !== 'web' ? new NotificationService() : null;
export default notificationService;
