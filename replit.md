# Antigravity Timer

## Overview
A premium productivity timer web application built with React + Vite frontend and an Express.js backend. Features stopwatch, countdown, and Pomodoro modes with custom sound support.

## Project Architecture
- **Frontend**: React 19 + Vite, served on port 5000 (0.0.0.0)
- **Backend**: Express.js API server on port 3001 (localhost) for custom sound uploads
- **Build System**: Vite 7
- **Language**: JavaScript (JSX)

## Key Files
- `server.js` - Express backend for custom sound upload/management
- `src/App.jsx` - Main React application component
- `src/components/` - UI components (TimerDisplay, ControlBar, SettingsOverlay, etc.)
- `src/hooks/` - Custom hooks (useStopwatch, useTimer)
- `vite.config.js` - Vite configuration with proxy to backend API
- `public/custom_sounds/` - Uploaded custom sound files

## Development
- Frontend runs on port 5000, backend on port 3001
- Vite proxies `/api` and `/custom_sounds` to the backend
- Run with: `node server.js & npm run dev`

## Recent Changes
- 2026-02-08: Configured for Replit environment (host, port, allowedHosts)
