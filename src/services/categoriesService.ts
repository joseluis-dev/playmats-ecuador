import { api } from './api'
import type { Category } from '@/types'

export interface CreateCategoryDto {
  name: string
  description: string
  color: string
}

export interface UpdateCategoryDto extends CreateCategoryDto {}

export const categoriesService = {
  async list(): Promise<Category[]> {
    return api.get<Category[]>('categories')
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
