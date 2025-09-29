"use client"

import { useState, useEffect, useCallback } from "react"
import InfiniteCanvas from "../components/InfiniteCanvas"
import {
  ArrowRightIcon,
  CloudArrowDownIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  CheckIcon,
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

export default function Studio() {
  const [prompt, setPrompt] = useState("")
  const [designs, setDesigns] = useState([])
  const [loading, setLoading] = useState(false)
  const [canvasAPI, setCanvasAPI] = useState(null)
  const [currentProject, setCurrentProject] = useState(null)
  const { isAuthenticated, loading: authLoading } = useAuth()
  

  const [selectedDesignId, setSelectedDesignId] = useState(null)
  const [exportId, setExportId] = useState(null)
  const [copied, setCopied] = useState(false)

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

  // Handle design selection
  const handleDesignSelect = useCallback((designId) => {
    setSelectedDesignId(designId)
    setExportId(null) // Reset export ID when selecting a new design
    setCopied(false)
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

  // Export selected design to Figma
  const handleFigmaExport = async () => {
    try {
      if (selectedDesignId) {
        const selectedDesign = designs.find(design => design.id === selectedDesignId)
        if (selectedDesign) {
          console.log(selectedDesign.data)
          const res = await exportToFigma(selectedDesign.data)
          console.log("Figma export response:", res)
          
          // Assuming the API returns an export_id in the response
          if (res.exportId) {
            setExportId(res.exportId)
          } else if (res.id) {
            setExportId(res.id)
          } else {
            // Fallback to a generated ID if API doesn't return one
            setExportId(`False_figma_export_${Date.now()}`)
          }
        }
      } else {
        alert("Please select a design first by clicking on it")
      }
    } catch (e) {
      console.log("Figma export error:", e)
      alert("Failed to export to Figma. Please try again.")
    }
  }

  // Copy export ID to clipboard
  const handleCopyExportId = async () => {
    if (exportId) {
      try {
        await navigator.clipboard.writeText(exportId)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } catch (err) {
        console.error('Failed to copy export ID:', err)
      }
    }
  }

  const handleClearAll = async () => {
    if (confirm('Are you sure you want to clear all designs? This cannot be undone.')) {
      setDesigns([])
      setSelectedDesignId(null)
      setExportId(null)
      setCopied(false)
      
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
  const { canvasComponent, addDesign, removeDesign, centerView, transform } = InfiniteCanvas({
    designs,
    onDesignsUpdate: handleDesignsUpdate,
    onDesignSelect: handleDesignSelect,
    selectedDesignId 
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
              className="inline-flex items-center gap-1 rounded-md bg-black px-3 py-1.5 text-xs font-medium text-white hover:bg-[#06b6b6] disabled:opacity-60 disabled:cursor-not-allowed"
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
              onClick={handleClearAll}
              className="flex items-center gap-2 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
          <div><kbd className="bg-gray-100 px-1 rounded text-xs">Click</kbd> Select design</div>
        </div>
      </div>

      {/* Selected design info panel with export options */}
      {selectedDesignId && (
        <div className="absolute top-20 left-4 bg-white rounded-lg shadow-lg border border-gray-200 p-4 min-w-[300px] z-40">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900 text-sm">Selected Design</h3>
            <button
              onClick={() => {
                setSelectedDesignId(null);
                setExportId(null);
                setCopied(false);
              }}
              className="text-gray-400 hover:text-gray-600 text-xs p-1 rounded hover:bg-gray-100 transition-colors"
              title="Clear selection"
            >
              <TrashIcon className="h-3 w-3" />
            </button>
          </div>
          
          {/* Design info */}
          <div className="mb-4">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
              <span>Design ID:</span>
              <code className="bg-gray-50 px-2 py-1 rounded font-mono text-gray-800">
                {selectedDesignId.slice(-8)}
              </code>
            </div>
            {(() => {
              const selectedDesign = designs.find(d => d.id === selectedDesignId);
              return selectedDesign?.data?.meta?.title && (
                <div className="text-xs text-gray-600">
                  <span className="font-medium">Title:</span> {selectedDesign.data.meta.title}
                </div>
              );
            })()}
          </div>

          {/* Figma export section */}
          <div className="space-y-3">
            <button
              onClick={handleFigmaExport}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-black border border-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CloudArrowDownIcon className="h-4 w-4" />
              {loading ? 'Exporting to Figma...' : 'Export to Figma'}
            </button>

            {/* Export ID display */}
            {exportId && (
              <div className="bg-gray-50 rounded-md border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-700">Export ID</span>
                  <button
                    onClick={handleCopyExportId}
                    className={`p-1 rounded transition-colors ${
                      copied 
                        ? 'text-green-600 bg-green-100' 
                        : 'text-gray-500 hover:text-gray-700 hover:bg-white'
                    }`}
                    title={copied ? "Copied!" : "Copy to clipboard"}
                  >
                    {copied ? (
                      <CheckIcon className="h-3.5 w-3.5" />
                    ) : (
                      <DocumentDuplicateIcon className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <code className="text-xs bg-white px-2 py-2 rounded border border-gray-300 font-mono text-gray-800 block w-full truncate">
                  {exportId}
                </code>
                {copied && (
                  <div className="mt-2 text-xs text-green-600 flex items-center gap-1">
                    <CheckIcon className="h-3 w-3" />
                    Copied to clipboard!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Help text */}
          {!exportId && (
            <p className="mt-3 text-xs text-gray-500 text-center">
              Click "Export to Figma" to generate a Figma export ID
            </p>
          )}
        </div>
      )}

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