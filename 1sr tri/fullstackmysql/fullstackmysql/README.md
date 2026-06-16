## 🛠️ Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **MySQL Server** - [Download here](https://dev.mysql.com/downloads/mysql/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)

## 💾 Database Setup

### Option 1: Using MySQL Command Line

1. Start your MySQL server
2. Open MySQL command line or MySQL Workbench
3. Create a new database:
   ```sql
   CREATE DATABASE fullstack_db;
   USE fullstack_db;
   ```
4. Run the database script:
   ```bash
   mysql -u root -p fullstack_db < backend/database.sql
   ```

### Option 2: Manual Setup

1. Create the database:
   ```sql
   CREATE DATABASE fullstack_db;
   USE fullstack_db;
   ```

2. Create the users table:
   ```sql
   CREATE TABLE users (
     id INT AUTO_INCREMENT PRIMARY KEY,
     name VARCHAR(100) NOT NULL,
     email VARCHAR(100) NOT NULL UNIQUE,
     phone VARCHAR(20),
     address TEXT,
     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
     updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
   );
   ```

3. Insert sample data (optional):
   ```sql
   INSERT INTO users (name, email, phone, address) VALUES
   ('John Doe', 'john@example.com', '123-456-7890', '123 Main St, City, State'),
   ('Jane Smith', 'jane@example.com', '098-765-4321', '456 Oak Ave, City, State'),
   ('Mike Johnson', 'mike@example.com', '555-123-4567', '789 Pine Rd, City, State');
   ```

## 🔧 Backend Setup

1. **Navigate to the backend directory:**
   
   cd backend
   ```

2. **Install dependencies:**
   npm install
   ```

3. **Configure environment variables:**
   
   Create/update the `.env` file in the backend directory:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_mysql_password
   DB_NAME=fullstack_db

   PORT=5000
   ```
   
   **Important:** Replace `your_mysql_password` with your actual MySQL password. If you don't have a password set for root, leave it empty: `DB_PASSWORD=`

4. **Start the backend server:**
   ```bash
   npm start
   ```
   
   For development with auto-restart:
   ```bash
   npm run dev
   ```

   The backend server will run on **http://localhost:5000**

## 🎨 Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

   The frontend will run on **http://localhost:3000**

## 🚀 Quick Start

1. **Clone the repository** (if you haven't already):
   ```bash
   git clone <your-repo-url>
   cd fullstackmysql
   ```

2. **Set up the database** (follow Database Setup section above)

3. **Start the backend**:
   ```bash
   cd backend
   npm install
   npm start
   ```

4. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Open your browser** and navigate to `http://localhost:3000`

## 📁 Project Structure

```
fullstackmysql/
├── backend/                    # Node.js/Express backend
│   ├── routes/
│   │   └── users.js           # User CRUD API routes
│   ├── .env                   # Environment variables (create this)
│   ├── server.js              # Express server setup
│   ├── database.sql           # Database schema and sample data
│   └── package.json           # Backend dependencies
├── frontend/                   # React frontend
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js       # API configuration and calls
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx  # User list/dashboard page
│   │   │   ├── CreateUser.jsx # Create user form page
│   │   │   └── EditUser.jsx   # Edit user form page
│   │   ├── App.jsx            # Main app component with routing
│   │   ├── main.jsx           # React app entry point
│   │   └── index.css          # Tailwind CSS imports
│   ├── index.html             # HTML template
│   ├── package.json           # Frontend dependencies
│   ├── vite.config.js         # Vite configuration
│   ├── tailwind.config.js     # Tailwind CSS configuration
│   └── postcss.config.js      # PostCSS configuration
└── README.md                   # Project documentation
```

## 🌐 API Endpoints

| Method | Endpoint         | Description           | Body Parameters                    |
|--------|------------------|-----------------------|------------------------------------|
| GET    | `/api/users`     | Get all users         | None                               |
| GET    | `/api/users/:id` | Get user by ID        | None                               |
| POST   | `/api/users`     | Create new user       | `name`, `email`, `phone`, `address`|
| PUT    | `/api/users/:id` | Update existing user  | `name`, `email`, `phone`, `address`|
| DELETE | `/api/users/:id` | Delete user           | None                               |

### Example API Requests

**Create User:**
```json
POST /api/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "address": "123 Main St, City, State"
}
```

**Update User:**
```json
PUT /api/users/1
{
  "name": "John Smith",
  "email": "johnsmith@example.com",
  "phone": "098-765-4321",
  "address": "456 Oak Ave, City, State"
}
```

## 📊 Database Schema

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20),
  address TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 🎯 Usage Guide

1. **Start both servers** (backend and frontend)
2. **Open your browser** and navigate to `http://localhost:3000`
3. **View all users** on the dashboard
4. **Add a new user** by clicking "Add New User" button
5. **Edit existing users** by clicking the "Edit" button in the table
6. **Delete users** by clicking the "Delete" button (with confirmation)

### Features Overview:

- **Dashboard**: Displays all users in a responsive table format
- **Create User**: Form to add new users with validation
- **Edit User**: Pre-populated form to update user information
- **Delete User**: Confirmation dialog before deletion
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🛠️ Technologies Used

### Frontend Stack
- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - Fast build tool and dev server

### Backend Stack
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MySQL2** - MySQL client for Node.js
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variable management

### Development Tools
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 🐛 Troubleshooting

### Common Issues and Solutions

#### 1. Backend Connection Issues

**Error: `Access denied for user 'root'@'localhost'`**
- Check your MySQL password in the `.env` file
- Ensure MySQL server is running
- Try connecting with empty password: `DB_PASSWORD=`

**Error: `Error connecting to MySQL: ECONNREFUSED`**
- Make sure MySQL server is started
- Check if MySQL is running on the correct port (default: 3306)
- Verify host and port settings in `.env`

#### 2. Frontend Issues

**Error: `module is not defined in ES module scope`**
- Make sure `postcss.config.js` uses ES6 export syntax:
  ```javascript
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  }
  ```

**Error: `Cannot read package.json`**
- Make sure you're in the correct directory (`frontend/`)
- Check if `package.json` exists in the frontend directory

#### 3. Database Issues

**Error: `Table 'fullstack_db.users' doesn't exist`**
- Run the database setup script: `mysql -u root -p fullstack_db < backend/database.sql`
- Or manually create the table using the schema provided above

**Error: `Unknown database 'fullstack_db'`**
- Create the database: `CREATE DATABASE fullstack_db;`

#### 4. Port Issues

**Error: `Port 3000 is already in use`**
- Change the port in `vite.config.js` or kill the process using port 3000
- For Windows: `netstat -ano | findstr :3000` then `taskkill /PID <PID> /F`

**Error: `Port 5000 is already in use`**
- Change the port in `.env` file: `PORT=5001`
- Update the API base URL in `frontend/src/api/axios.js`

## 🔒 Environment Variables

Create a `.env` file in the `backend` directory with the following variables:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=fullstack_db

# Server Configuration
PORT=5000

# JWT Secret (for future authentication features)
JWT_SECRET=your_super_secret_jwt_key_here
```

## 🚀 Deployment

### Backend Deployment
1. Set up a cloud database (AWS RDS, Google Cloud SQL, etc.)
2. Update environment variables for production
3. Deploy to Heroku, Vercel, or your preferred platform

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to Netlify, Vercel, or your preferred platform
3. Update API base URL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section above
2. Search existing issues in the repository
3. Create a new issue with detailed information about your problem

---

**Happy Coding! 🎉**
