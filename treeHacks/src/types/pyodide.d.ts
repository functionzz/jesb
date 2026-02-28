declare module '@/pyodide' {
  export class Pyodide {
    static instance: Pyodide | null
    pyodide: unknown
    outputCallback: ((text: string) => void) | null

    static getInstance(): Pyodide
    setOutput(callback: (text: string) => void): void
    init(): Promise<unknown>
    run(code: string): Promise<void>
  }
}
