# Habit Tracker & Accountability Partner App

A full-stack habit tracking application built with **Next.js**, **TypeScript**, **Redux Toolkit (RTK Query)**, and **MongoDB** that helps users build healthy habits with accountability partners.

---

## 🚀 Features

### Authentication

* Phone Number based Login
* OTP Verification
* No Password Required
* JWT Session Management
* Secure Authentication Flow

### Accountability Groups

* Create up to **3 groups per user**
* Each group supports **2 members only**
* Invite partner using Invite Code
* Real-time score comparison
* Shared accountability dashboard

### Habit Tracking

Users can track the following habits daily:

| Habit                | Points  |
| -------------------- | ------- |
| Every 2500 Steps     | 1 Point |
| No Fast Food         | 1 Point |
| Hit the Gym          | 1 Point |
| No Alcohol           | 1 Point |
| Social Media Detox   | 1 Point |
| Learn / Study        | 1 Point |
| No Sugar             | 1 Point |
| Drink 2 Liters Water | 1 Point |

### Step Tracking Formula

```text
0 - 2499 Steps = 0 Points
2500 - 4999 Steps = 1 Point
5000 - 7499 Steps = 2 Points
7500 - 9999 Steps = 3 Points

Points = floor(steps / 2500)
```

### Dashboard

* Today's Score
* Weekly Score
* Monthly Score
* Current Streak
* Habit Completion Rate
* Progress Charts
* Partner Comparison

### Leaderboard

* Group Ranking
* Weekly Ranking
* Monthly Ranking
* Longest Streak
* Most Consistent Member

### Analytics

* Habit Completion Percentage
* Daily Trends
* Weekly Reports
* Monthly Reports
* Streak Analysis

---

# 🛠 Tech Stack

## Frontend

* Next.js 15+
* React 19
* TypeScript
* Tailwind CSS
* Shadcn UI
* Redux Toolkit
* RTK Query
* React Hook Form
* Zod

## Backend

* Next.js Route Handlers
* Node.js
* MongoDB
* Mongoose
* JWT Authentication

## DevOps

* Vercel Deployment
* MongoDB Atlas
* GitHub Actions
* Environment Based Configuration

---

# 📁 Project Structure

```bash
src
│
├── app
│   ├── (auth)
│   │   ├── login
│   │   └── verify-otp
│   │
│   ├── dashboard
│   ├── groups
│   ├── leaderboard
│   ├── profile
│   ├── settings
│   │
│   └── api
│       ├── auth
│       ├── users
│       ├── groups
│       ├── habits
│       ├── records
│       └── leaderboard
│
├── components
│
├── features
│   ├── auth
│   ├── users
│   ├── groups
│   ├── habits
│   └── leaderboard
│
├── lib
│   ├── mongodb
│   ├── auth
│   └── utils
│
├── store
│
├── hooks
│
├── services
│
├── types
│
└── validations
```

---

# 🗄 Database Design

## Users Collection

```ts
{
  _id: ObjectId,
  phoneNumber: string,
  name: string,
  avatar?: string,

  groupsCreated: number,

  groupIds: ObjectId[],

  createdAt: Date,
  updatedAt: Date
}
```

---

## Groups Collection

One document per group.

```ts
{
  _id: ObjectId,

  name: string,

  inviteCode: string,

  createdBy: ObjectId,

  members: [
    {
      userId: ObjectId,
      joinedAt: Date
    }
  ],

  totalScores: {
    userId: number
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

## Daily Records Collection

```ts
{
  _id: ObjectId,

  userId: ObjectId,

  groupId: ObjectId,

  date: Date,

  steps: number,

  stepPoints: number,

  habits: {
    noFastFood: boolean,
    gym: boolean,
    noAlcohol: boolean,
    socialMediaDetox: boolean,
    study: boolean,
    noSugar: boolean,
    water2L: boolean
  },

  totalPoints: number,

  notes: string,

  createdAt: Date,
  updatedAt: Date
}
```

---

# 🔌 API Endpoints

## Authentication

### Send OTP

```http
POST /api/auth/send-otp
```

Request

```json
{
  "phoneNumber": "+919876543210"
}
```

---

### Verify OTP

```http
POST /api/auth/verify-otp
```

Request

```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

---

## Groups

### Create Group

```http
POST /api/groups
```

---

### Join Group

```http
POST /api/groups/join
```

---

### Get User Groups

```http
GET /api/groups
```

---

### Get Group Details

```http
GET /api/groups/:id
```

---

## Daily Records

### Create or Update Daily Record

```http
POST /api/records
```

---

### Get Daily Records

```http
GET /api/records
```

---

### Get Monthly Records

```http
GET /api/records/monthly
```

---

## Leaderboard

```http
GET /api/leaderboard/:groupId
```

---

# 🔄 RTK Query Setup

API slices:

```ts
authApi
groupApi
recordApi
leaderboardApi
userApi
```

Example:

```ts
export const groupApi = createApi({
  reducerPath: "groupApi",

  baseQuery: fetchBaseQuery({
    baseUrl: "/api"
  }),

  tagTypes: ["Groups"],

  endpoints: (builder) => ({
    getGroups: builder.query({
      query: () => "/groups"
    })
  })
})
```

---

# 🏆 Point Calculation

## Habit Points

```ts
const habitPoints =
  noFastFood +
  gym +
  noAlcohol +
  socialMediaDetox +
  study +
  noSugar +
  water2L
```

## Step Points

```ts
const stepPoints = Math.floor(steps / 2500)
```

## Total Points

```ts
const totalPoints =
  habitPoints +
  stepPoints
```

---

# 🔒 Business Rules

### User Rules

* Phone number must be unique.
* OTP required for login.
* User can create maximum 3 groups.

### Group Rules

* Maximum 2 members per group.
* Invite code required to join.
* One group document per accountability pair.

### Habit Rules

* Habits can be marked once per day.
* Daily record can be edited until midnight.
* Points recalculate automatically.

---

# 📊 Future Enhancements

* Push Notifications
* Google Fit Integration
* Apple Health Integration
* Friend Challenges
* Achievement Badges
* Habit Recommendations
* AI Habit Coach
* Dark Mode
* Offline Sync
* PWA Support

---

# 🚀 Local Development

## Install Dependencies

```bash
npm install
```

## Environment Variables

```env
MONGODB_URI=
JWT_SECRET=

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

NEXT_PUBLIC_APP_URL=
```

## Run Development Server

```bash
npm run dev
```

Open:

```bash
http://localhost:3000
```

---

# 📦 Deployment

Frontend + Backend

```bash
Vercel
```

Database

```bash
MongoDB Atlas
```

Recommended Architecture:

```text
Client
   ↓
Next.js App Router
   ↓
RTK Query
   ↓
Route Handlers
   ↓
Service Layer
   ↓
MongoDB Atlas
```

---

# 📄 License

MIT License

---

Built with ❤️ for accountability, consistency, and healthy habits.
