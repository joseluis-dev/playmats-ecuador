import { api } from './api'
import type { Resource } from '@/types'

export interface CreateResourceDto {
  name: string
  file?: File
}

export interface UpdateResourceDto {
  name: string
  file?: File
}

export interface ResourceWithRelations extends Resource {
  categories?: Array<{ id: number }>
  attributes?: Array<{ id: number }>
}

function buildForm(data: { name: string; file?: File }) {
  const formData = new FormData()
  formData.append('name', data.name)
  if (data.file) formData.append('file', data.file)
  return formData
}

export const resourcesService = {
  async list(params: Record<string, string> = {}): Promise<Resource[]> {
    if (params && Object.keys(params).length > 0) {
      const query = new URLSearchParams(params).toString()
      return api.get<Resource[]>(`resources?${query}`)
    }
    return api.get<Resource[]>('resources')
  },
  async get(id: number | string, include?: string[]): Promise<ResourceWithRelations> {
    const query = include && include.length > 0 ? `?include=${include.join(',')}` : ''
    return api.get<ResourceWithRelations>(`resources/${id}${query}`)
  },
  async create(data: CreateResourceDto): Promise<Resource> {
    return api.postForm('resources', buildForm(data)) as Promise<Resource>
  },
  async update(id: number | string, data: UpdateResourceDto): Promise<Resource> {
    return api.putForm(`resources/${id}`, buildForm(data)) as Promise<Resource>
  },
  async assignCategories(id: number | string, categoryIds: (number | string)[]): Promise<void> {
    await api.put(`resources/${id}/categories`, { categoryIds })
  },
  async assignAttributes(id: number | string, attributeIds: (number | string)[]): Promise<void> {
    await api.put(`resources/${id}/attributes`, { attributeIds })
  },
  async remove(id: number | string): Promise<void> {
    await api.delete(`resources/${id}`)
  }
}

export type ResourcesService = typeof resourcesService
