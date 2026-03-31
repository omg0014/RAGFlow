const RAW_API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''
const API_BASE_URL = RAW_API_BASE_URL.replace(/\/+$/, '')

function withBase(path) {
    if (!API_BASE_URL) return path
    if (path.startsWith('/')) return `${API_BASE_URL}${path}`
    return `${API_BASE_URL}/${path}`
}

export async function askQuestion(question) {
    let response
    try {
        response = await fetch(withBase('/ask'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        })
    } catch (error) {
        throw new Error('Unable to reach the API. Make sure the backend is running on http://localhost:8000 or set VITE_API_BASE_URL.')
    }

    if (!response.ok) {
        const error = await response.json().catch(() => ({}))
        throw new Error(error.detail || 'Failed to get response from server')
    }

    return response.json()
}

export async function checkHealth() {
    const response = await fetch(withBase('/health'))
    return response.json()
}
