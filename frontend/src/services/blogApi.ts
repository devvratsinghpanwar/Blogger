// Blog API service
const API_BASE_URL = 'http://localhost:8000/api';

// Get auth token from localStorage
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Create headers with auth token
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  };
};

export const blogAPI = {
  // Create a new blog
  createBlog: async (blogData: {
    title: string;
    content: string;
    category: string;
    coverImage?: string;
    excerpt?: string;
    tags?: string;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/blogs`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(blogData)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create blog');
    }
    
    return data;
  },

  // Get all blogs with filters
  getAllBlogs: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    author?: string;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/blogs?${queryParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch blogs');
    }
    
    return data;
  },

  // Get current user's blogs
  getMyBlogs: async (params: {
    page?: number;
    limit?: number;
    status?: string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await fetch(`${API_BASE_URL}/blogs/user/my-blogs?${queryParams}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch your blogs');
    }
    
    return data;
  },

  // Get blog by ID
  getBlogById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch blog');
    }
    
    return data;
  },

  // Update blog
  updateBlog: async (id: string, updateData: {
    title?: string;
    content?: string;
    category?: string;
    coverImage?: string;
    excerpt?: string;
    tags?: string;
    status?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update blog');
    }
    
    return data;
  },

  // Delete blog
  deleteBlog: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete blog');
    }
    
    return data;
  },

  // Like/Unlike blog
  toggleLike: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/like`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to toggle like');
    }
    
    return data;
  },

  // Add comment
  addComment: async (id: string, content: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}/comments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ content })
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to add comment');
    }
    
    return data;
  },

  // Delete comment
  deleteComment: async (blogId: string, commentId: string) => {
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/comments/${commentId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to delete comment');
    }
    
    return data;
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    const response = await fetch(`${API_BASE_URL}/blogs/stats`, {
      method: 'GET',
      headers: getAuthHeaders()
    });
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to fetch dashboard stats');
    }
    
    return data;
  }
};

export default blogAPI;
