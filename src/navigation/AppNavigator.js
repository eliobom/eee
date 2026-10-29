import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

// Import screens
import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import ClassesScreen from '../screens/ClassesScreen';
import ClassDetailScreen from '../screens/ClassDetailScreen';
import TasksScreen from '../screens/TasksScreen';
import ProfileScreen from '../screens/ProfileScreen';
import LiveClassesScreen from '../screens/LiveClassesScreen';

const Stack = createStackNavigator();
const Drawer = createDrawerNavigator();

// Custom drawer content
const CustomDrawerContent = ({ navigation, user }) => {
  const { logout } = useAuth();
  const menuItems = [
    { name: 'Home', label: 'Inicio', icon: 'home' },
    { name: 'Classes', label: 'Clases', icon: 'book' },
    { name: 'Tasks', label: 'Tareas', icon: 'checkmark-circle' },
    { name: 'Profile', label: 'Perfil', icon: 'person' },
    { name: 'LiveClasses', label: 'Clases en Vivo', icon: 'videocam' },
  ];

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          onPress: async () => {
            // Reset navigation to Login screen
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
            await logout();
          },
        },
      ]
    );
  };

  const handleMenuPress = (screenName) => {
    // Navigate to the screen in the Main stack
    navigation.navigate('Main', { screen: screenName });
    navigation.closeDrawer();
  };

  return (
    <View style={styles.drawerContainer}>
      {/* User Info */}
      <View style={styles.userInfo}>
        <Ionicons name="person-circle" size={50} color="#4c669f" />
        <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
        <Text style={styles.userRole}>
          {user?.role === 'user'
            ? 'Usuario'
            : user?.role === 'trainer'
              ? 'Entrenador'
              : 'Admin'}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item) => (
          <TouchableOpacity
            key={item.name}
            style={styles.menuItem}
            onPress={() => handleMenuPress(item.name)}
          >
            <Ionicons name={item.icon} size={24} color="#4c669f" />
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Logout Button */}
      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out" size={24} color="#fff" />
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

// Main stack navigator for authenticated screens
const MainStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: '#4c669f',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        headerLeft: () => (
          <TouchableOpacity
            onPress={() => navigation.openDrawer()}
            style={{ marginLeft: 15 }}
          >
            <Ionicons name="menu" size={24} color="#fff" />
          </TouchableOpacity>
        ),
      })}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio' }}
      />
      <Stack.Screen
        name="Classes"
        component={ClassesScreen}
        options={{ title: 'Clases' }}
      />
      <Stack.Screen
        name="ClassDetail"
        component={ClassDetailScreen}
        options={{ title: 'Detalle de Clase' }}
      />
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
        options={{ title: 'Tareas' }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil' }}
      />
      <Stack.Screen
        name="LiveClasses"
        component={LiveClassesScreen}
        options={{ title: 'Clases en Vivo' }}
      />
    </Stack.Navigator>
  );
};

// Drawer navigator
const DrawerNavigator = ({ user }) => {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} user={user} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Main" component={MainStack} />
    </Drawer.Navigator>
  );
};

const AppNavigator = () => {
  const { user, login, logout, isLoading } = useAuth();

  // Always show Login initially, navigate to MainApp after login
  // This prevents blank screen while auth context loads
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Login">
          {(props) => <LoginScreen {...props} onLogin={login} />}
        </Stack.Screen>
        <Stack.Screen name="MainApp">
          {(props) => (
            <DrawerNavigator {...props} user={user} onLogout={logout} />
          )}
        </Stack.Screen>
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  userInfo: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
  },
  userRole: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    paddingLeft: 20,
  },
  menuText: {
    fontSize: 16,
    marginLeft: 15,
    color: '#333',
  },
  logoutContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 8,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AppNavigator;
