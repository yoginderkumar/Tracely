// src/styles/globalStyles.ts
import { StyleSheet } from 'react-native';

export const colors = {
  background: '#282c34', // Dark theme background
  gridBorder: '#444',
  gridCell: '#3a3f47',
  primaryHighlight: '#8a2be2', // Purple/pink for highlights
  text: '#ffffff',
};

const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // You can add more global styles here later
});

export default globalStyles;