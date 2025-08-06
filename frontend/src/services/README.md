# API Service Documentation

This file contains all the API logic for your blogging application. Currently, it's set up with mock data for frontend development, but it's designed to easily switch to real API calls when your backend is ready.

## Features

### Authentication
- **Login**: `authAPI.login({ email, password })`
- **Register**: `authAPI.register({ name, email, password })`
- **Logout**: `authAPI.logout()`
- **Get Current User**: `authAPI.getCurrentUser()`

### Blog Management
- **Get All Blogs**: `blogAPI.getAllBlogs()`
- **Get Blog by ID**: `blogAPI.getBlogById(id)`
- **Create Blog**: `blogAPI.createBlog({ title, content, category, image? })`
- **Update Blog**: `blogAPI.updateBlog(id, data)`
- **Delete Blog**: `blogAPI.deleteBlog(id)`
- **Toggle Like**: `blogAPI.toggleLike(id)`
- **Add Comment**: `blogAPI.addComment(blogId, comment)`

## Development Mode

Currently, the API uses mock data for testing:
- Login works with: `test@example.com` / `password123`
- Registration works with any valid data
- All blog operations return mock data

## Production Setup

When your backend is ready:

1. Update `API_BASE_URL` to your backend URL
2. Uncomment the real API calls in each function
3. Remove the mock implementations
4. Ensure your backend returns data in the expected format

## Data Types

All TypeScript interfaces are defined at the top of the file:
- `User`: User information
- `AuthResponse`: Authentication response
- `BlogPost`: Blog post data
- `Comment`: Comment data
- `LoginRequest`/`RegisterRequest`: Request payloads

## Token Management

The service automatically handles JWT tokens:
- Stores tokens in localStorage
- Adds Authorization header to requests
- Removes tokens on logout

## Error Handling

All API functions throw errors that can be caught and displayed to users. The error messages are user-friendly and come from your backend's error responses.
