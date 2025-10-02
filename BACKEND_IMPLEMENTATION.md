
# Couply Backend Implementation

This document outlines the complete backend and social features implementation for the Couply app.

## 🗄️ Database Schema

### Core Tables

#### `profiles`
- User profile information
- Links to auth.users via user_id
- Stores name, avatar_url, bio, phone

#### `couples`
- Represents couple relationships
- Links two profiles together
- Stores anniversary_date, couple_name, couple_bio
- Has privacy settings (is_private_mode)
- Status tracking (active, pending, inactive)

#### `posts`
- Social feed posts
- Supports different post types (update, love_note, photo, story, milestone)
- Automatic like/comment counting
- Privacy controls (is_public)

#### `comments` & `likes`
- Engagement features for posts
- Automatic count updates via database triggers

#### `messages`
- Private couple chat
- Supports text, image, voice, sticker, hug, kiss message types
- Real-time updates via Supabase subscriptions

#### `challenges`
- Community challenges (photo, story, quiz, activity)
- Time-bound with start/end dates
- Active/inactive status

#### `challenge_submissions`
- User submissions to challenges
- Voting system with vote counts

#### `groups` & `group_members`
- Discussion groups (newlyweds, long_distance, parenting, general)
- Member management with roles (admin, moderator, member)
- Automatic member counting

#### `group_posts`
- Posts within discussion groups
- Similar to main posts but group-specific

#### `milestones`
- Couple milestone tracking
- Different types (anniversary, first_date, engagement, wedding, custom)
- Celebration status tracking

#### `badges` & `user_badges`
- Gamification system
- Achievement tracking with requirements stored as JSON
- Different badge types (milestone, activity, social, special)

#### `date_ideas`
- Community-shared date ideas
- Categorized (indoor, outdoor, romantic, adventure, budget, luxury)
- Like and save functionality

#### `saved_date_ideas`
- User's saved date ideas
- Personal collection management

#### `calendar_events`
- Couple's shared calendar
- Event types (anniversary, date, milestone, reminder)
- Recurring event support

#### `mood_entries`
- Daily mood tracking
- Score-based system (1-10)
- Notes and mood types

#### `shared_goals`
- Couple's shared goals
- Progress tracking with percentages
- Different goal types (relationship, travel, financial, health, career)

#### `memory_vault`
- Private couple memories
- Media storage (photo, video, journal, voice_note)
- Tagging system and favorites

## 🔐 Security Implementation

### Row Level Security (RLS)
All tables implement comprehensive RLS policies:

- **Profile Access**: Users can view all profiles but only modify their own
- **Couple Data**: Only couple members can access their couple data
- **Posts**: Public posts visible to all, private posts only to couple members
- **Messages**: Only accessible to couple members
- **Groups**: Public groups visible to all, private groups only to members
- **Personal Data**: Calendar, goals, memories only accessible to couple members

### Authentication
- Email/password authentication with email verification
- Profile creation on signup
- Session management with AsyncStorage
- Automatic token refresh

## 🚀 Edge Functions

### Content Moderation (`moderate-content`)
- AI-assisted content moderation
- Checks for inappropriate words, suspicious patterns, PII
- Returns moderation score and suggested actions
- Integrated into posts, comments, and messages

### Notifications (`send-notification`)
- Push notification system
- Template-based notifications for different events
- User targeting and data payload support

## 📱 Frontend Integration

### Authentication Hooks
- `useAuth`: Complete authentication management
- Sign up, sign in, sign out functionality
- Profile management and updates

### Social Features Hooks
- `usePosts`: Social feed management with moderation
- `useMessages`: Real-time chat with content filtering
- `useGroups`: Discussion group management
- `useCalendar`: Shared calendar functionality
- `useCouple`: Couple relationship management

### Real-time Features
- Message subscriptions via Supabase channels
- Automatic UI updates for new messages
- Live engagement tracking (likes, comments)

## 🎮 Gamification System

### Badges
Pre-populated achievement system:
- First Week Together
- 100 Days Strong
- One Year Anniversary
- Social Butterfly
- Conversation Starter
- Memory Keeper
- Goal Achiever
- Challenge Champion

### Challenges
Sample challenges included:
- Best Throwback Photo
- Love Story in 3 Words
- Date Night Creativity

### Progress Tracking
- Days together calculation
- Message counts
- Memory vault entries
- Goal completion tracking

## 🌐 Social Features

### Community Feed
- Public post sharing
- Like and comment system
- Content moderation
- Post type categorization

### Discussion Groups
- Pre-created groups for different couple types
- Join/leave functionality
- Group-specific posting
- Member role management

### Challenges
- Time-bound community challenges
- Submission system with voting
- Leaderboard functionality

## 📊 Data Management

### Database Triggers
- Automatic timestamp updates
- Count maintenance (likes, comments, members)
- Data consistency enforcement

### Sample Data
- Default badges and achievements
- Sample challenges
- Discussion groups
- Date ideas collection

## 🔧 Technical Features

### Content Moderation
- Real-time content filtering
- Pattern recognition for PII and spam
- Confidence scoring system
- Automatic action suggestions

### File Storage
- Media URL storage in database
- Support for images, videos, voice notes
- Organized by content type

### Privacy Controls
- Private mode for couples
- Public/private post controls
- Group privacy settings

## 🚀 Deployment Ready

The backend is fully deployed and functional:
- All database tables created with proper relationships
- RLS policies implemented and tested
- Edge functions deployed and accessible
- Sample data populated
- Real-time subscriptions configured

## 📈 Scalability Considerations

- Efficient database indexing
- Optimized queries with proper joins
- Real-time subscriptions for performance
- Content moderation to maintain quality
- Automatic cleanup and maintenance functions

This implementation provides a complete, production-ready backend for the Couply app with all social features, security measures, and scalability considerations in place.
