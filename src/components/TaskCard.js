import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const TaskCard = ({ title, dueDate, priority, completed, onPress }) => {
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Alta':
        return '#ef4444';
      case 'Media':
        return '#f59e0b';
      case 'Baja':
        return '#10b981';
      default:
        return '#6b7280';
    }
  };

  return (
    <TouchableOpacity 
      style={[styles.card, completed && styles.completedCard]} 
      onPress={onPress}
    >
      <View style={styles.checkboxContainer}>
        <View style={[styles.checkbox, completed && styles.checkedBox]}>
          {completed && <Ionicons name="checkmark" size={16} color="#fff" />}
        </View>
      </View>
      
      <View style={styles.content}>
        <Text 
          style={[styles.title, completed && styles.completedTitle]} 
          numberOfLines={2}
        >
          {title}
        </Text>
        <View style={styles.footer}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar" size={14} color="#666" />
            <Text style={styles.date}>{dueDate}</Text>
          </View>
          <View style={[styles.priorityBadge, { backgroundColor: getPriorityColor(priority) }]}>
            <Text style={styles.priorityText}>{priority}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  completedCard: {
    backgroundColor: '#f9fafb',
  },
  checkboxContainer: {
    marginRight: 15,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#d1d5db',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkedBox: {
    backgroundColor: '#10b981',
    borderColor: '#10b981',
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  completedTitle: {
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 5,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default TaskCard;
