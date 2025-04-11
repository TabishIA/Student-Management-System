-- Drop existing tables if they exist
DROP TABLE IF EXISTS assignment_submissions, attendance, marks, assignments, announcements, student_batches, class_subjects_teachers, batches, subjects, student_classes, classes, users;

-- Users table (for students, teachers, admins) with profile fields
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  staff_id VARCHAR(50),               -- For staff (teachers/admins)
  registration_number VARCHAR(50),    -- For students
  name VARCHAR(100) NOT NULL,
  role ENUM('student', 'teacher', 'admin') NOT NULL,
  password VARCHAR(255) NOT NULL,
  year VARCHAR(10),                   -- For students
  division VARCHAR(10),               -- For students
  roll_number INT,                    -- For students
  school_id INT NOT NULL DEFAULT 1,
  email VARCHAR(100),                 -- Student profile: Email
  mobile_number VARCHAR(20),          -- Student profile: Mobile number
  parent_contact VARCHAR(20),         -- Student profile: Parent contact
  UNIQUE(staff_id, school_id),
  UNIQUE(registration_number, school_id)
);

-- Classes table
CREATE TABLE classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  year VARCHAR(10) NOT NULL,
  division VARCHAR(10) NOT NULL,
  school_id INT NOT NULL,
  UNIQUE(year, division, school_id)
);

-- Student-Class mapping
CREATE TABLE student_classes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  class_id INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(student_id, class_id, school_id)
);

-- Subjects table
CREATE TABLE subjects (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  class_id INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(name, class_id, school_id)
);

-- Batches table
CREATE TABLE batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  batch_name VARCHAR(50) NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  UNIQUE(class_id, batch_name, school_id)
);

-- Student-Batch mapping
CREATE TABLE student_batches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  batch_id INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE CASCADE,
  UNIQUE(student_id, batch_id, school_id)
);

-- Class-Subjects-Teachers mapping
CREATE TABLE class_subjects_teachers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  class_id INT NOT NULL,
  subject_id INT NOT NULL,
  teacher_id INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(class_id, subject_id, teacher_id, school_id)
);

-- Assignments table
CREATE TABLE assignments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  due_date DATE NOT NULL,
  created_by INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Assignment Submissions table
CREATE TABLE assignment_submissions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  assignment_id INT NOT NULL,
  student_id INT NOT NULL,
  file_path VARCHAR(255),
  submitted_at DATETIME NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(assignment_id, student_id, school_id)
);

-- Attendance table
CREATE TABLE attendance (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  batch_id INT,
  date DATE NOT NULL,
  is_present BOOLEAN NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,
  UNIQUE(student_id, subject_id, date, school_id)
);

-- Marks table
CREATE TABLE marks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  student_id INT NOT NULL,
  subject_id INT NOT NULL,
  marks INT NOT NULL,
  school_id INT NOT NULL,
  FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE,
  UNIQUE(student_id, subject_id, school_id)
);

-- Announcements table
CREATE TABLE announcements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  created_by INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  school_id INT NOT NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert initial admin user for testing
-- Password: 'admin123' hashed with bcrypt (10 rounds)
INSERT INTO users (staff_id, name, role, password, school_id) 
VALUES ('A001', 'Admin User', 'admin', '$2a$12$ZmjXF4qyHbl/R0x2U42QUOM.jjv1UxAarvgjprP4gJ7OYqngA9nTq', 1);