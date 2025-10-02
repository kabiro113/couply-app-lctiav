
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Database } from './types';
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://itjqvmhytkmgojlofpys.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0anF2bWh5dGttZ29qbG9mcHlzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MDc5MjUsImV4cCI6MjA3NDk4MzkyNX0.edk7NuzgXRJm_GAf1JS_Ehw4dIZLexoBvW7RVoyV7os";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

// Helper functions for common operations
export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

export const getCurrentProfile = async () => {
  const user = await getCurrentUser();
  if (!user || !user.email_confirmed_at) {
    console.log('No authenticated user or email not confirmed');
    return null;
  }
  
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      
      // If profile doesn't exist, try to create it
      if (error.code === 'PGRST116') {
        console.log('Profile not found, creating one...');
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            name: user.user_metadata?.name || 'User',
          })
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return null;
        }
        
        return newProfile;
      }
      
      return null;
    }
    
    return profile;
  } catch (error) {
    console.error('Unexpected error fetching profile:', error);
    return null;
  }
};

export const getCurrentCouple = async () => {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  
  try {
    const { data: couple, error } = await supabase
      .from('couples')
      .select(`
        *,
        partner1:partner1_id(*),
        partner2:partner2_id(*)
      `)
      .or(`partner1_id.eq.${profile.id},partner2_id.eq.${profile.id}`)
      .eq('status', 'active')
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching couple:', error);
    }
    
    return couple;
  } catch (error) {
    console.error('Unexpected error fetching couple:', error);
    return null;
  }
};
