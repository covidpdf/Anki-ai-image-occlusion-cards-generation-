import { FC } from 'react'

const UploadPage: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Upload & OCR</h2>
        <p className="text-slate-600">
          Upload images and extract text using OCR technology.
        </p>
        <div className="rounded-lg border-2 border-dashed border-slate-200 bg-slate-50 p-12">
          <p className="text-slate-400">Placeholder for upload functionality</p>
        </div>
      </div>
    </div>
  )
}

export default UploadPage
