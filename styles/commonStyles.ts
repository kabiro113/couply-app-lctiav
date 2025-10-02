
import { StyleSheet, ViewStyle, TextStyle } from 'react-native';

// Couply Color Palette
export const colors = {
  background: '#F8F8FF',        // Light, almost white background
  text: '#282828',              // Dark gray for primary text
  textSecondary: '#708090',     // Slate gray for less important text
  primary: '#E91E63',           // Rose Pink (main brand color)
  secondary: '#673AB7',         // Deep Purple (secondary brand color)
  accent: '#FF4081',            // Brighter pink for highlights
  card: '#FFFFFF',              // White for cards and modals
  highlight: '#FFCDD2',         // Very light pink for subtle highlights
  border: '#E0E0E0',            // Light gray for borders
  success: '#4CAF50',           // Green for success states
  warning: '#FF9800',           // Orange for warnings
  error: '#F44336',             // Red for errors
};

export const typography = StyleSheet.create({
  h1: {
    fontSize: 32,
    fontWeight: '700',
    color: colors.text,
    lineHeight: 40,
  },
  h2: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 32,
  },
  h3: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    lineHeight: 28,
  },
  body: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.text,
    lineHeight: 24,
  },
  bodySecondary: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 24,
  },
  caption: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textSecondary,
    lineHeight: 20,
  },
  button: {
    fontSize: 16,
    fontWeight: '600',
    lineHeight: 24,
  },
});

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const borderRadius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};

export const shadows = {
  sm: {
    boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)',
    elevation: 2,
  },
  md: {
    boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
    elevation: 4,
  },
  lg: {
    boxShadow: '0px 10px 15px rgba(0, 0, 0, 0.1)',
    elevation: 8,
  },
};

export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginVertical: spacing.sm,
    ...shadows.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSecondary: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonOutline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    ...typography.button,
    color: colors.card,
  },
  buttonTextOutline: {
    ...typography.button,
    color: colors.primary,
  },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.sm,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.text,
  },
  inputFocused: {
    borderColor: colors.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spaceBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textCenter: {
    textAlign: 'center',
  },
  gradientBackground: {
    flex: 1,
  },
});
