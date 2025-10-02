
import React, { useState, useEffect, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  Pressable, 
  Platform,
  KeyboardAvoidingView,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useMessages } from "@/hooks/useMessages";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";

export default function ChatScreen() {
  const [message, setMessage] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);
  const { messages, loading, sendMessage: sendMessageToBackend, sendHug, sendKiss } = useMessages();
  const { profile } = useAuth();
  const { couple } = useCouple();

  const sendMessage = async () => {
    if (message.trim()) {
      const result = await sendMessageToBackend(message.trim());
      if (result.success) {
        setMessage('');
        // Scroll to bottom after sending
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 100);
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const renderMessage = (msg: any) => {
    const isOwn = msg.sender_id === profile?.id;
    
    return (
      <View key={msg.id} style={[
        styles.messageContainer,
        isOwn ? styles.ownMessage : styles.partnerMessage
      ]}>
        <View style={[
          styles.messageBubble,
          isOwn ? styles.ownBubble : styles.partnerBubble
        ]}>
          <Text style={[
            styles.messageText,
            isOwn ? styles.ownMessageText : styles.partnerMessageText
          ]}>
            {msg.content}
          </Text>
        </View>
        <Text style={[
          styles.messageTime,
          isOwn ? styles.ownMessageTime : styles.partnerMessageTime
        ]}>
          {formatTime(msg.created_at)}
        </Text>
      </View>
    );
  };

  const quickActions = [
    { icon: 'camera.fill', label: 'Photo', action: () => Alert.alert('Feature Coming Soon', 'Photo sharing will be available soon!') },
    { icon: 'mic.fill', label: 'Voice', action: () => Alert.alert('Feature Coming Soon', 'Voice messages will be available soon!') },
    { icon: 'face.smiling.fill', label: 'Sticker', action: () => Alert.alert('Feature Coming Soon', 'Stickers will be available soon!') },
    { icon: 'heart.fill', label: 'Hug', action: () => handleSendHug() },
  ];

  const handleSendHug = async () => {
    const result = await sendHug();
    if (result.success) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const getPartnerName = () => {
    if (!couple || !profile) return 'Partner';
    
    const partner = couple.partner1_id === profile.id ? couple.partner2 : couple.partner1;
    return partner?.name || 'Partner';
  };

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
        >
          <View style={styles.headerContent}>
            <View style={styles.partnerInfo}>
              <View style={styles.partnerAvatar}>
                <IconSymbol name="person.fill" color={colors.card} size={20} />
              </View>
              <View>
                <Text style={styles.partnerName}>{getPartnerName()}</Text>
                <Text style={styles.partnerStatus}>
                  {couple ? 'Connected' : 'Not linked yet'}
                </Text>
              </View>
            </View>
            <Pressable style={styles.headerButton} onPress={() => console.log('Video call')}>
              <IconSymbol name="video.fill" color={colors.card} size={20} />
            </Pressable>
          </View>
        </LinearGradient>

        {/* Messages */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {!couple ? (
            <View style={styles.emptyState}>
              <IconSymbol name="person.2" color={colors.textSecondary} size={48} />
              <Text style={[typography.h3, { marginTop: spacing.md, textAlign: 'center' }]}>
                Link with Your Partner
              </Text>
              <Text style={[typography.bodySecondary, { textAlign: 'center', marginTop: spacing.sm }]}>
                Connect with your partner to start chatting privately
              </Text>
            </View>
          ) : messages.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="message" color={colors.textSecondary} size={48} />
              <Text style={[typography.h3, { marginTop: spacing.md, textAlign: 'center' }]}>
                Start Your Conversation
              </Text>
              <Text style={[typography.bodySecondary, { textAlign: 'center', marginTop: spacing.sm }]}>
                Send your first message to begin chatting with {getPartnerName()}
              </Text>
            </View>
          ) : (
            messages.map(renderMessage)
          )}
        </ScrollView>

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.quickActions}
          >
            {quickActions.map((action, index) => (
              <Pressable
                key={index}
                style={styles.quickActionButton}
                onPress={action.action}
              >
                <IconSymbol name={action.icon as any} color={colors.primary} size={20} />
                <Text style={styles.quickActionLabel}>{action.label}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        {/* Input Area */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={message}
              onChangeText={setMessage}
              placeholder="Type a message..."
              placeholderTextColor={colors.textSecondary}
              multiline
              maxLength={500}
            />
            <Pressable
              style={[
                styles.sendButton,
                { backgroundColor: message.trim() ? colors.primary : colors.textSecondary }
              ]}
              onPress={sendMessage}
              disabled={!message.trim()}
            >
              <IconSymbol name="arrow.up" color={colors.card} size={20} />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  partnerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  partnerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  partnerName: {
    ...typography.h3,
    color: colors.card,
    fontSize: 16,
  },
  partnerStatus: {
    ...typography.caption,
    color: colors.card,
    opacity: 0.8,
  },
  headerButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginTop: spacing.xxl,
  },
  messageContainer: {
    marginBottom: spacing.md,
  },
  ownMessage: {
    alignItems: 'flex-end',
  },
  partnerMessage: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
  },
  ownBubble: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: spacing.xs,
  },
  partnerBubble: {
    backgroundColor: colors.card,
    borderBottomLeftRadius: spacing.xs,
    ...shadows.sm,
  },
  messageText: {
    ...typography.body,
  },
  ownMessageText: {
    color: colors.card,
  },
  partnerMessageText: {
    color: colors.text,
  },
  messageTime: {
    ...typography.caption,
    fontSize: 12,
    marginTop: spacing.xs,
  },
  ownMessageTime: {
    textAlign: 'right',
  },
  partnerMessageTime: {
    textAlign: 'left',
  },
  quickActionsContainer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
  },
  quickActions: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.highlight,
    minWidth: 60,
  },
  quickActionLabel: {
    ...typography.caption,
    marginTop: spacing.xs,
    fontSize: 12,
  },
  inputContainer: {
    backgroundColor: colors.card,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.sm,
  },
  textInput: {
    flex: 1,
    ...typography.body,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
