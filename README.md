# TeamTango - Youth Sports Team Matchmaking App

TeamTango is a mobile-friendly Vue.js application that helps youth sports teams connect with each other to schedule matches. Built with modern web technologies and deployable to iOS, Android, and web browsers.

## Features

- **Team Management**: Create and manage multiple sports teams with detailed profiles
- **Availability Calendar**: Set when your teams are available to host or travel for matches
- **Team Discovery**: Search and filter other teams by sport, skill level, location, and availability
- **Match Requests**: Send and receive match requests with other teams
- **Mobile-First Design**: Responsive design optimized for mobile devices
- **Cross-Platform**: Deploy to iOS, Android, and web browsers

## Tech Stack

- **Frontend**: Vue 3 with Composition API
- **Mobile**: Capacitor for native iOS and Android deployment
- **Backend**: Supabase (PostgreSQL database, authentication, real-time features)
- **Styling**: Tailwind CSS with custom components
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Build Tool**: Vite

## Quick Start

### Prerequisites

- Node.js 18+ and npm
- Supabase account (for backend services)
- For mobile development:
  - Xcode (for iOS development)
  - Android Studio (for Android development)

### Setup

1. **Clone and install dependencies**
   ```bash
   cd team-matchup-app
   npm install
   ```

2. **Configure Supabase**
   - Create a new project at [Supabase](https://supabase.com)
   - Get your project URL and anon key from the project dashboard
   - Update `src/config/supabase.js` with your credentials:
     ```javascript
     const supabaseUrl = 'your-project-url'
     const supabaseAnonKey = 'your-anon-key'
     ```

3. **Run development server**
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser

## Database Setup

You'll need to set up the following tables in your Supabase database:

### Core Tables

```sql
-- Sports reference table
CREATE TABLE sports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles (extends auth.users)
CREATE TABLE user_profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teams table
CREATE TABLE teams (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  sport_id UUID REFERENCES sports(id),
  skill_level VARCHAR(20) CHECK (skill_level IN ('Beginner', 'Intermediate', 'Advanced', 'Elite')),
  phone VARCHAR(20),
  city VARCHAR(50),
  state VARCHAR(2),
  zip VARCHAR(10),
  home_venue VARCHAR(100),
  venue_address TEXT,
  description TEXT,
  status VARCHAR(20) DEFAULT 'Active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Team availability
CREATE TABLE team_availability (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time TIME NOT NULL,
  duration DECIMAL(3,1) DEFAULT 2.0,
  type VARCHAR(20) CHECK (type IN ('available', 'travel', 'unavailable')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Match requests
CREATE TABLE match_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  requesting_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  target_team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  preferred_dates TEXT,
  message TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Enable Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_availability ENABLE ROW LEVEL SECURITY;
ALTER TABLE match_requests ENABLE ROW LEVEL SECURITY;

-- Create policies (example for teams table)
CREATE POLICY "Users can view all teams" ON teams FOR SELECT USING (true);
CREATE POLICY "Users can manage their own teams" ON teams FOR ALL USING (auth.uid() = user_id);
```

## Mobile Development

### Build for Mobile

```bash
# Build the web app and sync with mobile platforms
npm run mobile:build

# Open in Xcode (iOS)
npm run mobile:ios

# Open in Android Studio
npm run mobile:android

# Run directly on connected device/simulator
npm run mobile:run:ios
npm run mobile:run:android
```

### Prerequisites for Mobile Development

**For iOS:**
- macOS with Xcode installed
- iOS Simulator or physical iOS device
- Apple Developer account (for device testing and App Store deployment)

**For Android:**
- Android Studio installed
- Android SDK and emulator set up
- Physical Android device or emulator

## Deployment

### Web Deployment

Build for production:
```bash
npm run build
```

Deploy the `dist` folder to any static hosting service (Vercel, Netlify, AWS S3, etc.)

### Mobile App Store Deployment

1. **iOS App Store:**
   - Open the project in Xcode: `npm run mobile:ios`
   - Configure signing and capabilities
   - Build and upload to App Store Connect

2. **Google Play Store:**
   - Open in Android Studio: `npm run mobile:android`
   - Generate signed APK/AAB
   - Upload to Google Play Console

## Development Guide

### Project Structure

```
src/
├── components/          # Reusable Vue components
├── views/              # Page components
│   ├── HomeView.vue    # Landing page
│   ├── LoginView.vue   # Authentication
│   ├── DashboardView.vue   # Main dashboard
│   ├── TeamManagementView.vue  # Team CRUD
│   ├── CalendarView.vue    # Availability management
│   └── DiscoveryView.vue   # Team discovery
├── stores/             # Pinia state management
│   └── auth.js         # Authentication store
├── config/             # Configuration files
│   └── supabase.js     # Supabase client setup
└── assets/             # Static assets and styles
```

### Key Features Implementation

1. **Authentication**: Uses Supabase Auth with email/password
2. **Team Management**: Full CRUD operations for team profiles
3. **Calendar System**: Interactive calendar for availability management
4. **Discovery**: Advanced filtering and search for finding teams
5. **Match Requests**: Messaging system for coordinating games

### Customization

- **Sports**: Add/remove sports in the sports reference table
- **Skill Levels**: Modify in the database schema and form options
- **Styling**: Update Tailwind configuration in `tailwind.config.js`
- **Mobile Icons**: Replace icons in `public/` folder

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test on web and mobile platforms
5. Submit a pull request

## Support

For questions or support:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## License

This project is open source and available under the MIT License.

---

**TeamTango** - Connecting youth sports teams, one match at a time! 🏒⚽🏀
