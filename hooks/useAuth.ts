
import { useState, useEffect } from 'react';
import { supabase, getCurrentUser, getCurrentProfile } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';

type Profile = Tables<'profiles'>;

export const useAuth = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session:', session?.user?.id, 'Email confirmed:', session?.user?.email_confirmed_at);
      setUser(session?.user ?? null);
      
      if (session?.user && session.user.email_confirmed_at) {
        const userProfile = await getCurrentProfile();
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id, 'Email confirmed:', session?.user?.email_confirmed_at);
        setUser(session?.user ?? null);
        
        if (session?.user && session.user.email_confirmed_at) {
          const userProfile = await getCurrentProfile();
          setProfile(userProfile);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      // First check if user already exists
      const { data: existingUser } = await supabase.auth.signInWithPassword({
        email,
        password: 'dummy', // This will fail but tell us if user exists
      });

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          Alert.alert(
            'Account Already Exists', 
            'An account with this email already exists. Please sign in instead or use a different email address.'
          );
          return { success: false, error: 'User already exists' };
        }
        
        Alert.alert('Sign Up Error', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Only create profile if user was actually created (not if they already existed)
        if (!data.user.email_confirmed_at) {
          // Create profile for new user
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              user_id: data.user.id,
              name: name,
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // If profile creation fails due to duplicate, it means user already exists
            if (profileError.code === '23505') { // Unique violation
              Alert.alert(
                'Account Already Exists', 
                'An account with this email already exists. Please sign in instead.'
              );
              return { success: false, error: 'User already exists' };
            }
          }

          Alert.alert(
            'Registration Successful!', 
            'Please check your email to verify your account before signing in.',
            [{ text: 'OK' }]
          );
        } else {
          Alert.alert(
            'Account Already Exists', 
            'This email is already registered and verified. Please sign in instead.'
          );
          return { success: false, error: 'User already exists' };
        }
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Sign up error:', error);
      Alert.alert('Sign Up Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          Alert.alert(
            'Sign In Failed', 
            'Invalid email or password. Please check your credentials and try again.'
          );
        } else if (error.message.includes('Email not confirmed')) {
          Alert.alert(
            'Email Not Verified', 
            'Please check your email and click the verification link before signing in.'
          );
        } else {
          Alert.alert('Sign In Error', error.message);
        }
        return { success: false, error: error.message };
      }

      // Check if email is confirmed
      if (data.user && !data.user.email_confirmed_at) {
        Alert.alert(
          'Email Not Verified', 
          'Please check your email and click the verification link before signing in.'
        );
        // Sign out the user since they're not verified
        await supabase.auth.signOut();
        return { success: false, error: 'Email not confirmed' };
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Sign in error:', error);
      Alert.alert('Sign In Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        Alert.alert('Sign Out Error', error.message);
        return { success: false, error: error.message };
      }
      return { success: true };
    } catch (error: any) {
      Alert.alert('Sign Out Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!profile) return { success: false, error: 'No profile found' };

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id)
        .select()
        .single();

      if (error) {
        Alert.alert('Update Error', error.message);
        return { success: false, error: error.message };
      }

      setProfile(data);
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        Alert.alert('Resend Error', error.message);
        return { success: false, error: error.message };
      }

      Alert.alert(
        'Confirmation Email Sent', 
        'Please check your email for the verification link.'
      );
      return { success: true };
    } catch (error: any) {
      Alert.alert('Resend Error', error.message);
      return { success: false, error: error.message };
    }
  };

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resendConfirmation,
  };
};
