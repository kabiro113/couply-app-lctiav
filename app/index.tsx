
import { Redirect } from 'expo-router';

export default function Index() {
  // For now, redirect to onboarding. In a real app, you'd check if user is logged in
  return <Redirect href="/onboarding" />;
}
