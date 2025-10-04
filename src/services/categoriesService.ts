import { api } from './api'
import type { Category } from '@/types'

export interface CreateCategoryDto {
  name: string
  description: string
  color: string
}

export interface UpdateCategoryDto extends CreateCategoryDto {}

export interface CategoryFilters {
  name?: string
  color?: string
  description?: string
  limit?: number
  offset?: number
  sortBy?: 'name' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

export const categoriesService = {
  async list(filters?: CategoryFilters): Promise<Category[]> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value))
        }
      })
    }
    
    const queryString = params.toString()
    const endpoint = queryString ? `categories?${queryString}` : 'categories'
    
    return api.get<Category[]>(endpoint)
  },
  async create(data: CreateCategoryDto): Promise<Category> {
    return api.post('categories', data) as Promise<Category>
  },
  async update(id: number | string, data: UpdateCategoryDto): Promise<Category> {
    return api.put(`categories/${id}`, data) as Promise<Category>
  },
  async remove(id: number | string): Promise<void> {
    await api.delete(`categories/${id}`)
  }
}

export type CategoriesService = typeof categoriesService
