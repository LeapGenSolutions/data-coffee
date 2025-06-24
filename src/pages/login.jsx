import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { z } from 'zod';
import { loginSchema } from '../shared/schema.js';
import { toast } from '../components/ui/toaster.jsx';
import Logo from '../components/alien-logo.jsx';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { login } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);

  const schema = isRegistering 
    ? loginSchema.extend({
        username: z.string().min(1, "Username is required")
      })
    : loginSchema;

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: '',
      password: '',
      username: ''
    }
  });

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      if (isRegistering) {
        // Handle registration
        const response = {
          ok:true,
          data:{
            message:"Login successful"
          }
        }
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Registration failed');
        }
        
        return response.json();
      } else {
        // Handle login using auth context
        return await login(data);
      }
    },
    onSuccess: (data) => {
      console.log('Login successful:', data);
      toast({
        title: "Success",
        description: data.message || "Login successful",
      });
    },
    onError: (error) => {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: error.message || (isRegistering ? "Registration failed" : "Login failed"),
        variant: "destructive",
      });
    }
  });

  const onSubmit = (data) => {
    // Redirect to /dashboard without authentication, using window.location
    window.location.href = '/dashboard';
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
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {isRegistering && (
              <div>
                <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                  Username
                </label>
                <input
                  id="username"
                  type="text"
                  {...form.register('username')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-300 hover:bg-gray-50"
                  style={{ backgroundColor: 'white', color: 'black' }}
                  placeholder="Enter your username"
                />
                {form.formState.errors.username && (
                  <p className="mt-1 text-sm text-red-600">{form.formState.errors.username.message}</p>
                )}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                {...form.register('email')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:bg-gray-50"
                placeholder="Enter your email"
              />
              {form.formState.errors.email && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                {...form.register('password')}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all duration-300 hover:bg-gray-50"
                placeholder="Enter your password"
              />
              {form.formState.errors.password && (
                <p className="mt-1 text-sm text-red-600">{form.formState.errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {isRegistering ? 'Creating Account...' : 'Signing In...'}
                </div>
              ) : (
                isRegistering ? 'Create Account' : 'Sign In'
              )}
            </button>
          </form>

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

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
            <p className="text-xs text-blue-700 font-semibold mb-2">Demo credentials:</p>
            <p className="text-xs text-blue-600">Email: admin@datacoffee.com</p>
            <p className="text-xs text-blue-600">Password: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}