'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  DocumentDuplicateIcon, 
  ArrowRightIcon, 
  PaperAirplaneIcon, 
  UserCircleIcon,
  SparklesIcon,
  LightBulbIcon,
  CubeIcon,
  CommandLineIcon
} from '@heroicons/react/24/outline';
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
    router.push('/studio');
  };

  const handleLogout = async () => {
    document.cookie = 'uid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    router.push('/auth');
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#06b6b6] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push("/auth");
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Design Studio
              </h1>
            </div>
            
            <div className="flex gap-3 items-center">
              <button
                onClick={handleNewDesign}
                className="bg-gradient-to-r from-gray-900 to-gray-800 text-white px-6 py-2.5 rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
              >
                + New Design
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 px-4 py-2 rounded-xl hover:bg-gray-100 transition-all duration-300 font-medium"
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
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
              <SparklesIcon className="w-4 h-4" />
              AI-Powered Design Generation
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6 leading-tight">
              Describe your vision,<br />create beautiful designs
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Transform your ideas into pixel-perfect designs with AI. No design skills required.
            </p>
          </div>

          {/* Enhanced Main Prompt Input */}
          <div className="mb-16">
            <form onSubmit={handleGenerateDesign} className="relative">
              <div className="relative">
                <textarea
                  rows={4}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="w-full px-6 py-5 pr-20 text-lg border border-gray-200 rounded-2xl focus:ring-3 focus:ring-[#06b6b6]/20 focus:border-[#06b6b6] text-gray-900 resize-none bg-white shadow-lg shadow-gray-200/50 backdrop-blur-sm transition-all duration-300"
                  placeholder="Design a modern dashboard with analytics cards, a sidebar navigation, and a clean header using #06b6b6 as primary color..."
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  disabled={!prompt.trim() || isLoading}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 w-14 h-14 bg-gradient-to-r from-[#06b6b6] to-blue-500 text-white rounded-xl hover:from-[#05a5a5] hover:to-blue-600 focus:ring-4 focus:ring-[#06b6b6]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {isLoading ? (
                    <svg className="animate-spin h-6 w-6 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <PaperAirplaneIcon className="w-6 h-6 text-white" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between mt-4 px-2">
                <span className="text-sm text-gray-500">
                  {prompt.length}/500 characters
                </span>
                <span className="text-sm text-gray-500">
                  Press Enter to generate
                </span>
              </div>
            </form>

            {error && (
              <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 shadow-sm">
                <p className="font-medium">{error}</p>
              </div>
            )}
          </div>

          {/* Enhanced Design Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            <button 
              onClick={() => setPrompt('Design a product landing page with hero section, features grid, testimonials, and CTA buttons')}
              className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#06b6b6] hover:shadow-lg transition-all duration-300 text-left group"
              disabled={isLoading}
            >
              <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors">
                <LightBulbIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#06b6b6] transition-colors">
                  Landing Page
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Complete product pages with hero sections, features, and calls-to-action
                </p>
              </div>
            </button>

            <button 
              onClick={() => setPrompt('Design reusable UI components like cards, buttons, form elements, and navigation bars')}
              className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#06b6b6] hover:shadow-lg transition-all duration-300 text-left group"
              disabled={isLoading}
            >
              <div className="p-3 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors">
                <CubeIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#06b6b6] transition-colors">
                  UI Components
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Reusable elements like buttons, cards, and form components
                </p>
              </div>
            </button>

            <button 
              onClick={() => setPrompt('Design a comprehensive onboarding flow with multiple steps, progress indicators, and clear instructions')}
              className="flex items-start gap-4 p-6 bg-white rounded-2xl border border-gray-200 hover:border-[#06b6b6] hover:shadow-lg transition-all duration-300 text-left group"
              disabled={isLoading}
            >
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600 group-hover:bg-purple-100 transition-colors">
                <CommandLineIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-[#06b6b6] transition-colors">
                  Onboarding Flow
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Multi-step onboarding experiences with progress tracking
                </p>
              </div>
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