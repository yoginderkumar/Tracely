// src/components/GameControls.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface GameControlsProps {
  onUndo: () => void;
  onReset: () => void;
  canUndo: boolean;
  levelComplete: boolean;
}

export default function GameControls({ onUndo, onReset, canUndo, levelComplete }: GameControlsProps) {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, !canUndo && styles.disabledButton]}
        onPress={onUndo}
        disabled={!canUndo}
      >
        <Text style={[styles.buttonText, !canUndo && styles.disabledText]}>
          Undo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={onReset}
      >
        <Text style={styles.buttonText}>
          Hint
        </Text>
      </TouchableOpacity>

      {levelComplete && (
        <View style={styles.completionMessage}>
          <Text style={styles.completionText}>Level Complete!</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#2C2C2E',
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#48484A',
  },
  disabledButton: {
    backgroundColor: '#1C1C1E',
    borderColor: '#2C2C2E',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledText: {
    color: '#666',
  },
  completionMessage: {
    position: 'absolute',
    top: -50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  completionText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FF6B9D',
  },
});