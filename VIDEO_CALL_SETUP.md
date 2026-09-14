# 🎥 Video Call Setup Guide - Daily.co Integration

Complete guide to set up video calling with Daily.co for Xtin Capital.

---

## 📋 Prerequisites

- Daily.co account (free tier available)
- Backend environment variables configured
- Database schema applied

---

## 🚀 Step 1: Create Daily.co Account

1. Go to https://www.daily.co/
2. Click **"Sign Up"** (free account)
3. Verify your email
4. Log in to dashboard: https://dashboard.daily.co/

---

## 🔑 Step 2: Get API Key

1. In Daily.co dashboard, go to **"Developers" → "API Keys"**
2. Copy your **API Key** (starts with a long string)
3. Keep it secure - you'll need it for backend

---

## ⚙️ Step 3: Configure Backend

### Add to `/backend/.env`:

```bash
# Daily.co API Configuration
DAILY_API_KEY=your_daily_api_key_here
```

**Important:**
- Replace `your_daily_api_key_here` with your actual API key
- Never commit this file to Git (already in .gitignore)
- For production (Render), add this in Environment Variables

---

## 🗄️ Step 4: Apply Database Schema

Run this SQL in your Supabase SQL Editor:

```bash
# File: backend/database/video_calls_schema.sql
```

1. Go to Supabase Dashboard → SQL Editor
2. Open `video_calls_schema.sql`
3. Copy entire content
4. Paste in SQL Editor
5. Click **"Run"**

This creates:
- `video_call_sessions` table
- `call_participants` table
- `call_events` table
- All necessary indexes

---

## 🎨 Step 5: Test Locally

### Terminal 1: Start Backend
```bash
cd backend
npm start
# Should see: server is running on localhost:5002
```

### Terminal 2: Start Frontend
```bash
cd Client
npm run dev
# Should see: Local: http://localhost:5173
```

### Test Video Call:
1. Open http://localhost:5173
2. Login as a user
3. Go to Advisory page
4. Click **"Video Call"** on an advisor card
5. Allow camera/microphone permissions
6. You should see the video call interface!

---

## 🔧 Features Available

### User Controls:
- ✅ **Mute/Unmute** microphone
- ✅ **Video On/Off** camera toggle
- ✅ **Screen Share** (advisor only)
- ✅ **End Call** button
- ✅ **Call Duration** timer
- ✅ **Participant Count** indicator

### Backend Features:
- ✅ **Room Creation** with Daily.co API
- ✅ **JWT Tokens** for secure access
- ✅ **Call History** tracking
- ✅ **Scheduled Calls** support
- ✅ **Call Recording** (cloud recording enabled)
- ✅ **Participant Tracking**

---

## 📊 Database Tables

### `video_call_sessions`
Stores all video call sessions with:
- User & Advisor IDs
- Daily.co room details
- Call duration & status
- Payment information
- User ratings & feedback

### `call_participants`
Tracks who joined/left and when:
- Join/leave timestamps
- Connection quality
- Participant type (user/advisor)

### `call_events`
Detailed event log:
- Screen share events
- Recording events
- Participant actions

---

## 🌐 Production Deployment

### Render (Backend):
Add environment variable:
```
DAILY_API_KEY=your_daily_api_key_here
```

### Vercel (Frontend):
No additional env vars needed for Daily.co (handled by backend)

---

## 💰 Daily.co Pricing

### Free Tier:
- ✅ 10,000 minutes/month
- ✅ 1-on-1 video calls
- ✅ Screen sharing
- ✅ Recording
- ✅ Perfect for starting out!

### Paid Plans (Optional):
- **Standard:** $99/month - 100,000 minutes
- **Professional:** Custom pricing for enterprise

---

## 🔐 Security Features

1. **JWT Tokens:** Each call requires authentication
2. **Room Expiry:** Rooms auto-expire after 1 hour
3. **Max Participants:** Limited to 2 (1-on-1 calls)
4. **Secure Access:** Only invited participants can join

---

## 📱 How It Works

### User Flow:
1. User clicks "Video Call" on advisor card
2. Backend creates Daily.co room
3. Backend returns room URL + token
4. User joins with their token
5. Advisor receives notification
6. Both join the same room
7. Video call begins!

### Technical Flow:
```
User Request
    ↓
Frontend VideoCallService
    ↓
Backend API (POST /api/video-calls/create)
    ↓
Daily.co API (Create Room)
    ↓
Save to Database
    ↓
Return Room URL + Token
    ↓
Frontend VideoCall Component
    ↓
Daily.co Room (Video Call Active)
```

---

## 🛠️ API Endpoints

### Create Session
```
POST /api/video-calls/create
Body: { advisorId, scheduledAt, callType }
```

### Join Session
```
GET /api/video-calls/:sessionId/join
```

### End Session
```
POST /api/video-calls/:sessionId/end
Body: { rating, feedback }
```

### Get History
```
GET /api/video-calls/history
```

### Get Upcoming
```
GET /api/video-calls/upcoming
```

### Cancel Call
```
POST /api/video-calls/:sessionId/cancel
```

---

## ✅ Testing Checklist

- [ ] Daily.co API key added to backend `.env`
- [ ] Database schema applied in Supabase
- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can create video call session
- [ ] Can join video call
- [ ] Can mute/unmute microphone
- [ ] Can turn video on/off
- [ ] Can share screen (advisor)
- [ ] Can end call
- [ ] Call duration shows correctly
- [ ] Call history saves in database

---

## 🐛 Troubleshooting

### "Failed to create video call"
- Check `DAILY_API_KEY` is set correctly
- Verify Daily.co account is active
- Check backend logs for errors

### "Camera/microphone not working"
- Allow permissions in browser
- Check device settings
- Try different browser (Chrome recommended)

### "Cannot join room"
- Verify user is authenticated
- Check session exists in database
- Ensure room hasn't expired (1 hour limit)

### "Screen share not working"
- Only advisors can share screen
- Check browser permissions
- Use Chrome or Edge (best support)

---

## 📞 Support

**Daily.co Documentation:**
- https://docs.daily.co/

**Daily.co Dashboard:**
- https://dashboard.daily.co/

**API Reference:**
- https://docs.daily.co/reference/rest-api

---

## 🎉 You're Ready!

Video calling system is now fully configured. Users can have professional 1-on-1 video consultations with advisors!

**Next Steps:**
1. Add "Video Call" button to advisory page
2. Test with real users
3. Monitor call quality
4. Collect feedback
5. Scale as needed!
