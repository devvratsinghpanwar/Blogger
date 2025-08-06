import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, User as UserIcon, Edit, Trash2, Save, X } from 'lucide-react';
import { blogAPI } from '../services/blogApi';

interface BlogViewProps {
  currentUser: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string;
  };
}

interface BlogPost {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string;
  };
  category: string;
  coverImage?: string;
  likes: Array<{ user: string; createdAt: string }>;
  comments: Array<{
    _id: string;
    user: {
      _id: string;
      fullName: string;
      profileImageUrl?: string;
    };
    content: string;
    createdAt: string;
  }>;
  likesCount: number;
  commentsCount: number;
  views: number;
  readTime: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const BlogView: React.FC<BlogViewProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const isEditMode = searchParams.get('mode') === 'edit';
  
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  
  // Edit mode states
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editCoverImage, setEditCoverImage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const categories = [
    'Technology', 'Lifestyle', 'Travel', 'Food', 'Health', 'Education', 'Business', 'Others'
  ];

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getBlogById(id!);
      if (response.success) {
        setBlog(response.blog);
        setEditTitle(response.blog.title);
        setEditContent(response.blog.content);
        setEditCategory(response.blog.category);
        setEditCoverImage(response.blog.coverImage || '');
        
        // Check if current user liked this blog
        const userLiked = response.blog.likes.some((like: any) => like.user === currentUser.id);
        setIsLiked(userLiked);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch blog');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    
    try {
      const response = await blogAPI.toggleLike(blog._id);
      if (response.success) {
        setIsLiked(response.isLiked);
        setBlog(prev => prev ? { ...prev, likesCount: response.likesCount } : null);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to toggle like');
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!blog || !newComment.trim()) return;

    try {
      setIsSubmittingComment(true);
      const response = await blogAPI.addComment(blog._id, newComment.trim());
      
      if (response.success) {
        // Add the new comment to the blog
        setBlog(prev => prev ? {
          ...prev,
          comments: [...prev.comments, response.comment],
          commentsCount: response.commentsCount
        } : null);
        setNewComment('');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to add comment');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (blog) {
      setEditTitle(blog.title);
      setEditContent(blog.content);
      setEditCategory(blog.category);
      setEditCoverImage(blog.coverImage || '');
    }
  };

  const handleSaveEdit = async () => {
    if (!blog) return;

    try {
      setIsSaving(true);
      const response = await blogAPI.updateBlog(blog._id, {
        title: editTitle,
        content: editContent,
        category: editCategory,
        coverImage: editCoverImage
      });

      if (response.success) {
        setBlog(response.blog);
        setIsEditing(false);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update blog');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!blog) return;

    if (window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) {
      try {
        await blogAPI.deleteBlog(blog._id);
        navigate('/my-blogs');
      } catch (error: any) {
        setError(error.message || 'Failed to delete blog');
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading blog...</div>
      </div>
    );
  }

  if (error && !blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button
            onClick={() => navigate('/dashboard')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Blog not found</div>
      </div>
    );
  }

  const isAuthor = blog.author._id === currentUser.id;

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#44056f]">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-[#350158] to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate(isEditMode ? '/my-blogs' : '/dashboard')}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to {isEditMode ? 'My Blogs' : 'Dashboard'}
            </button>

            {isAuthor && (
              <div className="flex items-center gap-3">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleCancelEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveEdit}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                    >
                      <Save className="w-4 h-4" />
                      {isSaving ? 'Saving...' : 'Save'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleEdit}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={handleDelete}
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Error Display */}
      {error && (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
            <button 
              onClick={() => setError('')}
              className="float-right text-red-700 hover:text-red-900"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-8 border border-gray-800">
          {/* Blog Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <span className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full">
                {isEditing ? (
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="bg-blue-600 text-white border-none outline-none"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat} className="bg-gray-800">{cat}</option>
                    ))}
                  </select>
                ) : (
                  blog.category
                )}
              </span>
              <div className="text-gray-400 text-sm">
                {blog.readTime} min read • {blog.views} views
              </div>
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full text-3xl font-bold text-white mb-4 bg-transparent border-b border-gray-600 pb-2 outline-none focus:border-blue-500"
                placeholder="Blog title..."
              />
            ) : (
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                {blog.title}
              </h1>
            )}

            {/* Author Info */}
            <div className="flex items-center gap-3 text-gray-400">
              <div className="flex items-center gap-2">
                {blog.author.profileImageUrl ? (
                  <img
                    src={blog.author.profileImageUrl}
                    alt={blog.author.fullName}
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                    <UserIcon className="w-6 h-6 text-white" />
                  </div>
                )}
                <div>
                  <p className="text-white font-medium">{blog.author.fullName}</p>
                  <p className="text-gray-400 text-sm">{formatDate(blog.createdAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {(blog.coverImage || (isEditing && editCoverImage)) && (
            <div className="mb-8">
              {isEditing ? (
                <div className="space-y-4">
                  <input
                    type="url"
                    value={editCoverImage}
                    onChange={(e) => setEditCoverImage(e.target.value)}
                    placeholder="Cover image URL..."
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 outline-none"
                  />
                  {editCoverImage && (
                    <img
                      src={editCoverImage}
                      alt="Cover preview"
                      className="w-full h-80 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  )}
                </div>
              ) : (
                <img
                  src={blog.coverImage}
                  alt={blog.title}
                  className="w-full h-80 object-cover rounded-lg"
                />
              )}
            </div>
          )}

          {/* Blog Content */}
          <div className="prose prose-invert max-w-none mb-8">
            {isEditing ? (
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={20}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 outline-none resize-vertical"
                placeholder="Write your blog content here..."
              />
            ) : (
              <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {blog.content}
              </div>
            )}
          </div>

          {/* Blog Stats & Actions */}
          {!isEditing && (
            <>
              <div className="flex items-center justify-between border-t border-gray-700 pt-6">
                <div className="flex items-center gap-6">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 transition-colors duration-200 ${
                      isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    <span>{blog.likesCount}</span>
                  </button>

                  <div className="flex items-center gap-2 text-gray-400">
                    <MessageCircle className="w-5 h-5" />
                    <span>{blog.commentsCount}</span>
                  </div>

                  <button className="flex items-center gap-2 text-gray-400 hover:text-blue-400 transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                    <span>Share</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="border-t border-gray-700 pt-8 mt-8">
                <h3 className="text-xl font-bold text-white mb-6">
                  Comments ({blog.commentsCount})
                </h3>

                {/* Add Comment Form */}
                <form onSubmit={handleAddComment} className="mb-8">
                  <div className="flex gap-3">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      {currentUser.profileImageUrl ? (
                        <img
                          src={currentUser.profileImageUrl}
                          alt={currentUser.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ) : null}
                      <div 
                        className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center absolute top-0 left-0"
                        title="Error loading profile image"
                        style={{ display: currentUser.profileImageUrl ? 'none' : 'flex' }}
                      >
                        <UserIcon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Add a comment..."
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 outline-none resize-none"
                        rows={3}
                      />
                      <div className="flex justify-end mt-2">
                        <button
                          type="submit"
                          disabled={!newComment.trim() || isSubmittingComment}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200"
                        >
                          <Send className="w-4 h-4" />
                          {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>
                    </div>
                  </div>
                </form>

                {/* Comments List */}
                <div className="space-y-6">
                  {blog.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3">
                      {comment.user.profileImageUrl ? (
                        <img
                          src={comment.user.profileImageUrl}
                          alt={comment.user.fullName}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <UserIcon className="w-6 h-6 text-white" />
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="bg-gray-800 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-white">
                              {comment.user.fullName}
                            </span>
                            <span className="text-gray-400 text-sm">
                              {formatDate(comment.createdAt)}
                            </span>
                          </div>
                          <p className="text-gray-300">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {blog.comments.length === 0 && (
                    <div className="text-center py-8">
                      <MessageCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">No comments yet. Be the first to comment!</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
};

export default BlogView;
