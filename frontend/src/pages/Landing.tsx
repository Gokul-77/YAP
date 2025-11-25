import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { MessageSquare, Video, Shield, ArrowRight, Mail, Lock, User, Check } from 'lucide-react';

export default function Landing() {
    const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
    const [isLoaded, setIsLoaded] = useState(false);
    const navigate = useNavigate();

    // Login State
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [loginLoading, setLoginLoading] = useState(false);

    // Signup State
    const [signupUsername, setSignupUsername] = useState('');
    const [signupEmail, setSignupEmail] = useState('');
    const [signupPassword, setSignupPassword] = useState('');
    const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
    const [signupError, setSignupError] = useState('');
    const [signupSuccess, setSignupSuccess] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);

    const { login, register } = useAuthStore();

    useEffect(() => {
        setIsLoaded(true);
    }, []);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setLoginLoading(true);

        try {
            await login(loginUsername, loginPassword);
            navigate('/dashboard');
        } catch (err: any) {
            setLoginError(err.message);
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setSignupError('');

        if (signupPassword !== signupConfirmPassword) {
            setSignupError('Passwords do not match');
            return;
        }

        setSignupLoading(true);

        try {
            await register(signupUsername, signupEmail, signupPassword);
            setSignupSuccess(true);
            setTimeout(() => {
                setAuthMode('login');
                setSignupSuccess(false);
                setSignupUsername('');
                setSignupEmail('');
                setSignupPassword('');
                setSignupConfirmPassword('');
            }, 2000);
        } catch (err: any) {
            setSignupError(err.message);
        } finally {
            setSignupLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[var(--deep-space)] text-white overflow-hidden flex flex-col md:flex-row relative">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* LEFT SIDE: Landing Content (60%) */}
            <div className={`w-full md:w-[60%] p-8 md:p-16 flex flex-col justify-center relative z-10 transition-all duration-1000 transform ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="max-w-2xl mx-auto md:mx-0 space-y-8">
                    {/* Brand */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--holographic-start)] to-[var(--holographic-end)] flex items-center justify-center shadow-lg shadow-purple-500/30">
                            <MessageSquare className="text-white" size={24} />
                        </div>
                        <span className="text-3xl font-bold tracking-tight">YAP</span>
                    </div>

                    {/* Hero Text */}
                    <div className="space-y-6">
                        <h1 className="text-5xl md:text-7xl font-bold leading-tight">
                            Connect Beyond <br />
                            <span className="gradient-text">Boundaries</span>
                        </h1>
                        <p className="text-xl text-gray-400 leading-relaxed max-w-lg">
                            Experience the next generation of real-time communication.
                            Secure chat, crystal-clear streaming, and seamless collaboration in one platform.
                        </p>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8">
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center mb-3 text-blue-400">
                                <MessageSquare size={20} />
                            </div>
                            <h3 className="font-semibold mb-1">Real-time Chat</h3>
                            <p className="text-sm text-gray-500">Instant messaging with WebSocket power</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center mb-3 text-purple-400">
                                <Video size={20} />
                            </div>
                            <h3 className="font-semibold mb-1">Live Streaming</h3>
                            <p className="text-sm text-gray-500">Broadcast to thousands with low latency</p>
                        </div>
                        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center mb-3 text-pink-400">
                                <Shield size={20} />
                            </div>
                            <h3 className="font-semibold mb-1">Secure Access</h3>
                            <p className="text-sm text-gray-500">Role-based security and encryption</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE: Auth Cards (40%) */}
            <div className={`w-full md:w-[40%] bg-black/20 backdrop-blur-xl border-l border-white/5 flex items-center justify-center p-6 relative z-20 transition-all duration-1000 delay-300 transform ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                <div className="w-full max-w-md relative h-[600px] flex items-center justify-center overflow-hidden">

                    {/* LOGIN CARD */}
                    <div
                        className={`absolute w-full bg-[#1a1f2e] border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500 ease-in-out ${authMode === 'login'
                                ? 'z-20 animate-slide-in-left'
                                : 'z-10 animate-slide-out-left pointer-events-none'
                            }`}
                        style={{
                            animationFillMode: 'forwards'
                        }}
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold mb-2">Welcome Back</h2>
                            <p className="text-gray-400">Enter your credentials to access your account</p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="text"
                                        value={loginUsername}
                                        onChange={(e) => setLoginUsername(e.target.value)}
                                        className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                        placeholder="Enter username"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                    <input
                                        type="password"
                                        value={loginPassword}
                                        onChange={(e) => setLoginPassword(e.target.value)}
                                        className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                        placeholder="Enter password"
                                        required
                                    />
                                </div>
                            </div>

                            {loginError && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                    {loginError}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loginLoading}
                                className="w-full py-4 bg-gradient-to-r from-[var(--holographic-start)] to-[var(--cosmic-purple)] rounded-xl font-bold text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loginLoading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Sign In <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center">
                            <p className="text-gray-400">
                                Don't have an account?{' '}
                                <button
                                    onClick={() => setAuthMode('signup')}
                                    className="text-[var(--holographic-start)] font-semibold hover:underline focus:outline-none"
                                >
                                    Sign Up
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* SIGNUP CARD */}
                    <div
                        className={`absolute w-full bg-[#1a1f2e] border border-white/10 p-8 rounded-3xl shadow-2xl transition-all duration-500 ease-in-out ${authMode === 'signup'
                                ? 'z-20 animate-slide-in-right'
                                : 'z-10 animate-slide-out-right pointer-events-none'
                            }`}
                        style={{
                            animationFillMode: 'forwards'
                        }}
                    >
                        {signupSuccess ? (
                            <div className="text-center py-12">
                                <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Check className="text-green-500" size={40} />
                                </div>
                                <h2 className="text-3xl font-bold mb-4">Account Created!</h2>
                                <p className="text-gray-400 mb-8">
                                    Your account has been successfully created. Redirecting to login...
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="text-center mb-8">
                                    <h2 className="text-3xl font-bold mb-2">Create Account</h2>
                                    <p className="text-gray-400">Join the future of communication</p>
                                </div>

                                <form onSubmit={handleSignup} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 ml-1">Username</label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="text"
                                                value={signupUsername}
                                                onChange={(e) => setSignupUsername(e.target.value)}
                                                className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                                placeholder="Choose username"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-gray-300 ml-1">Email</label>
                                        <div className="relative">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                            <input
                                                type="email"
                                                value={signupEmail}
                                                onChange={(e) => setSignupEmail(e.target.value)}
                                                className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                                placeholder="Enter email"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 ml-1">Password</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="password"
                                                    value={signupPassword}
                                                    onChange={(e) => setSignupPassword(e.target.value)}
                                                    className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                                    placeholder="Password"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-gray-300 ml-1">Confirm</label>
                                            <div className="relative">
                                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                                                <input
                                                    type="password"
                                                    value={signupConfirmPassword}
                                                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                                                    className="w-full bg-[#0e1118] border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-600 focus:outline-none focus:border-[var(--cosmic-purple)] focus:ring-1 focus:ring-[var(--cosmic-purple)] transition-all"
                                                    placeholder="Confirm"
                                                    required
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {signupError && (
                                        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm text-center">
                                            {signupError}
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={signupLoading}
                                        className="w-full py-4 bg-gradient-to-r from-[var(--cosmic-purple)] to-[var(--holographic-end)] rounded-xl font-bold text-white shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {signupLoading ? (
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        ) : (
                                            <>
                                                Create Account <ArrowRight size={18} />
                                            </>
                                        )}
                                    </button>
                                </form>

                                <div className="mt-8 text-center">
                                    <p className="text-gray-400">
                                        Already have an account?{' '}
                                        <button
                                            onClick={() => setAuthMode('login')}
                                            className="text-[var(--holographic-end)] font-semibold hover:underline focus:outline-none"
                                        >
                                            Sign In
                                        </button>
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
