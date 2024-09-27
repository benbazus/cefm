import useAuth from '@/hooks/use-auth'
import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to='/login' state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default PrivateRoute
