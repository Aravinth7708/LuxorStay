import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { API_BASE_URL } from '../config/api';
import { useAuth } from '../context/AuthContext';
import AOS from 'aos';
import 'aos/dist/aos.css';

const SignIn = () => {
  // Initialize AOS for animations
  useEffect(() => {
    AOS.init({
      duration: 800,
      easing: 'ease-out',
      once: true
    });
  }, []);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { setAuthToken, setUserData } = useAuth();
  const navigate = useNavigate();

  // Input validation
  const validateInputs = () => {
    if (!email || !password) {
      setError('Email and password are required');
      return false;
    }
    
    if (!isLogin) {
      if (!name) {
        setError('Name is required');
        return false;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return false;
      }
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateInputs()) return;
    
    setLoading(true);
    
    try {
      // Call the OTP sending endpoint instead of direct login/register
      const endpoint = isLogin ? 'send-login-otp' : 'send-registration-otp';
      
      const response = await fetch(`${API_BASE_URL}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed');
      }
      
      setSuccess('Verification code sent to your email!');
      
      // Navigate to OTP verification page with user data
      setTimeout(() => {
        navigate('/verify-otp', { 
          state: { 
            email, 
            name: isLogin ? '' : name, 
            password, 
            isLogin 
          } 
        });
      }, 1000);
      
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-emerald-50 px-4 py-20">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-emerald-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '2s'}}></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-float" style={{animationDelay: '4s'}}></div>
      </div>
      
      <div className="w-full max-w-4xl flex rounded-2xl shadow-2xl overflow-hidden">
        {/* Left side: Form */}
        <div className="bg-white w-full md:w-1/2 p-8 lg:p-12" data-aos="fade-right">
          <div className="mb-8">
            <Link to="/" className="flex items-center">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="ml-2 text-gray-600 hover:text-gray-800">Back to Home</span>
            </Link>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-800 mb-2">
            {isLogin ? 'Welcome Back!' : 'Create Account'}
          </h2>
          <p className="text-gray-600 mb-8">
            {isLogin ? 'Sign in to access your account' : 'Sign up to get started with Luxor Stays'}
          </p>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded" data-aos="fade-up">
              <p className="font-medium">Error</p>
              <p className="text-sm">{error}</p>
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 border-l-4 border-green-500 text-green-700 rounded" data-aos="fade-up">
              <p className="font-medium">Success</p>
              <p className="text-sm">{success}</p>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div data-aos="fade-up" data-aos-delay="100">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="John Smith"
                  />
                </div>
              </div>
            )}
            
            <div data-aos="fade-up" data-aos-delay={isLogin ? "100" : "200"}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="example@email.com"
                />
              </div>
            </div>
            
            <div data-aos="fade-up" data-aos-delay={isLogin ? "200" : "300"}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            {!isLogin && (
              <div data-aos="fade-up" data-aos-delay="400">
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-300"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            )}
            
            {isLogin && (
              <div className="flex items-center justify-between" data-aos="fade-up" data-aos-delay="300">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>
                <div className="text-sm">
                  <a href="#" className="font-medium text-emerald-600 hover:text-emerald-500">
                    Forgot password?
                  </a>
                </div>
              </div>
            )}
            
            <div data-aos="fade-up" data-aos-delay={isLogin ? "400" : "500"}>
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-lg text-white font-medium transition-all duration-300 ${
                  loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg hover:shadow-xl'
                }`}
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Processing...
                  </div>
                ) : (
                  isLogin ? 'Sign In' : 'Create Account'
                )}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center" data-aos="fade-up" data-aos-delay={isLogin ? "500" : "600"}>
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                }}
                className="ml-1 font-medium text-emerald-600 hover:text-emerald-500 transition-colors"
              >
                {isLogin ? 'Sign Up' : 'Sign In'}
              </button>
            </p>
          </div>
          
          {isLogin && (
            <div className="mt-6" data-aos="fade-up" data-aos-delay="600">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or continue with
                  </span>
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-2 gap-3">
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972a6.033 6.033 0 110-12.064c1.498 0 2.866.549 3.921 1.453l2.814-2.814A9.969 9.969 0 0012.545 2C7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748l-9.426-.013z" />
                    </svg>
                  </a>
                </div>
                
                <div>
                  <a
                    href="#"
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M20 10c0-5.523-4.477-10-10-10S0 4.477 0 10c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V10h2.54V7.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V10h2.773l-.443 2.89h-2.33v6.988C16.343 19.128 20 14.991 20 10z" clipRule="evenodd" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Right side: Image */}
        <div className="hidden md:block md:w-1/2 bg-cover bg-center" style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1561501900-3701fa6a0864?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1470&q=80')`
        }} data-aos="fade-left">
          <div className="w-full h-full bg-gradient-to-t from-black/60 via-black/30 to-transparent flex flex-col justify-end p-12">
            <div className="text-white" data-aos="fade-up" data-aos-delay="300">
              <h3 className="text-2xl font-bold mb-3">Luxurious Villa Experiences</h3>
              <p className="mb-6">Experience the finest luxury villas and exceptional service with Luxor Holiday Home Stays.</p>
              <div className="flex items-center space-x-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-white overflow-hidden">
                      <img 
                        src={`https://randomuser.me/api/portraits/${i % 2 ? 'women' : 'men'}/${i + 40}.jpg`}
                        alt={`User ${i}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">Joined by 10,000+ customers</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default SignIn;
