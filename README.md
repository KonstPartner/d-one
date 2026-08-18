# DOne

**DOne** is an offline-first diabetes diary with cloud synchronization, follower access, and AI-powered meal analysis.

The application allows users to maintain a personal diary of glucose levels, insulin, carbohydrates, meals, comments, photos, and related events. Entries and photos are stored locally first, so the diary remains fully usable without an internet connection and can be synchronized with Firebase later.

Users can also share their synchronized diary with followers in read-only mode and use AI to analyze meal photos and estimate food composition, calories, protein, fat, and carbohydrates.

## Key Features

- **Offline-first diary** — local SQLite storage and local photos keep the diary available without a network connection.
- **Diabetes tracking** — record glucose, ultra-short-acting, short-acting and long-acting insulin, carbohydrates, meal relation, comments, photos, and event time.
- **Cloud synchronization** — synchronize local entries and photos with Firebase.
- **Follower access** — share a synchronized diary with followers in read-only mode.
- **AI food analysis** — analyze meal photos and estimate food composition, calories, protein, fat, and carbohydrates.
- **Cloud diary** — view synchronized entries and restore selected cloud entries to the device.
- **Import and export** — create application backups and CSV exports and restore supported backups.
- **English and Russian interface.**

## AI Analysis

AI requests are handled by a separate **Cloudflare Worker** rather than directly by the application.

```text
DOne
  → Cloudflare Worker
  → Firebase authentication and access checks
  → Cloudflare D1 request limits
  → Google Gemini
  → DOne
```

The Worker verifies Firebase authentication and user access; applies per-user and project request limits through Cloudflare D1.

The currently configured model is **Gemini 3.6 Flash**. The model can be changed through the Worker configuration.

## Architecture & Stack

DOne is built with **TypeScript**, **React Native**, and **Expo** and follows **Feature-Sliced Design (FSD)**.

Main technologies:

- React Native, Expo, Expo Router
- TypeScript
- Feature-Sliced Design
- TanStack Query
- Zustand
- Emotion
- react-i18next
- SQLite and FileSystem
- Firebase Authentication
- Cloud Firestore
- Firebase Storage
- Firebase Security Rules
- Cloudflare Workers
- Cloudflare D1
- Google Gemini API

The repository contains two main runtime projects:

```text
app/       React Native / Expo application
worker/    Cloudflare Worker for AI analysis
```

Product requirements, technical documentation, development rules, and UI prototypes are available in [`./docs`](./docs).

## Development

### Application

Install dependencies:

```bash
cd app
npm install
```

Create the local environment file:

```bash
cp .env.sample .env
```

Configure the required values.

To start the Expo development server:

```bash
npm start
```

### AI Worker

Install Worker dependencies:

```bash
cd worker
npm install
```

Create local Worker secrets:

```bash
cp .dev.vars.sample .dev.vars
```

Configure the required values.

Apply the local D1 migrations:

```bash
npx wrangler d1 migrations apply done-ai-usage --local
```

Start the Worker:

```bash
npm run dev
```
