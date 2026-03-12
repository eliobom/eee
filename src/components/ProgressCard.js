import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const ProgressCard = ({ label, value, max, color = '#667eea', icon }) => {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <View style={[styles.card, { borderLeftColor: color, borderLeftWidth: 4 }]}>
      <View style={styles.header}>
        <View style={styles.labelContainer}>
          {icon && <Ionicons name={icon} size={18} color={color} style={styles.icon} />}
          <Text style={[styles.label, { color }]}>{label}</Text>
        </View>
        <Text style={[styles.value, { color }]}>{value}/{max}</Text>
      </View>
      <View style={styles.progressBarContainer}>
        <View
          style={[
            styles.progressBar,
            { width: `${percentage}%`, backgroundColor: color }
          ]}
        />
      </View>
      <View style={styles.footer}>
        <Text style={[styles.percentage, { color }]}>{Math.round(percentage)}% completado</Text>
        <Text style={styles.remaining}>
          {max - value > 0 ? `${max - value} restantes` : 'Completado'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    borderRadius: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  remaining: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
});

export default ProgressCard;
