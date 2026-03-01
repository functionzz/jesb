export type CanvasBackgroundPreset =
  | "paper"
  | "sunset"
  | "mint"
  | "midnight"
  | "dots-slate"
  | "dots-indigo"
  | "lines-sky"
  | "lines-graph"

export type CanvasExportFileV1 = {
  kind: "dataframe-canvas-export"
  version: 1
  exportedAt: string
  sourceCanvasId: string | null
  settings: {
    backgroundPreset: CanvasBackgroundPreset
  }
  tldrawSnapshot: unknown
}

export type ParsedCanvasImport = {
  snapshot: unknown
  shapesForApi: object[]
  backgroundPreset: CanvasBackgroundPreset | null
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function isCanvasBackgroundPreset(value: unknown): value is CanvasBackgroundPreset {
  return (
    value === 'paper' ||
    value === 'sunset' ||
    value === 'mint' ||
    value === 'midnight' ||
    value === 'dots-slate' ||
    value === 'dots-indigo' ||
    value === 'lines-sky' ||
    value === 'lines-graph'
  )
}

export function isCanvasExportFileV1(value: unknown): value is CanvasExportFileV1 {
  if (!isObjectRecord(value)) return false
  return (
    value.kind === 'dataframe-canvas-export' &&
    value.version === 1 &&
    'settings' in value &&
    'tldrawSnapshot' in value
  )
}

export function toCanvasExportFileName(canvasId: string | null) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return `canvas-${canvasId ?? 'unsaved'}-${stamp}.json`
}

function toShapeArray(value: unknown): object[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is object => isObjectRecord(item))
}

function extractShapesFromStoreMap(storeMap: Record<string, unknown>): object[] {
  return Object.values(storeMap).filter((record): record is object => {
    if (!isObjectRecord(record)) return false
    if (record.typeName !== 'shape') return false
    return !('isDeleted' in record && record.isDeleted === true)
  })
}

export function extractShapesFromSnapshot(snapshot: unknown): object[] {
  if (Array.isArray(snapshot)) {
    return toShapeArray(snapshot)
  }

  if (!isObjectRecord(snapshot)) return []

  if (Array.isArray(snapshot.shapes)) {
    return toShapeArray(snapshot.shapes)
  }

  if (isObjectRecord(snapshot.store)) {
    return extractShapesFromStoreMap(snapshot.store)
  }

  const document = snapshot.document
  if (isObjectRecord(document) && isObjectRecord(document.store)) {
    return extractShapesFromStoreMap(document.store)
  }

  return []
}

export function parseCanvasImportPayload(payload: unknown): ParsedCanvasImport {
  if (isCanvasExportFileV1(payload)) {
    return {
      snapshot: payload.tldrawSnapshot,
      shapesForApi: extractShapesFromSnapshot(payload.tldrawSnapshot),
      backgroundPreset: isCanvasBackgroundPreset(payload.settings.backgroundPreset)
        ? payload.settings.backgroundPreset
        : null,
    }
  }

  return {
    snapshot: payload,
    shapesForApi: extractShapesFromSnapshot(payload),
    backgroundPreset: null,
  }
}
