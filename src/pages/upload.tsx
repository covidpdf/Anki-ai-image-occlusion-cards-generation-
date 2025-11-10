import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Upload, FileImage, AlertCircle } from 'lucide-react'

export function UploadPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Upload Images</h1>
        <p className="text-muted-foreground">
          Upload images to create occlusion cards for studying
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Upload className="h-5 w-5" />
            <span>Upload New Images</span>
          </CardTitle>
          <CardDescription>
            Drag and drop your images here or click to browse
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">Drop images here</p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports PNG, JPG, JPEG up to 10MB
            </p>
            <Button>Choose Files</Button>
          </div>
          
          <div className="flex items-start space-x-2 p-4 bg-muted/50 rounded-lg">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div className="text-sm text-muted-foreground">
              <p className="font-medium mb-1">Tips for best results:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-quality images with clear text or diagrams</li>
                <li>Ensure good contrast between elements</li>
                <li>Avoid images with complex backgrounds</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}