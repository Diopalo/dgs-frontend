import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getProjects } from "../services/projectService";
import MainLayout from "../layouts/MainLayout";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const data = await getProjects();
        if (isMounted) {
          setProjects(Array.isArray(data) ? data : data.data || []);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des projets :", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProjects();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
  <MainLayout>
    <div className="max-w-6xl mx-auto p-6 mt-6">
      {/* En-tête avec disposition Flexbox et Tailwind */}
      <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
        <h2 className="text-3xl font-bold text-slate-800">Mes projets</h2>

        <Link
          to="/projects/create"
          className="bg-blue-600 text-white px-4 py-2 rounded-md font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          Nouveau projet
        </Link>
      </div>

      {/* Gestion de l'état de chargement */}
      {loading ? (
        <div className="flex justify-center items-center h-48">
          <p className="text-slate-500 font-medium animate-pulse">
            Chargement des projets...
          </p>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-slate-100">
          <p className="text-slate-500 mb-4">Aucun projet trouvé.</p>
          <Link to="/projects/create" className="text-blue-600 hover:underline text-sm font-medium">
            Créer votre premier projet :
          </Link>
        </div>
      ) : (
        /* Grille de cartes de projets responsive */
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-white p-6 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <h4 className="text-xl font-bold text-slate-900 mb-2 truncate">
                  {project.name}
                </h4>
                <p className="text-slate-600 text-sm line-clamp-3 mb-4">
                  {project.description || "Aucune description fournie."}
                </p>
              </div>
              
              <div className="mt-4 pt-3 border-t border-slate-100 text-right">
                <span className="text-xs font-semibold text-slate-400">
                  ID: #{project.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  </MainLayout>
  );
}

export default Projects;