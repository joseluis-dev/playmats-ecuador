// Use environment variable for API URL
const API_URL = import.meta.env.API_URL || 'http://localhost:3000'; // Default fallback if env variable is not set

export const api = {
  get: async <T>(endpoint: string): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'GET',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    const data = await response.json()
    return data
  },
  post: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return data
  },
  postForm: async (endpoint: string, formData: FormData) => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'POST',
      mode: 'cors',
      body: formData
    })
    const data = await response.json()
    return data
  },
  put: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'PUT',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return data
  },
  putForm: async (endpoint: string, formData: FormData) => {
    console.log({ formData })
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'PUT',
      mode: 'cors',
      body: formData
    })
    const data = await response.json()
    return data
  },
  patch: async <T>(endpoint: string, body: any): Promise<T> => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      method: 'PATCH',
      mode: 'cors',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(body)
    })
    const data = await response.json()
    return data
  },
  delete: async (endpoint: string) => {
    const response = await fetch(`${API_URL}/${endpoint}`, {
      mode: 'cors',
      method: 'DELETE'
    })
    return response.ok
  }
}
