"use client"

import { useState, useEffect, useCallback } from "react"
import InfiniteCanvas from "../components/InfiniteCanvas"
import {
  ArrowRightIcon,
  CloudArrowDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline"
import { generateDesign, exportToFigma, ensureStudioProject, updateProject } from "../../lib/api"
import { useAuth } from '@/hooks/useAuth'

async function generateDesignDataFromPrompt(prompt) {
  const trimmed = (prompt || "").trim()
  if (!trimmed) return null

  try {
    const res = await generateDesign(prompt)
    const data = res;
    
    return {
      figmaTokens: data.figmaTokens,
      artboard: data.artboard,
      tree: data.tree,
      floating: data.floating || [],
      meta: data.meta,
      ...data
    }
  } catch (err) {
    console.error("generateDesignDataFromPrompt failed:", err)
    return null
  }
}

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [canvasAPI, setCanvasAPI] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const { isAuthenticated, loading: authLoading } = useAuth()

  // Initialize project on first load
  useEffect(() => {
    const initializeProject = async () => {
      try {
        const projectData = await ensureStudioProject()
        setCurrentProject(projectData.project)
        
        // Load designs from project data if they exist
        if (projectData.project.designData && Array.isArray(projectData.project.designData)) {
          setDesigns(projectData.project.designData)
        }
      } catch (error) {
        console.error('Failed to initialize project:', error)
      }
    }

    if (isAuthenticated && !authLoading) {
      initializeProject()
    }
  }, [isAuthenticated, authLoading])

  useEffect(() => {
    const saved = localStorage.getItem("prompt")
    if (saved) setPrompt(saved)
  }, [])

  // Save designs to project when they change
  useEffect(() => {
    if (currentProject && designs.length > 0) {
      const saveProject = async () => {
        try {
          await updateProject(currentProject.project_id, {
            designData: designs,
            prompt: prompt || currentProject.prompt
          })
        } catch (error) {
          console.error('Failed to save project:', error)
        }
      }
      saveProject()
    }
  }, [designs, currentProject, prompt])

  const handleDesignsUpdate = useCallback((updatedDesigns) => {
    setDesigns(updatedDesigns)
  }, [])

  // Generate new design and add to canvas
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canvasAPI) return

    setLoading(true)
    try {
      const result = await generateDesignDataFromPrompt(prompt)
      if (result) {
        const position = {
          x: Math.random() * 400 + 100,
          y: Math.random() * 300 + 100
        }
        
        const newDesign = {
          id: `design_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          data: result,
          position: {
            ...position,
            width: result?.artboard?.width || 800,
            height: result?.artboard?.height || 600
          },
          timestamp: Date.now()
        }

        const updatedDesigns = [...designs, newDesign]
        setDesigns(updatedDesigns)

        // Update project with new design and prompt
        if (currentProject) {
          await updateProject(currentProject.project_id, {
            designData: updatedDesigns,
            prompt: prompt,
            title: prompt.substring(0, 50) + '...' || 'New Design'
          })
        }
        
        localStorage.removeItem("prompt")
        setPrompt("") 
      }
    } catch (err) {
      console.error('Failed to generate design:', err)
    }
    setLoading(false)
  }

  // Export all designs as JSON
  const handleExport = () => {
    const exportData = {
      version: "Latest",
      timestamp: new Date().toISOString(),
      designs: designs.map(design => ({
        id: design.id,
        data: design.data,
        position: design.position,
        timestamp: design.timestamp
      }))
    }

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `infinite-canvas-designs-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFigmaExport = () => {
    try {
      if (designs.length > 0) {
        const res = exportToFigma(designs[0].data)
        console.log(res)
      }
    } catch (e) {
      console.log("Err", e)
    }
  }

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all designs? This cannot be undone.')) {
      setDesigns([])
      
      // Also clear from project in database
      if (currentProject) {
        try {
          await updateProject(currentProject.project_id, {
            designData: [],
            prompt: ''
          })
        } catch (error) {
          console.error('Failed to clear project designs:', error)
        }
      }
    }
  }

  // Get the infinite canvas component and API
  const { canvasComponent, addDesign, removeDesign, centerView, transform, selectedDesignId } = InfiniteCanvas({
    designs,
    onDesignsUpdate: handleDesignsUpdate
  })

  // Set canvas API reference
  useEffect(() => {
    if (addDesign && removeDesign) {
      setCanvasAPI({ addDesign, removeDesign, centerView })
    }
  }, [addDesign, removeDesign, centerView])

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6b6]"></div>
      </div>
    )
  }

  // Redirect if not authenticated
  if (!isAuthenticated && !authLoading) {
    return (
      <div className="h-screen w-full overflow-hidden bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6b6] mx-auto mb-4"></div>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-gray-100">
      {/* Top toolbar */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left side - Logo/Title */}
          <div className="flex items-center gap-4">
            <h1 className="text-lg font-semibold text-gray-900">Design Studio</h1>
            <div className="text-sm text-gray-500">
              {designs.length} design{designs.length !== 1 ? 's' : ''}
              {currentProject && ` • ${currentProject.title}`}
            </div>
          </div>

          {/* Center - Prompt input */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-lg bg-gray-50 px-4 py-2 border border-gray-200 focus-within:border-[#06b6b6] focus-within:ring-1 focus-within:ring-blue-500"
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design idea…"
              className="w-[400px] bg-transparent text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="inline-flex items-center gap-1 rounded-md bg-[#06b6b6] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#06b6b6] disabled:opacity-50 disabled:cursor-not-allowed"
              title="Generate Design"
            >
              {loading ? 'Generating...' : 'Generate'} 
              <ArrowRightIcon className="h-3 w-3" />
            </button>
          </form>

          {/* Right side - Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 border border-gray-200 hover:bg-gray-100"
              title="Export All Designs"
              disabled={designs.length === 0}
            >
              <CloudArrowDownIcon className="h-4 w-4" />
              Export
            </button>
            
            <button
              onClick={handleFigmaExport}
              className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2 text-sm text-gray-700 border border-gray-200 hover:bg-gray-100"
              title="Export to Figma"
              disabled={designs.length === 0}
            >
              <CloudArrowDownIcon className="h-4 w-4" />
              Figma Export
            </button>

            <button
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200 hover:bg-red-100"
              title="Clear All Designs"
              disabled={designs.length === 0}
            >
              <TrashIcon className="h-4 w-4" />
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Canvas area */}
      <div className="absolute inset-0 top-16">
        {canvasComponent}
      </div>

      {/* Floating help panel */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 text-sm text-gray-600 max-w-xs z-40">
        <h3 className="font-medium text-gray-900 mb-2">Keyboard Shortcuts</h3>
        <div className="space-y-1">
          <div><kbd className="bg-gray-100 px-1 rounded text-xs">C</kbd> Center view</div>
          <div><kbd className="bg-gray-100 px-1 rounded text-xs">A</kbd> Align Items</div>
          <div><kbd className="bg-gray-100 px-1 rounded text-xs">R</kbd> Reset view</div>
          <div><kbd className="bg-gray-100 px-1 rounded text-xs">Scroll</kbd> Zoom in/out</div>
        </div>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#06b6b6]"></div>
              <span className="text-gray-700">Generating design...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}