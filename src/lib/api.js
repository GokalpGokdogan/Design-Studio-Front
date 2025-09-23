import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
})



api.interceptors.response.use(
  (response) => response.data, // unwrap data directly
  (error) => {
    console.error("API error:", error)
    return Promise.reject(error)
  }
)

// === API helpers ===
export const generateDesign = (prompt) =>
  api.post(
    "/generate-design",
    { prompt: prompt.trim() }
  )


export default api
