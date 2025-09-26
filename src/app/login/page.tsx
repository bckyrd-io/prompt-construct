"use client";
import { useState } from "react";
import { loginAction } from "../actions";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setIsLoading(true);
        setError("");
        
        const formData = new FormData();
        formData.append('username', username);
        formData.append('password', password);

        try {
            const result = await loginAction(formData);
            if (result.success) {
                // Set auth state in localStorage before redirecting
                if (typeof window !== 'undefined') {
                    localStorage.setItem('auth', 'true');
                }
                // Force a full page reload to ensure all components get the updated auth state
                window.location.href = '/admin';
            } else {
                setError(result.message || "Invalid credentials");
            }
        } catch (err) {
            console.error('Login error:', err);
            setError("An error occurred during login. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleLogin} className="rounded shadow-none w-full max-w-sm">
                {error && <div className="text-red-500 mb-4">{error}</div>}
                
                <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="w-full mb-4 px-3 py-2 border rounded"
                    required
                />
                <div className="relative mb-6">
                    <input
                        type={showPassword ? "text" : "password"}
                        placeholder="Password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="w-full px-3 py-2 border rounded pr-10"
                        required
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? (
                            <EyeOff className="h-5 w-5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </button>
                </div>
                <button 
                    type="submit" 
                    className="w-full bg-primary text-white py-2 rounded font-semibold"
                    disabled={isLoading}
                >
                    {isLoading ? 'Signing in...' : 'Login'}
                </button>
                <div className="mt-4">
                    <Link
                        href="/"
                        className="block w-full border border-primary text-primary py-2 rounded font-semibold text-center hover:bg-primary/10"
                    >
                        Home
                    </Link>
                </div>
            </form>
        </div>
    );
}
