import axios, { AxiosInstance } from 'axios'

class AuthApi {
  private api: AxiosInstance

  constructor() {
    this.api = axios.create({
      baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Add a request interceptor to include the access token in requests
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )

    // Add a response interceptor to handle token refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config
        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true
          const refreshToken = localStorage.getItem('refreshToken')
          try {
            const response = await this.refreshToken(refreshToken)
            localStorage.setItem('accessToken', response.data.accessToken)
            this.api.defaults.headers['Authorization'] =
              `Bearer ${response.data.accessToken}`
            return this.api(originalRequest)
          } catch (refreshError) {
            // If refresh token is invalid, logout the user
            this.logout()
            return Promise.reject(refreshError)
          }
        }
        return Promise.reject(error)
      }
    )
  }

  async login(email: string, password: string) {
    return this.api.post('/auth/login', { email, password })
  }

  async verifyTwoFactor(email: string, token: string) {
    return this.api.post('/auth/verify-2fa', { email, token })
  }

  async logout() {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    return this.api.post('/auth/logout')
  }

  async requestPasswordReset(email: string) {
    return this.api.post('/auth/request-reset', { email })
  }

  async resetPassword(token: string, newPassword: string) {
    return this.api.post('/auth/reset-password', { token, newPassword })
  }

  async confirmEmail(token: string) {
    return this.api.get(`/auth/confirm-email/${token}`)
  }

  private async refreshToken(refreshToken: string | null) {
    return this.api.post('/auth/refresh-token', { refreshToken })
  }

  async getProfile() {
    return this.api.get('/auth/profile')
  }

  async updateProfile(updatedProfile: any) {
    return this.api.put('/auth/profile', updatedProfile)
  }

  async verifyToken(token: string) {
    return this.api.post('/auth/verify-token', { token })
  }
}

export const authApi = new AuthApi()
