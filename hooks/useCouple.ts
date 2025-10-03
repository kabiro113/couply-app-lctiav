
import { useState, useEffect } from 'react';
import { supabase, getCurrentCouple, getCurrentProfile } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';

type Couple = Tables<'couples'>;
type Profile = Tables<'profiles'>;

export const useCouple = () => {
  const [couple, setCouple] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCouple();
  }, []);

  const loadCouple = async () => {
    try {
      const coupleData = await getCurrentCouple();
      setCouple(coupleData);
    } catch (error) {
      console.error('Error loading couple:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCouple = async (partnerEmail: string, anniversaryDate?: string) => {
    try {
      const currentProfile = await getCurrentProfile();
      if (!currentProfile) {
        return { success: false, error: 'No profile found' };
      }

      // Find partner by email
      const { data: partnerUser } = await supabase.auth.admin.getUserByEmail(partnerEmail);
      if (!partnerUser) {
        return { success: false, error: 'Partner not found' };
      }

const { data: partnerProfile, error: profileError } = await supabase
  .from('profiles')
  .select('*')
  .eq('user_id', partnerUser.id)
  .maybeSingle();

if (!partnerProfile) {
  return { success: false, error: 'Partner profile not found' };
}


      // Create couple
      const { data, error } = await supabase
        .from('couples')
        .insert({
          partner1_id: currentProfile.id,
          partner2_id: partnerProfile.id,
          anniversary_date: anniversaryDate,
          status: 'pending'
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      await loadCouple();
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const linkWithPartner = async (inviteCode: string) => {
    try {
      // This would typically involve a more complex invite system
      // For now, we'll use a simple approach
      Alert.alert('Feature Coming Soon', 'Partner linking via invite code will be available soon!');
      return { success: false, error: 'Feature not implemented yet' };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateCouple = async (updates: Partial<Couple>) => {
    if (!couple) return { success: false, error: 'No couple found' };

    try {
      const { data, error } = await supabase
        .from('couples')
        .update(updates)
        .eq('id', couple.id)
        .select(`
          *,
          partner1:partner1_id(*),
          partner2:partner2_id(*)
        `)
        .single();

      if (error) {
        Alert.alert('Update Error', error.message);
        return { success: false, error: error.message };
      }

      setCouple(data);
      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Update Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const acceptCoupleInvite = async () => {
    if (!couple) return { success: false, error: 'No couple found' };

    return await updateCouple({ status: 'active' });
  };

  return {
    couple,
    loading,
    createCouple,
    linkWithPartner,
    updateCouple,
    acceptCoupleInvite,
    refreshCouple: loadCouple,
  };
};
