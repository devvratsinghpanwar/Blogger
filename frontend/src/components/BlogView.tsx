import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Heart, MessageCircle, Share2, Send, User as UserIcon } from 'lucide-react';
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
  const [blog, setBlog] = useState<BlogPost | null>(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isAddingComment, setIsAddingComment] = useState(false);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!id) return;
        const data = await blogAPI.getBlogById(id);
        setBlog(data);
        setIsLiked(data.likes.some((like: any) => like.user === currentUser.id));
        setLikesCount(data.likes.length);
        setComments(data.comments);
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };
    fetchBlog();
  }, [id, currentUser.id]);

  const handleLike = async () => {
    if (!blog) return;
    try {
      await onLike(blog._id);
      setIsLiked(!isLiked);
      setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    } catch (error) {
      console.error('Error liking blog:', error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsAddingComment(true);
    try {
      if (!blog) return;
      await onAddComment(blog._id, newComment.trim());
      
      // Add the new comment to the local state
      const tempComment = {
        _id: Date.now().toString(),
        user: {
          _id: currentUser.id,
          fullName: currentUser.fullName,
          profileImageUrl: currentUser.profileImageUrl
        },
        content: newComment.trim(),
        createdAt: new Date().toISOString()
      };
      
      setComments(prev => [...prev, tempComment]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsAddingComment(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[] to-[#44056f]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#350158] to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </button>
            
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200">
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Blog Post */}
        <article className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-8 border border-gray-800 mb-8">
          {/* Category */}
          <span className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-4">
            {blog ? blog.category : ''}
          </span>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-6">
            {blog ? blog.title : ''}
          </h1>

          {/* Author and Date */}
          <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              {blog && blog.author.profileImageUrl ? (
                <img 
                  src={blog.author.profileImageUrl} 
                  alt={blog.author.fullName}
                  className="w-12 h-12 rounded-full"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                  <UserIcon className="w-6 h-6 text-white" />
                </div>
              )}
              <div>
                <p className="text-white font-medium">{blog ? blog.author.fullName : ''}</p>
                <p className="text-gray-400 text-sm">{blog ? formatDate(blog.createdAt) : ''}</p>
              </div>
            </div>
          </div>

          {/* Cover Image */}
          {blog?.coverImage && (
            <div className="mb-8">
              <img 
                src={blog.coverImage} 
                alt={blog.title}
                className="w-full h-64 md:h-96 object-cover rounded-lg"
              />
            </div>
          )}

          {/* Content */}
          <div className="prose prose-invert max-w-none mb-8">
            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed text-lg">
              {blog?.content}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-6 pt-6 border-t border-gray-700">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                isLiked 
                  ? 'bg-red-600 text-white' 
                  : 'bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-400">
              <MessageCircle className="w-5 h-5" />
              <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
            </div>
          </div>
        </article>

        {/* Comments Section */}
        <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">
            Comments ({comments.length})
          </h2>

          {/* Add Comment Form */}
          <form onSubmit={handleAddComment} className="mb-8">
            <div className="flex gap-4">
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
                  <UserIcon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Write a comment..."
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-none"
                />
                <div className="flex justify-end mt-3">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isAddingComment}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors duration-200"
                  >
                    <Send className="w-4 h-4" />
                    {isAddingComment ? 'Adding...' : 'Add Comment'}
                  </button>
                </div>
              </div>
            </div>
          </form>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.length === 0 ? (
              <p className="text-gray-400 text-center py-8">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-4">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    {comment.user.profileImageUrl ? (
                      <img 
                        src={comment.user.profileImageUrl} 
                        alt={comment.user.fullName}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div 
                      className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center absolute top-0 left-0"
                      title="Error loading profile image"
                      style={{ display: comment.user.profileImageUrl ? 'none' : 'flex' }}
                    >
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="bg-gray-800 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-white font-medium">{comment.user.fullName}</span>
                        <span className="text-gray-400 text-sm">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-gray-300">{comment.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

async function onLike(id: string) {
    // Call the API to like/unlike the blog post
    try {
        await blogAPI.toggleLike(id);
    } catch (error) {
        throw error;
    }
}

async function onAddComment(id: string, comment: string) {
    try {
        await blogAPI.addComment(id, comment);
    } catch (error) {
        throw error;
    }
}

export default BlogView;

