import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { blogAPI } from '../services/blogApi';
import { Heart, MessageCircle, Image, Loader2, ServerCrash } from 'lucide-react';

// Define the structure of a Blog object
interface Blog {
  _id: string;
  title: string;
  excerpt: string;
  author: {
    fullName: string;
  };
  createdAt: string;
  likesCount: number;
  commentsCount: number;
  category: string;
  coverImage?: string;
}

// The main component for displaying search results
export const SearchResults: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State for search results, loading status, and errors
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blogImageErrors, setBlogImageErrors] = useState<{ [key: string]: boolean }>({});

  // Extract search query from URL
  const searchQuery = new URLSearchParams(location.search).get('q');

  // Fetch search results when the query changes
  useEffect(() => {
    if (!searchQuery) {
      setLoading(false);
      setBlogs([]);
      return;
    }

    const fetchSearchResults = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await blogAPI.getAllBlogs({ search: searchQuery, limit: 20 });
        if (response.success) {
          setBlogs(response.data.blogs);
        } else {
          setError('Failed to fetch search results.');
        }
      } catch (err) {
        setError('An error occurred while searching. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchQuery]);
  
  // Handlers for navigating and image errors
  const handleViewBlog = (blogId: string) => navigate(`/blog/${blogId}`);
  const handleBlogImageError = (blogId: string) => {
    setBlogImageErrors((prev) => ({ ...prev, [blogId]: true }));
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Search Results</h1>
        <p className="text-gray-400 mb-8">
          {loading ? 'Searching for blogs...' : `Found ${blogs.length} results for "${searchQuery}"`}
        </p>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center bg-red-900/50 border border-red-700 p-8 rounded-lg">
            <ServerCrash className="w-16 h-16 mx-auto text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong.</h2>
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* No Results State */}
        {!loading && !error && blogs.length === 0 && (
          <div className="text-center bg-gray-900/50 border border-gray-700 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">No Results Found</h2>
            <p className="text-gray-400">We couldn't find any blogs matching your search. Try a different keyword.</p>
          </div>
        )}

        {/* Display Results */}
        {!loading && !error && blogs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((blog) => (
              <div
                key={blog._id}
                onClick={() => handleViewBlog(blog._id)}
                className="bg-gradient-to-br from-[#350158] to-black rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer shadow-lg hover:shadow-blue-500/20"
              >
                {blog.coverImage && !blogImageErrors[blog._id] ? (
                  <img
                    src={blog.coverImage}
                    alt={blog.title}
                    className="w-full h-48 object-cover"
                    onError={() => handleBlogImageError(blog._id)}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                    <Image className="w-12 h-12 text-gray-500" />
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                      {blog.category}
                    </span>
                    <span className="text-gray-400 text-xs">{new Date(blog.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-lg font-bold text-white mb-2 line-clamp-2 h-14">
                    {blog.title}
                  </h4>
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3 h-16">
                    {blog.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-gray-400 text-sm pt-4 border-t border-gray-700">
                    <span>By {blog.author.fullName}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1.5">
                        <Heart className="w-4 h-4" />
                        <span>{blog.likesCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MessageCircle className="w-4 h-4" />
                        <span>{blog.commentsCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchResults;