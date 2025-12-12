import { useState } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup
} from "firebase/auth";
import { auth, googleProvider } from "./firebase/firebase";
import { Mail, Lock, Activity, Chrome, UserPlus, LogIn, AlertCircle } from "lucide-react";

export default function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRegister, setIsRegister] = useState(false);

  const login = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      onLogin(res.user);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const register = async () => {
    if (!email || !password) {
      setError("Please enter both email and password");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await createUserWithEmailAndPassword(auth, email, password);
      onLogin(res.user);
    } catch (err) {
      setError(getErrorMessage(err.code));
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await signInWithPopup(auth, googleProvider);
      onLogin(res.user);
    } catch (err) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setError(getErrorMessage(err.code));
      }
    } finally {
      setLoading(false);
    }
  };

  const getErrorMessage = (code) => {
    switch (code) {
      case 'auth/email-already-in-use':
        return 'This email is already registered. Please login instead.';
      case 'auth/invalid-email':
        return 'Invalid email address';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/user-not-found':
        return 'No account found with this email';
      case 'auth/wrong-password':
        return 'Incorrect password';
      case 'auth/popup-closed-by-user':
        return 'Login cancelled';
      default:
        return 'An error occurred. Please try again.';
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegister) {
      register();
    } else {
      login();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-blue-500 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full shadow-lg mb-4 animate-bounce">
            <Activity className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">NutriDash Pro</h1>
          <p className="text-purple-100 text-lg">Your Personal Nutrition Hub</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h2>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {/* Google Login */}
          <button
            onClick={googleLogin}
            disabled={loading}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center space-x-3 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Chrome className="w-5 h-5 text-blue-500" />
            <span>Continue with Google</span>
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">Or continue with email</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  disabled={loading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition"
                  disabled={loading}
                />
              </div>
              {isRegister && (
                <p className="mt-2 text-xs text-gray-500">Password must be at least 6 characters</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  <span>Please wait...</span>
                </>
              ) : (
                <>
                  {isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />}
                  <span>{isRegister ? 'Create Account' : 'Sign In'}</span>
                </>
              )}
            </button>
          </form>

          {/* Toggle Login/Register */}
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegister(!isRegister);
                setError("");
              }}
              className="text-purple-600 hover:text-purple-700 font-medium text-sm"
              disabled={loading}
            >
              {isRegister
                ? 'Already have an account? Sign in'
                : "Don't have an account? Create one"
              }
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-purple-100 text-sm mt-6">
          Secure authentication powered by Firebase
        </p>
      </div>
    </div>
  );
}

