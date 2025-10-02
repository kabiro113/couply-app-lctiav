
import { supabase } from '@/app/integrations/supabase/client';

export interface NotificationData {
  userId: string;
  title: string;
  body: string;
  data?: Record<string, any>;
}

export interface ModerationData {
  content: string;
  type: 'post' | 'comment' | 'message';
  userId: string;
}

export interface ModerationResult {
  isAppropriate: boolean;
  confidence: number;
  reasons?: string[];
  suggestedAction: 'approve' | 'flag' | 'reject';
}

export const sendNotification = async (notificationData: NotificationData) => {
  try {
    const { data, error } = await supabase.functions.invoke('send-notification', {
      body: notificationData,
    });

    if (error) {
      console.error('Error sending notification:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error calling notification function:', error);
    return { success: false, error: 'Failed to send notification' };
  }
};

export const moderateContent = async (moderationData: ModerationData): Promise<{
  success: boolean;
  moderation?: ModerationResult;
  error?: string;
}> => {
  try {
    const { data, error } = await supabase.functions.invoke('moderate-content', {
      body: moderationData,
    });

    if (error) {
      console.error('Error moderating content:', error);
      return { success: false, error: error.message };
    }

    return { success: true, moderation: data.moderation };
  } catch (error) {
    console.error('Error calling moderation function:', error);
    return { success: false, error: 'Failed to moderate content' };
  }
};

// Helper function to check if content should be posted based on moderation
export const shouldAllowContent = (moderationResult: ModerationResult): boolean => {
  return moderationResult.isAppropriate && moderationResult.suggestedAction !== 'reject';
};

// Helper function to send notifications for various events
export const sendEventNotification = async (
  recipientUserId: string,
  event: 'new_message' | 'new_post' | 'new_comment' | 'new_like' | 'partner_linked',
  senderName?: string,
  additionalData?: Record<string, any>
) => {
  const notificationTemplates = {
    new_message: {
      title: 'New Message',
      body: `${senderName || 'Your partner'} sent you a message`,
    },
    new_post: {
      title: 'New Post',
      body: `${senderName || 'Someone'} shared a new post`,
    },
    new_comment: {
      title: 'New Comment',
      body: `${senderName || 'Someone'} commented on a post`,
    },
    new_like: {
      title: 'New Like',
      body: `${senderName || 'Someone'} liked your post`,
    },
    partner_linked: {
      title: 'Partner Linked!',
      body: 'You are now connected with your partner on Couply',
    },
  };

  const template = notificationTemplates[event];
  if (!template) {
    console.error('Unknown notification event:', event);
    return { success: false, error: 'Unknown notification event' };
  }

  return await sendNotification({
    userId: recipientUserId,
    title: template.title,
    body: template.body,
    data: {
      event,
      senderName,
      ...additionalData,
    },
  });
};
