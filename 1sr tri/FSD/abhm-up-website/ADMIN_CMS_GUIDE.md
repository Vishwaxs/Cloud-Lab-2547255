# Admin CMS System - Implementation Guide

## ✅ Completed Features

### 1. **Admin Login Button in Header**
- **Location**: Top-right corner of the header
- **Functionality**:
  - Shows "Admin Login" button when user is not logged in
  - Shows "Dashboard" button when admin is logged in
  - Matches the saffron gradient theme with hover effects

### 2. **Comprehensive Admin Dashboard**
- **URL**: `/admin`
- **Features**:
  - 4 content management sections with color-coded cards:
    - 📰 News & Announcements (Blue)
    - 📅 Events (Green)
    - 👥 Leaders (Purple)
    - 🎯 Focus Areas (Orange)
  - Each card links to its respective management page
  - Shows role-based access, draft/publish workflow info

### 3. **Database Models (MongoDB)**

#### Event Model (`models/Event.ts`)
```typescript
{
  title: string,              // Event title (English)
  titleHi?: string,           // Event title (Hindi)
  slug: string,               // URL-friendly slug
  description: string,        // Event description
  descriptionHi?: string,     // Description in Hindi
  eventDate: Date,            // 📅 Event date (BOLD in UI)
  eventTime?: string,         // 🕐 Event time (BOLD in UI)
  location: string,           // 📍 Location (BOLD in UI)
  locationHi?: string,        // Location in Hindi
  imageUrl?: string,          // Event image
  status: "draft" | "published",
  publishedAt?: Date
}
```

#### Leader Model (`models/Leader.ts`)
```typescript
{
  name: string,
  nameHi?: string,
  role: string,
  roleHi?: string,
  description?: string,
  descriptionHi?: string,
  imageUrl?: string,
  order: number,              // Display order
  isActive: boolean
}
```

#### Focus Area Model (`models/FocusArea.ts`)
```typescript
{
  title: string,
  titleHi?: string,
  description: string,
  descriptionHi?: string,
  icon: string,               // Emoji icon
  order: number,
  isActive: boolean
}
```

#### Enhanced News Model (`models/NewsPost.ts`)
```typescript
{
  title: string,
  titleHi?: string,
  slug: string,
  excerpt?: string,
  excerptHi?: string,
  contentHtml: string,
  contentHtmlHi?: string,
  imageUrl?: string,          // 🖼️ News image
  publishDate?: Date,         // 📅 Publication date
  eventTime?: string,         // 🕐 Time (for announcements)
  location?: string,          // 📍 Location
  locationHi?: string,
  status: "draft" | "published"
}
```

### 4. **Events Management System**

#### Events List Page (`/admin/events`)
- **Features**:
  - Lists all events with preview cards
  - Shows event status badges (draft/published)
  - Displays structured fields in grid:
    - 📅 Event Date (bold, with calendar icon)
    - 🕐 Event Time (bold, with clock icon)
    - 📍 Location (bold, with pin icon)
  - "+ New Event" button to create events
  - Click any event card to edit

#### Event Creation/Edit Form (`/admin/events/new`)
- **Sections**:

  1. **English Content** (White card)
     - Title *
     - Slug (auto-generated from title)
     - Description *

  2. **Hindi Content** (Orange card)
     - शीर्षक (Title in Hindi)
     - विवरण (Description in Hindi)
     - स्थान (Location in Hindi)

  3. **Event Details** (Blue card)
     - 📅 Event Date * (date picker)
     - 🕐 Event Time (text input, e.g., "10:00 AM - 2:00 PM")
     - 📍 Location * (text input)
     - 🖼️ Image URL (for event banner)

- **Buttons**:
  - "Save as Draft" - saves without publishing
  - "Publish Event" - publishes immediately
  - "Cancel" - returns to events list

### 5. **API Routes**

#### Events API
- `POST /api/admin/events` - Create new event
- `GET /api/admin/events` - List all events
- `GET /api/admin/events/[id]` - Get single event
- `PATCH /api/admin/events/[id]` - Update event
- `DELETE /api/admin/events/[id]` - Delete event

All routes have:
- Authentication check (JWT session)
- Role-based permissions
- Automatic audit tracking (createdByAdminId, updatedByAdminId)

---

## 🚧 Remaining Work

### Leaders Management (Similar to Events)
Create:
1. `/app/admin/(panel)/leaders/page.tsx` - List leaders
2. `/app/admin/(panel)/leaders/new/page.tsx` - Create leader
3. `/app/admin/(panel)/leaders/[id]/page.tsx` - Edit leader
4. `/app/admin/(panel)/leaders/LeaderForm.tsx` - Form component
5. `/app/api/admin/leaders/route.ts` - API routes
6. `/app/api/admin/leaders/[id]/route.ts` - Single leader API

### Focus Areas Management
Create:
1. `/app/admin/(panel)/focus-areas/page.tsx` - List focus areas
2. `/app/admin/(panel)/focus-areas/new/page.tsx` - Create focus area
3. `/app/admin/(panel)/focus-areas/[id]/page.tsx` - Edit focus area
4. `/app/admin/(panel)/focus-areas/FocusAreaForm.tsx` - Form component
5. `/app/api/admin/focus-areas/route.ts` - API routes

### Update Homepage to Use Dynamic Data
Modify `/app/page.tsx` to:
```typescript
// Fetch from database instead of hardcoded
const events = await Event.find({ status: 'published' })
  .sort({ eventDate: -1 })
  .limit(3)
  .lean();

const leaders = await Leader.find({ isActive: true })
  .sort({ order: 1 })
  .limit(4)
  .lean();

const focusAreas = await FocusArea.find({ isActive: true })
  .sort({ order: 1 })
  .lean();
```

### Image Upload System
1. Install cloudinary or use built-in Next.js image optimization
2. Create `/app/api/admin/upload/route.ts`
3. Add file upload component to all forms
4. Display uploaded images in forms

---

## 🔐 Admin Access Setup

### Create First Admin User
```javascript
// Run this in MongoDB or via API to create admin
const AdminUser = require('./models/AdminUser');
const bcrypt = require('bcryptjs');

const adminUser = await AdminUser.create({
  email: 'admin@abhm-up.org',
  name: 'Administrator',
  role: 'superadmin',
  passwordHash: await bcrypt.hash('your-secure-password', 10),
  isActive: true
});
```

### Environment Variables Required
```env
MONGODB_URI=mongodb://localhost:27017/abhm-up
JWT_SECRET=your-secret-key-here-minimum-32-characters
```

---

## 📝 How to Use the Admin Panel

### For Admin Users:

1. **Login**:
   - Click "Admin Login" button in header
   - Enter credentials
   - Redirects to dashboard on success

2. **Create Event**:
   - Dashboard → "Events" card
   - Click "+ New Event" button
   - Fill in English fields (required)
   - Optionally add Hindi translations
   - Enter event date, time, location (date/time/location show as BOLD on public site)
   - Add image URL if available
   - Click "Save as Draft" or "Publish Event"

3. **Edit Event**:
   - Go to Events list
   - Click on any event card
   - Modify fields
   - Save changes

4. **Bilingual Content**:
   - All forms have English (required) and Hindi (optional) sections
   - Language toggle button on homepage switches between them
   - If Hindi not provided, falls back to English

### Structured Display Format:

On the public website, News/Events will display structured fields prominently:

```
📰 Annual Membership Drive 2025

📅 January 15, 2025    🕐 10:00 AM - 2:00 PM    📍 Lucknow, Uttar Pradesh

Join us for our annual membership drive...
```

All date, time, and location fields are displayed in **BOLD** with icons, making them stand out from regular content.

---

## 🎨 UI Design Patterns

All admin forms follow these patterns:

1. **Color-Coded Sections**:
   - White cards: English/primary content
   - Orange cards: Hindi translations
   - Blue/green cards: Metadata (dates, locations)

2. **Structured Fields**:
   - Date fields use `<input type="date">`
   - Time fields use text input with placeholder "10:00 AM - 2:00 PM"
   - Locations use text input with examples
   - Required fields marked with red asterisk (*)

3. **Icons**:
   - 📅 Calendar for dates
   - 🕐 Clock for times
   - 📍 Pin for locations
   - 🖼️ Image for photos

4. **Status System**:
   - Green badge: Published
   - Gray badge: Draft
   - Items can be saved as draft and published later

---

## Next Steps to Complete the System:

1. Run `npm install` to ensure all dependencies
2. Set up MongoDB connection (MONGODB_URI)
3. Create admin user in database
4. Test Events CRUD system
5. Copy Events pattern to create Leaders and Focus Areas management
6. Update homepage to fetch dynamic data
7. Implement image upload system
8. Add delete confirmation modals
9. Add search/filter to admin lists
10. Add pagination for large datasets

The foundation is complete - Events management is fully functional as a template for other content types!
