
import { useState, useEffect } from 'react';
import { supabase, getCurrentProfile, getCurrentCouple } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';
import { moderateContent, shouldAllowContent } from '@/utils/edgeFunctions';

type Post = Tables<'posts'>;
type Comment = Tables<'comments'>;

export const usePosts = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          author:author_id(name, avatar_url),
          couple:couple_id(couple_name, couple_avatar_url, partner1:partner1_id(name), partner2:partner2_id(name)),
          comments(count),
          likes(count)
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error loading posts:', error);
        return;
      }

      setPosts(data || []);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (content: string, postType: string = 'update', mediaUrls?: string[]) => {
    try {
      const profile = await getCurrentProfile();
      const couple = await getCurrentCouple();
      
      if (!profile || !couple) {
        return { success: false, error: 'Profile or couple not found' };
      }

      // Moderate content before posting
      const moderationResult = await moderateContent({
        content,
        type: 'post',
        userId: profile.id,
      });

      if (!moderationResult.success) {
        Alert.alert('Error', 'Failed to validate content. Please try again.');
        return { success: false, error: 'Content moderation failed' };
      }

      if (!shouldAllowContent(moderationResult.moderation!)) {
        Alert.alert(
          'Content Not Allowed',
          'Your post contains content that violates our community guidelines. Please revise and try again.'
        );
        return { success: false, error: 'Content not allowed' };
      }

      const { data, error } = await supabase
        .from('posts')
        .insert({
          content,
          post_type: postType,
          media_urls: mediaUrls,
          author_id: profile.id,
          couple_id: couple.id,
          is_public: !couple.is_private_mode
        })
        .select(`
          *,
          author:author_id(name, avatar_url),
          couple:couple_id(couple_name, couple_avatar_url, partner1:partner1_id(name), partner2:partner2_id(name))
        `)
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      // Add to local state
      setPosts(prev => [data, ...prev]);
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const likePost = async (postId: string) => {
    try {
      const profile = await getCurrentProfile();
      if (!profile) return { success: false, error: 'Profile not found' };

      // Check if already liked
      const { data: existingLike } = await supabase
        .from('likes')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', profile.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) {
          Alert.alert('Error', error.message);
          return { success: false, error: error.message };
        }

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: Math.max(0, post.likes_count - 1) }
            : post
        ));

        return { success: true, liked: false };
      } else {
        // Like
        const { error } = await supabase
          .from('likes')
          .insert({
            post_id: postId,
            user_id: profile.id
          });

        if (error) {
          Alert.alert('Error', error.message);
          return { success: false, error: error.message };
        }

        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId 
            ? { ...post, likes_count: post.likes_count + 1 }
            : post
        ));

        return { success: true, liked: true };
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const addComment = async (postId: string, content: string) => {
    try {
      const profile = await getCurrentProfile();
      if (!profile) return { success: false, error: 'Profile not found' };

      // Moderate comment content
      const moderationResult = await moderateContent({
        content,
        type: 'comment',
        userId: profile.id,
      });

      if (!moderationResult.success) {
        Alert.alert('Error', 'Failed to validate comment. Please try again.');
        return { success: false, error: 'Content moderation failed' };
      }

      if (!shouldAllowContent(moderationResult.moderation!)) {
        Alert.alert(
          'Comment Not Allowed',
          'Your comment contains content that violates our community guidelines. Please revise and try again.'
        );
        return { success: false, error: 'Comment not allowed' };
      }

      const { data, error } = await supabase
        .from('comments')
        .insert({
          post_id: postId,
          author_id: profile.id,
          content
        })
        .select(`
          *,
          author:author_id(name, avatar_url)
        `)
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      // Update local state
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? { ...post, comments_count: post.comments_count + 1 }
          : post
      ));

      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const getPostComments = async (postId: string) => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          *,
          author:author_id(name, avatar_url)
        `)
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading comments:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error loading comments:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    posts,
    loading,
    createPost,
    likePost,
    addComment,
    getPostComments,
    refreshPosts: loadPosts,
  };
};
