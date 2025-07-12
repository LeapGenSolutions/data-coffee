import { useState } from 'react';
import { toast } from '../components/ui/toaster.jsx';
import Logo from '../components/alien-logo.jsx';
import { loginRequest } from '../authConfig.js';
import { useMsal } from '@azure/msal-react';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const { instance } = useMsal();
  const handleSignInClick = async () => {
    try {
      await instance.loginRedirect(loginRequest);
    } catch (error) {
      toast({
        title: "Login Error",
        description: error.message || "An error occurred during Azure sign in.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-100">
        {/* Floating background elements */}
        <div className="absolute top-10 left-10 w-32 h-32 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
        <div className="absolute top-1/3 right-20 w-24 h-24 bg-cyan-200 rounded-full opacity-30 animate-bounce" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-indigo-200 rounded-full opacity-15 animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-1/3 right-1/3 w-20 h-20 bg-blue-300 rounded-full opacity-25 animate-bounce" style={{ animationDelay: '0.5s' }}></div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        {/* Logo Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6 relative">
            {/* Glow effect behind logo */}
            <div className="absolute inset-0 bg-gradient-radial from-blue-200/40 to-transparent rounded-full blur-xl transform scale-150"></div>
            <Logo size="large" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent mb-2">
            Data Coffee
          </h1>
          <p className="text-gray-600 text-lg font-medium">
            {isRegistering ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-2xl p-8 border border-white/20">


          <button
            type="submit"
            onClick={handleSignInClick}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
          >Sign In
          </button>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-sm text-blue-600 hover:text-cyan-600 font-medium transition-colors duration-300 hover:underline"
            >
              {isRegistering
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}