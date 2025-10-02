
import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  Pressable, 
  Platform,
  Dimensions,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withTiming,
  interpolate
} from "react-native-reanimated";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const onboardingSteps = [
  {
    title: "Welcome to Couply",
    subtitle: "Where Couples Grow Together",
    description: "Connect privately with your partner and build stronger relationships through shared experiences.",
    icon: "heart.fill",
    color: colors.primary,
  },
  {
    title: "Private & Secure",
    subtitle: "Your Love, Your Space",
    description: "Enjoy secure messaging, shared calendars, and private moments designed just for you two.",
    icon: "lock.shield.fill",
    color: colors.secondary,
  },
  {
    title: "Grow Together",
    subtitle: "Build Lasting Memories",
    description: "Track your journey, set goals together, and celebrate milestones as your relationship flourishes.",
    icon: "arrow.up.heart.fill",
    color: colors.accent,
  },
];

export default function OnboardingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const animatedValue = useSharedValue(0);

  const nextStep = () => {
    if (currentStep < onboardingSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      animatedValue.value = withSpring(newStep);
    } else {
      // Navigate to main app
      router.replace('/(tabs)/(home)/');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      animatedValue.value = withSpring(newStep);
    }
  };

  const skipOnboarding = () => {
    router.replace('/(tabs)/(home)/');
  };

  const currentStepData = onboardingSteps[currentStep];

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(1, { duration: 300 }),
      transform: [
        {
          translateY: withTiming(0, { duration: 300 }),
        },
      ],
    };
  });

  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: withTiming(`${((currentStep + 1) / onboardingSteps.length) * 100}%`, {
        duration: 300,
      }),
    };
  });

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <LinearGradient
        colors={[currentStepData.color, colors.secondary]}
        style={styles.container}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        {/* Skip Button */}
        <View style={styles.header}>
          <Pressable style={styles.skipButton} onPress={skipOnboarding}>
            <Text style={styles.skipButtonText}>Skip</Text>
          </Pressable>
        </View>

        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View style={[styles.progressFill, progressAnimatedStyle]} />
          </View>
        </View>

        {/* Content */}
        <Animated.View style={[styles.content, contentAnimatedStyle]}>
          <View style={styles.iconContainer}>
            <View style={[styles.iconCircle, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
              <IconSymbol 
                name={currentStepData.icon as any} 
                color={colors.card} 
                size={64} 
              />
            </View>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{currentStepData.title}</Text>
            <Text style={styles.subtitle}>{currentStepData.subtitle}</Text>
            <Text style={styles.description}>{currentStepData.description}</Text>
          </View>
        </Animated.View>

        {/* Navigation */}
        <View style={styles.navigation}>
          {/* Step Indicators */}
          <View style={styles.stepIndicators}>
            {onboardingSteps.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.stepIndicator,
                  index === currentStep && styles.stepIndicatorActive,
                ]}
              />
            ))}
          </View>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <Pressable style={styles.backButton} onPress={prevStep}>
                <IconSymbol name="chevron.left" color={colors.card} size={20} />
                <Text style={styles.backButtonText}>Back</Text>
              </Pressable>
            )}
            
            <View style={styles.spacer} />
            
            <Pressable style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.nextButtonText}>
                {currentStep === onboardingSteps.length - 1 ? "Get Started" : "Next"}
              </Text>
              <IconSymbol name="chevron.right" color={colors.card} size={20} />
            </Pressable>
          </View>
        </View>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  skipButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  skipButtonText: {
    ...typography.button,
    color: colors.card,
    fontSize: 14,
  },
  progressContainer: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.card,
    borderRadius: 2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  iconContainer: {
    marginBottom: spacing.xxl,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    ...typography.h1,
    color: colors.card,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.h3,
    color: colors.card,
    opacity: 0.9,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    ...typography.body,
    color: colors.card,
    opacity: 0.8,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 300,
  },
  navigation: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  stepIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.sm,
  },
  stepIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  stepIndicatorActive: {
    backgroundColor: colors.card,
    width: 24,
  },
  navigationButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  backButtonText: {
    ...typography.button,
    color: colors.card,
    marginLeft: spacing.xs,
  },
  spacer: {
    flex: 1,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: borderRadius.md,
    backgroundColor: colors.card,
  },
  nextButtonText: {
    ...typography.button,
    color: colors.primary,
    marginRight: spacing.xs,
  },
});
