
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
      setUser(session?.user ?? null);
      
      if (session?.user) {
        const userProfile = await getCurrentProfile();
        setProfile(userProfile);
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);
        setUser(session?.user ?? null);
        
        if (session?.user) {
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: 'https://natively.dev/email-confirmed'
        }
      });

      if (error) {
        Alert.alert('Sign Up Error', error.message);
        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: data.user.id,
            name: name,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        Alert.alert(
          'Registration Successful!', 
          'Please check your email to verify your account before signing in.'
        );
      }

      return { success: true, data };
    } catch (error: any) {
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
        Alert.alert('Sign In Error', error.message);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error: any) {
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

  return {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
  };
};
