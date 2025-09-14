"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createPage, updatePage, deletePage } from "@/app/actions";

export default function EditPage({ params }: { params: { id: string } }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [date, setDate] = useState("");
    const [group, setGroup] = useState("");
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const router = useRouter();

    // Load content data when component mounts or ID changes
    useEffect(() => {
        const loadContent = async () => {
            try {
                setIsLoading(true);
                
                if (params.id !== "new") {
                    // Since we don't have a getter function, we'll just set some default values
                    // In a real app, you would fetch the content here
                    setTitle('');
                    setDescription('');
                    setGroup('');
                    setPreviewUrl(null);
                }
                
            } catch (error) {
                console.error("Error loading content:", error);
                setMessage("Failed to load content. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        loadContent();
    }, [params.id]);

    function handleMediaChange(e: React.ChangeEvent<HTMLInputElement>) {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            // For now, just create a preview URL
            // In a real app, you would upload the file to a storage service
            // and get back a URL to store in the database
            const fileUrl = URL.createObjectURL(selectedFile);
            setPreviewUrl(fileUrl);
            
            // In a real implementation, you would upload the file here
            // and update the previewUrl with the actual URL from the storage service
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        
        try {
            setIsLoading(true);
            
            const contentData = {
                title,
                slug: title.toLowerCase().replace(/\s+/g, '-'),
                content: description,
                category: group,
                imageUrl: previewUrl || undefined,
                metadata: {}
            };

            if (params.id === 'new') {
                const formData = new FormData();
                formData.append('title', contentData.title);
                formData.append('content', contentData.content);
                formData.append('category', contentData.category);
                if (contentData.imageUrl) {
                    formData.append('imageUrl', contentData.imageUrl);
                }
                
                await createPage(formData);
                setMessage("Content created successfully!");
                setTimeout(() => router.push("/admin"), 1500);
            } else {
                // For update, we'll just use the ID from the URL
                const formData = new FormData();
                formData.append('id', params.id);
                formData.append('title', contentData.title);
                formData.append('content', contentData.content);
                formData.append('category', contentData.category);
                if (contentData.imageUrl) {
                    formData.append('imageUrl', contentData.imageUrl);
                }
                
                await updatePage(formData);
                setMessage("Content updated successfully!");
            }
        } catch (error) {
            console.error("Error saving content:", error);
            setMessage("Failed to save content. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }

    async function handleDelete() {
        if (params.id === "new") return;
        
        if (!confirm("Are you sure you want to delete this content?")) return;
        
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('id', params.id);
            await deletePage(formData);
            setMessage("Content deleted successfully!");
            setTimeout(() => router.push("/admin"), 1500);
        } catch (error) {
            console.error("Error deleting content:", error);
            setMessage("Failed to delete content");
            setIsLoading(false);
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 flex flex-col items-center">
            <div className="max-w-2xl w-full bg-white p-6 md:p-8 rounded-lg shadow-md mb-8">
                <div className="flex items-center mb-6">
                    <button
                        className="text-primary hover:text-primary/80 flex items-center gap-2 transition-colors"
                        onClick={() => router.back()}
                        disabled={isLoading}
                        aria-label="Go Back"
                    >
                        <ArrowLeft size={20} />
                        <span className="hidden sm:inline">Back</span>
                    </button>
                    <h1 className="text-xl font-bold ml-4">
                        {params.id === "new" ? "Create New Content" : "Edit Content"}
                    </h1>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {message && (
                        <div className={`p-3 rounded ${
                            message.includes("success") 
                                ? "bg-green-100 text-green-700" 
                                : "bg-red-100 text-red-700"
                        }`}>
                            {message}
                        </div>
                    )}
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            required
                            disabled={isLoading}
                        />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Media
                        </label>
                        <div className="mt-1">
                            <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary inline-block">
                                Choose File
                                <input 
                                    type="file" 
                                    className="sr-only" 
                                    onChange={handleMediaChange}
                                    disabled={isLoading}
                                    accept="image/*,video/*"
                                />
                            </label>
                            <span className="ml-3 text-sm text-gray-500">
                                {file ? file.name : (params.id === "new" ? "No file chosen" : "No file selected")}
                            </span>
                            {previewUrl && (
                                <div className="mt-2">
                                    {file?.type.startsWith('image/') ? (
                                        <img src={previewUrl} alt="Preview" className="max-h-40 rounded" />
                                    ) : file?.type.startsWith('video/') ? (
                                        <video src={previewUrl} controls className="max-h-40 rounded" />
                                    ) : null}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Location
                            </label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                disabled={isLoading}
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700">
                                Date
                            </label>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                    
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-gray-700">
                            Content Group <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={group}
                            onChange={(e) => setGroup(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            required
                            disabled={isLoading}
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
                    
                    <div className="flex flex-col space-y-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {params.id === "new" ? "Creating..." : "Saving..."}
                                </>
                            ) : params.id === "new" ? (
                                "Create Content"
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                        
                        {params.id !== "new" && (
                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isLoading ? "Deleting..." : "Delete Content"}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
