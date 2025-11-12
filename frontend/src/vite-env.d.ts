/// <reference types="vite/client" />

declare module '*.module.css' {
  const content: Record<string, string>
  export default content
}

declare module 'pdfjs-dist/build/pdf.worker?url' {
  const workerSrc: string
  export default workerSrc
}
