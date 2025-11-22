import { Link } from 'react-router-dom';

export default function Landing() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center p-4">
            <div className="max-w-4xl w-full text-center space-y-8">
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-8xl font-bold text-white drop-shadow-2xl">
                        YAP
                    </h1>
                    <p className="text-2xl md:text-3xl text-white/90 font-light">
                        Yet Another Platform
                    </p>
                    <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto">
                        A modern real-time communication platform with chat, streaming, and role-based access control
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Link
                        to="/register"
                        className="px-8 py-4 bg-white text-purple-600 rounded-xl font-semibold text-lg shadow-2xl hover:shadow-3xl hover:scale-105 transition-all duration-200"
                    >
                        Get Started
                    </Link>
                    <Link
                        to="/login"
                        className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-xl font-semibold text-lg hover:bg-white/20 transition-all duration-200"
                    >
                        Sign In
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-4xl mb-3">💬</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Real-Time Chat</h3>
                        <p className="text-white/80">Connect instantly with WebSocket-powered messaging</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-4xl mb-3">📺</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Live Streaming</h3>
                        <p className="text-white/80">Watch and host live events with paid/unpaid access</p>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                        <div className="text-4xl mb-3">🔐</div>
                        <h3 className="text-xl font-semibold text-white mb-2">Secure Access</h3>
                        <p className="text-white/80">Role-based permissions with admin approval</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
