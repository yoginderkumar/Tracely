// src/components/NumberDot.tsx
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native'; // Import Pressable
import { colors } from '../styles/globalStyles';

interface NumberDotProps {
  number: number;
  isStart?: boolean;
  isActive?: boolean;
  isCompleted?: boolean;
  x: number;
  y: number;
  size: number;
  onPress: (dotNumber: number, position: { x: number; y: number }) => void; // New: Callback for press
  dotPosition: { x: number; y: number }; // Rename position to dotPosition to avoid conflict with pixel x,y
}

const NumberDot: React.FC<NumberDotProps> = ({
  number,
  isStart = false,
  isActive = false,
  isCompleted = false,
  x,
  y,
  size,
  onPress, // Destructure the new prop
  dotPosition, // Destructure the new prop
}) => {
  const fontSize = size * 0.6;

  const dot: ViewStyle = {
      width: size,
      height: size,
      borderRadius: size / 2,
      position: 'absolute',
      left: x - size / 2,
      top: y - size / 2,
    }

  const dotStyles = [
    styles.dotBase,
    dot,
    // Only apply 'active' style if it's explicitly active and not completed
    isActive && !isCompleted && styles.dotActive,
    isCompleted && styles.dotCompleted,
    isStart && !isCompleted && styles.dotStart, // Apply start style if not completed
  ];

  return (
    <Pressable
      style={dotStyles}
      onPress={() => onPress(number, dotPosition)} // Call onPress with dot's number and grid position
      accessibilityLabel={`Number ${number} dot`}
    >
      <Text style={[styles.dotText, { fontSize: fontSize }]}>{number}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  dotBase: {
    backgroundColor: colors.text,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gridBorder,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  dotText: {
    color: colors.background,
    fontWeight: 'bold',
  },
  dotActive: {
    borderColor: colors.primaryHighlight,
    borderWidth: 3,
    backgroundColor: colors.primaryHighlight,
    // Optional: add a slight scale animation on active for feedback
    transform: [{ scale: 1.1 }],
  },
  dotCompleted: {
    borderColor: colors.primaryHighlight,
    backgroundColor: colors.gridCell,
    borderWidth: 3,
  },
  dotStart: {
    borderColor: colors.primaryHighlight,
    borderWidth: 3,
  },
});

export default NumberDot;