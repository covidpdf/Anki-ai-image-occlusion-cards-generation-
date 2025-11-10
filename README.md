# Anki AI Image Occlusion Cards Generation

A modern web application for generating AI-powered flashcard decks with image occlusion. Built with Vite, React, TypeScript, Tailwind CSS, and shadcn/ui.

## Features

- 🧠 **AI-Powered Occlusion**: Smart generation of image occlusion cards using advanced AI algorithms
- 📱 **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- 🌓 **Dark/Light Theme**: Built-in theme toggle with system preference detection
- 🔄 **Spaced Repetition**: Integrated spaced repetition algorithm for optimal learning
- 📊 **Progress Tracking**: Comprehensive analytics and learning statistics
- 🔐 **Authentication**: User authentication and deck management
- 🎨 **Modern UI**: Beautiful, accessible UI built with shadcn/ui components
- ⚡ **Type-Safe**: Full TypeScript implementation for better development experience

## Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: React Router v6
- **State Management**: Zustand
- **HTTP Client**: Axios with interceptors
- **Testing**: Vitest + React Testing Library
- **Icons**: Lucide React
- **UI Components**: Radix UI primitives

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd anki-ai-image-occlusion-cards-generation
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   ├── layout.tsx      # Main layout component
│   ├── navigation.tsx  # Navigation component
│   ├── theme-toggle.tsx # Theme toggle component
│   └── ...
├── pages/              # Page components
│   ├── home.tsx        # Home page
│   ├── upload.tsx      # Upload page
│   ├── decks.tsx       # Decks page
│   └── study.tsx       # Study page
├── stores/             # Zustand stores
│   ├── theme.ts        # Theme state
│   ├── auth.ts         # Authentication state
│   └── app.ts          # App state
├── lib/                # Utility functions
│   ├── api.ts          # API client
│   └── utils.ts        # General utilities
├── hooks/              # Custom React hooks
│   └── use-toast.ts    # Toast hook
├── router/             # React Router configuration
├── test/               # Test files and setup
└── App.tsx             # Main App component
```

## Features Overview

### Navigation
- **Upload**: Upload images for occlusion card generation
- **Decks**: Browse and manage flashcard decks
- **Study**: Interactive study session with spaced repetition

### Theme System
- Automatic system preference detection
- Manual theme toggle with smooth transitions
- Persistent theme preference using localStorage

### Responsive Design
- Mobile-first approach with breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px  
  - Desktop: > 1024px
- Touch-friendly interface for mobile devices
- Optimized navigation for different screen sizes

### State Management
- **Theme Store**: Manages light/dark theme state
- **Auth Store**: Handles user authentication
- **App Store**: Global app state (loading, errors)

### Error Handling
- Global error boundary for React errors
- API error handling with user-friendly messages
- Toast notifications for user feedback

## Testing

The project includes comprehensive unit tests for:
- Layout components
- Navigation functionality  
- Theme toggle behavior
- Page rendering
- Error boundaries

Run tests with:
```bash
npm run test
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=Anki AI Image Occlusion
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run tests and linting
6. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.