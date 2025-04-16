# Student Management System

## Overview
This is a web-based Student Management System built using React for the frontend and Node.js with Express for the backend. The system allows students to view and edit their profiles, track attendance, manage assignments, and access announcements, while teachers can manage classes and student data. The project is designed to be scalable and secure, with role-based access control.

## Features
- **Student Features:**
  - View and edit personal profile (e.g., mobile number, email, parent contact).
  - Access class details, attendance records, marks, and assignments.
  - Submit assignments with file uploads.
  - View school announcements.
- **Teacher Features:**
  - Manage classes and assign subjects.
  - Record attendance and marks for students.
  - Create and manage assignments and announcements.
- **Admin Features:** 
  - User management and school configuration.

## Technologies Used
- **Frontend:** React, Axios, React Router
- **Backend:** Node.js, Express, MySQL (via a database module)
- **Version Control:** Git
- **Hosting Platform:** GitHub

## Installation

### Prerequisites
- Node.js and npm installed
- MySQL database server
- Git installed

### Setup Instructions
1. **Clone the Repository:**
   ```bash
   git clone https://github.com/yourusername/your-repo.git
   cd your-repo
   ```

2. **Install Dependencies:**
   - For the frontend:
     ```bash
     cd client
     npm install
     ```
   - For the backend:
     ```bash
     cd server
     npm install
     ```

3. **Configure the Database:**
   - Create a MySQL database and import the schema from `schema.sql` (provided earlier).
   - Update the database connection in `db.js` with your credentials.

4. **Environment Variables:**
   - Create a `.env` file in the `server` directory with:
     ```
     DB_HOST=localhost
     DB_USER=your_username
     DB_PASSWORD=your_password
     DB_NAME=student_management
     JWT_SECRET=your_secret_key
     ```

5. **Run the Application:**
   - Start the backend:
     ```bash
     cd server
     npm start
     ```
   - Start the frontend:
     ```bash
     cd client
     npm start
     ```
   - Access the app at `http://localhost:3000`.
