const API_URL = 'http://localhost:8080'

export const api = {
  get: async (endpoint: string) => {
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
  post: async (endpoint: string, body: any) => {
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
  put: async (endpoint: string, body: any) => {
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
  patch: async (endpoint: string, body: any) => {
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
