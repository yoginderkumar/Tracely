// src/styles/gameStyles.ts
import { StyleSheet } from 'react-native';
import { colors } from './globalStyles';

const gameStyles = StyleSheet.create({
  gameGridContainer: {
    width: 300,
    height: 300,
    backgroundColor: colors.gridCell,
    borderRadius: 10,
    overflow: 'hidden', // Ensures children respect border radius
    borderWidth: 2,
    borderColor: colors.gridBorder,
    // --- NEW: Remove flex properties here ---
    // flexDirection: 'row',
    // flexWrap: 'wrap',
    position: 'relative', // IMPORTANT: This makes it a positioning context for absolute children
  },
  gridRow: { // This style isn't directly used for now but is good to keep for row-based layouts
    flexDirection: 'row',
    flex: 1,
  },
  gridCell: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default gameStyles;