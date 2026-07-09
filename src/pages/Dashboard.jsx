import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { getSiteDashboard } from "../services/dashboardService";
import { getSites } from "../services/siteService"; // Import pour charger le select

function Dashboard() {
  const [sites, setSites] = useState([]); // Liste de tous les sites pour le select
  const [selectedSiteId, setSelectedSiteId] = useState(""); // ID du site actif
  const [dashboard, setDashboard] = useState(null);
  const [loadingDashboard, setLoadingDashboard] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // 1. Charger la liste des sites au montage du composant
  useEffect(() => {
    const fetchInitialSites = async () => {
      try {
        const data = await getSites();
        const sitesList = Array.isArray(data) ? data : data.data || [];
        setSites(sitesList);

        // Sélectionner par défaut le premier site de la liste s'il y en a un
        if (sitesList.length > 0) {
          setSelectedSiteId(sitesList[0].id);
        }
      } catch (error) {
        console.error("Erreur chargement de la liste des sites :", error);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialSites();
  }, []);

  // 2. Recharger les données du dashboard dès que le selectedSiteId change
  useEffect(() => {
    if (!selectedSiteId) return;

    const fetchDashboard = async () => {
      try {
        setLoadingDashboard(true);
        const response = await getSiteDashboard(selectedSiteId);
        console.log(`Dashboard du site #${selectedSiteId} :`, response);
        setDashboard(response.data || response);
      } catch (error) {
        console.error("Erreur chargement dashboard :", error);
        setDashboard(null);
      } finally {
        setLoadingDashboard(false);
      }
    };

    fetchDashboard();
  }, [selectedSiteId]);

  // Écran de chargement principal (au tout premier démarrage)
  if (loadingInitial) {
    return (
      <MainLayout>
        <p className="text-center mt-10 text-slate-500 font-medium">
          Initialisation de l'application...
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h1 className="text-3xl font-bold text-slate-800">Dashboard SEO</h1>
        
        {/* Menu déroulant de sélection du site */}
        <div className="w-full md:w-64">
          <label htmlFor="site-select" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
            Sélectionner un site
          </label>
          <select
            id="site-select"
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            className="w-full p-2.5 bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
          >
            {sites.length === 0 ? (
              <option value="">Aucun site disponible</option>
            ) : (
              sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.nom}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Rendu conditionnel selon l'état du chargement ou de l'absence de données */}
      {loadingDashboard ? (
        <div className="flex justify-center items-center h-48 bg-white shadow rounded-lg border border-slate-200">
          <p className="text-slate-500 font-medium animate-pulse">
            Mise à jour des métriques SEO...
          </p>
        </div>
      ) : !dashboard ? (
        <div className="p-6 text-center text-slate-600 bg-slate-50 rounded-lg border border-dashed border-slate-300">
          Aucune donnée disponible pour le site sélectionné. Lancez un audit pour commencer.
        </div>
      ) : (
        <div className="animate-fadeIn">
          {/* Informations Site */}
          <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-2 text-slate-800">
              {dashboard.site?.nom || "Site sans nom"}
            </h2>
            <p className="text-blue-600 font-medium text-sm">
              <a href={dashboard.site?.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {dashboard.site?.url}
              </a>
            </p>
          </div>

          {/* Cartes statistiques */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <h3 className="text-gray-500 text-sm font-medium">Score SEO</h3>
              <p className="text-4xl font-black text-blue-600 mt-2">
                {dashboard.audit?.dernier_score ?? "--"}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <h3 className="text-gray-500 text-sm font-medium">Mots-clés</h3>
              <p className="text-4xl font-black text-green-600 mt-2">
                {dashboard.mots_cles?.total ?? 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <h3 className="text-gray-500 text-sm font-medium">Recommandations</h3>
              <p className="text-4xl font-black text-orange-600 mt-2">
                {dashboard.recommandations?.total_ouvertes ?? 0}
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
              <h3 className="text-gray-500 text-sm font-medium">Santé globale</h3>
              <p className="text-4xl font-black text-purple-600 mt-2">
                {dashboard.sante_globale?.score ?? "--"}
              </p>
              {dashboard.sante_globale?.niveau && (
                <p className="mt-2 text-xs bg-purple-50 text-purple-700 py-1 px-2 rounded font-semibold inline-block">
                  {dashboard.sante_globale.niveau}
                </p>
              )}
            </div>
          </div>

          {/* Top mots-clés */}
          <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Top 5 mots-clés</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="py-3">Expression</th>
                    <th className="py-3">Position</th>
                    <th className="py-3">Tendance</th>
                  </tr>
                </thead>
                <tbody className="text-slate-600 text-sm divide-y">
                  {dashboard.mots_cles?.top5_positions?.map((keyword, index) => (
                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 font-medium text-slate-800">{keyword.expression}</td>
                      <td className="py-3 font-mono">{keyword.position_actuelle}</td>
                      <td className="py-3">{keyword.tendance}</td>
                    </tr>
                  )) || (
                    <tr>
                      <td colSpan="3" className="py-4 text-center text-slate-400">Aucun mot-clé détecté.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommandations */}
          <div className="bg-white p-6 rounded-lg shadow mb-6 border border-slate-100">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Recommandations prioritaires</h2>
            {dashboard.recommandations?.dernieres?.length > 0 ? (
              <ul className="space-y-3">
                {dashboard.recommandations.dernieres.map((reco) => (
                  <li key={reco.id} className="border-l-4 border-red-500 bg-red-50/50 p-3 rounded-r text-sm text-red-900 font-medium">
                    {reco.message}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-green-600 bg-green-50 p-4 rounded border border-green-100 font-medium">
                Aucune recommandation en suspens. Beau travail !
              </p>
            )}
          </div>

          {/* Calendrier éditorial */}
          <div className="bg-white p-6 rounded-lg shadow border border-slate-100">
            <h2 className="text-xl font-bold mb-4 text-slate-800">Prochains contenus</h2>
            {dashboard.calendrier?.a_venir?.length > 0 ? (
              <ul className="space-y-3 divide-y">
                {dashboard.calendrier.a_venir.map((contenu) => (
                  <li key={contenu.id} className="pt-3 first:pt-0 flex justify-between items-center text-sm">
                    <strong className="text-slate-700 font-medium">{contenu.titre}</strong>
                    <span className="text-slate-400 text-xs font-mono bg-slate-100 px-2 py-1 rounded">
                      {new Date(contenu.date_publication).toLocaleDateString()}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400">Aucun contenu programmé.</p>
            )}
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default Dashboard;