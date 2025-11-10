import { useToast } from '@/hooks/use-toast'

export function useErrorHandler() {
  const { toast } = useToast()

  const handleError = (error: unknown, fallbackMessage = 'An error occurred') => {
    console.error('Error:', error)
    
    let message = fallbackMessage
    if (error instanceof Error) {
      message = error.message
    } else if (typeof error === 'string') {
      message = error
    }

    toast({
      title: 'Error',
      description: message,
      variant: 'destructive',
    })
  }

  const handleSuccess = (message: string) => {
    toast({
      title: 'Success',
      description: message,
    })
  }

  return { handleError, handleSuccess }
}