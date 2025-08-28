import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Heart,
  MessageCircle,
  Eye,
  Plus,
} from "lucide-react";
import { blogAPI } from "../services/blogApi";

interface MyBlogsProps {
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
    profileImageUrl?: string;
  };
  category: string;
  coverImage?: string;
  likesCount: number;
  commentsCount: number;
  views: number;
  readTime: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export const MyBlogs: React.FC<MyBlogsProps> = ({ user }) => {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState("");
  console.log("User:", user.fullName);
  useEffect(() => {
    fetchMyBlogs();
  }, [currentPage, selectedStatus]);

  const fetchMyBlogs = async () => {
    try {
      setLoading(true);
      const response = await blogAPI.getMyBlogs({
        page: currentPage,
        limit: 9,
        ...(selectedStatus && { status: selectedStatus }),
      });

      if (response.success) {
        setBlogs(response.data.blogs);
        setTotalPages(response.data.pagination.totalPages);
      }
    } catch (error: any) {
      setError(error.message || "Failed to fetch your blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleViewBlog = (blogId: string) => {
    navigate(`/blog/${blogId}`); // View mode (full screen)
  };

  const handleEditBlog = (blogId: string) => {
    navigate(`/blog/${blogId}?mode=edit`); // Edit mode
  };

  const handleCreateBlog = () => {
    navigate("/create-blog");
  };

  const handleBackToDashboard = () => {
    navigate("/dashboard");
  };

  const handleDeleteBlog = async (blogId: string, blogTitle: string) => {
    if (
      window.confirm(
        `Are you sure you want to delete "${blogTitle}"? This action cannot be undone.`
      )
    ) {
      try {
        await blogAPI.deleteBlog(blogId);
        fetchMyBlogs(); // Refresh the list
      } catch (error: any) {
        setError(error.message || "Failed to delete blog");
      }
    }
  };

  // Helper functions
  const formatReadTime = (readTime: number): string => {
    if (readTime < 1) return "Less than 1 min read";
    if (readTime === 1) return "1 min read";
    if (readTime <= 10) return `${Math.round(readTime)} min read`;
    return "More than 10 min read";
  };

  const getCreateButtonText = (): string => {
    return blogs.length > 0 ? "Create Another Blog" : "Create Your First Blog";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white text-xl">Loading your blogs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-[#350158] to-black border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-white hover:text-blue-400 transition-colors duration-200"
              >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
              </button>
            </div>
            <h1 className="text-2xl font-bold text-white">My Blogs</h1>
            <div className="flex items-center gap-4">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => {
                  setSelectedStatus(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-gray-800 text-white px-3 py-2 rounded-lg border border-gray-700 focus:border-blue-500 outline-none"
              >
                <option value="">All Status</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>

              <button
                onClick={handleCreateBlog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                New Blog
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
                {selectedStatus
                  ? `You don't have any ${selectedStatus} blogs yet.`
                  : "You haven't created any blogs yet. Start sharing your thoughts with the world!"}
              </p>
              <button
                onClick={handleCreateBlog}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105"
              >
                {getCreateButtonText()}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogs.map((blog) => (
                <div
                  key={blog._id}
                  className="bg-gradient-to-br from-[#5b0c90] to-black rounded-xl overflow-hidden border border-gray-700 hover:border-gray-600 transition-all duration-200 transform hover:scale-105 cursor-pointer"
                  onClick={() => handleViewBlog(blog._id)}
                >
                  {/* Blog Image or Placeholder */}
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
                    <div className="w-full h-48 bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
                      <Edit className="w-12 h-12 text-gray-400" />
                    </div>
                  )}

                  {/* Blog Content */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                        {blog.category}
                      </span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            blog.status === "published"
                              ? "bg-green-600 text-white"
                              : blog.status === "draft"
                              ? "bg-yellow-600 text-white"
                              : "bg-gray-600 text-white"
                          }`}
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
                      <span className="text-xs">
                        {formatReadTime(blog.readTime)}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div
                      className="flex gap-2"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => handleEditBlog(blog._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <Edit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog._id, blog.title)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
                >
                  Previous
                </button>

                <span className="text-white px-4">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors duration-200"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyBlogs;
