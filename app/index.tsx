
import { Redirect } from "expo-router";
import { useAuth } from "@/hooks/useAuth";
import { useCouple } from "@/hooks/useCouple";

export default function Index() {
  const { user, loading } = useAuth();
  const { couple } = useCouple();

  if (loading) {
    return null; // Show loading screen
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  if (!couple) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)/(home)" />;
}