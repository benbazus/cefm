import { signIn, signOut, fetchUserData } from '@/services/api'
import api from '@/services/api-client'
import { AuthResponse, User, UserResponse } from '@/types/types'
import { handleError } from '@/utils/helpers'
import {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

type AuthContext = {
  authToken: string | null
  currentUser: User | null
  logInUser: (
    email: string,
    password: string,
    code: string
  ) => Promise<AuthResponse>
  logOutUser: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContext | undefined>(undefined)

type AuthProviderProps = PropsWithChildren

export default function AuthProvider({ children }: AuthProviderProps) {
  const [authToken, setAuthToken] = useState<string | null>(() =>
    localStorage.getItem('accessToken')
  )
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState<boolean>(true)

  const fetchUser = useCallback(async () => {
    if (!authToken) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const user = (await fetchUserData()) as UserResponse
      // const { email } = user

      if (user) {
        setCurrentUser(user)
      } else {
        setCurrentUser(null)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
      }
    } catch (error) {
      handleError(error)
      setAuthToken(null)
      setCurrentUser(null)
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    } finally {
      setLoading(false)
    }
  }, [authToken])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  const logInUser = useCallback(
    async (
      email: string,
      password: string,
      code: string
    ): Promise<AuthResponse> => {
      setLoading(true)
      try {
        const response = (await signIn(email, password, code)) as AuthResponse

        if (response?.accessToken && response?.user) {
          const { accessToken, refreshToken, user } = response
          setAuthToken(accessToken || null)
          setCurrentUser(user)

          localStorage.setItem('accessToken', accessToken || '')
          localStorage.setItem('refreshToken', refreshToken || '')
          api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`
        }

        return response
      } catch (error) {
        handleError(error)
        setAuthToken(null)
        setCurrentUser(null)
        throw error
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const logOutUser = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken')
      if (refreshToken) {
        await signOut(refreshToken)
      }
    } catch (error) {
      console.error('Error during logout:', error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')

      api.defaults.headers.common['Authorization'] = ''
      setAuthToken(null)
      setCurrentUser(null)
    }
  }, [])
  return (
    <AuthContext.Provider
      value={{
        authToken,
        currentUser,
        logInUser,
        logOutUser,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth must be used inside of a AuthProvider')
  }

  return context
}
