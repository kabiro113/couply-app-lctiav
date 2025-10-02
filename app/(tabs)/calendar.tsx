
import React, { useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  Pressable, 
  Platform,
  Alert
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/IconSymbol";
import { colors, typography, spacing, borderRadius, shadows, commonStyles } from "@/styles/commonStyles";
import { LinearGradient } from "expo-linear-gradient";
import { useCalendar } from "@/hooks/useCalendar";

export default function CalendarScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { events, loading, createEvent, getEventsForDate } = useCalendar();

  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();
  const today = new Date();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const getEventsForDateLocal = (date: Date) => {
    return getEventsForDate(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(currentMonth - 1);
    } else {
      newDate.setMonth(currentMonth + 1);
    }
    setSelectedDate(newDate);
  };

  const renderCalendarDay = (day: number, isCurrentMonth: boolean = true) => {
    const date = new Date(currentYear, currentMonth, day);
    const dayEvents = getEventsForDateLocal(date);
    const isToday = date.toDateString() === today.toDateString();
    const hasEvents = dayEvents.length > 0;

    return (
      <Pressable
        key={`${day}-${isCurrentMonth}`}
        style={[
          styles.calendarDay,
          isToday && styles.todayDay,
          hasEvents && styles.eventDay,
          !isCurrentMonth && styles.otherMonthDay,
        ]}
        onPress={() => {
          if (hasEvents) {
            Alert.alert(
              `Events on ${date.toLocaleDateString()}`,
              dayEvents.map(e => `• ${e.title}`).join('\n')
            );
          }
        }}
      >
        <Text style={[
          styles.calendarDayText,
          isToday && styles.todayDayText,
          hasEvents && styles.eventDayText,
          !isCurrentMonth && styles.otherMonthDayText,
        ]}>
          {day}
        </Text>
        {hasEvents && <View style={styles.eventIndicator} />}
      </Pressable>
    );
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const firstDay = getFirstDayOfMonth(currentMonth, currentYear);
    const daysInPrevMonth = getDaysInMonth(currentMonth - 1, currentYear);
    
    const calendarDays = [];
    
    // Previous month days
    for (let i = firstDay - 1; i >= 0; i--) {
      calendarDays.push(renderCalendarDay(daysInPrevMonth - i, false));
    }
    
    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      calendarDays.push(renderCalendarDay(day));
    }
    
    // Next month days to fill the grid
    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let day = 1; day <= remainingCells; day++) {
      calendarDays.push(renderCalendarDay(day, false));
    }

    return (
      <View style={styles.calendarGrid}>
        {calendarDays}
      </View>
    );
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'anniversary':
        return 'heart.fill';
      case 'date':
        return 'calendar.badge.plus';
      case 'milestone':
        return 'star.fill';
      case 'reminder':
        return 'bell.fill';
      default:
        return 'calendar';
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case 'anniversary':
        return colors.primary;
      case 'date':
        return colors.secondary;
      case 'milestone':
        return colors.accent;
      case 'reminder':
        return colors.success;
      default:
        return colors.textSecondary;
    }
  };

  const upcomingEvents = events
    .filter(event => new Date(event.start_date) >= today)
    .sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime())
    .slice(0, 3);

  return (
    <SafeAreaView style={commonStyles.safeArea}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <LinearGradient
          colors={[colors.secondary, colors.primary]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Our Calendar</Text>
            <Text style={styles.headerSubtitle}>Plan your moments together</Text>
          </View>
        </LinearGradient>

        {/* Calendar Navigation */}
        <View style={styles.calendarHeader}>
          <Pressable style={styles.navButton} onPress={() => navigateMonth('prev')}>
            <IconSymbol name="chevron.left" color={colors.primary} size={20} />
          </Pressable>
          
          <Text style={styles.monthYear}>
            {monthNames[currentMonth]} {currentYear}
          </Text>
          
          <Pressable style={styles.navButton} onPress={() => navigateMonth('next')}>
            <IconSymbol name="chevron.right" color={colors.primary} size={20} />
          </Pressable>
        </View>

        {/* Calendar Days Header */}
        <View style={styles.daysHeader}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <Text key={day} style={styles.dayHeaderText}>{day}</Text>
          ))}
        </View>

        {/* Calendar Grid */}
        <View style={styles.calendarContainer}>
          {renderCalendar()}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Quick Add</Text>
          <View style={styles.quickActions}>
            <Pressable 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Date planning will be available soon!')}
            >
              <IconSymbol name="calendar.badge.plus" color={colors.secondary} size={24} />
              <Text style={styles.quickActionText}>Plan Date</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Milestone tracking will be available soon!')}
            >
              <IconSymbol name="star.fill" color={colors.accent} size={24} />
              <Text style={styles.quickActionText}>Add Milestone</Text>
            </Pressable>
            
            <Pressable 
              style={styles.quickActionButton}
              onPress={() => Alert.alert('Feature Coming Soon', 'Reminder setting will be available soon!')}
            >
              <IconSymbol name="bell.fill" color={colors.success} size={24} />
              <Text style={styles.quickActionText}>Set Reminder</Text>
            </Pressable>
          </View>
        </View>

        {/* Upcoming Events */}
        <View style={styles.section}>
          <Text style={[typography.h2, { marginBottom: spacing.md }]}>Upcoming Events</Text>
          {upcomingEvents.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="calendar" color={colors.textSecondary} size={48} />
              <Text style={[typography.h3, { marginTop: spacing.md, textAlign: 'center' }]}>
                No Upcoming Events
              </Text>
              <Text style={[typography.bodySecondary, { textAlign: 'center', marginTop: spacing.sm }]}>
                Start planning your special moments together
              </Text>
            </View>
          ) : (
            upcomingEvents.map(event => (
              <View key={event.id} style={styles.eventCard}>
                <View style={[styles.eventIcon, { backgroundColor: getEventColor(event.event_type || 'date') }]}>
                  <IconSymbol name={getEventIcon(event.event_type || 'date') as any} color={colors.card} size={20} />
                </View>
                <View style={styles.eventContent}>
                  <Text style={[typography.h3, { fontSize: 16 }]}>{event.title}</Text>
                  <Text style={[typography.caption, { marginTop: 2 }]}>
                    {new Date(event.start_date).toLocaleDateString()} • {event.description}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: Platform.OS !== 'ios' ? 100 : spacing.xl,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xl,
  },
  headerContent: {
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.h1,
    color: colors.card,
    fontSize: 28,
  },
  headerSubtitle: {
    ...typography.bodySecondary,
    color: colors.card,
    opacity: 0.9,
    marginTop: spacing.xs,
  },
  calendarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  navButton: {
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  monthYear: {
    ...typography.h2,
    fontSize: 20,
  },
  daysHeader: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  dayHeaderText: {
    ...typography.caption,
    flex: 1,
    textAlign: 'center',
    fontWeight: '600',
    color: colors.textSecondary,
  },
  calendarContainer: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  calendarDay: {
    width: '14.28%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  todayDay: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.sm,
  },
  eventDay: {
    backgroundColor: colors.highlight,
    borderRadius: borderRadius.sm,
  },
  otherMonthDay: {
    opacity: 0.3,
  },
  calendarDayText: {
    ...typography.body,
    fontSize: 16,
  },
  todayDayText: {
    color: colors.card,
    fontWeight: '600',
  },
  eventDayText: {
    fontWeight: '600',
  },
  otherMonthDayText: {
    color: colors.textSecondary,
  },
  eventIndicator: {
    position: 'absolute',
    bottom: 4,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.xl,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: spacing.sm,
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    alignItems: 'center',
    ...shadows.sm,
  },
  quickActionText: {
    ...typography.caption,
    marginTop: spacing.sm,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  eventCard: {
    ...commonStyles.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  eventIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  eventContent: {
    flex: 1,
  },
});
