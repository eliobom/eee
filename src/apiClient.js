import { supabase } from './supabaseClient';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  token: 'twm_token',
  user: 'twm_user',
};

// Storage adapter for web
const storage = {
  getItem: async (key) => {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: async (key, value) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
      return;
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key) => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
      return;
    }
    return AsyncStorage.removeItem(key);
  },
};

class ApiClient {
  constructor() {
    this.token = null;
    this.currentAppUser = null;
  }

  setToken(token) {
    this.token = token;
  }

  setCurrentUser(user) {
    this.currentAppUser = user;
  }

  async hydrateSession() {
    try {
      const [token, userRaw] = await Promise.all([
        storage.getItem(STORAGE_KEYS.token),
        storage.getItem(STORAGE_KEYS.user),
      ]);

      if (token) {
        this.token = token;
      }

      if (userRaw) {
        const parsed = JSON.parse(userRaw);
        if (parsed && parsed.id) {
          this.currentAppUser = parsed;
        }
      }
    } catch {
      // ignore hydration errors
    }
  }

  async persistSession(token, user) {
    try {
      await Promise.all([
        storage.setItem(
          STORAGE_KEYS.token,
          String(token || this.token || '')
        ),
        storage.setItem(
          STORAGE_KEYS.user,
          JSON.stringify(user || this.currentAppUser || null)
        ),
      ]);
    } catch {
      // ignore persistence errors
    }
  }

  async clearSession() {
    this.token = null;
    this.currentAppUser = null;

    try {
      await Promise.all([
        storage.removeItem(STORAGE_KEYS.token),
        storage.removeItem(STORAGE_KEYS.user),
      ]);
    } catch {
      // ignore
    }
  }

  // ============ Supabase Authentication ============

  async loginWithSupabase(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Store the session
      if (data.session) {
        this.setToken(data.session.access_token);
        await this.persistSession(data.session.access_token, data.user);
      }

      return {
        user: data.user,
        token: data.session?.access_token,
      };
    } catch (error) {
      console.error('Supabase login error:', error);
      throw error;
    }
  }

  async registerWithSupabase(email, password, userData = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (error) throw error;

      return {
        user: data.user,
        session: data.session,
      };
    } catch (error) {
      console.error('Supabase register error:', error);
      throw error;
    }
  }

  async signOutFromSupabase() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      await this.clearSession();
    } catch (error) {
      console.error('Supabase sign out error:', error);
      throw error;
    }
  }

  async getSupabaseUser() {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  // ============ Legacy Login (for backward compatibility) ============
  async loginAppUser(credentials) {
    const emailOrUsername = String(
      credentials?.email || credentials?.username || ''
    ).trim();
    const password = String(credentials?.password || '').trim();

    if (!emailOrUsername) throw new Error('Usuario requerido');
    if (!password) throw new Error('Contraseña requerida');

    // Prefer exact match by email if it looks like an email
    const isEmail = emailOrUsername.includes('@');

    let appUser = null;

    if (isEmail) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('email', emailOrUsername)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      appUser = data || null;
    }

    if (!appUser) {
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .ilike('username', emailOrUsername)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      appUser = data || null;
    }

    if (!appUser) {
      throw new Error('Usuario no encontrado');
    }

    if (appUser.status && appUser.status !== 'active') {
      throw new Error('Usuario inactivo');
    }

    // NOTE: This is a client-side check. For production use Supabase Auth or a secure server-side compare.
    // For now we accept if password matches the stored value OR the development password.
    const stored = String(appUser.password_hash || '').trim();
    const validPassword =
      password === '123456' || (stored && password === stored);
    if (!validPassword) {
      throw new Error('Contraseña incorrecta');
    }

    const userToken = `app_user_token_${appUser.id}`;
    const userData = { ...appUser, role: 'user' };
    this.token = userToken;
    this.currentAppUser = userData;

    await this.persistSession(userToken, userData);

    return {
      user: userData,
      token: userToken,
    };
  }

  async login(credentials) {
    // Mobile app should authenticate against `app_users`.
    return this.loginAppUser(credentials);
  }

  getCurrentAppUser() {
    const u = this.currentAppUser;
    if (!u || !u.id) {
      throw new Error('No user logged in');
    }
    return u;
  }

  async register(userData) {
    // Use Supabase auth
    return await this.registerWithSupabase(userData.email, userData.password, {
      username: userData.username,
      full_name: userData.fullName,
    });
  }

  // ============ Supabase Data Methods (using existing database schema) ============

  // Get user's tasks assigned by their trainer
  async getSupabaseTasks() {
    try {
      const appUser = this.getCurrentAppUser();

      // Mostrar tareas específicas del usuario O tareas sin user_id (para todos)
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .or(`user_id.eq.${appUser.id},user_id.is.null`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Supabase tasks:', error);
      throw error;
    }
  }

  async getSupabaseClasses() {
    try {
      const appUser = this.getCurrentAppUser();

      // If user has a trainer, get classes from that trainer
      if (appUser?.trainer_id) {
        const { data: classesData, error: classesError } = await supabase
          .from('classes')
          .select('*')
          .eq('instructor_id', appUser.trainer_id)
          .order('created_at', { ascending: false });

        if (classesError) throw classesError;
        return classesData || [];
      }

      // Otherwise get all available classes
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Supabase classes:', error);
      throw error;
    }
  }

  async getSupabaseLiveClasses() {
    try {
      const appUser = this.getCurrentAppUser();

      // If user has a trainer, get live classes from that trainer
      if (appUser?.trainer_id) {
        const { data: liveClassesData, error: liveClassesError } =
          await supabase
            .from('live_classes')
            .select('*')
            .eq('trainer_id', appUser.trainer_id)
            .gte('scheduled_at', new Date().toISOString())
            .order('scheduled_at', { ascending: true });

        if (liveClassesError) throw liveClassesError;
        return liveClassesData || [];
      }

      // Otherwise get all upcoming live classes
      const { data, error } = await supabase
        .from('live_classes')
        .select('*')
        .gte('scheduled_at', new Date().toISOString())
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching Supabase live classes:', error);
      throw error;
    }
  }

  async getSupabaseProfile() {
    try {
      const appUser = this.getCurrentAppUser();

      // Ensure we return the latest profile from DB
      const { data, error } = await supabase
        .from('app_users')
        .select('*')
        .eq('id', appUser.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data || appUser;
    } catch (error) {
      console.error('Error fetching Supabase profile:', error);
      throw error;
    }
  }

  async updateSupabaseTaskStatus(taskId, status) {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .update({
          status,
          updated_at: new Date().toISOString(),
          completed_at:
            status === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', taskId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating Supabase task:', error);
      throw error;
    }
  }

  async saveMeasurement(measurementData) {
    try {
      const appUser = this.getCurrentAppUser();

      const { data, error } = await supabase
        .from('body_measurements')
        .insert({
          user_id: appUser.id,
          weight: measurementData.weight,
          height: measurementData.height,
          chest_perimeter: measurementData.chest_perimeter,
          waist_perimeter: measurementData.waist_perimeter,
          hip_perimeter: measurementData.hip_perimeter,
          thigh_perimeter: measurementData.thigh_perimeter,
          bicep_perimeter: measurementData.bicep_perimeter,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error saving measurement:', error);
      throw error;
    }
  }

  // Get class attachments
  async getClassAttachments(classId) {
    try {
      const { data, error } = await supabase
        .from('class_attachments')
        .select('*')
        .eq('class_id', classId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching class attachments:', error);
      return [];
    }
  }

  // Get task attachments
  async getTaskAttachments(taskId) {
    try {
      const { data, error } = await supabase
        .from('task_attachments')
        .select('*')
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching task attachments:', error);
      return [];
    }
  }

  // Normalize Supabase Storage URLs - mejorado
  normalizeSupabaseUrl(url) {
    if (!url) return '';
    const normalized = String(url).trim();

    // Si ya tiene /storage/v1/object/public/, retornar tal cual
    if (normalized.includes('/storage/v1/object/public/')) return normalized;

    // Si tiene /storage/v1/object/ pero sin /public/, agregarlo
    if (normalized.includes('/storage/v1/object/')) {
      return normalized.replace('/storage/v1/object/', '/storage/v1/object/public/');
    }

    // Si es una URL de Supabase sin la ruta completa, intentar construir
    if (normalized.startsWith('http://') || normalized.startsWith('https://')) {
      try {
        const urlObj = new URL(normalized);
        if (urlObj.pathname.includes('/storage/v1/object/') && !urlObj.pathname.includes('/public/')) {
          urlObj.pathname = urlObj.pathname.replace('/storage/v1/object/', '/storage/v1/object/public/');
          return urlObj.toString();
        }
      } catch {
        // Si hay error al parsear URL, retornar original
      }
    }

    return normalized;
  }

  // ============ End Supabase Data Methods ============
}

export const apiClient = new ApiClient();
