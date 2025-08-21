# Blogger

A full-stack blogging platform that allows users to create, manage, and interact with blog posts. The project features a modern React + TypeScript frontend and a robust Node.js/Express backend with MongoDB for data storage. It supports user authentication, blog CRUD operations, likes, comments, and a personalized dashboard.

---

## Table of Contents

- [Project Introduction](#project-introduction)
- [Tech Stack](#tech-stack)
- [High-Level Design](#high-level-design)
- [Low-Level Design](#low-level-design)
- [How to Run the Project Locally](#how-to-run-the-project-locally)
- [Additional Information](#additional-information)

---


## Project Introduction

**Blogger** is a feature-rich blogging platform designed for individuals and organizations who want to share their thoughts, stories, and expertise with the world. Users can sign up, create and manage blogs, like and comment on posts, search blogs by title or author name, and view personalized statistics on their dashboard.

**Target Audience:**
- Bloggers and content creators
- Readers interested in various topics
- Developers looking for a modern full-stack example

---

## Features

- User authentication (sign up, sign in, JWT-based sessions)
- Create, edit, delete, and view blogs
- Like and comment on blogs
- Personalized dashboard with stats
- **Advanced blog search by title and author name**

### Blog Search Functionality (How It Works)

The Blogger platform implements a robust search feature that allows users to find blogs by their title, content, category, tags, excerpt, and—most notably—by the author's name. This is achieved through a combination of MongoDB text indexes and an aggregation pipeline in the backend.

**How the search works:**

1. **Flexible Search Input:**
  - Users can enter one or more keywords in the search bar.
  - The backend splits the search string into individual terms for more flexible matching.

2. **Aggregation Pipeline:**
  - The backend uses MongoDB's aggregation framework to perform the search.
  - It first joins (`$lookup`) the `users` collection to each blog's `author` field, so that the author's full name is available for searching.
  - It then applies `$match` conditions to filter blogs by status, category, etc.
  - For each search term, it creates a case-insensitive regex pattern and matches it against:
    - Blog `title`
    - Blog `content`
    - Blog `category`
    - Blog `tags`
    - Blog `excerpt`
    - **Author's `fullName`**
  - All search terms must be present in at least one of these fields (AND logic).

3. **Indexes for Performance:**
  - The `blog.js` model defines text indexes on `title` and `content` for fast text search.
  - Additional indexes on `author`, `category`, and `status` improve query performance.

4. **Pagination and Sorting:**
  - The search results are paginated and can be sorted by creation date or other fields.

**Example:**

If a user searches for `react John`, the backend will return all blogs where either the title, content, category, tags, or excerpt contains "react" or "John", or where the author's name contains "react" or "John" (case-insensitive, partial matches allowed).

**Relevant Code:**
- See `backend/controllers/blogControllers.js` (`getAllBlogs` function)
- See `backend/models/blog.js` (schema indexes)

---

---

## Tech Stack

### Frontend

- **React** (^19.1.0)
- **TypeScript** (~5.8.3)
- **Vite** (^7.0.4)
- **Tailwind CSS** (^4.1.11)
- **React Router DOM** (^7.7.1)
- **Radix UI, Lucide, Tabler Icons, GSAP, OGL** (for UI/UX enhancements)

### Backend

- **Node.js** (v18+ recommended)
- **Express** (^5.1.0)
- **Mongoose** (^8.17.0)
- **MongoDB** (^6.18.0)
- **jsonwebtoken** (^9.0.2)
- **dotenv** (^17.2.1)
- **Nodemon** (for development)

---

## High-Level Design

- **Frontend** (in `/frontend`):  
  Built with React and TypeScript, styled using Tailwind CSS, and bundled with Vite. Handles all user interactions, authentication, and communicates with the backend via RESTful APIs.

- **Backend** (in `/backend`):  
  Node.js/Express server providing REST APIs for user authentication, blog management, likes, comments, and dashboard statistics. Uses MongoDB for persistent storage and Mongoose for schema modeling.

- **Database**:  
  MongoDB, with collections for users and blogs. Relationships are managed via Mongoose schemas and references.

- **Authentication**:  
  JWT-based authentication for secure API access. Middleware ensures protected routes are only accessible to authenticated users.

- **API Communication**:  
  The frontend communicates with the backend using fetch/AJAX, sending and receiving JSON data.

---

## Low-Level Design

### Backend

- **Models**
  - `user.js`: Defines the User schema, including password hashing with salt, roles (USER/ADMIN), and profile image.
  - `blog.js`: Defines the Blog schema, supporting categories, tags, likes, comments (with sub-schema), status (draft/published/archived), and virtuals for counts.

- **Controllers**
  - `userControllers.js`: Handles user signup, signin, and profile retrieval.
  - `blogControllers.js`: Handles blog CRUD, likes, comments, user-specific blog queries, and dashboard stats.

- **Routes**
  - `userRoutes.js`: User authentication and profile endpoints.
  - `blogRoutes.js`: Blog CRUD, like, comment, and dashboard endpoints.

- **Middleware**
  - `auth.js`: JWT authentication, admin check, and optional authentication.

- **Database Connection**
  - `db.js`: Connects to MongoDB using environment variables.

### Frontend

- **Components**
  - `Navbar`, `SignIn`, `SignUp`, `Dashboard`, `BlogView`, `CreateBlog`, `MyBlogs`, etc.
  - UI components for navigation, forms, blog display, and user dashboard.

- **Services**
  - `api.ts`, `blogApi.ts`: Abstract API calls for authentication and blog operations.

- **Design Patterns**
  - MVC (Model-View-Controller) on the backend.
  - Component-based architecture on the frontend.
  - Use of React hooks for state and effect management.

---

## How to Run the Project Locally

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (v9+)
- **MongoDB** (local or cloud instance)
- **Git** (optional, for cloning)

### Backend Setup

1. **Navigate to the backend directory:**
   ```sh
   cd backend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in `backend/` with:
     ```
     MONGO_URI=your_mongodb_connection_string
     JWT_SECRET=your_jwt_secret
     CORS_ORIGIN=http://localhost:5173
     PORT=8000
     ```

4. **Start the backend server:**
   ```sh
   npm run dev
   ```
   - The server will run on `http://localhost:8000`.

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```sh
   cd frontend
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Configure environment variables:**
   - Create a `.env` file in `frontend/` with:
     ```
     VITE_API_BASE_URL=http://localhost:8000/api
     ```

4. **Start the frontend development server:**
   ```sh
   npm run dev
   ```
   - The app will run on `http://localhost:5173`.

### Testing the Project

- **Sign up** for a new account.
- **Sign in** and create, edit, or delete blogs.
- **Like** and **comment** on blogs.
- **View your dashboard** for stats.
- **Test protected routes** by logging out and trying to access dashboard or blog creation.

---

## Additional Information

- **Troubleshooting**
  - Ensure MongoDB is running and accessible.
  - If CORS errors occur, check the `CORS_ORIGIN` in backend `.env`.
  - For Windows, use PowerShell or Command Prompt for commands.
  - If ports are in use, change `PORT` in `.env` files.

- **Common Errors**
  - `MongoDB connection error`: Check your `MONGO_URI`.
  - `JWT token errors`: Ensure `JWT_SECRET` matches in backend and tokens are valid.
  - `Frontend API errors`: Check `VITE_API_BASE_URL` and backend server status.

- **Customization**
  - Update categories, UI themes, or add new features as needed.
  - Extend user roles and permissions for more granular access control.

- **Deployment**
  - The project is ready for deployment on platforms like Vercel (frontend) and AWS/Heroku (backend).
  - Update environment variables for production.

---

## License


---

*For questions or contributions, please open an issue or pull request.*

---
