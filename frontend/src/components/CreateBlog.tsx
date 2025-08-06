import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye, Type, FileText, Tag, Image as ImageIcon } from 'lucide-react';
import { blogAPI } from '../services/blogApi';

interface CreateBlogProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string;
  };
}

export const CreateBlog: React.FC<CreateBlogProps> = ({ user }) => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Technology');
  const [imageUrl, setImageUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const categories = [
    'Technology',
    'Lifestyle', 
    'Travel',
    'Food',
    'Health',
    'Education',
    'Business',
    'Others'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await blogAPI.createBlog({
        title: title.trim(),
        content: content.trim(),
        category,
        coverImage: imageUrl.trim() || undefined
      });

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError('Failed to create blog');
      }
    } catch (error: any) {
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[] to-[#44056f]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#350158] to-black border-b border-transparent sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20 py-4">
            {/* Left Side - Back Button */}
            <div className="flex-1">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200 font-medium"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
            
            {/* Center - Heading */}
            <div className="flex-1 flex justify-center">
              <h1 className="text-2xl font-bold text-white text-center">Create Your Blog</h1>
            </div>
            
            {/* Right Side - Action Buttons */}
            <div className="flex-1 flex justify-end">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setIsPreview(!isPreview)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Eye className="w-4 h-4" />
                  {isPreview ? 'Edit' : 'Preview'}
                </button>
                
                <button
                  type="submit"
                  form="blog-form"
                  disabled={isLoading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg transition-colors duration-200 font-medium"
                >
                  <Save className="w-4 h-4" />
                  {isLoading ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {isPreview ? (
          /* Preview Mode */
          <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-8 border border-transparent">
            <div className="mb-6">
              <span className="inline-block bg-blue-600 text-white text-sm px-3 py-1 rounded-full mb-4">
                {category}
              </span>
              <h1 className="text-3xl font-bold text-white mb-4">
                {title || 'Your Blog Title'}
              </h1>
              <div className="flex items-center gap-3 text-gray-400 text-sm">
                <span>By {user.fullName}</span>
                <span>•</span>
                <span>{new Date().toLocaleDateString()}</span>
              </div>
            </div>
            
            {imageUrl && (
              <div className="mb-6">
                <img 
                  src={imageUrl} 
                  alt="Blog cover"
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="prose prose-invert max-w-none">
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {content || 'Your blog content will appear here...'}
              </div>
            </div>
          </div>
        ) : (
          /* Edit Mode */
          <form id="blog-form" onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            {/* Title Field */}
            <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-6 border border-transparent">
              <label htmlFor="title" className="block text-sm font-medium text-white mb-3">
                <Type className="w-4 h-4 inline mr-2" />
                Blog Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter an engaging title for your blog..."
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                required
              />
            </div>

            {/* Category and Image URL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category */}
              <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-6 border border-transparent">
                <label htmlFor="category" className="block text-sm font-medium text-white mb-3">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}
                        className='bg-black text-white'
                    >
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-6 border border-transparent">
                <label htmlFor="imageUrl" className="block text-sm font-medium text-white mb-3">
                  <ImageIcon className="w-4 h-4 inline mr-2" />
                  Cover Image URL (Optional)
                </label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Content Field */}
            <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-6 border border-transparent">
              <label htmlFor="content" className="block text-sm font-medium text-white mb-3">
                <FileText className="w-4 h-4 inline mr-2" />
                Blog Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your blog content here... Share your thoughts, experiences, and insights!"
                rows={15}
                className="w-full px-4 py-3 bg-transparent border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none resize-vertical"
                required
              />
              <div className="mt-2 text-gray-400 text-sm">
                {content.length} characters
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateBlog;
