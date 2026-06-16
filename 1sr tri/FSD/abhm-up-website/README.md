# Akhil Bharat Hindu Mahasabha (U.P.) — Official Website

Production-ready bilingual (English/Hindi) website using Next.js (App Router) + React + TypeScript + Tailwind CSS + MongoDB with comprehensive Admin CMS.

## ✨ Features

### Frontend
- 🌐 **Bilingual Support** - Full English/Hindi language toggle
- 📱 **Responsive Design** - Mobile, tablet, and desktop optimized
- ⚡ **Dynamic Content** - Database-driven content management
- 🎨 **Modern UI** - Gradient themes, smooth animations, hover effects

### Admin CMS
- 🔐 **Role-Based Access** - Superadmin, Admin, Editor, Viewer roles
- ✏️ **Content Management** - Full CRUD for Events, Leaders, Focus Areas, News
- 🌏 **Bilingual CMS** - Manage English and Hindi content separately
- 📊 **Draft/Publish Workflow** - Preview before publishing
- 🎯 **Structured Fields** - Date, time, location with rich formatting
- 🖼️ **Image Support** - URL-based image management

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (local or MongoDB Atlas)

### Installation

1. **Clone and Install**
   ```bash
   cd abhm-up-website
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Copy the example environment file
   cp .env.example .env.local
   
   # Edit .env.local with your settings:
   # - MONGODB_URI: Your MongoDB connection string
   # - JWT_SECRET: Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   # - NEXT_PUBLIC_SITE_URL: Your site URL
   ```

3. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Visit http://localhost:3000

### First-Time Setup

1. **Create Admin User** (via MongoDB)
   ```javascript
   // Connect to your MongoDB and insert:
   {
     email: "admin@example.com",
     password: "<use bcrypt to hash your password>",
     role: "superadmin",
     name: "Admin User"
   }
   ```

2. **Login to Admin Panel**
   - Visit http://localhost:3000/admin/login
   - Use the credentials you created

3. **Add Initial Content**
   - Leaders: Add organizational leaders at /admin/leaders
   - Focus Areas: Add core principles at /admin/focus-areas
   - Events: Add upcoming events at /admin/events

## 📋 Environment Variables

Create `.env.local` with these variables:

```env
# MongoDB Connection (required)
MONGODB_URI=mongodb://localhost:27017/abhm-up-website
# For MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/dbname

# JWT Authentication Secret (required)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Site URL (required for metadata)
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## 🎯 Testing the Language Toggle

1. Visit the homepage (http://localhost:3000)
2. Look for the language toggle button in the header (top right)
3. Click it - should show "हिन्दी" when in English mode
4. Page content switches to Hindi (where Hindi translations exist)
5. Click again to switch back to English
6. Toggle persists across page navigation

## Requirements
- Node.js 18+ recommended
- MongoDB (Atlas or self-hosted)

## Getting started
1. Create environment file:
	- Copy `.env.example` → `.env.local`
2. Install dependencies:
	- `npm install`
3. Run dev server:
	- `npm run dev`

## Deployment (Vercel)
- Add the same variables from `.env.local` in Vercel Project Settings → Environment Variables.
- Deploy normally; the project is Vercel compatible.

## Folder structure
- `app/` App Router pages (public + admin)
- `components/` Shared UI components
- `lib/` Core utilities (db, auth, validation, security)
- `models/` Mongoose models
- `api/` Shared API helpers/types (reserved)
- `styles/` Shared styling utilities
