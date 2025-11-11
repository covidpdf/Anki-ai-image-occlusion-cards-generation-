import { FC } from 'react'

const OcclusionPage: FC = () => {
  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="w-full max-w-2xl space-y-4 text-center">
        <h2 className="text-2xl font-semibold text-slate-900">Occlusion Editor</h2>
        <p className="text-slate-600">
          Create occlusion masks to hide information for spaced repetition.
        </p>
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-12">
          <p className="text-slate-400">Placeholder for occlusion editor</p>
        </div>
      </div>
    </div>
  )
}

export default OcclusionPage
