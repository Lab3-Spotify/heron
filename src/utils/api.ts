import axios, { type AxiosResponse } from 'axios'
import type { ApiResponse } from '@/types'

// 創建 axios 實例
const api = axios.create({
  baseURL: import.meta.env.WALRUS_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 請求攔截器
api.interceptors.request.use(
  (config) => {
    // 在這裡可以添加認證 token
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 響應攔截器
api.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    return response
  },
  (error) => {
    // 統一錯誤處理
    if (error.response?.status === 401) {
      // 處理未授權錯誤
      console.error('未授權，請重新登入')
    } else if (error.response?.status >= 500) {
      // 處理伺服器錯誤
      console.error('伺服器錯誤，請稍後再試')
    }
    return Promise.reject(error)
  }
)

export default api

// 通用 API 函數
export const apiGet = <T = any>(url: string, params?: any) => 
  api.get<ApiResponse<T>>(url, { params })

export const apiPost = <T = any>(url: string, data?: any) => 
  api.post<ApiResponse<T>>(url, data)

export const apiPut = <T = any>(url: string, data?: any) => 
  api.put<ApiResponse<T>>(url, data)

export const apiDelete = <T = any>(url: string) => 
  api.delete<ApiResponse<T>>(url)
