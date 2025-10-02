
import React from "react";
import { Stack } from "expo-router";
import { ScrollView, View, Text, Pressable, StyleSheet, Platform, Image } from "react-native";
import { IconSymbol } from "@/components/IconSymbol";
import { GlassView } from "expo-glass-effect";
import { useTheme } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";

export default function HomeScreen() {
  const theme = useTheme();

  const quickActions = [
    {
      title: "Send Love Note",
      description: "Share a sweet message",
      icon: "heart.text.square.fill",
      color: colors.primary,
      action: () => console.log("Send love note"),
    },
    {
      title: "Plan Date Night",
      description: "Schedule quality time",
      icon: "calendar.badge.plus",
      color: colors.secondary,
      action: () => console.log("Plan date night"),
    },
    {
      title: "Memory Vault",
      description: "Save precious moments",
      icon: "photo.on.rectangle.angled",
      color: colors.accent,
      action: () => console.log("Open memory vault"),
    },
    {
      title: "Mood Check-in",
      description: "How are you feeling?",
      icon: "face.smiling",
      color: colors.success,
      action: () => console.log("Mood check-in"),
    },
  ];

  const renderQuickAction = (action: typeof quickActions[0], index: number) => (
    <Pressable
      key={index}
      style={styles.quickActionCard}
      onPress={action.action}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color }]}>
        <IconSymbol name={action.icon as any} color={colors.card} size={24} />
      </View>
      <View style={styles.quickActionContent}>
        <Text style={[typography.h3, { fontSize: 16 }]}>{action.title}</Text>
        <Text style={[typography.caption, { marginTop: 2 }]}>{action.description}</Text>
      </View>
      <IconSymbol name="chevron.right" color={colors.textSecondary} size={16} />
    </Pressable>
  );

  const renderHeaderRight = () => (
    <Pressable
      onPress={() => console.log("Settings pressed")}
      style={styles.headerButton}
    >
      <IconSymbol name="gear" color={colors.text} size={20} />
    </Pressable>
  );

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      {Platform.OS === 'ios' && (
        <Stack.Screen
          options={{
            title: "",
            headerTransparent: true,
            headerRight: renderHeaderRight,
            headerStyle: {
              backgroundColor: 'transparent',
            },
          }}
        />
      )}
      
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section with Gradient */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.welcomeText}>Welcome to</Text>
            <Text style={styles.appTitle}>Couply</Text>
            <Text style={styles.tagline}>Where Couples Grow Together</Text>
            
            {/* Couple Status Card */}
            <View style={styles.coupleStatusCard}>
              <View style={styles.coupleAvatars}>
                <View style={[styles.avatar, styles.avatarLeft]}>
                  <IconSymbol name="person.fill" color={colors.textSecondary} size={24} />
                </View>
                <View style={[styles.avatar, styles.avatarRight]}>
                  <IconSymbol name="person.fill" color={colors.textSecondary} size={24} />
                </View>
              </View>
              <Text style={styles.coupleStatusText}>Link with your partner to get started</Text>
              <Pressable style={styles.linkButton} onPress={() => console.log("Link partner")}>
                <Text style={styles.linkButtonText}>Link Partner</Text>
              </Pressable>
            </View>
          </View>
        </LinearGradient>

        {/* Quick Actions Section */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* Daily Prompt Section */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Today's Prompt</Text>
          <View style={styles.promptCard}>
            <View style={styles.promptIcon}>
              <IconSymbol name="lightbulb.fill" color={colors.accent} size={24} />
            </View>
            <View style={styles.promptContent}>
              <Text style={[typography.h3, { fontSize: 16, marginBottom: spacing.xs }]}>
                Send your partner a compliment today
              </Text>
              <Text style={typography.caption}>
                Take a moment to appreciate something special about your partner
              </Text>
            </View>
          </View>
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Recent Activity</Text>
          <View style={styles.activityCard}>
            <IconSymbol name="clock" color={colors.textSecondary} size={20} />
            <Text style={[typography.bodySecondary, { marginLeft: spacing.sm }]}>
              No recent activity yet. Start by linking with your partner!
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: Platform.OS !== 'ios' ? 100 : spacing.xl,
  },
  headerGradient: {
    paddingTop: Platform.OS === 'ios' ? 60 : spacing.lg,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  headerContent: {
    alignItems: 'center',
  },
  welcomeText: {
    ...typography.body,
    color: colors.card,
    opacity: 0.9,
  },
  appTitle: {
    ...typography.h1,
    color: colors.card,
    fontSize: 40,
    fontWeight: '800',
    marginVertical: spacing.xs,
  },
  tagline: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.8,
    marginBottom: spacing.lg,
  },
  coupleStatusCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    width: '100%',
    ...shadows.md,
  },
  coupleAvatars: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: colors.card,
  },
  avatarLeft: {
    marginRight: -10,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -10,
  },
  coupleStatusText: {
    ...typography.body,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  linkButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  linkButtonText: {
    ...typography.button,
    color: colors.card,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  quickActionsGrid: {
    gap: spacing.sm,
  },
  quickActionCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  quickActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  quickActionContent: {
    flex: 1,
  },
  promptCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: spacing.lg,
    backgroundColor: colors.highlight,
  },
  promptIcon: {
    marginRight: spacing.md,
    marginTop: 2,
  },
  promptContent: {
    flex: 1,
  },
  activityCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
