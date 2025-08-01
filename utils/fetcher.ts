export type HTTPMethods = 'GET' | 'POST' | 'PUT' | 'DELETE'

export const fetcher = async (
  url: string,
  params: { method: HTTPMethods; body?: string | FormData } = { method: 'GET' }
) => {
  const response = await fetch(url, params)

  if (!response.ok) {
    let message = 'Something went wrong'

    const code = response.status

    try {
      const errorBody = await response.json()
      message = errorBody.message || response.statusText || 'Something went wrong'
    } catch (error) {
      console.error('Error parsing error response:', error)
    }

    throw { message, code }
  }

  return response.json()
}
