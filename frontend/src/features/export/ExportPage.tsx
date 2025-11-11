import { FC } from 'react'

const ExportPage: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Export</h2>
        <p className="text-slate-600">
          Review and export your deck to Anki or share with others.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12">
          <p className="text-slate-400">Placeholder for export options</p>
        </div>
      </div>
    </div>
  )
}

export default ExportPage
