'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { updatePage, deletePage, getContentById } from '@/app/actions';

type Tag = string;

interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message?: string;
}

interface Message {
  text: string;
  type: 'success' | 'error';
}

interface ContentData {
    id: number;
    title: string;
    slug: string;
    description?: string | null;
    content?: string | null;
    category?: string | null;
    tags?: string[] | null;
    featuredMedia?: string | null;
    isPublished?: boolean | null;
    createdAt: string;
    updatedAt: string | null;
    publishedAt?: Date | null;
    metadata?: unknown;
}

export default function EditPage({ params }: { params: { id: string } }) {
    // Get the ID from params and ensure it's a string
    const contentId = params.id === 'new' ? null : parseInt(params.id);
    const router = useRouter();
    const [contentData, setContentData] = useState<ContentData | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load content data
    useEffect(() => {
        const loadContent = async () => {
            if (!contentId) {
                setIsLoading(false);
                return;
            }
            
            setIsLoading(true);
            try {
                if (!isNaN(contentId)) {
                    const response = await getContentById(contentId) as ApiResponse<ContentData>;
                const { success, data } = response;
                    if (success && data) {
                        setContentData(data);
                        setTitle(data.title || '');
                        setContent(data.content || '');
                        setCategory(data.category || '');
                        setTags(Array.isArray(data.tags) ? data.tags : []);
                        setPreviewUrl(data.featuredMedia || null);
                        setIsLoading(false);
                    } else {
                        setMessage({ text: response.message || 'Failed to load content', type: 'error' });
                        setIsLoading(false);
                    }
                }
            } catch (error: any) {
                console.error('Error loading content:', error);
                setMessage({ text: 'Failed to load content', type: 'error' });
            } finally {
                setIsLoading(false);
            }
        };

        // Only load content if we have a valid ID
        if (contentId) {
            loadContent();
        } else {
            setIsLoading(false);
        }
    }, [contentId]);

    const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault();
            const newTag = tagInput.trim().replace(/,/g, '');
            if (newTag && !tags.includes(newTag)) {
                setTags([...tags, newTag]);
                setTagInput('');
            }
        }
    };

    const removeTag = (tagToRemove: Tag) => {
        setTags(tags.filter((tag: Tag) => tag !== tagToRemove));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
        }
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setMessage(null);
        setIsSaving(true);

        try {
            const formData = new FormData();
            formData.append('title', title);
            formData.append('category', category || '');
            formData.append('content', content || '');
            formData.append('id', params.id);
            
            tags.forEach((tag: Tag) => {
                formData.append('tags', tag);
            });

            if (file) {
                formData.append('file', file);
            }

            const result = await updatePage(formData);

            if (result?.success) {
                setMessage({ text: 'Content updated successfully!', type: 'success' });
                router.push('/admin');
                router.refresh();
            } else {
                setMessage({ text: result?.message || 'Failed to update content', type: 'error' });
            }
        } catch (error) {
            console.error('Error updating content:', error);
            setMessage({ text: 'An error occurred while updating the content', type: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                const formData = new FormData();
                formData.append('id', params.id);
                const result = await deletePage(formData);
                if (result?.success) {
                    router.push('/admin');
                    router.refresh();
                } else {
                    setMessage({ text: result?.message || 'Failed to delete content', type: 'error' });
                }
            } catch (error) {
                console.error('Error deleting content:', error);
                setMessage({ text: 'An error occurred while deleting the content', type: 'error' });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <p className="text-lg text-gray-600">Loading content...</p>
                </div>
            </div>
        );
    }

    const categories = [
        'Project',
        'Article',
        'Update',
        'News',
        'Tutorial'
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center justify-between">
                    <h1 className="text-2xl font-bold text-gray-900">
                        {contentData ? 'Edit Content' : 'Create New Content'}
                    </h1>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                        disabled={isSaving}
                    >
                        ← Back to Dashboard
                    </button>
                </div>
                
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    {message && (
                        <div className={`p-4 ${message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                            {message.text}
                        </div>
                    )}
                    
                    <form onSubmit={handleSubmit} className="divide-y divide-gray-200">
                        <div className="grid grid-cols-6 gap-6">
                            <div className="col-span-6">
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                                        Title <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="title"
                                        name="title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        required
                                    />
                                </div>


                                {/* Content */}
                                <div className="col-span-6">
                                    <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                                        Content <span className="text-red-500">*</span>
                                    </label>
                                    <textarea
                                        id="content"
                                        name="content"
                                        rows={10}
                                        value={content}
                                        onChange={(e) => setContent(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
                                        placeholder="Write your full content here..."
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                                        Category
                                    </label>
                                    <select
                                        id="category"
                                        name="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags */}
                                <div className="col-span-6 sm:col-span-3">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tags
                                    </label>
                                    <div className="mt-1">
                                        <div className="flex flex-wrap gap-2 mb-2">
                                            {tags.map((tag: Tag) => (
                                                <span
                                                    key={tag}
                                                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                                >
                                                    {tag}
                                                    <button
                                                        type="button"
                                                        onClick={() => removeTag(tag)}
                                                        className="ml-1.5 inline-flex text-primary/70 hover:text-primary focus:outline-none"
                                                        disabled={isSaving}
                                                    >
                                                        <X className="h-3 w-3" />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                        <div className="flex rounded-md shadow-sm">
                                            <input
                                                type="text"
                                                value={tagInput}
                                                onChange={(e) => setTagInput(e.target.value)}
                                                onKeyDown={handleTagKeyDown}
                                                placeholder="Add a tag and press Enter"
                                                className="block w-full rounded-none rounded-l-md border-gray-300 focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50 sm:text-sm"
                                                disabled={isSaving}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
                                                        setTags([...tags, tagInput.trim()]);
                                                        setTagInput('');
                                                    }
                                                }}
                                                className="inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 text-sm font-medium rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary"
                                                disabled={isSaving}
                                            >
                                                Add
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Featured Image */}
                                <div className="col-span-6">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Featured Image
                                    </label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                                        {previewUrl ? (
                                            <div className="space-y-1 text-center">
                                                <img
                                                    src={previewUrl}
                                                    alt="Preview"
                                                    className="mx-auto h-32 w-auto object-cover rounded-md"
                                                />
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                    >
                                                        <span>Change</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            ref={fileInputRef}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setPreviewUrl(null);
                                                            setFile(null);
                                                            if (fileInputRef.current) {
                                                                fileInputRef.current.value = '';
                                                            }
                                                        }}
                                                        className="ml-2 text-sm text-red-600 hover:text-red-800"
                                                    >
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <svg
                                                    className="mx-auto h-12 w-12 text-gray-400"
                                                    stroke="currentColor"
                                                    fill="none"
                                                    viewBox="0 0 48 48"
                                                    aria-hidden="true"
                                                >
                                                    <path
                                                        d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                        strokeWidth={2}
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                    />
                                                </svg>
                                                <div className="flex text-sm text-gray-600">
                                                    <label
                                                        htmlFor="file-upload"
                                                        className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary"
                                                    >
                                                        <span>Upload a file</span>
                                                        <input
                                                            id="file-upload"
                                                            name="file-upload"
                                                            type="file"
                                                            className="sr-only"
                                                            onChange={handleFileChange}
                                                            ref={fileInputRef}
                                                            accept="image/*"
                                                        />
                                                    </label>
                                                    <p className="pl-1">or drag and drop</p>
                                                </div>
                                                <p className="text-xs text-gray-500">
                                                    PNG, JPG, GIF up to 2MB
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Publish Status */}
                                <div className="col-span-6">
                                    <div className="flex items-start">
                                        <div className="flex items-center h-5">
                                            <input
                                                id="isPublished"
                                                name="isPublished"
                                                type="checkbox"
                                                defaultChecked={contentData?.isPublished || false}
                                                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                                disabled={isSaving}
                                            />
                                        </div>
                                        <div className="ml-3 text-sm">
                                            <label htmlFor="isPublished" className="font-medium text-gray-700">
                                                Publish this content
                                            </label>
                                            <p className="text-gray-500">This content will be visible to everyone when published.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="px-4 py-4 bg-gray-50 text-right sm:px-6">
                                {contentId && (
                                    <button
                                        type="button"
                                        onClick={handleDelete}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Deleting...' : 'Delete Content'}
                                    </button>
                                )}
                                <div className={`flex space-x-3 ${!contentId ? 'ml-auto' : ''}`}>
                                    <button
                                        type="button"
                                        onClick={() => router.back()}
                                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        disabled={isSaving}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                                        disabled={isSaving}
                                    >
                                        {isSaving ? 'Saving...' : (contentId ? 'Update Content' : 'Create Content')}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
