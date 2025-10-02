
import { useState, useEffect } from 'react';
import { supabase, getCurrentProfile, getCurrentCouple } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';
import { moderateContent, shouldAllowContent } from '@/utils/edgeFunctions';

type Message = Tables<'messages'>;

export const useMessages = () => {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
    
    // Set up real-time subscription
    const subscription = supabase
      .channel('messages')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          console.log('New message received:', payload);
          loadMessages(); // Reload messages when new one arrives
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loadMessages = async () => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(name, avatar_url)
        `)
        .eq('couple_id', couple.id)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        return;
      }

      setMessages(data || []);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (content: string, messageType: string = 'text', mediaUrl?: string) => {
    try {
      const profile = await getCurrentProfile();
      const couple = await getCurrentCouple();
      
      if (!profile || !couple) {
        return { success: false, error: 'Profile or couple not found' };
      }

      // Only moderate text messages (not hugs, kisses, etc.)
      if (messageType === 'text' && content.trim()) {
        const moderationResult = await moderateContent({
          content,
          type: 'message',
          userId: profile.id,
        });

        if (!moderationResult.success) {
          console.warn('Content moderation failed, allowing message through');
        } else if (!shouldAllowContent(moderationResult.moderation!)) {
          Alert.alert(
            'Message Not Sent',
            'Your message contains content that may not be appropriate. Please revise and try again.'
          );
          return { success: false, error: 'Message not allowed' };
        }
      }

      const { data, error } = await supabase
        .from('messages')
        .insert({
          content,
          message_type: messageType,
          media_url: mediaUrl,
          sender_id: profile.id,
          couple_id: couple.id
        })
        .select(`
          *,
          sender:sender_id(name, avatar_url)
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

  const sendHug = async () => {
    return await sendMessage('🤗', 'hug');
  };

  const sendKiss = async () => {
    return await sendMessage('💋', 'kiss');
  };

  const markAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('id', messageId);

      if (error) {
        console.error('Error marking message as read:', error);
        return { success: false, error: error.message };
      }

      // Update local state
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, is_read: true } : msg
      ));

      return { success: true };
    } catch (error: any) {
      console.error('Error marking message as read:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    messages,
    loading,
    sendMessage,
    sendHug,
    sendKiss,
    markAsRead,
    refreshMessages: loadMessages,
  };
};
