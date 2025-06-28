import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NumberCellProps {
  number: number;
  size: number;
  isActive?: boolean;
  isNext?: boolean;
  onPress?: () => void;
}

export default function NumberCell({ number, size, isActive = false, isNext = false, onPress }: NumberCellProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <View style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
          },
          isActive && styles.activeCircle,
          isNext && styles.nextCircle
        ]}>
          <Text style={[
            styles.numberText,
            { fontSize: size * 0.45 },
            isActive && styles.activeText,
            isNext && styles.nextText
          ]}>
            {number}
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
    elevation: 10,
  },
  circle: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  activeCircle: {
    backgroundColor: 'white',
  },
  nextCircle: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#FF6B9D',
  },
  numberText: {
    color: '#1C1C1E',
    fontWeight: 'bold',
  },
  activeText: {
    color: '#1C1C1E',
  },
  nextText: {
    color: '#1C1C1E',
  },
});