// API base URL - change this when you connect to your actual backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

// Types for API responses
export interface User {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  role?: string;
  createdAt?: string;
}

export interface AuthResponse {
  success: boolean;
  user: User;
  token: string;
  message: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
}

export interface BlogPost {
  id: string;
  title: string;
  content: string;
  author: User;
  category: string;
  image: string;
  likes: number;
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  user: User;
  comment: string;
  createdAt: string;
}

export interface CreateBlogRequest {
  title: string;
  content: string;
  category: string;
  image?: string;
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to create headers with auth token
// Removed unused getAuthHeaders function.

// Generic API request function (for future use when backend is ready)
// Removed because it was declared but never used.

//Authentication API
export const authAPI = {
  // Login user
  login: async (credentials: LoginRequest): Promise<User & { token: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/signin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      return {
        id: data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        profileImageUrl: data.user.profileImageUrl,
        role: data.user.role,
        createdAt: data.user.createdAt,
        token: data.token
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Login failed');
    }
  },

  // Register user
  register: async (userData: RegisterRequest): Promise<User & { token: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      if (!data.success) {
        throw new Error(data.message || 'Registration failed');
      }

      // For signup, we need to login after successful registration to get token
      // Or you can modify your backend to return token on signup
      return await authAPI.login({ email: userData.email, password: userData.password });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Registration failed');
    }
  },

  // Logout user
  logout: async (): Promise<void> => {
    // Just clear local storage for now
    return Promise.resolve();
  },

  // Verify token and get current user
  getCurrentUser: async (): Promise<User> => {
    const token = getAuthToken();
    if (!token) {
      throw new Error('No token found');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get user');
      }

      return {
        id: data.user._id || data.user.id,
        fullName: data.user.fullName,
        email: data.user.email,
        profileImageUrl: data.user.profileImageUrl,
        role: data.user.role,
        createdAt: data.user.createdAt
      };
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to get user');
    }
  },
};

// Blog API
export const blogAPI = {
  // Get all blogs
  getAllBlogs: async (): Promise<BlogPost[]> => {
    // Mock data for development
    return Promise.resolve([
      {
        id: '1',
        title: 'Getting Started with React',
        content: 'This is a sample blog post about React...',
        author: {
          id: '1',
          fullName: 'Test User',
          email: 'test@example.com',
        },
        category: 'Technology',
        image: 'https://picsum.photos/400/200',
        likes: 10,
        comments: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]);

    // Uncomment this when your backend is ready:
    // return apiRequest<{ blogs: BlogPost[] }>('/blogs').then(response => response.blogs);
  },

  // Get blog by ID
  getBlogById: async (id: string): Promise<BlogPost> => {
    // Mock data for development
    return Promise.resolve({
      id,
      title: 'Sample Blog Post',
      content: 'This is the content of the blog post...',
      author: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      category: 'Technology',
      image: 'https://picsum.photos/400/200',
      likes: 5,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Uncomment this when your backend is ready:
    // return apiRequest<{ blog: BlogPost }>(`/blogs/${id}`).then(response => response.blog);
  },

  // Create new blog
  createBlog: async (blogData: CreateBlogRequest): Promise<BlogPost> => {
    // Mock response for development
    return Promise.resolve({
      id: Date.now().toString(),
      title: blogData.title,
      content: blogData.content,
      author: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      category: blogData.category,
      image: blogData.image || 'https://picsum.photos/400/200',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Uncomment this when your backend is ready:
    // return apiRequest<{ blog: BlogPost }>('/blogs', {
    //   method: 'POST',
    //   body: JSON.stringify(blogData),
    // }).then(response => response.blog);
  },

  // Update blog
  updateBlog: async (id: string, blogData: Partial<CreateBlogRequest>): Promise<BlogPost> => {
    // Mock response for development
    return Promise.resolve({
      id,
      title: blogData.title || 'Updated Title',
      content: blogData.content || 'Updated content',
      author: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      category: blogData.category || 'Technology',
      image: blogData.image || 'https://picsum.photos/400/200',
      likes: 0,
      comments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    // Uncomment this when your backend is ready:
    // return apiRequest<{ blog: BlogPost }>(`/blogs/${id}`, {
    //   method: 'PUT',
    //   body: JSON.stringify(blogData),
    // }).then(response => response.blog);
  },

  // Delete blog
  deleteBlog: async (_id: string): Promise<void> => {
    // Mock response for development
    return Promise.resolve();

    // Uncomment this when your backend is ready:
    // return apiRequest<void>(`/blogs/${id}`, {
    //   method: 'DELETE',
    // });
  },

  // Like/Unlike blog
  toggleLike: async (_id: string): Promise<{ likes: number; liked: boolean }> => {
    // Mock response for development
    return Promise.resolve({
      likes: Math.floor(Math.random() * 20),
      liked: Math.random() > 0.5,
    });

    // Uncomment this when your backend is ready:
    // return apiRequest<{ likes: number; liked: boolean }>(`/blogs/${id}/like`, {
    //   method: 'POST',
    // });
  },

  // Add comment to blog
  addComment: async (_blogId: string, comment: string): Promise<Comment> => {
    // Mock response for development
    return Promise.resolve({
      id: Date.now().toString(),
      user: {
        id: '1',
        fullName: 'Test User',
        email: 'test@example.com',
      },
      comment,
      createdAt: new Date().toISOString(),
    });

    // Uncomment this when your backend is ready:
    // return apiRequest<{ comment: Comment }>(`/blogs/${blogId}/comments`, {
    //   method: 'POST',
    //   body: JSON.stringify({ comment }),
    // }).then(response => response.comment);
  },
};

export default { authAPI, blogAPI };
