# DocVault | Personal Document Organizer & Expiry Tracker (MERN Stack)

A full-stack **MERN** web application designed to manage, categorize, search, preview, and track expiration dates for personal documents (Passports, Driving Licenses, Insurance Policies, Academic Certificates, Vehicle Registrations, Warranties, and Contracts).

---

## 1. Problem Statement
Individuals routinely manage diverse physical and digital records. Forgetting critical document expiration dates often leads to severe disruptions, penalties, or invalid credentials (e.g. driving with an expired license, expired health insurance during medical emergencies, expired travel passports). **DocVault** solves this by providing a centralized vault that monitors document lifecycles, computes dynamic status badges, issues real-time expiration warnings, and streamlines document renewals.

---

## 2. Objectives & Implementation

| Objective | Implementation Details |
|---|---|
| **Demonstrate MERN Stack Development** | End-to-end integration of MongoDB (ODM via Mongoose), Express.js (REST routes & middleware), React.js (Vite + Tailwind UI), and Node.js. |
| **Implement CRUD Operations** | Full Create, Read, Update, and Delete operations for documents and categories with MongoDB persistence. |
| **Build REST APIs** | Modular Node.js/Express controllers, Multer multipart file upload handling, and JWT-authenticated endpoints. |
| **Develop Frontend using React.js** | Dynamic UI with reactive state management, status pills, file previewers (PDF/images), filters, and modal workflows. |
| **Authentication & Role-Based Access (RBAC)** | JSON Web Token (JWT) auth, bcrypt password hashing, and granular access separation (`user` vs `admin`). |
| **Display Project Info & Results Clearly** | Interactive "Project Overview" page with architecture diagrams, REST API documentation, and live status metrics. |

---

## 3. Key Features

- **Document Management (Full CRUD)**:
  - Title, Document Number, Category, Issue Date, Expiry Date, Issuing Authority, Tags, and Notes.
  - "Lifetime / No Expiry" toggle for permanent credentials (e.g., Degree certificates, birth records).
- **Dynamic Expiry Status Engine**:
  - Automatically calculates days remaining and assigns statuses:
    - `Active / Valid` (Healthy, > 30 days)
    - `Expiring Soon` (Urgent, within customizable reminder window: 7, 15, 30, 60, or 90 days)
    - `Expired` (Critical, negative days remaining)
    - `Lifetime` (Permanent)
- **High-Priority Expiry Alert Banner**:
  - Dashboard banner highlighting documents needing urgent attention with 1-click renewal.
- **File Upload & Inline Preview**:
  - Secure file attachment handling via Multer (PDF, PNG, JPG, DOCX).
  - Inline preview for PDFs and images + direct download stream.
- **Expiry Tracker & Timeline**:
  - Visual breakdown into urgency brackets (Expired, <7 Days, <30 Days, <90 Days, Safe >90 Days, Lifetime).
  - Quick Renewal modal (+6 months, +1 year, +2 years, +5 years presets).
- **Category Customization**:
  - 10 starter presets + user custom category creation with color picker.
- **Role-Based Access Control (RBAC)**:
  - `user`: Manages their own documents, receives personalized alerts.
  - `admin`: System-wide User Management, role promotion/demotion, system storage monitoring, and complete Activity/Audit Log.

---

## 4. Default Demo Accounts

| Role | Email | Password | Privileges |
|---|---|---|---|
| **User** | `user@example.com` | `user123` | Personal document management & renewals |
| **Admin** | `admin@example.com` | `admin123` | Full access + User management + Audit logs |

*(One-click demo login buttons are provided on the login page for instantaneous access)*

---

## 5. Quick Start Instructions

### Prerequisites
- Node.js (v18+)
- MongoDB (Running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### Quick One-Click Launch (Windows)
Double-click `run-project.bat` or run:
```bash
./run-project.bat
```

### Manual Setup

#### 1. Backend Setup:
```bash
cd backend
npm install
npm run seed       # Seeds demo users, categories, realistic documents and sample files
npm start          # Runs backend on port 5050
```

#### 2. Frontend Setup:
```bash
cd frontend
npm install
npm run dev        # Runs React frontend on http://localhost:3000
```

Open `http://localhost:3000` in your web browser.

---

## 6. REST API Endpoints Summary

- `POST /api/auth/register` - Create user
- `POST /api/auth/login` - Authenticate & get JWT token
- `GET  /api/auth/me` - Get logged-in user profile
- `GET  /api/documents` - List documents with search, category, status & sort
- `POST /api/documents` - Upload & create document (Multipart/Form-Data)
- `GET  /api/documents/:id` - Get document details
- `PUT  /api/documents/:id` - Update document & optionally replace file
- `DELETE /api/documents/:id` - Delete document & attachment
- `PATCH /api/documents/:id/renew` - Quick renew expiry date
- `GET  /api/documents/preview/:filename` - Stream file inline
- `GET  /api/documents/download/:filename` - Download attachment
- `GET  /api/stats/dashboard` - Expiry metrics, storage, and 6-month forecast
- `GET  /api/categories` - Fetch categories
- `POST /api/categories` - Create custom category
- `GET  /api/admin/users` - User directory (Admin)
- `PUT  /api/admin/users/:id/role` - Toggle user/admin role (Admin)
- `GET  /api/admin/logs` - Security audit trail (Admin)
