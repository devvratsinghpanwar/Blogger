import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import { NavbarDemo } from "./components/Navbar";
import LandingPage from "./components/LandingPage";
import { SignInPage } from "./components/SignIn";
import { SignUpPage } from "./components/SignUp";
import Dashboard from "./components/Dashboard";
import CreateBlog from "./components/CreateBlog";
import EnhancedBlogView from "./components/EnhancedBlogView";
import MyBlogs from "./components/MyBlogs";
import { authAPI, type User } from "./services/api";
import SearchResults from './components/SearchResult';
import AllBlogs from './components/AllBlogs';

// Type for user with token
type AuthUser = User & { token: string };

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    const savedToken = localStorage.getItem('token');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser({ ...parsedUser, token: savedToken });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const handleSignIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userData = await authAPI.login({ email, password });
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
        createdAt: userData.createdAt
      }));
      localStorage.setItem('token', userData.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    }
  };

  const handleSignUp = async (
    fullName: string,
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const userData = await authAPI.register({ fullName, email, password });
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify({
        id: userData.id,
        fullName: userData.fullName,
        email: userData.email,
        profileImageUrl: userData.profileImageUrl,
        role: userData.role,
        createdAt: userData.createdAt
      }));
      localStorage.setItem('token', userData.token);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    }
  };

  const handleSignOut = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  };

    // Blog-related handlers - removed since components now handle their own API calls

  // Wrapper components for routes that need user data
  const CreateBlogWrapper = () => {
    if (!user) return <Navigate to="/" replace />;
    return <CreateBlog user={user} />;
  };

  const BlogViewWrapper = () => {
    if (!user) return <Navigate to="/" replace />;
    return <EnhancedBlogView currentUser={user} />;
  };

  const MyBlogsWrapper = () => {
    if (!user) return <Navigate to="/" replace />;
    return <MyBlogs user={user} />;
  };
  const AllBlogsWrapper = ()=>{
    if(!user) return <Navigate to ='/' replace />
    return <AllBlogs user={user} />
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-[] to-[#44056f] flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {/* Only show navbar on landing page when user is not logged in */}
      {!user && (
        <div className="sticky top-0 z-50">
          <NavbarDemo />
        </div>
      )}
      
      <Routes>
        <Route
          path="/"
          element={
            user ? <Navigate to="/dashboard" replace /> : <LandingPage />
          }
        />
        <Route path="/search" element={<SearchResults />} />
        <Route
          path="/signin"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignInPage onSignIn={handleSignIn} />
            )
          }
        />
        <Route
          path="/signup"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <SignUpPage onSignUp={handleSignUp} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            user ? (
              <Dashboard user={user} onSignOut={handleSignOut} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/create-blog"
          element={<CreateBlogWrapper />}
        />
        <Route
          path="/my-blogs"
          element={<MyBlogsWrapper />}
        />
        <Route
          path="/blog/:id"
          element={<BlogViewWrapper />}
        />
        <Route
          path="/all-blogs"
          element={<AllBlogsWrapper />}
        />
        {/* Catch all route - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
