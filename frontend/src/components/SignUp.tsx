import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Lock, Eye, EyeOff, CheckCircle, Image } from 'lucide-react';

// Props definition updated to match backend
type SignUpPageProps = {
  onSignUp: (fullName: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
};

// The main SignUpPage component
export const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const navigate = useNavigate();
  
  // State variables for form fields and UI control
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [profileImageUrl, setProfileImageUrl] = useState(''); // New state for profile image URL
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Navigation handlers
  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleGoToSignIn = () => {
    navigate('/signin');
  };

  // Real-time password requirement validation
  const passwordRequirements = [
    { text: 'At least 8 characters', met: password.length >= 8 },
    { text: 'Contains uppercase letter', met: /[A-Z]/.test(password) },
    { text: 'Contains lowercase letter', met: /[a-z]/.test(password) },
    { text: 'Contains number', met: /\d/.test(password) }
  ];

  const isPasswordValid = passwordRequirements.every(req => req.met);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  // Type definitions for form events and API results
  interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}
  interface SignUpResult {
      success: boolean;
      error?: string;
  }

  // Form submission handler
  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (fullName && email && password && isPasswordValid && doPasswordsMatch && agreedToTerms) {
        setIsLoading(true);
        setError('');
        
        // Call the onSignUp prop function with all the user details
        const result: SignUpResult = await onSignUp(fullName, email, password);
        
        if (!result.success) {
            setError(result.error as string);
        }
        
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-[#44056f] flex items-center justify-center p-4 font-sans">
      <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl shadow-2xl p-8 w-full max-w-md border border-purple-800">
        {/* Back Button */}
        <button
          onClick={handleBackToLanding}
          className="flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Sign Up Card */}
        <div className="bg-gradient-to-br from-[#5b0c90] via-black to-[#350158] rounded-3xl shadow-2xl p-8 border border-purple-700">
          <div className="text-center mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-2xl w-fit mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-gray-300">Start your journey with us</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 outline-none"
                  required
                />
              </div>
            </div>

            {/* Profile Image URL Field (Optional) */}
            <div>
              <label htmlFor="profileImageUrl" className="block text-sm font-medium text-gray-300 mb-2">
                Profile Image URL (Optional)
              </label>
              <div className="relative">
                <Image className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="url"
                  id="profileImageUrl"
                  value={profileImageUrl}
                  onChange={(e) => setProfileImageUrl(e.target.value)}
                  placeholder="http://example.com/image.png"
                  className="w-full bg-gray-900/50 text-white pl-12 pr-4 py-3 rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 outline-none"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a strong password"
                  className="w-full bg-gray-900/50 text-white pl-12 pr-12 py-3 rounded-xl border border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50 transition-all duration-200 outline-none"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* Password Requirements */}
              {password && (
                <div className="mt-3 space-y-2">
                  {passwordRequirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <CheckCircle 
                        className={`w-4 h-4 transition-colors ${req.met ? 'text-green-500' : 'text-gray-500'}`}
                      />
                      <span className={`transition-colors ${req.met ? 'text-green-400' : 'text-gray-400'}`}>
                        {req.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className={`w-full bg-gray-900/50 text-white pl-12 pr-12 py-3 rounded-xl border transition-all duration-200 outline-none ${
                    confirmPassword && !doPasswordsMatch 
                      ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/50' 
                      : 'border-gray-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/50'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {confirmPassword && !doPasswordsMatch && (
                <p className="mt-2 text-sm text-red-400">Passwords do not match</p>
              )}
              {doPasswordsMatch && (
                <p className="mt-2 text-sm text-green-400 flex items-center gap-1">
                  <CheckCircle className="w-4 h-4" />
                  Passwords match
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 bg-gray-700 border-gray-500 rounded focus:ring-blue-500"
                required
              />
              <label htmlFor="terms" className="text-sm text-gray-300 leading-relaxed">
                I agree to the{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 underline">
                  Terms of Service
                </button>{' '}
                and{' '}
                <button type="button" className="text-blue-400 hover:text-blue-300 underline">
                  Privacy Policy
                </button>
              </label>
            </div>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={!fullName || !email || !isPasswordValid || !doPasswordsMatch || !agreedToTerms || isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-600"></div>
            <span className="text-gray-400 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-600"></div>
          </div>

          {/* Social Sign Up */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-600 hover:bg-gray-800/50 transition-colors duration-200">
              {/* Simple SVG for Google Icon */}
              <svg className="w-5 h-5" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Google</title><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              <span className="font-medium text-gray-200">Continue with Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-gray-600 hover:bg-gray-800/50 transition-colors duration-200">
              {/* Simple SVG for Apple Icon */}
              <svg className="w-5 h-5 text-white" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Apple</title><path fill="currentColor" d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-1.84.048-3.538 1.122-4.524 2.804-1.96 3.334-.48 8.245 1.44 10.98 1.02.948 2.22 2.232 3.828 2.202 1.56-.03 2.04-1.044 3.9-1.044 1.86 0 2.34 1.044 3.9 1.044 1.632-.03 2.712-1.23 3.72-2.172 1.14-1.092 1.62-2.34 1.656-2.4.036-.06-.48-1.896-1.44-3.48-1.02-1.704-2.52-2.856-4.284-2.916-1.584-.06-2.94.996-3.864.996zm-2.28 12.3c-.048.012-1.08-.3-2.184-1.224-1.224-1.02-2.244-2.7-2.244-4.236s.84-2.94 1.92-3.9.9-.684 2.4-1.224c1.08-.42 2.16-.6 3.12-.54.24.012 1.08.3 2.148 1.212 1.14 1.02 2.136 2.628 2.136 4.152 0 1.584-.84 2.94-1.92 3.936-1.452 1.308-2.58 1.248-3.156 1.248-.24 0-.96-.12-1.8-.48z"/></svg>
              <span className="font-medium text-gray-200">Continue with Apple</span>
            </button>
          </div>

          {/* Sign In Link */}
          <div className="text-center mt-8">
            <span className="text-gray-300">Already have an account? </span>
            <button
              type="button"
              onClick={handleGoToSignIn}
              className="text-blue-400 hover:text-blue-300 font-semibold transition-colors duration-200"
            >
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Exporting the component as default
export default SignUpPage;
