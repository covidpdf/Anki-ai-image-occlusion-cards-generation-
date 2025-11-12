import type { FC } from 'react'
import UploadWizard from './UploadWizard'

const Upload: FC = () => {
  const handleUploadSuccess = (fileId: string) => {
    console.log('Upload successful with ID:', fileId)
  }

  return <UploadWizard onUploadSuccess={handleUploadSuccess} />
}

export default Upload
