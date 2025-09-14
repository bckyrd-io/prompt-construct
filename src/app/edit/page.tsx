"use client";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function EditPage() {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [group, setGroup] = useState("");
    const [message, setMessage] = useState("");
    const router = useRouter();

    function handleMediaChange() {
        // Media handling logic can be added here when needed
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setMessage("Content updated (demo only)");
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full bg-white p-8 rounded shadow mb-8">
                <div className="flex items-center mb-6">
                    <button
                        className="text-primary hover:text-primary/80 flex items-center gap-2"
                        onClick={() => router.back()}
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={24} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && <div className="mb-4 text-green-600">{message}</div>}
                    <div>
                        <label className="block mb-1 font-semibold">Title</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full border rounded p-2"
                            required
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Media</label>
                        <input
                            type="file"
                            onChange={handleMediaChange}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Location</label>
                        <input
                            type="text"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Date</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border rounded p-2"
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-semibold">Content Group</label>
                        <select
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className="w-full border rounded p-2"
                            required
                        >
                            <option value="">Select group</option>
                            <option value="hero">Hero Section</option>
                            <option value="media">Media/Video</option>
                            <option value="recent">Recent Works</option>
                            <option value="services">Services</option>
                            <option value="about">About</option>
                            <option value="contact">Contact</option>
                        </select>
                    </div>
                    <button
                        type="submit"
                        className="bg-primary w-full text-white px-4 py-2 rounded"
                    >
                        Update Content
                    </button>
                </form>
                {/* Delete Button */}
                <button
                    type="button"
                    className="mt-4 w-full bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 shadow-sm"
                    onClick={() => setMessage("Content deleted (demo only)")}
                >
                    Delete Content
                </button>
            </div>
        </div>
    );
}
