# Habit Builder & Reminder App

A full‑stack web application that helps users create daily or weekly habits, mark them as completed, and track their consistency through streaks and completion counts. It includes a dashboard to visualize habit progress.

## Minimum Requirements Coverage

- **Create / delete habits**
- **Daily / weekly frequency** per habit
- **Mark habits as completed**
- **Track streaks** (current + longest)
- **Dashboard visualization** for habit progress

## Key Features

- Authentication (Signup/Login)
- Habit management (Create, List, Update, Delete)
- Completion logging with streak tracking
- Dashboard with modern habit list UI + progress indicators
- Habit detail view with analytics (weekly/monthly charts + heatmap)
- Light/Dark theme toggle (saved in local storage)
- Reminder time selection (12‑hour AM/PM UI stored as `HH:mm`)

## Tech Stack

- **Frontend**: React (Create React App), Axios
- **Backend**: Node.js, Express
- **Database**: MongoDB + Mongoose
- **Auth**: JWT

## Project Structure

```
habit-builder-app/
  backend/
  frontend/
```

## Local Development Setup

### 1) Backend

1. Create `backend/.env`:

```env
MONGO_URI=mongodb://localhost:27017/habit-builder
JWT_SECRET=your-secret
CORS_ORIGIN=http://localhost:3000
PORT=5001
```

2. Install and run:

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:5001`.

### 2) Frontend

1. Install and run:

```bash
cd frontend
npm install
npm start
```

Frontend runs on `http://localhost:3000`.

## Environment Configuration (Frontend)

All API calls go through `frontend/src/api/api.js`.

### Recommended env variable

Set this for production deployments (Netlify/Vercel):

```
REACT_APP_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```

If not set:

- In **development** it falls back to `http://localhost:5001/api`
- In **production** it falls back to `/api` (useful only when frontend and backend are hosted together)

## Deployment (Recommended)

### Backend (Railway/Render)

Set these environment variables:

- `MONGO_URI` (MongoDB Atlas `mongodb+srv://...` recommended)
- `JWT_SECRET`
- `CORS_ORIGIN` (your frontend URL)

Example:

```
CORS_ORIGIN=https://your-site.netlify.app
```

### Database (MongoDB Atlas)

Use an Atlas connection string:

```
mongodb+srv://<USER>:<PASSWORD>@<cluster>.mongodb.net/<DBNAME>?retryWrites=true&w=majority
```

### Frontend (Netlify)

1. Add environment variable:

```
REACT_APP_API_BASE_URL=https://YOUR_BACKEND_DOMAIN/api
```

2. Deploy the `frontend` build.

### Fix Netlify Refresh 404 (React Router)

This project includes:

`frontend/public/_redirects`

```txt
/*    /index.html   200
```

This ensures routes like `/dashboard` work even after refresh.

## Team Contributions

### 1) Sumukh S P — Backend + Integration

- Create GitHub repo and project structure
- Setup backend server
- Handle authentication (login/signup)
- Manage integration of all modules
- Final testing and deployment coordination

### 2) Harikrishna — Database Models

- Create models:
  - User
  - Habit
  - CompletionLog
  - Streak
- Setup MongoDB connection

### 3) Pruthvi R — Habit Management APIs

- Create habit
- Delete habit
- Update habit
- List habits

### 4) Vaishnavi Pralhad Shindhe — Completion & Streak Logic

- Mark habit completed
- Update streaks
- Track completion counts
- Weekly/daily logic

### 5) Sukeerti Vani Jha — Authentication & Forms UI

- Login / Signup UI
- Add habit form
- Connect auth APIs

### 6) Supreeth S — Dashboard & Visualization

- Habit dashboard
- Streak display
- Progress charts
- Connect habit APIs

