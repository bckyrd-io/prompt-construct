"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, GripVertical } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [editableContents, setEditableContents] = useState([
    { id: 1, title: "Homepage Hero Text" },
    { id: 2, title: "About Section" },
    { id: 3, title: "Contact Info" }
  ]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const auth = localStorage.getItem("auth");
      if (auth === "true") {
        setAuthenticated(true);
      } else {
        router.push("/");
      }
    }
  }, [router]);

  if (!authenticated) return null;

  // Drag and drop handlers
  function handleDragStart(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.dataTransfer.setData("text/plain", idx.toString());
  }
  
  function handleDrop(e: React.DragEvent<HTMLLIElement>, idx: number) {
    e.preventDefault();
    const dragIndex = Number(e.dataTransfer.getData("text/plain"));
    if (dragIndex === idx) return;
    
    const items = [...editableContents];
    const [dragged] = items.splice(dragIndex, 1);
    items.splice(idx, 0, dragged);
    setEditableContents(items);
  }
  
  function handleDragOver(e: React.DragEvent<HTMLLIElement>) {
    e.preventDefault();
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-2xl mx-auto bg-white p-8 rounded shadow">
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
          {editableContents.map((content, idx) => (
            <li
              key={content.id}
              className="flex justify-between items-center py-2 border-b cursor-move"
              draggable
              onDragStart={e => handleDragStart(e, idx)}
              onDrop={e => handleDrop(e, idx)}
              onDragOver={handleDragOver}
            >
              <span className="flex items-center gap-2">
                <GripVertical size={18} className="text-gray-400" />
                {content.title}
              </span>
              <a href="/edit" className="border border-primary text-primary px-3 py-1 rounded hover:bg-secondary hover:text-white text-sm">
                Edit
              </a>
            </li>
          ))}
        </ul>
        <a 
          href="/edit" 
          className="block w-full bg-primary text-white px-4 py-2 rounded text-center font-semibold hover:bg-primary/90"
        >
          Go to Upload & Edit Forms
        </a>
      </div>
    </div>
  );
}