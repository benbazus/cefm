import { useState, useEffect } from 'react'
import { fetchUserData } from '@/services/api'
import { useNavigate } from 'react-router-dom'
import { User } from '@/types/next-auth'
import { UserResponse } from '@/types/types'

const useUser = () => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userData: UserResponse | null = await fetchUserData()

        setUser(userData)
      } catch (err) {
        // Check if the error is an instance of Error and has a response
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if (err instanceof Error && (err as any)?.response?.status === 401) {
          navigate('/login', { replace: true })
        } else {
          setError('Failed to fetch user data')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [navigate])

  return { user, loading, error }
}

export default useUser
