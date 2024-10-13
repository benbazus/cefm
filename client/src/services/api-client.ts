// import axios, {
//   AxiosInstance,
//   AxiosRequestConfig,
//   AxiosResponse,
//   AxiosError,
// } from 'axios'
// import retry, { Options as RetryOptions } from 'async-retry'

// const API_URL = '/api'

// export interface ApiError extends Error {
//   response?: AxiosResponse
//   status?: number
// }

// // Create axios instances
// const createAxiosInstance = (isUseAuth: boolean): AxiosInstance => {
//   const instance = axios.create({
//     baseURL: API_URL,
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     withCredentials: isUseAuth,
//   })

//   if (isUseAuth) {
//     instance.interceptors.request.use(
//       (config) => {
//         const token = localStorage.getItem('accessToken')
//         if (token && config.headers) {
//           config.headers.Authorization = `Bearer ${token}`
//         }
//         return config
//       },
//       (error: AxiosError) => {
//         return Promise.reject(error)
//       }
//     )

//     instance.interceptors.response.use(
//       (response) => response,
//       async (error) => {
//         const originalRequest = error.config

//         if (error.response.status === 401 && !originalRequest._retry) {
//           originalRequest._retry = true

//           try {
//             const refreshToken = localStorage.getItem('refreshToken')

//             const response = await axios.post('/auth/refresh-token', {
//               refreshToken,
//             })
//             const { accessToken } = response.data

//             localStorage.setItem('accessToken', accessToken)
//             api.defaults.headers.common['Authorization'] =
//               `Bearer ${accessToken}`

//             return api(originalRequest)
//           } catch (refreshError) {
//             // Refresh token is invalid, logout the user
//             localStorage.removeItem('accessToken')
//             localStorage.removeItem('refreshToken')
//             window.location.href = '/login'
//             return Promise.reject(refreshError)
//           }
//         }

//         return Promise.reject(error)
//       }
//     )
//   }

//   return instance
// }

// const api = createAxiosInstance(true)
// const publicApi = createAxiosInstance(false)

// const retryOptions: RetryOptions = {
//   retries: 3,
//   factor: 2,
//   minTimeout: 1000,
//   maxTimeout: 30000,
//   onRetry: (err: Error, attempt: number) => {
//     console.warn(`Retry #${attempt} failed with error: ${err.message}`)
//   },
// }

// const axiosWithRetry = async <T>(
//   config: AxiosRequestConfig,
//   isUseAuth: boolean = true
// ): Promise<AxiosResponse<T>> => {
//   const axiosInstance = isUseAuth ? api : publicApi

//   return retry(async (bail) => {
//     try {
//       const response = await axiosInstance<T>(config)
//       return response
//     } catch (error) {
//       if (axios.isAxiosError(error) && error.response) {
//         if ([401, 402, 404].includes(error.response.status)) {
//           bail(error)
//           return Promise.reject(error)
//         }
//       }
//       throw error
//     }
//   }, retryOptions)
// }

// export const axiosRequest = async <T>(
//   config: AxiosRequestConfig,
//   isUseAuth: boolean = true
// ): Promise<AxiosResponse<T>> => {
//   try {
//     const response = await axiosWithRetry<T>(config, isUseAuth)
//     return response
//   } catch (error) {
//     if (axios.isAxiosError(error)) {
//       if (axios.isAxiosError(error) && error.response) {
//         if ([401, 402, 404].includes(error.response.status)) {
//           return Promise.reject(error)
//         }
//       }

//       const apiError: ApiError = new Error(error.message)
//       apiError.response = error.response
//       apiError.status = error.response?.status
//       throw apiError
//     } else {
//       console.error('An unexpected error occurred:', error)
//       throw error
//     }
//   }
// }

// export const publicAxiosRequest = async <T>(
//   config: AxiosRequestConfig
// ): Promise<AxiosResponse<T>> => {
//   return axiosRequest<T>(config, false)
// }

// export default api
import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from 'axios'
import retry, { Options as RetryOptions } from 'async-retry'

const API_URL = '/api'

export interface ApiError extends Error {
  response?: AxiosResponse
  status?: number
}

// Create axios instances
const createAxiosInstance = (isUseAuth: boolean): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
    withCredentials: isUseAuth,
  })

  if (isUseAuth) {
    instance.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('accessToken')
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error: AxiosError) => {
        return Promise.reject(error)
      }
    )

    instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        if (error.response.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true

          try {
            const refreshToken = localStorage.getItem('refreshToken')

            const response = await axios.post('/auth/refresh-token', {
              refreshToken,
            })
            const { accessToken } = response.data

            localStorage.setItem('accessToken', accessToken)
            api.defaults.headers.common['Authorization'] =
              `Bearer ${accessToken}`

            return api(originalRequest)
          } catch (refreshError) {
            // Refresh token is invalid, logout the user
            localStorage.removeItem('accessToken')
            localStorage.removeItem('refreshToken')
            window.location.href = '/login'
            return Promise.reject(refreshError)
          }
        }

        return Promise.reject(error)
      }
    )
  }

  return instance
}

const api = createAxiosInstance(true)
const publicApi = createAxiosInstance(false)

const retryOptions: RetryOptions = {
  retries: 3,
  factor: 2,
  minTimeout: 1000,
  maxTimeout: 30000,
  onRetry: (err: Error, attempt: number) => {
    console.warn(`Retry #${attempt} failed with error: ${err.message}`)
  },
}

const axiosWithRetry = async <T>(
  config: AxiosRequestConfig,
  isUseAuth: boolean = true
): Promise<AxiosResponse<T>> => {
  const axiosInstance = isUseAuth ? api : publicApi

  return retry(async (bail) => {
    try {
      const response = await axiosInstance<T>(config)
      return response
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if ([401, 402, 404].includes(error.response.status)) {
          bail(new Error('Record not found'))
          return Promise.reject(new Error('Record not found'))
        }
      }
      throw error
    }
  }, retryOptions)
}

export const axiosRequest = async <T>(
  config: AxiosRequestConfig,
  isUseAuth: boolean = true
): Promise<AxiosResponse<T>> => {
  try {
    const response = await axiosWithRetry<T>(config, isUseAuth)
    return response
  } catch (error) {
    if (axios.isAxiosError(error)) {
      if (axios.isAxiosError(error) && error.response) {
        if ([401, 402, 404].includes(error.response.status)) {
          return Promise.reject(new Error('Record not found'))
        }
      }

      const apiError: ApiError = new Error(error.message)
      apiError.response = error.response
      apiError.status = error.response?.status
      throw apiError
    } else {
      console.error('An unexpected error occurred:', error)
      throw error
    }
  }
}

export const publicAxiosRequest = async <T>(
  config: AxiosRequestConfig
): Promise<AxiosResponse<T>> => {
  return axiosRequest<T>(config, false)
}

export default api
