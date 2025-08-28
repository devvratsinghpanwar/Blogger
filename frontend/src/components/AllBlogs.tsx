import { authAPI } from "@/services/api";
import blogAPI from "@/services/blogApi";
import {
  ArrowLeft,
  Eye,
  Heart,
  LogOut,
  MessageCircle,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

interface AllBlogsProps {
  user: {
    id: string;
    fullName: string;
    email: string;
    profileImageUrl?: string;
  };
}

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: {
    _id: string;
    fullName: string;
    email: string;
    profileImageUrl: string;
  };
  category: string;
  coverImage: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  readTime: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

const AllBlogs: React.FC<AllBlogsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [imageLoadError, setImageLoadError] = useState(false);
  const blogsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAllBlogs(currentPage);
  }, [currentPage]);

  const getAllBlogs = async (page: number) => {
    try {
      setLoading(true);
      const response = await blogAPI.getAllBlogs({
        page,
        limit: 9,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      if (response.success) {
        if (page === 1) {
          // Replace blogs on first page fetch
          setBlogs(response.data.blogs);
        } else {
          // Append blogs on subsequent pages
          setBlogs((prevBlogs) => [...prevBlogs, ...response.data.blogs]);
        }
        setTotalPages(response.data.pagination.totalPages);

        // Scroll to new blogs
        if (page > 1 && blogsContainerRef.current) {
          setTimeout(() => {
            blogsContainerRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 100); // wait a moment to ensure blogs are rendered
        }
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch blogs at the moment");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    setImageLoadError(false);
  }, [user.profileImageUrl]);

  const handleLoadMore = () => {
    setCurrentPage((prevPage) => prevPage + 1);
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };
  const handleImageError = () => setImageLoadError(true);
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
    const handleSignOut = async () => {
      try {
        await authAPI.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    };
  const onSignOut = () => {
    handleSignOut();
    navigate("/");
  };
  if (loading && blogs.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <nav className="bg-gradient-to-r from-[#350158] to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center justify-between flex-1 gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
              <h1 className="text-2xl font-bold text-white">All Blogs</h1>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.profileImageUrl && !imageLoadError ? (
                    <img
                      src={user.profileImageUrl}
                      alt={user.fullName}
                      className="w-8 h-8 rounded-full object-cover"
                      onError={handleImageError}
                    />
                  ) : (
                    <div
                      className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center"
                      title="User"
                    >
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-white font-medium">
                    {user.fullName}
                  </span>
                </div>
                <button
                  onClick={onSignOut}
                  className="text-white hover:text-red-400 p-2 rounded-lg"
                  title="Sign Out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {blogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-12 border border-gray-800">
              <h3 className="text-2xl font-bold text-white mb-4">
                No blogs found
              </h3>
              <p className="text-gray-300 mb-8">
                Either the API is down or we don't have any blogs to show.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Blogs grid */}
            <div
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
              ref={blogsContainerRef}
            >
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-gradient-to-br from-[#5b0c90] to-black rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                >
                  {blog.coverImage ? (
                    <img
                      src={blog.coverImage}
                      alt={blog.title}
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div>
                      <p className="text-gray-300 mb-8">
                        No cover image available
                      </p>
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            blog.status === "published"
                              ? "bg-green-600"
                              : blog.status === "draft"
                              ? "bg-yellow-600"
                              : "bg-gray-600"
                          } text-white`}
                        >
                          {blog.status}
                        </span>
                        <span className="text-gray-400 text-xs">
                          {formatDate(blog.createdAt)}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                      {blog.title}
                    </h4>

                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between text-gray-400 text-sm mb-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span>{blog.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{blog.commentsCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          <span>{blog.views}</span>
                        </div>
                      </div>
                      <span className="text-xs">{blog.readTime} min read</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            {currentPage < totalPages && (
              <div className="text-center">
                <button
                  onClick={handleLoadMore}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full transition duration-200"
                >
                  {loading ? "Loading..." : "Load More"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AllBlogs;
