
import { useState, useEffect } from 'react';
import { supabase, getCurrentProfile, getCurrentCouple } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';

type Group = Tables<'groups'>;
type GroupPost = Tables<'group_posts'>;

export const useGroups = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGroups();
    loadMyGroups();
  }, []);

  const loadGroups = async () => {
    try {
      const { data, error } = await supabase
        .from('groups')
        .select('*')
        .eq('is_private', false)
        .order('member_count', { ascending: false });

      if (error) {
        console.error('Error loading groups:', error);
        return;
      }

      setGroups(data || []);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMyGroups = async () => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) return;

      const { data, error } = await supabase
        .from('group_members')
        .select(`
          *,
          group:group_id(*)
        `)
        .eq('couple_id', couple.id);

      if (error) {
        console.error('Error loading my groups:', error);
        return;
      }

      setMyGroups(data || []);
    } catch (error) {
      console.error('Error loading my groups:', error);
    }
  };

  const joinGroup = async (groupId: string) => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        return { success: false, error: 'Couple not found' };
      }

      const { data, error } = await supabase
        .from('group_members')
        .insert({
          group_id: groupId,
          couple_id: couple.id
        })
        .select(`
          *,
          group:group_id(*)
        `)
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      setMyGroups(prev => [...prev, data]);
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const leaveGroup = async (groupId: string) => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        return { success: false, error: 'Couple not found' };
      }

      const { error } = await supabase
        .from('group_members')
        .delete()
        .eq('group_id', groupId)
        .eq('couple_id', couple.id);

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      setMyGroups(prev => prev.filter(member => member.group_id !== groupId));
      return { success: true };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const getGroupPosts = async (groupId: string) => {
    try {
      const { data, error } = await supabase
        .from('group_posts')
        .select(`
          *,
          author:author_id(name, avatar_url)
        `)
        .eq('group_id', groupId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading group posts:', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (error: any) {
      console.error('Error loading group posts:', error);
      return { success: false, error: error.message };
    }
  };

  const createGroupPost = async (groupId: string, content: string, mediaUrls?: string[]) => {
    try {
      const profile = await getCurrentProfile();
      if (!profile) {
        return { success: false, error: 'Profile not found' };
      }

      const { data, error } = await supabase
        .from('group_posts')
        .insert({
          group_id: groupId,
          author_id: profile.id,
          content,
          media_urls: mediaUrls
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

      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    groups,
    myGroups,
    loading,
    joinGroup,
    leaveGroup,
    getGroupPosts,
    createGroupPost,
    refreshGroups: loadGroups,
    refreshMyGroups: loadMyGroups,
  };
};
