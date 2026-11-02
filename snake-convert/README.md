# Serpentis — Frontend-only React Snake Game

This project uses React, Vite, JavaScript/JSX and browser localStorage. There is no application backend or API server.

## Requirements
- Node.js 20.19+ (Node.js 22.12+ recommended)
- npm

## Run in VS Code
Open this folder in VS Code and run:

```bash
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally **http://localhost:5173**.

## Features
- Register and log in with a username and password
- Password confirmation during registration
- Logout
- Snake game, difficulty levels, skins, leaderboard and score import/export
- User accounts, profiles and scores saved in this browser's localStorage

## Important security note
This is a frontend-only educational/demo login. Password hashes and accounts are stored in the browser and can be inspected or changed by the browser owner. Do not use real or reused passwords. For secure authentication, a backend is required.
