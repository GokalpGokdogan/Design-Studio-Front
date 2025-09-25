"use client"

import { useState } from "react"
import DesignCanvas from "../components/DesignCanvas"
import {
  ArrowRightIcon,
  CloudArrowDownIcon,
} from "@heroicons/react/24/outline"
import { generateDesign } from "../../lib/api"

async function generateDesignDataFromPrompt(prompt) {
  const trimmed = (prompt || "").trim()
  if (!trimmed) return null

  try {
    const res = await generateDesign(prompt)

    // if (!res.ok) throw new Error(`HTTP error: ${res.status}`)

    const data = res; //await res.json()
    const { figmaTokens, layout, components, ...rest } = data || {}
    return { figmaTokens, layout, components, ...rest }
  } catch (err) {
    console.error("generateDesignDataFromPrompt failed:", err)
    return null
  }
}

export default function Page() {
  const [prompt, setPrompt] = useState("")
  const [designData, setDesignData] = useState(null)
  const [loading, setLoading] = useState(false)


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await Promise.resolve(generateDesignDataFromPrompt(prompt))
    console.log(result)
    setDesignData(result)
    setLoading(false)
  }

  return (
    <div className="h-dvh w-full overflow-hidden bg-[color:var(--page-bg,#f3f4f6)]">
      <div className="relative h-full w-full">
        <div className="pointer-events-auto absolute left-1/2 top-6 z-20 flex -translate-x-1/2 items-center gap-3">
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 shadow-lg ring-1 ring-black/5"
          >
            <input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your design idea…"
              className="w-[300px] md:w-[460px] bg-transparent text-sm text-slate-700 placeholder:text-slate-400 outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1 text-xs font-medium text-white hover:bg-slate-800"
              title="Generate"
            >
              Generate <ArrowRightIcon className="h-4 w-4" />
            </button>
          </form>

          <button
            type="button"
            onClick={() => alert("Export not wired")}
            className="flex items-center gap-2 rounded-[14px] bg-white px-3 py-2 text-sm text-slate-800 shadow-lg ring-1 ring-black/5 hover:bg-slate-50"
          >
            <CloudArrowDownIcon className="h-5 w-5" />
            Export
          </button>
        </div>


        {/* big canvas with subtle dotted grid */}
        <div
          className="absolute inset-0 top-20 overflow-auto"
          style={{
            background:
              "radial-gradient(circle at 1px 1px, rgba(0,0,0,0.16) 1px, transparent 0) 0 0 / 16px 16px",
          }}
        >
          <div className="mx-auto my-12 min-w-[1100px] max-w-[1400px] px-8">
              <div className="relative px-5 pb-6">
                <div className="overflow-hidden rounded-xl border border-slate-200 bg-[color:var(--board,#fafafa)]">
                  {loading ? (
                    <div className="flex h-[720px] items-center justify-center text-sm text-slate-500">
                      Generating…
                    </div>
                  ) : (
                    <div className="p-6">
                      <DesignCanvas designData={designData} />
                    </div>
                  )}
                </div>
            </div>

            
          </div>
        </div>
      </div>
    </div>
  )
}
