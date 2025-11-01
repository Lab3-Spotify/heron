// 通用類型定義

export interface ApiResponse<T = any> {
  data: T
  message: string
  success: boolean
}

export interface User {
  id: number
  name: string
  email: string
  avatar?: string
}

export interface MenuItem {
  id: string
  label: string
  path: string
  icon?: string
  children?: MenuItem[]
}

// 組件 Props 類型
export interface BaseComponentProps {
  class?: string
  style?: string | Record<string, any>
}

// API 相關類型
export interface PaginationParams {
  page: number
  pageSize: number
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
}
