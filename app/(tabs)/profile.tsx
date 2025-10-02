
import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform,
  Alert,
  Switch,
  TextInput,
  Modal
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";
import { router } from "expo-router";

export default function ProfileScreen() {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { couple, updateCouple } = useCouple();
  const [showSettings, setShowSettings] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [partnerEmail, setPartnerEmail] = useState('');
  const [anniversaryDate, setAnniversaryDate] = useState('');

  const profileStats = [
    { label: "Days Together", value: couple?.anniversary_date ? 
      Math.floor((new Date().getTime() - new Date(couple.anniversary_date).getTime()) / (1000 * 60 * 60 * 24)) : 0 },
    { label: "Messages Sent", value: 0 }, // TODO: Get from backend
    { label: "Memories Saved", value: 0 }, // TODO: Get from backend
    { label: "Goals Completed", value: 0 }, // TODO: Get from backend
  ];

  const settingsOptions = [
    {
      title: "Privacy Mode",
      description: "Keep your relationship private",
      icon: "lock.fill",
      type: "toggle" as const,
      value: couple?.is_private_mode || false,
      onToggle: async (value: boolean) => {
        if (couple) {
          await updateCouple({ is_private_mode: value });
        }
      },
    },
    {
      title: "Community Feed",
      description: "Connect with other couples",
      icon: "person.2.fill",
      type: "navigation" as const,
      onPress: () => router.push('/social/feed'),
    },
    {
      title: "Discussion Groups",
      description: "Join couple discussion groups",
      icon: "message.fill",
      type: "navigation" as const,
      onPress: () => router.push('/social/groups'),
    },
    {
      title: "Challenges",
      description: "Participate in fun challenges",
      icon: "star.fill",
      type: "navigation" as const,
      onPress: () => router.push('/social/challenges'),
    },
    {
      title: "Sign Out",
      description: "Sign out of your account",
      icon: "arrow.right.square.fill",
      type: "navigation" as const,
      onPress: () => handleSignOut(),
    },
  ];

  const achievements = [
    { title: "First Message", description: "Sent your first message", icon: "message.fill", earned: true },
    { title: "Week Strong", description: "7 days together", icon: "calendar", earned: true },
    { title: "Memory Keeper", description: "Saved 10 memories", icon: "photo.fill", earned: true },
    { title: "Goal Getter", description: "Completed first goal", icon: "target", earned: false },
    { title: "Social Butterfly", description: "Joined the community", icon: "person.2.fill", earned: false },
  ];

  const linkPartner = () => {
    setShowLinkModal(true);
  };

  const handleLinkPartner = async () => {
    if (!partnerEmail.trim()) {
      Alert.alert('Error', 'Please enter your partner\'s email address');
      return;
    }

    // For now, just show a message. In a real app, you'd implement the linking logic
    Alert.alert(
      'Feature Coming Soon',
      'Partner linking will be available soon! For now, both partners need to sign up separately.'
    );
    setShowLinkModal(false);
    setPartnerEmail('');
  };

  const editProfile = () => {
    Alert.alert('Feature Coming Soon', 'Profile editing will be available soon!');
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive',
          onPress: async () => {
            const result = await signOut();
            if (result.success) {
              router.replace('/auth/login');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Your Profile</Text>
            <Pressable style={styles.settingsButton} onPress={() => setShowSettings(!showSettings)}>
              <IconSymbol name="gear" color={colors.card} size={20} />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Couple Profile Card */}
        <View style={styles.section}>
          <View style={styles.coupleCard}>
            <View style={styles.coupleAvatars}>
              <View style={[styles.avatar, styles.avatarLeft]}>
                <IconSymbol name="person.fill" color={colors.textSecondary} size={32} />
              </View>
              {profile.isLinked ? (
                <View style={[styles.avatar, styles.avatarRight]}>
                  <IconSymbol name="person.fill" color={colors.textSecondary} size={32} />
                </View>
              ) : (
                <View style={[styles.avatar, styles.avatarRight, styles.avatarEmpty]}>
                  <IconSymbol name="plus" color={colors.textSecondary} size={24} />
                </View>
              )}
            </View>
            
            <Text style={[typography.h2, { textAlign: 'center', marginTop: spacing.md }]}>
              {couple ? 
                (couple.couple_name || `${couple.partner1?.name} & ${couple.partner2?.name}`) : 
                profile?.name || "Your Profile"
              }
            </Text>
            
            {couple ? (
              <>
                {couple.anniversary_date && (
                  <Text style={[typography.bodySecondary, { textAlign: 'center', marginTop: spacing.xs }]}>
                    Together since {new Date(couple.anniversary_date).toLocaleDateString()}
                  </Text>
                )}
                {couple.couple_bio && (
                  <Text style={[typography.body, { textAlign: 'center', marginTop: spacing.sm }]}>
                    {couple.couple_bio}
                  </Text>
                )}
                <Pressable style={styles.editButton} onPress={editProfile}>
                  <Text style={styles.editButtonText}>Edit Profile</Text>
                </Pressable>
              </>
            ) : (
              <>
                <Text style={[typography.bodySecondary, { textAlign: 'center', marginTop: spacing.sm }]}>
                  Connect with your partner to unlock all features and start your journey together
                </Text>
                <Pressable style={styles.linkButton} onPress={linkPartner}>
                  <Text style={styles.linkButtonText}>Link Partner</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>

        {/* Stats Section */}
        {couple && (
          <View style={styles.section}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Your Journey</Text>
            <View style={styles.statsGrid}>
              {profileStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Achievements Section */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Achievements</Text>
          <View style={styles.achievementsGrid}>
            {achievements.map((achievement, index) => (
              <View key={index} style={[
                styles.achievementCard,
                !achievement.earned && styles.achievementCardLocked
              ]}>
                <View style={[
                  styles.achievementIcon,
                  { backgroundColor: achievement.earned ? colors.primary : colors.textSecondary }
                ]}>
                  <IconSymbol 
                    name={achievement.icon as any} 
                    color={colors.card} 
                    size={20} 
                  />
                </View>
                <Text style={[
                  typography.caption,
                  { fontWeight: '600', textAlign: 'center', marginTop: spacing.xs }
                ]}>
                  {achievement.title}
                </Text>
                <Text style={[
                  typography.caption,
                  { textAlign: 'center', fontSize: 12, opacity: achievement.earned ? 1 : 0.6 }
                ]}>
                  {achievement.description}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Settings Section */}
        {showSettings && (
          <View style={styles.section}>
            <Text style={[typography.h2, { marginBottom: spacing.md }]}>Settings</Text>
            {settingsOptions.map((option, index) => (
              <View key={index} style={styles.settingCard}>
                <View style={styles.settingIcon}>
                  <IconSymbol name={option.icon as any} color={colors.primary} size={20} />
                </View>
                <View style={styles.settingContent}>
                  <Text style={[typography.body, { fontWeight: '600' }]}>{option.title}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>{option.description}</Text>
                </View>
                {option.type === 'toggle' ? (
                  <Switch
                    value={option.value}
                    onValueChange={option.onToggle}
                    trackColor={{ false: colors.border, true: colors.primary }}
                    thumbColor={colors.card}
                  />
                ) : (
                  <Pressable onPress={option.onPress}>
                    <IconSymbol name="chevron.right" color={colors.textSecondary} size={16} />
                  </Pressable>
                )}
              </View>
            ))}
          </View>
        )}

        {/* App Info */}
        <View style={styles.section}>
          <View style={styles.appInfoCard}>
            <Text style={[typography.h3, { textAlign: 'center', marginBottom: spacing.sm }]}>
              Couply
            </Text>
            <Text style={[typography.caption, { textAlign: 'center' }]}>
              Where Couples Grow Together
            </Text>
            <Text style={[typography.caption, { textAlign: 'center', marginTop: spacing.xs, opacity: 0.6 }]}>
              Version 1.0.0
            </Text>
          </View>
        </View>

        {/* Link Partner Modal */}
        <Modal
          visible={showLinkModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowLinkModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={[typography.h2, { marginBottom: spacing.lg }]}>Link with Partner</Text>
              
              <Text style={[typography.body, { marginBottom: spacing.md }]}>
                Enter your partner's email address to send them an invitation to link your accounts.
              </Text>
              
              <TextInput
                style={styles.modalInput}
                placeholder="Partner's email address"
                placeholderTextColor={colors.textSecondary}
                value={partnerEmail}
                onChangeText={setPartnerEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.modalInput}
                placeholder="Anniversary date (optional)"
                placeholderTextColor={colors.textSecondary}
                value={anniversaryDate}
                onChangeText={setAnniversaryDate}
              />
              
              <View style={styles.modalButtons}>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowLinkModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.linkModalButton]}
                  onPress={handleLinkPartner}
                >
                  <Text style={styles.linkModalButtonText}>Send Invitation</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
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
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.card,
    fontSize: 28,
  },
  settingsButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  section: {
    paddingHorizontal: spacing.md,
    marginTop: spacing.xl,
  },
  coupleCard: {
    ...commonStyles.card,
    alignItems: 'center',
    padding: spacing.xl,
  },
  coupleAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: colors.card,
  },
  avatarLeft: {
    marginRight: -20,
    zIndex: 1,
  },
  avatarRight: {
    marginLeft: -20,
  },
  avatarEmpty: {
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  linkButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    marginTop: spacing.lg,
  },
  linkButtonText: {
    ...typography.button,
    color: colors.card,
  },
  editButton: {
    backgroundColor: colors.secondary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  editButtonText: {
    ...typography.button,
    color: colors.card,
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  statValue: {
    ...typography.h2,
    color: colors.primary,
    fontSize: 24,
  },
  statLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  achievementCard: {
    width: '30%',
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    alignItems: 'center',
    ...shadows.sm,
  },
  achievementCardLocked: {
    opacity: 0.6,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.highlight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  appInfoCard: {
    ...commonStyles.card,
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.highlight,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    ...typography.body,
    color: colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  modalButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  linkModalButton: {
    backgroundColor: colors.primary,
  },
  linkModalButtonText: {
    ...typography.button,
    color: colors.white,
  },
});
