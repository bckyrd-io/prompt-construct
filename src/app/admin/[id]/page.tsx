'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { ChevronLeft, X } from 'lucide-react';
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
    const [, setContentData] = useState<ContentData | null>(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('');
    const [tags, setTags] = useState<Tag[]>([]);
    const [tagInput, setTagInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [message, setMessage] = useState<Message | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isPublished, setIsPublished] = useState<boolean>(false);
    const [locationName, setLocationName] = useState<string>('');

    // Helper to resolve media URL from DB value
    const resolveMediaUrl = (value?: string | null) => {
        if (!value) return null;
        // If it's an absolute URL or already root-relative, use as-is
        if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
            return value;
        }
        // Otherwise, assume it lives under /uploads in public/
        return `/uploads/${value}`;
    };

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
                        setDescription(data.content || '');
                        setCategory(data.category || '');
                        setTags(Array.isArray(data.tags) ? data.tags : []);
                        setPreviewUrl(resolveMediaUrl(data.featuredMedia));
                        setIsPublished(Boolean(data.isPublished));
                        try {
                            const meta = (data.metadata as Record<string, unknown>) ?? {};
                            setLocationName(typeof meta?.locationName === 'string' ? meta.locationName : '');
                        } catch {}
                        setIsLoading(false);
                    } else {
                        setMessage({ text: response.message || 'Failed to load content', type: 'error' });
                        setIsLoading(false);
                    }
                }
            } catch (error) {
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
            const lowerExisting = tags.map(t => t.toLowerCase());
            if (newTag && !lowerExisting.includes(newTag.toLowerCase())) {
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
            // Submit description as 'content' to match backend schema
            formData.append('content', description || '');
            formData.append('id', params.id === 'new' ? '0' : params.id);
            formData.append('isPublished', String(isPublished));
            formData.append('locationName', locationName || '');

            tags.forEach((tag: Tag) => {
                formData.append('tags', tag);
            });

            if (file) {
                // Server expects the uploaded file under 'featuredImage'
                formData.append('featuredImage', file);
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
                setIsDeleting(true);
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
            } finally {
                setIsDeleting(false);
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
        'display1',
        'display2',
        'project',
        'display3',
        'service'
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-8 pt-0">
            <div className="max-w-2xl mx-auto bg-white p-8 pt-2 rounded shadow">
                <div className="flex items-center mb-6">
                    <button
                        className="text-primary hover:text-secondary flex items-center gap-2"
                        onClick={() => router.back()}
                        aria-label="Go Back"
                    >
                        <ChevronLeft size={24} />
                        <span className="hidden sm:inline">Back</span>
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
                                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="mt-1 block w-full rounded-md border p-2"
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="col-span-6">
                                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                                <textarea
                                    id="description"
                                    rows={2}
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="mt-1 block w-full rounded-md border p-2"
                                    placeholder="Write your description here..."
                                    required
                                />
                            </div>

                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="locationName" className="block text-sm font-medium text-gray-700">Location Name</label>
                                <input
                                    type="text"
                                    id="locationName"
                                    name="locationName"
                                    value={locationName}
                                    onChange={(e) => setLocationName(e.target.value)}
                                    className="mt-1 block w-full rounded-md border p-2"
                                    placeholder="e.g., San Francisco, CA"
                                    disabled={isSaving}
                                />
                            </div>



                            {/* Featured Image */}
                            <div className="col-span-6">
                                <label className="block text-sm font-medium text-gray-700">Featured Media</label>

                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">

                                    {previewUrl ? (
                                        <div className="relative">
                                            <Image
                                                src={previewUrl}
                                                alt="Preview"
                                                width={300}
                                                height={200}
                                                className="max-h-60 mx-auto rounded-md object-contain"
                                                style={{ height: 'auto' }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    // Clear preview entirely to show upload dropzone
                                                    setPreviewUrl(null);
                                                    setFile(null);
                                                    if (fileInputRef.current) {
                                                        fileInputRef.current.value = '';
                                                    }
                                                }}
                                                className="absolute top-0 right-0 p-1 bg-gray-800 rounded-full text-white hover:bg-gray-700 focus:outline-none"
                                                disabled={isLoading}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v12a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="mt-4 flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary/60 focus-within:outline-none"
                                                >
                                                    <span>Upload Media .</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        onChange={handleFileChange}
                                                        ref={fileInputRef}
                                                        accept="image/*"
                                                        disabled={isLoading}
                                                    />
                                                </label>
                                                <span> Or drag and drop</span>

                                            </div>
                                            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                                        </div>
                                    )}
                                </div>



                            </div>



                            {/* Category */}
                            <div className="col-span-6 sm:col-span-3">
                                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="mt-1 block w-full rounded-md border p-2"
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
                                <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>

                                <div className="mt-1 block w-full rounded-md border p-2 flex flex-wrap gap-2">
                                    {tags.map((tag: Tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                                        >
                                            {tag}
                                            <button
                                                type="button"
                                                onClick={() => removeTag(tag)}
                                                className="ml-1.5 inline-flex text-primary/70 "
                                                disabled={isSaving}
                                            >
                                                <X className="h-3 w-3" />
                                            </button>
                                        </span>
                                    ))}
                                    <input
                                        type="text"
                                        id="tags"
                                        value={tagInput}
                                        onChange={(e) => setTagInput(e.target.value)}
                                        onKeyDown={handleTagKeyDown}
                                        placeholder="Add a tag and press Enter"
                                        className="flex-1 min-w-[160px] outline-none"
                                        disabled={isSaving}
                                    />
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
                                            checked={isPublished}
                                            onChange={(e) => setIsPublished(e.target.checked)}
                                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                                            disabled={isSaving}
                                        />
                                    </div>
                                    <div className="ml-3 text-sm">
                                        <label htmlFor="isPublished" className="font-medium text-gray-700">
                                            Publish this content
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="block w-full bg-red-500 mb-2 mt-2 text-white px-4 py-2 rounded text-center font-semibold hover:bg-primary/90"
                            disabled={isSaving || isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Content'}
                        </button>

                        <button
                            type="submit"
                            className="block w-full bg-primary text-white px-4 py-2 rounded text-center font-semibold hover:bg-primary/90"
                            disabled={isSaving || isDeleting}
                        >
                            {isSaving ? 'Saving...' : (contentId ? 'Update Content' : 'Create Content')}
                        </button>


                    </form>
                </div>
            </div>
        </div>
    );
}
