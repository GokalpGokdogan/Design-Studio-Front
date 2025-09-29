'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  CalendarIcon,
  TrashIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { getAllProjects, deleteProject } from '../../lib/api';
import { useAuth } from '@/hooks/useAuth';

const ProjectsList = ({ maxItems = 6 }) => {
  const [serverProjects, setServerProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const router = useRouter();
  const { isAuthenticated, userId, loading: authLoading } = useAuth();

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      setErr('User not signed in.');
      setLoading(false);
      return;
    }

    (async () => {
      try {
        setLoading(true);
        const data = await getAllProjects();
        setServerProjects(data.projects || data || []);
      } catch (e) {
        setErr(e?.message || 'Failed to load projects.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthenticated, authLoading, userId]); 


  const projects = useMemo(() => {
    return serverProjects.map((project) => {
      const firstDesign = Array.isArray(project.designData) && project.designData.length > 0 
        ? project.designData[0] 
        : null;
      
      const width = firstDesign?.data?.artboard?.width || firstDesign?.position?.width || 800;
      const height = firstDesign?.data?.artboard?.height || firstDesign?.position?.height || 600;

      return {
        id: project.project_id,
        title: project.title || 'Untitled Project',
        prompt: project.prompt || (firstDesign?.data?.meta?.prompt || ''),
        date: new Date(project.updatedAt || project.createdAt).toLocaleDateString(),
        time: new Date(project.updatedAt || project.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        dimensions: `${width} x ${height}`,
        projectData: project,
      };
    });
  }, [serverProjects]);

  const displayedProjects = showAll ? projects : projects.slice(0, maxItems);


  const handleViewProject = (project) => {
    // Navigate to studio with project ID
    router.push(`/studio?projectId=${project.id}`);
  };

  const handleDeleteProject = async (project, e) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this project? This cannot be undone.')) return;

    const prevProjects = [...serverProjects];
    setServerProjects(prevProjects.filter((p) => p.project_id !== project.id));

    try {
      await deleteProject(project.id);
    } catch (error) {
      setServerProjects(prevProjects);
      alert('Failed to delete project on server.');
    }
  };

  const handleViewAllProjects = () => {
    router.push('/studio?view=projects');
  };

  const ProjectIcon = () => (
    <div className="w-10 h-10 bg-gradient-to-br from-[#06b6b6] to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-xs">
      UI
    </div>
  );

  if (loading) return null;
  if (err || projects.length === 0) return null;

  return (
    <section className="w-full max-w-4xl mx-auto my-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Recent Projects</h2>
          <p className="text-gray-600 mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>

        {/* <button
          onClick={handleViewAllProjects}
          className="flex items-center gap-2 text-[#06b6b6] hover:text-teal-700 font-medium transition-colors"
        >
          View all
          <ArrowRightIcon className="w-4 h-4" />
        </button> */}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {displayedProjects.map((project) => (
          <div
            key={project.id}
            className="bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md group cursor-pointer p-4"
            onClick={() => handleViewProject(project)}
          >
            <div className="flex items-start gap-3">
              <ProjectIcon />

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-base font-semibold text-gray-900 group-hover:text-[#06b6b6] transition-colors truncate">
                    {project.title}
                  </h3>
                  <button
                    onClick={(e) => handleDeleteProject(project, e)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded"
                    title="Delete Project"
                  >
                    <TrashIcon className="w-4 h-4 text-red-500" />
                  </button>
                </div>

                {project.prompt && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {project.prompt}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <CalendarIcon className="w-3 h-3" />
                    {project.date}
                  </span>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {project.dimensions}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length > maxItems && !showAll && (
        <div className="text-center mt-6">
          <button
            onClick={() => setShowAll(true)}
            className="text-[#06b6b6] hover:text-teal-700 font-medium transition-colors"
          >
            Show {projects.length - maxItems} more projects
          </button>
        </div>
      )}
    </section>
  );
};

export default ProjectsList;