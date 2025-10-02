
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Image,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePosts } from '@/hooks/usePosts';
import { colors, typography, spacing, borderRadius, shadows } from '@/styles/commonStyles';
import { IconSymbol } from '@/components/IconSymbol';

export default function FeedScreen() {
  const { posts, loading, createPost, likePost, refreshPosts } = usePosts();
  const [newPost, setNewPost] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  const handleCreatePost = async () => {
    if (!newPost.trim()) return;

    const result = await createPost(newPost.trim());
    if (result.success) {
      setNewPost('');
      setShowCreatePost(false);
    }
  };

  const handleLike = async (postId: string) => {
    await likePost(postId);
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const renderPost = (post: any) => (
    <View key={post.id} style={styles.postCard}>
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          <View style={styles.avatar}>
            {post.author?.avatar_url ? (
              <Image source={{ uri: post.author.avatar_url }} style={styles.avatarImage} />
            ) : (
              <IconSymbol name="person" size={20} color={colors.textSecondary} />
            )}
          </View>
          <View>
            <Text style={styles.authorName}>{post.author?.name || 'Anonymous'}</Text>
            <Text style={styles.postTime}>{formatTimeAgo(post.created_at)}</Text>
          </View>
        </View>
        <View style={styles.postTypeTag}>
          <Text style={styles.postTypeText}>{post.post_type}</Text>
        </View>
      </View>

      <Text style={styles.postContent}>{post.content}</Text>

      {post.media_urls && post.media_urls.length > 0 && (
        <ScrollView horizontal style={styles.mediaContainer}>
          {post.media_urls.map((url: string, index: number) => (
            <Image key={index} source={{ uri: url }} style={styles.mediaImage} />
          ))}
        </ScrollView>
      )}

      <View style={styles.postActions}>
        <Pressable style={styles.actionButton} onPress={() => handleLike(post.id)}>
          <IconSymbol name="heart" size={20} color={colors.primary} />
          <Text style={styles.actionText}>{post.likes_count || 0}</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <IconSymbol name="message" size={20} color={colors.textSecondary} />
          <Text style={styles.actionText}>{post.comments_count || 0}</Text>
        </Pressable>
        <Pressable style={styles.actionButton}>
          <IconSymbol name="share" size={20} color={colors.textSecondary} />
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
          <Text style={styles.title}>Community Feed</Text>
          <Pressable onPress={() => setShowCreatePost(true)} style={styles.createButton}>
            <IconSymbol name="plus" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {showCreatePost && (
          <View style={styles.createPostContainer}>
            <TextInput
              style={styles.createPostInput}
              placeholder="Share something with the community..."
              placeholderTextColor={colors.textSecondary}
              value={newPost}
              onChangeText={setNewPost}
              multiline
              maxLength={500}
            />
            <View style={styles.createPostActions}>
              <Pressable onPress={() => setShowCreatePost(false)} style={styles.cancelButton}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleCreatePost} style={styles.postButton}>
                <Text style={styles.postButtonText}>Post</Text>
              </Pressable>
            </View>
          </View>
        )}

        <ScrollView
          style={styles.feed}
          refreshControl={<RefreshControl refreshing={loading} onRefresh={refreshPosts} />}
        >
          {posts.map(renderPost)}
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
  createButton: {
    padding: spacing.sm,
  },
  createPostContainer: {
    backgroundColor: colors.card,
    margin: spacing.lg,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    ...shadows.medium,
  },
  createPostInput: {
    ...typography.body,
    color: colors.text,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  createPostActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: spacing.md,
  },
  cancelButton: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  cancelButtonText: {
    ...typography.button,
    color: colors.textSecondary,
  },
  postButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  postButtonText: {
    ...typography.button,
    color: colors.white,
  },
  feed: {
    flex: 1,
    padding: spacing.lg,
  },
  postCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    ...shadows.medium,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.backgroundSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  authorName: {
    ...typography.subtitle,
    color: colors.text,
  },
  postTime: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  postTypeTag: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  postTypeText: {
    ...typography.caption,
    color: colors.white,
    textTransform: 'capitalize',
  },
  postContent: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.md,
  },
  mediaContainer: {
    marginBottom: spacing.md,
  },
  mediaImage: {
    width: 200,
    height: 150,
    borderRadius: borderRadius.md,
    marginRight: spacing.sm,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.caption,
    color: colors.textSecondary,
  },
});
