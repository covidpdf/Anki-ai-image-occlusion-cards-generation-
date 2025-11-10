import { createBrowserRouter, Navigate } from 'react-router-dom'
import { Layout } from '@/components/layout'
import { HomePage } from '@/pages/home'
import { UploadPage } from '@/pages/upload'
import { DecksPage } from '@/pages/decks'
import { StudyPage } from '@/pages/study'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout><div></div></Layout>,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'upload',
        element: <UploadPage />,
      },
      {
        path: 'decks',
        element: <DecksPage />,
      },
      {
        path: 'study',
        element: <StudyPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
])