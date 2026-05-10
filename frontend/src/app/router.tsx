import { AppLayout } from '@presentation/components/AppLayout'
import { ProtectedRoute } from '@presentation/components/ProtectedRoute'
import { DashboardPage } from '@presentation/pages/DashboardPage'
import { JobDetailPage } from '@presentation/pages/JobDetailPage'
import { LoginPage } from '@presentation/pages/LoginPage'
import { UploadPage } from '@presentation/pages/UploadPage'
import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from 'react-router-dom'

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'upload', element: <UploadPage /> },
          { path: 'jobs/:jobId', element: <JobDetailPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
])

export function AppRouter() {
  return <RouterProvider router={router} />
}
