import axios from 'axios'

// Backend API configuration - connects to the Node.js/Express backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 60000, // Increased timeout for AI analysis
})

// Request interceptor for logging
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      console.error(`[API Error] ${status}:`, data)
      
      // Create enhanced error with backend message
      const enhancedError = new Error(
        data?.error || data?.message || `Request failed with status ${status}`
      )
      enhancedError.code = data?.code || `HTTP_${status}`
      enhancedError.status = status
      enhancedError.response = error.response
      return Promise.reject(enhancedError)
    } else if (error.request) {
      // Request was made but no response received
      console.error('[API Error] No response received:', error.request)
      const networkError = new Error(
        'Unable to connect to the backend server. Please ensure the server is running on port 5000.'
      )
      networkError.code = 'NETWORK_ERROR'
      return Promise.reject(networkError)
    } else {
      // Something else happened
      console.error('[API Error]', error.message)
      return Promise.reject(error)
    }
  }
)

/**
 * Review code using the hybrid AI + Rule Engine backend
 * @param {string} code - The code to review
 * @param {string} language - Programming language (javascript, python, etc.)
 * @returns {Promise<Object>} Review results
 */
export const reviewCode = async (code, language = 'javascript') => {
  try {
    const response = await api.post('/review', { 
      code, 
      language: language.toLowerCase().trim() 
    })
    
    // Transform backend response to match frontend expectations
    const { data } = response.data
    
    return {
      summary: data.summary,
      overallScore: data.overallScore,
      issues: data.issues || [],
      securityWarnings: data.securityWarnings || [],
      suggestions: data.suggestions || [],
      optimizedCode: data.optimizedCode,
      reviewedAt: data.reviewedAt,
      // Include metadata for debugging
      _metadata: data.metadata || response.data.metadata
    }
  } catch (error) {
    console.error('[reviewCode] Error:', error)
    throw error
  }
}

/**
 * Quick rule-based analysis (no AI, faster)
 * @param {string} code - The code to analyze
 * @param {string} language - Programming language
 * @returns {Promise<Object>} Quick analysis results
 */
export const quickReview = async (code, language = 'javascript') => {
  try {
    const response = await api.post('/review/quick', { 
      code, 
      language: language.toLowerCase().trim() 
    })
    
    return response.data.data
  } catch (error) {
    console.error('[quickReview] Error:', error)
    throw error
  }
}

/**
 * Get list of supported programming languages
 * @returns {Promise<Array>} Supported languages
 */
export const getSupportedLanguages = async () => {
  try {
    const response = await api.get('/review/supported-languages')
    return response.data.data
  } catch (error) {
    console.error('[getSupportedLanguages] Error:', error)
    // Return default languages on error
    return [
      { id: 'javascript', name: 'JavaScript' },
      { id: 'typescript', name: 'TypeScript' },
      { id: 'python', name: 'Python' },
      { id: 'java', name: 'Java' },
      { id: 'cpp', name: 'C++' },
    ]
  }
}

/**
 * Check backend health status
 * @returns {Promise<Object>} Health status
 */
export const checkHealth = async () => {
  try {
    const healthUrl = API_BASE_URL.replace('/api', '') + '/health'
    const response = await axios.get(healthUrl, { timeout: 5000 })
    return response.data
  } catch (error) {
    return { 
      success: false, 
      error: 'Backend unavailable',
      details: error.message 
    }
  }
}

export default api
