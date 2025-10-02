
import { useState, useEffect } from 'react';
import { supabase, getCurrentCouple } from '@/app/integrations/supabase/client';
import { Tables } from '@/app/integrations/supabase/types';
import { Alert } from 'react-native';

type CalendarEvent = Tables<'calendar_events'>;

export const useCalendar = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('couple_id', couple.id)
        .order('start_date', { ascending: true });

      if (error) {
        console.error('Error loading events:', error);
        return;
      }

      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    } finally {
      setLoading(false);
    }
  };

  const createEvent = async (event: Omit<CalendarEvent, 'id' | 'couple_id' | 'created_at'>) => {
    try {
      const couple = await getCurrentCouple();
      if (!couple) {
        return { success: false, error: 'Couple not found' };
      }

      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          ...event,
          couple_id: couple.id
        })
        .select()
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      setEvents(prev => [...prev, data].sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ));

      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const updateEvent = async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .select()
        .single();

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      setEvents(prev => prev.map(event => 
        event.id === eventId ? data : event
      ).sort((a, b) => 
        new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
      ));

      return { success: true, data };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const deleteEvent = async (eventId: string) => {
    try {
      const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', eventId);

      if (error) {
        Alert.alert('Error', error.message);
        return { success: false, error: error.message };
      }

      setEvents(prev => prev.filter(event => event.id !== eventId));
      return { success: true };
    } catch (error: any) {
      Alert.alert('Error', error.message);
      return { success: false, error: error.message };
    }
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return events.filter(event => {
      const eventDate = new Date(event.start_date).toISOString().split('T')[0];
      return eventDate === dateStr;
    });
  };

  return {
    events,
    loading,
    createEvent,
    updateEvent,
    deleteEvent,
    getEventsForDate,
    refreshEvents: loadEvents,
  };
};
