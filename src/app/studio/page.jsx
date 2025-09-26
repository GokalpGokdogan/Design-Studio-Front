"use client";

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

  const [prompt, setPrompt] = useState(() =>
    typeof window !== "undefined" ? localStorage.getItem("prompt") ?? "" : ""
  );

  const [designData, setDesignData] = useState(null)
  const [loading, setLoading] = useState(false)

  


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const result = await Promise.resolve(generateDesignDataFromPrompt(prompt))
  //   const result = {"figmaTokens": {
  //       "color": {
  //           "primary-500": { "value": "#06b6b6" },
  //           "neutral-50": { "value": "#fafafa" },
  //           "neutral-200": { "value": "#e4e4e7" },
  //           "neutral-900": { "value": "#18181b" }
  //       },
  //       "spacing": { "md": 16, "lg": 24, "xl": 32 },
  //       "borderRadius": { "md": 8, "lg": 12 }
  //   },
  //   "meta": { "title": "Login Page", "prompt": "login use #06b6b6" },
  //   "artboard": { "width": 1200, "height": 800, "background": "#fafafa" },
  //   "tree": {
  //       "type": "stack",
  //       "direction": "column",
  //       "gap": "xl",
  //       "children": [
  //           {
  //               "type": "section",
  //               "maxWidth": "800px",
  //               "centered": true,
  //               "children": [
  //                   {
  //                       "type": "component",
  //                       "role": "heading",
  //                       "content": "Login to your account",
  //                       "props": { "level": 1 }
  //                   },
  //                   {
  //                       "type": "component",
  //                       "role": "input",
  //                       "props": {
  //                           "label": "Email",
  //                           "placeholder": "Enter your email",
  //                           "type": "email"
  //                       }
  //                   },
  //                   {
  //                       "type": "component",
  //                       "role": "input",
  //                       "props": {
  //                           "label": "Password",
  //                           "placeholder": "Enter your password",
  //                           "type": "password"
  //                       }
  //                   },
  //                   {
  //                       "type": "component",
  //                       "role": "button",
  //                       "content": "Login",
  //                       "props": { "variant": "primary" }
  //                   }
  //               ]
  //           }
  //       ]
  //   }
  // };
    setDesignData(result)
    console.log(result, designData)

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
                    <div className="flex h-[600px] items-center justify-center text-sm text-slate-500">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mr-3"></div>
                      Generating your design...
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
