import axios from "axios"

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
})

api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error("API error:", error)
    return Promise.reject(error)
  }
)



// Auth APIs
export const createUser = (email, password) => api.post("/api/users", { email, password })
export const loginUser  = (email, password) => api.post("/api/login", { email, password })
export const logoutUser = () => api.post("/api/logout")
export const getMe      = () => api.get("/api/me") 




// Design APIs
export const generateDesign = (prompt) =>
  api.post("/api/generate-design", { prompt: prompt.trim() })

export const exportToFigma = (designData) =>
  api.post("/api/export", { designData: designData, projectId: -1 }) // Will update projectId later for better tracking



// Project APIs
export const getAllProjects = () =>
  api.get("/api/projects")

export const getProject = (projectId) =>
  api.get(`/api/projects/${projectId}`)

export const createProject = (projectData) =>
  api.post("/api/projects", projectData)

export const updateProject = (projectId, projectData) =>
  api.put(`/api/projects/${projectId}`, projectData)

export const deleteProject = (projectId) =>
  api.delete(`/api/projects/${projectId}`)

export const ensureStudioProject = () =>
  api.post("/api/studio/ensure-project")

export default api