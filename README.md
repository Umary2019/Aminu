# Past Question Paper Finder System

A full-stack production-ready web application for students to search, preview, and download past examination papers.

## Tech Stack

- Frontend: React (Vite), Tailwind CSS, Axios, React Router
- Backend: Node.js, Express.js
- Database: MongoDB with Mongoose
- Authentication: JWT + bcryptjs
- File Storage: Cloudinary (PDF uploads)

## Project Structure

- backend/: Express API and MongoDB models
- frontend/: React client app

## Backend Setup

1. Navigate to backend folder
2. Copy .env.example to .env and update values
3. Install dependencies: npm install
4. Run development server: npm run dev

## Frontend Setup

1. Navigate to frontend folder
2. Copy .env.example to .env and update API URL if needed
3. Install dependencies: npm install
4. Run development server: npm run dev

## API Summary

### Auth
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/profile

### Papers
- GET /api/papers
- GET /api/papers/:id
- POST /api/papers/upload (admin only)

### Comments
- POST /api/comments
- GET /api/comments/paper/:paperId

### Ratings
- POST /api/ratings
- GET /api/ratings/paper/:paperId

### Admin
- GET /api/admin/analytics
- GET /api/admin/users
- GET /api/admin/papers
- PATCH /api/admin/papers/:id/review
- DELETE /api/admin/papers/:id
