
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { supabase, getCurrentCouple } from '@/app/integrations/supabase/client';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function ChallengesScreen() {
  const [challenges, setChallenges] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'submissions'>('active');

  useEffect(() => {
    loadChallenges();
    loadSubmissions();
  }, []);

  const loadChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from('challenges')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading challenges:', error);
        return;
      }

      setChallenges(data || []);
    } catch (error) {
      console.error('Error loading challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('challenge_submissions')
        .select(`
          *,
          challenge:challenge_id(title, description),
          couple:couple_id(couple_name, couple_avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading submissions:', error);
        return;
      }

      setSubmissions(data || []);
    } catch (error) {
      console.error('Error loading submissions:', error);
    }
  };

  const submitToChallenge = async (challengeId: string) => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        Alert.alert('Error', 'You need to be in a couple to participate in challenges');
        return;
      }

      // For now, just show an alert. In a real app, you'd open a submission form
      Alert.alert(
        'Submit to Challenge',
        'Challenge submission feature will be available soon! You&apos;ll be able to upload photos, write stories, and more.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error submitting to challenge:', error);
      Alert.alert('Error', 'Failed to submit to challenge');
    }
  };

  const getChallengeIcon = (challengeType: string) => {
    switch (challengeType) {
      case 'photo':
        return 'camera';
      case 'story':
        return 'text.bubble';
      case 'quiz':
        return 'questionmark.circle';
      case 'activity':
        return 'figure.walk';
      default:
        return 'star';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const renderChallenge = (challenge: any) => (
    <View key={challenge.id} style={styles.challengeCard}>
      <View style={styles.challengeHeader}>
        <View style={styles.challengeIcon}>
          <IconSymbol name={getChallengeIcon(challenge.challenge_type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.challengeInfo}>
          <Text style={styles.challengeTitle}>{challenge.title}</Text>
          <Text style={styles.challengeDescription}>{challenge.description}</Text>
          {challenge.end_date && (
            <Text style={styles.challengeDate}>
              Ends: {formatDate(challenge.end_date)}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.challengeActions}>
        <Pressable
          style={styles.participateButton}
          onPress={() => submitToChallenge(challenge.id)}
        >
          <Text style={styles.participateButtonText}>Participate</Text>
        </Pressable>
      </View>
    </View>
  );

  const renderSubmission = (submission: any) => (
    <View key={submission.id} style={styles.submissionCard}>
      <View style={styles.submissionHeader}>
        <Text style={styles.submissionChallenge}>{submission.challenge?.title}</Text>
        <Text style={styles.submissionDate}>{formatDate(submission.created_at)}</Text>
      </View>

      <Text style={styles.submissionContent}>{submission.content}</Text>

      <View style={styles.submissionFooter}>
        <Text style={styles.submissionCouple}>
          by {submission.couple?.couple_name || 'Anonymous Couple'}
        </Text>
        <View style={styles.submissionVotes}>
          <IconSymbol name="heart" size={16} color={colors.primary} />
          <Text style={styles.voteCount}>{submission.votes_count || 0}</Text>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient colors={[colors.background, colors.backgroundSecondary]} style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <IconSymbol name="chevron.left" size={24} color={colors.text} />
          </Pressable>
          <Text style={styles.title}>Challenges</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'active' && styles.activeTab]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
              Active Challenges
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'submissions' && styles.activeTab]}
            onPress={() => setActiveTab('submissions')}
          >
            <Text style={[styles.tabText, activeTab === 'submissions' && styles.activeTabText]}>
              Submissions
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => {
                loadChallenges();
                loadSubmissions();
              }}
            />
          }
        >
          {activeTab === 'active' ? (
            <View style={styles.challengesList}>
              {challenges.length > 0 ? (
                challenges.map(renderChallenge)
              ) : (
                <View style={styles.emptyState}>
                  <IconSymbol name="star" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No active challenges</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Check back soon for new challenges!
                  </Text>
                </View>
              )}
            </View>
          ) : (
            <View style={styles.submissionsList}>
              {submissions.length > 0 ? (
                submissions.map(renderSubmission)
              ) : (
                <View style={styles.emptyState}>
                  <IconSymbol name="photo" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>No submissions yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Be the first to participate in a challenge!
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: spacing.sm,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  placeholder: {
    width: 40,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.md,
    alignItems: 'center',
    borderRadius: borderRadius.md,
  },
  activeTab: {
    backgroundColor: colors.primary,
  },
  tabText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.white,
  },
  content: {
    flex: 1,
  },
  challengesList: {
    padding: spacing.lg,
  },
  challengeCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  challengeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  challengeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  challengeDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  challengeDate: {
    ...typography.caption,
    color: colors.primary,
  },
  challengeActions: {
    alignItems: 'flex-end',
  },
  participateButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  participateButtonText: {
    ...typography.button,
    color: colors.white,
  },
  submissionsList: {
    padding: spacing.lg,
  },
  submissionCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  submissionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  submissionChallenge: {
    ...typography.subtitle,
    color: colors.primary,
  },
  submissionDate: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  submissionContent: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  submissionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  submissionCouple: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  submissionVotes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  voteCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl * 2,
  },
  emptyStateText: {
    ...typography.subtitle,
    color: colors.textSecondary,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
