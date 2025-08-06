import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from 'lucide-react';

type SignInResult = {
  success: boolean;
  error?: string;
};

type SignInPageProps = {
  onSignIn: (email: string, password: string) => Promise<SignInResult>;
};

export const SignInPage = ({ onSignIn }: SignInPageProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleBackToLanding = () => {
    navigate('/');
  };

  const handleGoToSignUp = () => {
    navigate('/signup');
  };

interface SubmitEvent extends React.FormEvent<HTMLFormElement> {}

const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    if (email && password) {
        setIsLoading(true);
        setError('');
        
        const result: SignInResult = await onSignIn(email, password);
        
        if (!result.success) {
            setError(result.error as string);
        }
        
        setIsLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-[] to-[#44056f] flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#350158] to-black rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        {/* Back Button */}
        <button
          onClick={handleBackToLanding}
          className="flex items-center gap-2 text-white hover:text-red-500 mb-8 transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        {/* Sign In Card */}
        <div className="bg-gradient-to-br from-[#5b0c90] to-black rounded-3xl shadow-2xl p-8 border border-gray-100">
          <div className="text-center mb-8">
            <div className="bg-blue-600 p-3 rounded-2xl w-fit mx-auto mb-4">
              <Lock className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white">Sign in to continue managing your expenses</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-white"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white w-5 h-5" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-12 pr-12 py-4 rounded-2xl border border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 outline-none text-white"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <button
                type="button"
                className="text-blue-300 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-2xl font-semibold text-lg hover:from-blue-700 hover:to-blue-800 transform hover:scale-[1.02] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-gray-200"></div>
            <span className="text-gray-500 text-sm">or</span>
            <div className="flex-1 h-px bg-gray-200"></div>
          </div>

          {/* Social Sign In */}
          <div className="space-y-3">
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-gray-200 hover:bg-gray-900 transition-colors duration-200">
              <div className="w-5 h-5 bg-gradient-to-r from-blue-300 to-blue-600 rounded"></div>
              <span className="font-medium text-white">Continue with Google</span>
            </button>
            <button className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl border border-gray-200 hover:bg-gray-900 transition-colors duration-200">
              <div className="w-5 h-5 bg-gray-900 rounded"></div>
              <span className="font-medium text-white">Continue with Apple</span>
            </button>
          </div>

          {/* Sign Up Link */}
          <div className="text-center mt-8">
            <span className="text-white">Don't have an account? </span>
            <button
              type="button"
              onClick={handleGoToSignUp}
              className="text-blue-300 hover:text-blue-400 font-semibold transition-colors duration-200"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
