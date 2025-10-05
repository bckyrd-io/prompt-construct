"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User } from "lucide-react";
import { getContents } from "@/app/actions";
import type { ContentItem } from "@/app/actions";

export default function AdminPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [contents, setContents] = useState<ContentItem[]>([]);

  useEffect(() => {
    // Only run on client-side
    if (typeof window === 'undefined') return;
    
    const checkAuth = async () => {
      const auth = localStorage.getItem("auth");
      if (auth === "true") {
        setAuthenticated(true);
        try {
          // Fetch contents using server action
          const result = await getContents();
          if (result.success && result.data) {
            setContents(result.data);
          }
        } catch (error) {
          console.error("Error fetching pages:", error);
        }
      } else {
        router.replace("/login");
      }
      setIsLoading(false);
    };

    const timer = setTimeout(checkAuth, 100);
    return () => clearTimeout(timer);
  }, [router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, we'll redirect in the useEffect
  // This prevents flash of content before redirect
  if (!authenticated) {
    return null;
  }

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.dataTransfer.setData("text/plain", idx.toString());
  }
  
  function handleDrop(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (dragIndex === idx) return;
    
    const newContents = [...contents];
    const [dragged] = newContents.splice(dragIndex, 1);
    newContents.splice(idx, 0, dragged);
    setContents(newContents);
    
 
  }
  
  function handleDragOver(e: React.DragEvent<HTMLLIElement>) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-2xl mx-auto bg-white p-4 sm:p-8 pt-2 rounded shadow-none">
        <div className="flex items-center mb-6">
          <button
            className="text-primary hover:text-secondary flex items-center gap-2"
            onClick={() => router.back()}
            aria-label="Go Back"
          >
            <User size={24} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
        <ul className="mb-8">
          {contents.length > 0 ? (
            contents.map((content, idx) => (
              <li
                key={content.id}
                className="flex justify-between items-center py-2 border-b cursor-move"
                draggable
                onDragStart={(e) => handleDragStart(e, idx)}
                onDrop={(e) => handleDrop(e, idx)}
                onDragOver={handleDragOver}
              >
                <span className="flex items-center gap-2">
                  {content.title}
                  {content.category && (
                    <span className="ml-2 inline-flex items-center rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-700">
                      {content.category}
                    </span>
                  )}
                </span>
                <Link
                  href={`/admin/${content.id}`}
                  className="border border-primary text-primary px-3 py-1 rounded hover:bg-secondary hover:text-white text-sm"
                >
                  Edit
                </Link>
              </li>
            ))
          ) : (
            <li className="py-4 text-center text-gray-500">
              Empty
            </li>
          )}
        </ul>
        <Link
          href="/admin/new"
          className="block w-full bg-primary text-white px-4 py-2 rounded text-center font-semibold hover:bg-primary/90"
        >
          Create New Content
        </Link>
      </div>
    </div>
  );
}

