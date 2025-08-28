import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  LogOut,
  PlusCircle,
  Heart,
  MessageCircle,
  Calendar,
  Image,
  Search,
  BookOpen // Renamed to avoid conflict
} from "lucide-react";
import { blogAPI } from "../services/blogApi";

// Interfaces for our data structures
interface DashboardUser {
  id: string;
  fullName: string;
  email: string;
  profileImageUrl?: string;
  role?: string;
}

interface DashboardProps {
  user: DashboardUser;
  onSignOut: () => void;
}

interface DashboardStats {
  totalBlogs: number;
  totalLikes: number;
  totalComments: number;
  totalViews: number;
  blogsThisMonth: number;
}

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

export const Dashboard: React.FC<DashboardProps> = ({ user, onSignOut }) => {
  const navigate = useNavigate();
  
  // State management
  const [imageLoadError, setImageLoadError] = useState(false);
  const [blogImageErrors, setBlogImageErrors] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [recentBlogs, setRecentBlogs] = useState<Blog[]>([]);
  const [blogsLoading, setBlogsLoading] = useState(true);

  // Fetch dashboard stats and recent blogs on component mount
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setStatsLoading(true);
        setBlogsLoading(true);
        
        // Fetch stats and recent blogs in parallel
        const [statsResponse, blogsResponse] = await Promise.all([
          blogAPI.getDashboardStats(),
          blogAPI.getAllBlogs({ limit: 3, sortBy: 'createdAt', sortOrder: 'desc' })
        ]);

        if (statsResponse.success) {
          setDashboardStats(statsResponse.data.stats);
        }
        if (blogsResponse.success) {
          setRecentBlogs(blogsResponse.data.blogs);
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setStatsLoading(false);
        setBlogsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);
  
  // Reset profile image error state when URL changes
  useEffect(() => {
    setImageLoadError(false);
  }, [user.profileImageUrl]);

  // Navigation and event handlers
  const handleCreateBlog = () => navigate("/create-blog");
  const handleViewBlog = (blogId: string) => navigate(`/blog/${blogId}`);
  const handleMyBlogs = () => navigate("/my-blogs");
  const handleImageError = () => setImageLoadError(true);
  const handleBlogImageError = (blogId: string) => {
    setBlogImageErrors((prev) => ({ ...prev, [blogId]: true }));
  };

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${searchQuery.trim()}`);
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-[#350158] to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-white">Blogger</h1>
            </div>
            <div className="flex items-center gap-4">
              {/* Search Bar */}
              <div className="relative">
                <form onSubmit={handleSearchSubmit}>
                  {showSearch ? (
                    <div className="flex items-center">
                      <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none w-64 transition-all"
                        autoFocus
                        onBlur={() => !searchQuery && setShowSearch(false)}
                      />
                      <button type="button" onClick={() => setShowSearch(false)} className="ml-2 text-gray-400 hover:text-white">&times;</button>
                    </div>
                  ) : (
                    <button type="button" onClick={() => setShowSearch(true)} className="text-white hover:text-blue-400 p-2 rounded-lg" title="Search Blogs">
                      <Search className="w-5 h-5" />
                    </button>
                  )}
                </form>
              </div>
              <button onClick={handleMyBlogs} className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <BookOpen className="w-4 h-4" /> My Blogs
              </button>
              <button onClick={handleCreateBlog} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <PlusCircle className="w-4 h-4" /> New Post
              </button>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.profileImageUrl && !imageLoadError ? (
                    <img src={user.profileImageUrl} alt={user.fullName} className="w-8 h-8 rounded-full object-cover" onError={handleImageError} />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center" title="User">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-white font-medium">{user.fullName}</span>
                </div>
                <button onClick={onSignOut} className="text-white hover:text-red-400 p-2 rounded-lg" title="Sign Out">
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-[#5b0c90] to-black rounded-2xl p-8 mb-8 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Welcome back, {user.fullName}!</h2>
              <p className="text-gray-300">Ready to share your thoughts with the world?</p>
            </div>
            <div className="hidden md:block">
              <button onClick={handleCreateBlog} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105">
                {/* DYNAMIC BUTTON TEXT */}
                {statsLoading ? '...' : (dashboardStats?.totalBlogs === 0 ? 'Create Your First Post' : 'Create New Post')}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Posts */}
          <div className="bg-gradient-to-br from-[#350158] to-black p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Posts</p>
                <p className="text-2xl font-bold text-white">{statsLoading ? "..." : dashboardStats?.totalBlogs ?? 0}</p>
              </div>
              <div className="bg-blue-600 p-3 rounded-lg"><PlusCircle className="w-6 h-6 text-white" /></div>
            </div>
          </div>
          {/* Total Likes */}
          <div className="bg-gradient-to-br from-[#350158] to-black p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Likes</p>
                <p className="text-2xl font-bold text-white">{statsLoading ? "..." : dashboardStats?.totalLikes ?? 0}</p>
              </div>
              <div className="bg-red-600 p-3 rounded-lg"><Heart className="w-6 h-6 text-white" /></div>
            </div>
          </div>
          {/* Total Comments */}
          <div className="bg-gradient-to-br from-[#350158] to-black p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Comments</p>
                <p className="text-2xl font-bold text-white">{statsLoading ? "..." : dashboardStats?.totalComments ?? 0}</p>
              </div>
              <div className="bg-green-600 p-3 rounded-lg"><MessageCircle className="w-6 h-6 text-white" /></div>
            </div>
          </div>
          {/* This Month */}
          <div className="bg-gradient-to-br from-[#350158] to-black p-6 rounded-xl border border-gray-800">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">This Month</p>
                <p className="text-2xl font-bold text-white">{statsLoading ? "..." : dashboardStats?.blogsThisMonth ?? 0}</p>
              </div>
              <div className="bg-purple-600 p-3 rounded-lg"><Calendar className="w-6 h-6 text-white" /></div>
            </div>
          </div>
        </div>

        {/* Recent Blog Posts */}
        <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-white">Recent Posts</h3>
            <button onClick={() => navigate('/all-blogs')} className="text-blue-400 hover:text-blue-300 font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogsLoading ? (
              <p className="text-gray-400 col-span-3 text-center">Loading recent posts...</p>
            ) : (
              recentBlogs.map((blog) => (
                <div key={blog._id} onClick={() => handleViewBlog(blog._id)} className="bg-gradient-to-br from-[#5b0c90] to-black rounded-xl overflow-hidden border border-gray-700 hover:border-blue-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                  {blog.coverImage && !blogImageErrors[blog._id] ? (
                    <img src={blog.coverImage} alt={blog.title} className="w-full h-48 object-cover" onError={() => handleBlogImageError(blog._id)} />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center"><Image className="w-12 h-12 text-gray-500" /></div>
                  )}
                  <div className="p-6">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{blog.category}</span>
                    <h4 className="text-lg font-semibold text-white mt-2 mb-2 line-clamp-2">{blog.title}</h4>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-2">{blog.excerpt}</p>
                    <div className="flex items-center justify-between text-gray-400 text-sm pt-2 border-t border-gray-700/50">
                      <span>By {blog.author.fullName}</span>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1"><Heart className="w-4 h-4" /><span>{blog.likesCount}</span></div>
                        <div className="flex items-center gap-1"><MessageCircle className="w-4 h-4" /><span>{blog.commentsCount}</span></div>
                      </div>
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

export default Dashboard;