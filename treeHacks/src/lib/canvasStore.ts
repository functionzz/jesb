export type CanvasMeta = {
  id: string;
  name: string;
  updatedAt: string;
  createdAt?: string;
  lastOpenedAt?: string;
};

const STORAGE_KEY = "treehacks_canvases";
const PREVIEW_STORAGE_KEY = "treehacks_canvas_previews";

function safeParse(value: string | null): CanvasMeta[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as CanvasMeta[];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && typeof item.id === "string");
  } catch {
    return [];
  }
}

export function loadCanvases(): CanvasMeta[] {
  return safeParse(localStorage.getItem(STORAGE_KEY));
}

export function upsertCanvas(meta: CanvasMeta) {
  const list = loadCanvases();
  const next = [meta, ...list.filter((c) => c.id !== meta.id)];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeCanvas(id: string) {
  const list = loadCanvases();
  const next = list.filter((canvas) => canvas.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));

  const previews = loadCanvasPreviews();
  if (id in previews) {
    const nextPreviews = { ...previews };
    delete nextPreviews[id];
    localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(nextPreviews));
  }
}

export function touchCanvas(id: string, name = "Untitled Canvas") {
  const now = new Date().toISOString();
  const existing = loadCanvases().find((canvas) => canvas.id === id);
  upsertCanvas({
    id,
    name,
    updatedAt: now,
    createdAt: existing?.createdAt ?? now,
    lastOpenedAt: now,
  });
}

function safeParsePreviewMap(value: string | null): Record<string, string> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as Record<string, string>;
    if (!parsed || typeof parsed !== "object") return {};
    return Object.fromEntries(
      Object.entries(parsed).filter(
        ([key, preview]) => typeof key === "string" && typeof preview === "string"
      )
    );
  } catch {
    return {};
  }
}

export function loadCanvasPreviews(): Record<string, string> {
  return safeParsePreviewMap(localStorage.getItem(PREVIEW_STORAGE_KEY));
}

export function saveCanvasPreview(id: string, previewDataUrl: string | null) {
  const previews = loadCanvasPreviews();
  const next = { ...previews };

  if (previewDataUrl) {
    next[id] = previewDataUrl;
  } else {
    delete next[id];
  }

  localStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(next));
}

export function loadCanvasPreview(id: string): string | null {
  return loadCanvasPreviews()[id] ?? null;
}
