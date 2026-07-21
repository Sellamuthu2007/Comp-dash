# Comp-Dash

A production-grade mobile-first SaaS platform for college competition management.

## Architecture

```
comp-dash/
├─ apps/
│  ├─ mobile/          # React Native (Expo) - Student & Advisor app
│  └─ web/             # Next.js 15 - Admin dashboard
├─ packages/
│  ├─ api/             # TanStack Query hooks & API client
│  ├─ design-system/   # Shared UI components (Button, Card, Badge, etc.)
│  ├─ hooks/           # Shared React hooks
│  ├─ i18n/            # Internationalization (en, ta, hi)
│  ├─ types/           # TypeScript type definitions
│  └─ utils/           # Utility functions
└─ locales/            # Translation files
```

## Tech Stack

- **Mobile**: React Native, Expo, React Navigation
- **Web**: Next.js 15, React, Tailwind CSS
- **State**: TanStack Query (React Query)
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **i18n**: i18next + react-i18next

## Getting Started

### Prerequisites

- Node.js >= 20.0.0
- npm or yarn
- Expo CLI (for mobile)
- Android Studio / Xcode (for mobile development)

### Installation

```bash
# Install dependencies
npm install

# Start web dashboard
npm run dev:web

# Start mobile app
npm run dev:mobile
```

### Development

```bash
# Run web app
cd apps/web && npm run dev

# Run mobile app
cd apps/mobile && npm start

# Type checking
npm run typecheck

# Linting
npm run lint

# Formatting
npm run format
```

## Design System

The design system follows Apple-inspired design language with:

- **Colors**: Primary violet (#6C4CF1), semantic colors for status
- **Typography**: Inter font family, clear hierarchy
- **Components**: Button, Card, Badge, Avatar, Input, Skeleton, etc.
- **Spacing**: 8-point grid system
- **Border Radius**: Rounded corners (12-20px)

### Available Components

```tsx
import { Button, Card, Badge, Avatar, Input, Skeleton } from '@comp-dash/design-system'

<Button variant="primary" size="md">Click me</Button>
<Card padding="lg">Content</Card>
<Badge variant="success" dot>Active</Badge>
<Avatar name="John Doe" size="lg" />
<Input label="Email" placeholder="Enter email" />
<Skeleton variant="heading" width="half" />
```

## API Layer

All API calls go through TanStack Query hooks:

```tsx
import { useCompetitions, useRegistrations } from '@comp-dash/api'

const { data, isLoading } = useCompetitions({ category: 'hackathon' })
const { data: registrations } = useRegistrations({ status: 'verified' })
```

## Internationalization

Translations are in `locales/` directory:

- `en.json` - English
- `ta.json` - Tamil
- `hi.json` - Hindi

```tsx
import { useTranslation } from 'react-i18next'

const { t } = useTranslation()
return <h1>{t('home.greeting', { name: 'John' })}</h1>
```

## Features

### Mobile App (Student/Advisor)
- **Home**: Personalized dashboard with stats, deadlines, verified registrations
- **Discover**: Browse and filter competitions
- **Competition Details**: Full competition info with registration
- **History**: Track registration status
- **Profile**: Account settings and preferences
- **Notifications**: Real-time updates

### Web Dashboard (Admin)
- **Dashboard**: Overview with charts and key metrics
- **Competitions**: Manage all competitions
- **Registrations**: Review and verify registrations
- **Students**: Student management
- **Advisors**: Advisor management
- **Departments**: Department overview
- **Winners**: Winner management
- **Analytics**: Detailed analytics
- **Notifications**: Notification management
- **Settings**: System configuration
- **Audit Logs**: Activity tracking

## Environment Variables

### Web App (`apps/web/.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

### Mobile App (`apps/mobile/.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3001/api
EXPO_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
```

## License

Private - All rights reserved.
