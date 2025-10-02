
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useGroups } from '@/hooks/useGroups';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function GroupsScreen() {
  const { groups, myGroups, loading, joinGroup, leaveGroup, refreshGroups } = useGroups();
  const [activeTab, setActiveTab] = useState<'discover' | 'my-groups'>('discover');

  const handleJoinGroup = async (groupId: string) => {
    await joinGroup(groupId);
  };

  const handleLeaveGroup = async (groupId: string) => {
    await leaveGroup(groupId);
  };

  const isGroupJoined = (groupId: string) => {
    return myGroups.some(member => member.group_id === groupId);
  };

  const getGroupIcon = (groupType: string) => {
    switch (groupType) {
      case 'newlyweds':
        return 'heart';
      case 'long_distance':
        return 'location';
      case 'parenting':
        return 'person.2';
      default:
        return 'message';
    }
  };

  const renderGroup = (group: any) => (
    <View key={group.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <IconSymbol name={getGroupIcon(group.group_type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{group.name}</Text>
          <Text style={styles.groupDescription}>{group.description}</Text>
          <Text style={styles.memberCount}>{group.member_count || 0} members</Text>
        </View>
      </View>

      <View style={styles.groupActions}>
        {isGroupJoined(group.id) ? (
          <Pressable
            style={[styles.actionButton, styles.leaveButton]}
            onPress={() => handleLeaveGroup(group.id)}
          >
            <Text style={styles.leaveButtonText}>Leave</Text>
          </Pressable>
        ) : (
          <Pressable
            style={[styles.actionButton, styles.joinButton]}
            onPress={() => handleJoinGroup(group.id)}
          >
            <Text style={styles.joinButtonText}>Join</Text>
          </Pressable>
        )}
      </View>
    </View>
  );

  const renderMyGroup = (member: any) => (
    <View key={member.id} style={styles.groupCard}>
      <View style={styles.groupHeader}>
        <View style={styles.groupIcon}>
          <IconSymbol name={getGroupIcon(member.group.group_type)} size={24} color={colors.primary} />
        </View>
        <View style={styles.groupInfo}>
          <Text style={styles.groupName}>{member.group.name}</Text>
          <Text style={styles.groupDescription}>{member.group.description}</Text>
          <Text style={styles.memberCount}>{member.group.member_count || 0} members</Text>
        </View>
      </View>

      <View style={styles.groupActions}>
        <Pressable
          style={[styles.actionButton, styles.viewButton]}
          onPress={() => {
            // Navigate to group detail screen
            console.log('View group:', member.group.id);
          }}
        >
          <Text style={styles.viewButtonText}>View</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.leaveButton]}
          onPress={() => handleLeaveGroup(member.group.id)}
        >
          <Text style={styles.leaveButtonText}>Leave</Text>
        </Pressable>
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
          <Text style={styles.title}>Discussion Groups</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tab, activeTab === 'discover' && styles.activeTab]}
            onPress={() => setActiveTab('discover')}
          >
            <Text style={[styles.tabText, activeTab === 'discover' && styles.activeTabText]}>
              Discover
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tab, activeTab === 'my-groups' && styles.activeTab]}
            onPress={() => setActiveTab('my-groups')}
          >
            <Text style={[styles.tabText, activeTab === 'my-groups' && styles.activeTabText]}>
              My Groups
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.content}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshGroups} />}
        >
          {activeTab === 'discover' ? (
            <View style={styles.groupsList}>
              {groups.map(renderGroup)}
            </View>
          ) : (
            <View style={styles.groupsList}>
              {myGroups.length > 0 ? (
                myGroups.map(renderMyGroup)
              ) : (
                <View style={styles.emptyState}>
                  <IconSymbol name="message" size={48} color={colors.textSecondary} />
                  <Text style={styles.emptyStateText}>You haven&apos;t joined any groups yet</Text>
                  <Text style={styles.emptyStateSubtext}>
                    Discover groups to connect with other couples
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
  groupsList: {
    padding: spacing.lg,
  },
  groupCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    ...typography.subtitle,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  groupDescription: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  memberCount: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  groupActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  joinButton: {
    backgroundColor: colors.primary,
  },
  joinButtonText: {
    ...typography.button,
    color: colors.white,
  },
  leaveButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  leaveButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  viewButton: {
    backgroundColor: colors.backgroundSecondary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  viewButtonText: {
    ...typography.button,
    color: colors.primary,
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
