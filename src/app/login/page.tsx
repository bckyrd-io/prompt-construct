"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        // Simple hardcoded authentication for demo
        if (username === "admin" && password === "password") {
            localStorage.setItem("auth", "true");
            router.push("/admin");
        } else {
            setError("Invalid credentials");
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
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="w-full mb-6 px-3 py-2 border rounded"
                    required
                />
                <button type="submit" className="w-full bg-primary text-white py-2 rounded font-semibold">Login</button>
            </form>
           
        </div>
    );
}
