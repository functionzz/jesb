import { useEffect, useRef, useState } from "react";
import { Tldraw, Editor } from "tldraw";
import "tldraw/tldraw.css";
import { CodeBlockUtil, CodeBlockTool } from "../shapes/CodeBlock";
import { useNavigate, useSearchParams } from "react-router-dom";
import { touchCanvas, upsertCanvas } from "@/lib/canvasStore";

const customShapeUtils = [CodeBlockUtil];
const customTools = [CodeBlockTool];

const API_BASE = "http://localhost:8000";

export default function CanvasPage() {
  async function fetchData(url: string) {
    try {
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Fetch error:", error);
      return null;
    }
  }

  const editorRef = useRef<Editor | null>(null);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeCanvasId, setActiveCanvasId] = useState<string | null>(null);

  const canvasId = searchParams.get("id");
  useEffect(() => {
    if (canvasId) {
      setActiveCanvasId(canvasId);
    }
  }, [canvasId]);

  const createCanvas = async () => {
    try {
      const response = await fetch(`${API_BASE}/canvas/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Canvas" }),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || "unknown error"}`
        );
      }
      const data = await response.json();
      if (data?.id) {
        upsertCanvas({
          id: data.id,
          name: data.name ?? "Untitled Canvas",
          updatedAt: new Date().toISOString(),
        });
        navigate(`/canvas?id=${data.id}`, { replace: true });
      }
    } catch (error) {
      console.error("Error creating canvas:", error);
    }
  };

  const loadShapes = (id: string) => {
    const apiUrl = `${API_BASE}/canvas/${id}/shapes`;
    fetchData(apiUrl).then((shapeData) => {
      if (!editorRef.current) return;
      if (shapeData && shapeData.length > 0) {
        const shapes = shapeData.map((s: { data: object }) => s.data);
        editorRef.current.createShapes(shapes);
      }
    });
  };

  const handleMount = (editor: Editor) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (!activeCanvasId || !editorRef.current) return;
    loadShapes(activeCanvasId);
  }, [activeCanvasId]);

  const exportShapes = () => {
    if (!editorRef.current || !activeCanvasId) return;

    // Get all shapes on current page
    const shapes = editorRef.current.getCurrentPageShapes();

    // Serialize to JSON
    const json = JSON.stringify(shapes, null, 2);

    const apiUrl = `${API_BASE}/canvas/${activeCanvasId}/shapes`;
    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: json,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        console.log("Shapes successfully saved:", data);
        touchCanvas(activeCanvasId);
      })
      .catch((error) => {
        console.error("Error saving shapes:", error);
      });
    console.log(json);
  };

  // on save, post TLShapes to API

  const selectCodeBlockTool = () => {
    editorRef.current?.setCurrentTool("code-block");
  };

  if (!activeCanvasId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 text-center max-w-md">
          <h2 className="text-2xl font-semibold text-slate-900">
            No canvas selected
          </h2>
          <p className="text-slate-600 mt-2">
            Create a new canvas to get started.
          </p>
          <button
            onClick={createCanvas}
            className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-lg font-semibold"
          >
            Create Canvas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ position: "fixed", inset: 0 }}>
      <Tldraw
        onMount={handleMount}
        shapeUtils={customShapeUtils}
        tools={customTools}
      />
      <div className="absolute bottom-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-slate-900 text-white px-4 py-2 rounded shadow"
        >
          Back to Dashboard
        </button>
        <button
          onClick={selectCodeBlockTool}
          className="bg-purple-500 text-white px-4 py-2 rounded shadow"
        >
          Code Block
        </button>
        <button
          onClick={exportShapes}
          className="bg-white px-4 py-2 text-white rounded shadow"
        >
          Save
        </button>
      </div>
    </div>
  );
}
