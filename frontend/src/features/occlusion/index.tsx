import type { FC } from 'react'

const Occlusion: FC = () => (
  <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
    <h2 className="text-lg font-semibold text-slate-900">Occlusion Editor</h2>
    <p className="mt-2 text-sm text-slate-600">
      Draw masks on images using canvas-based tooling to create dynamic occlusion exercises.
    </p>
  </section>
)

export default Occlusion
