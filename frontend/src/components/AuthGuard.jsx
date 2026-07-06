import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Skeleton } from './Skeleton'

export default function AuthGuard({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface">
        <div className="w-full max-w-sm space-y-4 p-6">
          <Skeleton className="h-10 w-48 mx-auto" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />
  return children
}
