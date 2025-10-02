
import React from 'react';
import { Platform } from 'react-native';
import { NativeTabs, Icon, Label } from 'expo-router/unstable-native-tabs';
import { Stack } from 'expo-router';
import FloatingTabBar, { TabBarItem } from '@/components/FloatingTabBar';
import { colors } from '@/styles/commonStyles';

export default function TabLayout() {
  // Define the tabs configuration for Couply
  const tabs: TabBarItem[] = [
    {
      name: '(home)',
      route: '/(tabs)/(home)/',
      icon: 'heart.fill',
      label: 'Home',
    },
    {
      name: 'chat',
      route: '/(tabs)/chat',
      icon: 'message.fill',
      label: 'Chat',
    },
    {
      name: 'calendar',
      route: '/(tabs)/calendar',
      icon: 'calendar',
      label: 'Calendar',
    },
    {
      name: 'profile',
      route: '/(tabs)/profile',
      icon: 'person.2.fill',
      label: 'Profile',
    },
  ];

  // Use NativeTabs for iOS, custom FloatingTabBar for Android and Web
  if (Platform.OS === 'ios') {
    return (
      <NativeTabs>
        <NativeTabs.Trigger name="(home)">
          <Icon sf="heart.fill" drawable="ic_home" />
          <Label>Home</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="chat">
          <Icon sf="message.fill" drawable="ic_chat" />
          <Label>Chat</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="calendar">
          <Icon sf="calendar" drawable="ic_calendar" />
          <Label>Calendar</Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="profile">
          <Icon sf="person.2.fill" drawable="ic_profile" />
          <Label>Profile</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    );
  }

  // For Android and Web, use Stack navigation with custom floating tab bar
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'none',
        }}
      >
        <Stack.Screen name="(home)" />
        <Stack.Screen name="chat" />
        <Stack.Screen name="calendar" />
        <Stack.Screen name="profile" />
      </Stack>
      <FloatingTabBar tabs={tabs} />
    </>
  );
}
