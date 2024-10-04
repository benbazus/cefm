import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-app-state'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { authToken, loading } = useAuth()
  const location = useLocation()

  console.log(' +++++++++ ProtectedRoute +++++++++++++  ')
  console.log(loading)
  console.log(authToken)
  console.log(' +++++++ ProtectedRoute ++++++++++++++  ')

  if (loading) {
    // You can replace this with a loading spinner or component
    return <div>Loading...</div>
  }

  if (!authToken) {
    // Redirect to login page if not authenticated
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
