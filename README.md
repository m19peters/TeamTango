# TeamTango - Youth Sports Team Matchmaking Platform

TeamTango is a comprehensive mobile-first application that connects youth sports teams for competitive matchups. Built with modern web technologies, it provides a seamless experience across web, iOS, and Android platforms.

## 🏆 Features

### Core Functionality
- **Multi-Team Management**: Create and manage multiple sports teams with detailed profiles including logos, venues, and contact information
- **Smart Team Discovery**: Advanced search with like/dislike system, proximity-based filtering, and intelligent matching
- **Real-Time Messaging**: Instant communication between teams with availability date embedding and read receipts
- **Interactive Calendar**: Comprehensive availability management with visual calendar interface
- **Global Team Context**: "Viewing as team" functionality for managing multiple teams seamlessly

### User Experience
- **Mobile-First Design**: Optimized responsive interface with native mobile navigation
- **Dark Mode**: System-aware theme with user preference persistence in database
- **Real-Time Updates**: Live messaging and notification system using Supabase Realtime
- **Proximity Search**: Location-based team discovery with distance calculations
- **Smart Interactions**: Like/dislike system with interaction history and recommendations

### Team Management
- **Soft Deletion**: Mark teams as inactive without losing data, with reactivation capability
- **Logo Management**: Custom team logo upload and display throughout the application
- **Venue Information**: Detailed home venue and address management with geocoding support
- **Team Statistics**: Dashboard with interaction counts, message statistics, and activity metrics
- **Form Validation**: Comprehensive client-side validation for phone numbers, addresses, and required fields

### Communication System
- **Message Threads**: Organized conversations grouped by team interactions
- **Availability Integration**: Embed proposed dates directly into messages with visual tags
- **Message Status**: Track message delivery and interaction states
- **Inactive Team Handling**: Graceful handling of communications with deactivated teams

## 🛠️ Tech Stack

### Frontend
- **Vue 3** with Composition API and `<script setup>` syntax
- **Pinia** for state management with persistent stores
- **Vue Router 4** for client-side routing
- **Tailwind CSS** for utility-first styling with custom components
- **Vite** for lightning-fast development and building

### Mobile Development
- **Capacitor 6** for cross-platform mobile deployment
- **Native iOS/Android** integration with platform-specific optimizations

### Backend & Services
- **Supabase** comprehensive backend solution:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions for live messaging
  - Authentication with email/password
  - File storage for team logos
- **PostGIS** extension for geospatial queries and proximity search
- **Multiple Geocoding APIs** (OpenStreetMap Nominatim, MapBox, Google Maps)

### Development Tools
- **ESLint** for code quality
- **PostCSS** for CSS processing
- **Environment Variables** for configuration management

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** and npm
- **Supabase account** for backend services
- For mobile development:
  - **Xcode** (iOS development on macOS)
  - **Android Studio** (Android development)

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd team-matchup-app
   npm install
   ```

2. **Environment Setup**
   Create a `.env.local` file with your configuration:
   ```env
   VITE_SUPABASE_URL=your-supabase-project-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_MAPBOX_API_KEY=your-mapbox-api-key (optional)
   VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key (optional)
   ```

3. **Database Setup**
   Run the provided SQL scripts in your Supabase SQL Editor:
   ```bash
   # Run these in order:
   database/setup.sql
   database/setup_storage.sql
   database/add_team_logo_migration.sql
   database/add_theme_preference_migration.sql
   ```

4. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

## 🗄️ Database Schema

### Core Tables

- **`sports`**: Reference table for available sports
- **`user_profiles`**: Extended user information with theme preferences
- **`teams`**: Team profiles with geocoding and soft deletion support
- **`team_availability`**: Calendar-based availability management
- **`match_requests`**: Message conversation threads between teams
- **`team_messages`**: Individual messages within conversations
- **`team_interactions`**: Like/dislike system for team discovery
- **`team_interaction_stats`**: Aggregated statistics for dashboard

### Database Views

- **`team_conversations`**: Consolidated view of message threads with participant details
- **`team_interaction_stats`**: Real-time statistics for dashboard displays

### Key Features

- **Row Level Security (RLS)**: Comprehensive security policies for data protection
- **Real-time Subscriptions**: Live updates for messaging and interactions
- **PostGIS Integration**: Spatial queries for proximity-based team discovery
- **Soft Deletion**: `active` flags for non-destructive team management

## 📱 Mobile Development

### Build Commands

```bash
# Build and sync with mobile platforms
npm run mobile:build

# Open in development environments
npm run mobile:ios      # Opens in Xcode
npm run mobile:android  # Opens in Android Studio

# Run on devices/simulators
npm run mobile:run:ios
npm run mobile:run:android
```

### Mobile-Specific Features

- **Native Navigation**: Bottom tab navigation optimized for mobile use
- **Mobile Header**: Top navigation with logout functionality and branding
- **Touch Optimizations**: Gesture-friendly interfaces and touch targets
- **Responsive Design**: Adaptive layouts for various screen sizes

## 🏗️ Project Structure

```
team-matchup-app/
├── src/
│   ├── components/
│   │   ├── AvailabilityPicker.vue    # Date selection for messages
│   │   ├── MessageDisplay.vue        # Message rendering with date tags
│   │   ├── Toast.vue                 # Notification system
│   │   └── ViewingAsTeamSelector.vue # Team context switching
│   ├── views/
│   │   ├── HomeView.vue             # Landing page
│   │   ├── LoginView.vue            # Authentication
│   │   ├── TeamManagementView.vue   # Team CRUD & dashboard
│   │   ├── CalendarView.vue         # Availability management
│   │   ├── DiscoveryView.vue        # Team discovery & matching
│   │   └── MessageView.vue          # Real-time messaging
│   ├── stores/
│   │   ├── auth.js                  # Authentication state
│   │   ├── teams.js                 # Team management
│   │   ├── messages.js              # Messaging system
│   │   ├── interactions.js          # Like/dislike system
│   │   ├── dashboard.js             # Statistics and metrics
│   │   ├── notifications.js         # Toast notifications
│   │   ├── theme.js                 # Dark mode with persistence
│   │   └── viewingAsTeam.js         # Team context management
│   ├── utils/
│   │   ├── messageUtils.js          # Message formatting utilities
│   │   └── geocoding.js             # Location services
│   ├── config/
│   │   └── supabase.js              # Supabase client configuration
│   └── assets/                      # Static assets and styling
├── database/                        # SQL migration scripts
├── android/                         # Android platform files
├── ios/                            # iOS platform files
└── public/                         # Static public assets
```

## 🎯 Key Features Deep Dive

### Team Discovery System
- **Proximity Search**: Find teams within specified distance using PostGIS
- **Like/Dislike Mechanism**: Tinder-style interaction system
- **Smart Filtering**: Sport, skill level, age group, and availability filters
- **Interaction History**: Track and prevent duplicate interactions

### Real-Time Messaging
- **Live Updates**: Instant message delivery using Supabase Realtime
- **Date Embedding**: Propose game dates directly within messages
- **Conversation Management**: Organized threads between team pairs
- **Status Tracking**: Message read receipts and delivery status

### Multi-Team Management
- **Global Context**: Switch between teams seamlessly across all views
- **Team Dashboard**: Statistics, interactions, and activity metrics
- **Soft Deletion**: Mark teams inactive without data loss
- **Bulk Operations**: Manage multiple teams efficiently

### Mobile Experience
- **Native Feel**: Platform-specific navigation and interactions
- **Responsive Design**: Optimized for all screen sizes
- **Touch Gestures**: Mobile-first interaction patterns
- **Offline Resilience**: Graceful handling of connectivity issues

## 🔧 Customization

### Adding New Sports
Update the sports table and form options:
```sql
INSERT INTO sports (name) VALUES ('New Sport');
```

### Modifying UI Theme
Update Tailwind configuration in `tailwind.config.js` or modify CSS custom properties.

### Geocoding Services
Configure multiple providers in `src/utils/geocoding.js` for redundancy and global coverage.

## 📦 Deployment

### Web Deployment
```bash
npm run build
# Deploy dist/ folder to Vercel, Netlify, or any static host
```

### Mobile App Stores
1. **iOS**: Use Xcode for App Store Connect deployment
2. **Android**: Generate signed APK/AAB for Google Play Console

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **Supabase** for providing an excellent backend-as-a-service platform
- **Vue.js Community** for the amazing ecosystem and tools
- **Capacitor Team** for seamless cross-platform mobile development

---

**TeamTango** - Connecting youth sports teams, one match at a time! 🏒⚾🏀🏈⚽
