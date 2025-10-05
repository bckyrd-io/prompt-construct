'use client';

import { useState, useRef, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, X } from 'lucide-react';
import { createContentAction } from '@/app/actions';
import Image from 'next/image';

export default function NewContentPage() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPublished, setIsPublished] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<string>('');

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

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
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
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('category', category || '');
      // Submit description as 'content' to match backend schema
      formData.append('content', description || '');
      formData.append('isPublished', String(isPublished));
      formData.append('locationName', locationName || '');

      tags.forEach(tag => {
        formData.append('tags', tag);
      });

      if (file) {
        formData.append('featuredImage', file);
      }

      const result = await createContentAction(formData);

      if (result?.success) {
        setMessage({ text: 'Content created successfully!', type: 'success' });
        router.push('/admin');
        router.refresh();
      } else {
        setMessage({ text: result?.message || 'Failed to create content', type: 'error' });
      }
    } catch (error) {
      console.error('Error creating content:', error);
      setMessage({ text: 'An error occurred while creating the content', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 pt-2 rounded shadow-none">
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
                disabled={isLoading}
              />
            </div>

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
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>

            <div className="col-span-6">
              <label className="block text-sm font-medium text-gray-700">Featured Media</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                {previewUrl ? (
                  <div className="relative">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      width={800}
                      height={600}
                      className="max-h-60 mx-auto rounded-md w-auto h-auto"
                      unoptimized
                    />
                    <button
                      type="button"
                      onClick={() => {
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

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="category"
                name="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border p-2"
                disabled={isLoading}
              >
                <option value="">Select a category</option>
                {['display1','display2','project','display3','service'].map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="col-span-6 sm:col-span-3">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700">Tags</label>
              <div className="mt-1 block w-full rounded-md border p-2 flex flex-wrap gap-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-1.5 inline-flex text-primary/70 "
                      disabled={isLoading}
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
                  disabled={isLoading}
                />
              </div>
            </div>

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
                    disabled={isLoading}
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
            type="submit"
            className="block w-full bg-primary text-white px-4 py-2 rounded text-center font-semibold hover:bg-primary/90 mt-2"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Content'}
          </button>
        </form>
      </div>
    </div>
  );
}

