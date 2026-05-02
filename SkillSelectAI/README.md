# 📚 SkillSelectAI - Libraries & Dependencies Setup Guide

## Backend Dependencies

### Core Framework & Database
```bash
npm install express mongoose
```

**Purpose:**
- `express` - Web framework for API endpoints
- `mongoose` - MongoDB ODM for database operations

### Authentication & Security
```bash
npm install jsonwebtoken bcryptjs cookie-parser
```

**Purpose:**
- `jsonwebtoken` - JWT token generation and verification
- `bcryptjs` - Password hashing
- `cookie-parser` - Parse HTTP cookies

### File Handling & CV Parsing
```bash
npm install multer pdf-parse mammoth
```

**Purpose:**
- `multer` - File upload middleware
- `pdf-parse` - PDF file parsing for CVs
- `mammoth` - DOCX file parsing for CVs

### Interview Scheduling & Email
```bash
npm install googleapis date-fns uuid
```

**Purpose:**
- `googleapis` - Google Calendar API integration
- `date-fns` - Date manipulation for scheduling
- `uuid` - Generate unique interview tokens

### Development Tools
```bash
npm install -D nodemon dotenv
```

**Purpose:**
- `nodemon` - Auto-restart server on file changes
- `dotenv` - Environment variable management

---

## Frontend Dependencies

### Core Framework & Routing
```bash
npm install react react-dom react-router-dom
```

**Purpose:**
- `react` - Core React library
- `react-dom` - React DOM renderer
- `react-router-dom` - Client-side routing

### HTTP Client & State Management
```bash
npm install axios
```

**Purpose:**
- `axios` - HTTP client for API calls

### UI Components & Styling
```bash
npm install tailwindcss
```

**Purpose:**
- `tailwindcss` - Utility-first CSS framework

### Development Tools
```bash
npm install -D vite @vitejs/plugin-react
```

**Purpose:**
- `vite` - Fast build tool and dev server
- `@vitejs/plugin-react` - React plugin for Vite

---

## Environment Variables Setup

### Backend [.env](cci:7://file:///Users/yashal/Desktop/SkillSelectAI/backend/.env:0:0-0:0) File
```env
# Database
MONGODB_URI=mongodb://localhost:27017/skillselect

# JWT Configuration
JWT_SECRET=your-long-random-secret-here
JWT_EXPIRES_IN=1d
BCRYPT_ROUNDS=10

# Google Calendar API (Required for email invites)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=https://developers.google.com/oauthplayground
GOOGLE_REFRESH_TOKEN=your_google_refresh_token

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

---

## Google Calendar API Setup

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project
3. Enable **Google Calendar API**

### 2. Create OAuth 2.0 Credentials
1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Select **Web application**
3. Add authorized redirect URI: `https://developers.google.com/oauthplayground`
4. Copy **Client ID** and **Client Secret**

### 3. Generate Refresh Token
1. Go to [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/)
2. Click ⚙️ → **Use your own OAuth credentials**
3. Enter your Client ID and Secret
4. In **Step 1**, select **Google Calendar API** → `https://www.googleapis.com/auth/calendar`
5. Authorize and copy the refresh token

---

## Installation Commands

### Backend Setup
```bash
cd backend
npm install express mongoose jsonwebtoken bcryptjs cookie-parser multer pdf-parse mammoth googleapis date-fns uuid nodemon dotenv
```

### Frontend Setup
```bash
cd frontend
npm install react react-dom react-router-dom axios tailwindcss vite @vitejs/plugin-react
```

---

## Package.json Versions

### Backend Dependencies
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^7.5.0",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "cookie-parser": "^1.4.6",
    "multer": "^1.4.5",
    "pdf-parse": "^1.1.1",
    "mammoth": "^1.6.0",
    "googleapis": "^126.0.1",
    "date-fns": "^2.30.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "dotenv": "^16.3.1"
  }
}
```

### Frontend Dependencies
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.15.0",
    "axios": "^1.5.0",
    "tailwindcss": "^3.3.3"
  },
  "devDependencies": {
    "vite": "^4.4.5",
    "@vitejs/plugin-react": "^4.0.3"
  }
}
```

---

## Development Scripts

### Backend `package.json`
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

### Frontend `package.json`
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## Quick Start

1. **Install MongoDB** and start it
2. **Clone repository** and navigate to project
3. **Install dependencies** using commands above
4. **Set up environment variables** in [backend/.env](cci:7://file:///Users/yashal/Desktop/SkillSelectAI/backend/.env:0:0-0:0)
5. **Configure Google Calendar API** (for email invites)
6. **Start development servers:**
   ```bash
   # Terminal 1 - Backend
   cd backend && npm run dev
   
   # Terminal 2 - Frontend
   cd frontend && npm run dev
   ```

