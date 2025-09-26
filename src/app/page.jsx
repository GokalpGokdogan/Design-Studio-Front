'use client';

import { useState } from 'react';
import { DocumentDuplicateIcon, ArrowRightIcon, PaperAirplaneIcon, PhotoIcon, CloudArrowDownIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';


function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleGenerateDesign = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    
    // set localstorage
    localStorage.setItem('prompt', prompt);
    
    setIsLoading(false);
    
    router.push('/studio')

  };

  // const handleExportFigmaTokens = async () => {
  //   if (!designData) return;

  //   try {
  //     const response = await fetch('http://localhost:5000/api/export-figma-tokens', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ designData }),
  //     });

  //     if (!response.ok) {
  //       throw new Error(`HTTP error! status: ${response.status}`);
  //     }

  //     const data = await response.json();
      
  //     // Download tokens as JSON file
  //     const blob = new Blob([JSON.stringify(data.tokens, null, 2)], {
  //       type: 'application/json',
  //     });
  //     const url = URL.createObjectURL(blob);
  //     const a = document.createElement('a');
  //     a.href = url;
  //     a.download = data.filename || 'figma-tokens.json';
  //     document.body.appendChild(a);
  //     a.click();
  //     document.body.removeChild(a);
  //     URL.revokeObjectURL(url);
  //   } catch (err) {
  //     setError('Failed to export Figma tokens');
  //     console.error('Export error:', err);
  //   }
  // };

  // const handleBackToPrompt = () => {
  //   setError('');
  // };

  const handleNewDesign = () => {
    setPrompt('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className=" p-2 bg-[#06b6b6] rounded-lg flex items-center justify-center text-white font-bold">
                Gokalp's
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                Polymet
              </h1>
            </div>
            
              <div className="flex gap-3">
                
                <button
                  onClick={handleNewDesign}
                  className="bg-[#06b6b6] text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors font-medium"
                >
                  New Design
                </button>
                {/* <button
                  onClick={handleBackToPrompt}
                  className="bg-gray-600 text-white px-4 py-2 rounded-xl hover:bg-gray-700 transition-colors font-medium"
                >
                  Back
                </button> */}
              </div>

          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">

          <div className="w-full max-w-4xl mx-auto">
            {/* Main Heading */}
            <div className="text-center mb-12">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
                Explain what you want to design
              </h1>
            </div>

            {/* Main Prompt Input */}
            <div className="mb-8">
              <form onSubmit={handleGenerateDesign} className="relative">
                <textarea
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-6 py-4 pr-16 text-lg border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#06b6b6] focus:border-transparent text-black resize-none bg-white shadow-sm"
                  placeholder="Design a Welcome Page that looks professional using #06b6b6 and gray and black."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-[#06b6b6] text-white rounded-xl hover:bg-[#06b6b6] focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <PaperAirplaneIcon className="w-5 h-5 text-white" />
                  )}
                </button>
              </form>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
                  <p className="text-red-800">{error}</p>
                </div>
              )}
            </div>

            {/* Action Buttons
            <div className="flex justify-center gap-4 mb-12">
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <DocumentDuplicateIcon className="w-5 h-5 text-gray-400" />
                Import from Figma
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <PhotoIcon className="w-5 h-5 text-gray-400" />
                Upload Image
              </button>
              <button className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                  <CloudArrowDownIcon className="w-5 h-5 text-gray-400" />
              </button>
            </div> */}

            {/* Design Options */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button 
                onClick={() => setPrompt('Design a product landing page with hero section, features, and CTA')}
                className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                disabled={isLoading}
              >
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Design a product</h3>
                </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <button 
                onClick={() => setPrompt('Design a reusable component like a card, button, or form element')}
                className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                disabled={isLoading}
              >
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Design a component</h3>
                </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>

              <button 
                onClick={() => setPrompt('Design a complex onboarding page. Make it professional.')}
                className="flex items-center justify-between p-6 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors text-left group"
                disabled={isLoading}
              >
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Design an Onboarding Page</h3>
                </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
              </button>
            </div>
          </div>
        
      </main>
    </div>
  );
}

export default App;