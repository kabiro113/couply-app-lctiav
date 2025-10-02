
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";
import { colors, typography } from "@/styles/commonStyles";

export default function Index() {
  const { user, profile, loading } = useAuth();
  const { couple } = useCouple();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  // If no user or user email not confirmed, go to login
  if (!user || !user.email_confirmed_at) {
    return <Redirect href="/auth/login" />;
  }

  // If user exists but no profile, there might be an issue
  if (!profile) {
    console.log('User exists but no profile found, redirecting to login');
    return <Redirect href="/auth/login" />;
  }

  // If user and profile exist but no couple, go to onboarding
  if (!couple) {
    return <Redirect href="/onboarding" />;
  }

  // All good, go to main app
  return <Redirect href="/(tabs)/(home)" />;
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    ...typography.body,
    color: colors.text,
    marginTop: 16,
  },
});
