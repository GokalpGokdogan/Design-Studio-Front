'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DocumentDuplicateIcon, ArrowRightIcon, PaperAirplaneIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import ProjectsList from './components/ProjectsList';
import { useAuth } from '@/hooks/useAuth';


function App() {
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, authLoading, router]);

  const handleGenerateDesign = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setIsLoading(true);
    setError('');

    localStorage.setItem('prompt', prompt);
    
    setIsLoading(false);
    router.push('/studio');
  };

  const handleNewDesign = () => {
    setPrompt('');
    setError('');
  };

  const handleLogout = async () => {
    // Clear client-side auth state
    document.cookie = 'uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/auth');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6b6]"></div>
      </div>
    );
  }

  // Show auth page if not authenticated
  if (!isAuthenticated) {
    router.push("/auth")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              {/* <div className="p-2 bg-[#06b6b6] rounded-lg flex items-center justify-center text-white font-bold">
                Gokalp's
              </div> */}
              <h1 className="text-xl font-semibold text-gray-900">
                Design Studio
              </h1>
            </div>
            
            <div className="flex gap-3 items-center">
              <button
                onClick={handleNewDesign}
                className="bg-black text-white px-4 py-2 rounded-xl hover:bg-teal-600 transition-colors font-medium"
              >
                New Design
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <UserCircleIcon className="w-5 h-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-4xl mx-auto">
          {/* Main Heading */}
          <div className="text-center mb-12">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-4">
              Explain what you want to design
            </h1>
          </div>

          {/* Main Prompt Input */}
          <div className="mb-12">
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 w-12 h-12 bg-black text-white rounded-xl hover:bg-[#06b6b6] focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
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

          {/* Recent Projects Section */}
          <ProjectsList maxItems={6} />
        </div>
      </main>
    </div>
  );
}

export default App;