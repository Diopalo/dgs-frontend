import MainLayout from "../layouts/MainLayout";
import { useEffect, useState } from "react";
import { getSiteDashboard } from "../services/dashboardService";

function Dashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  // ⚠️ Remplace par un vrai siteId récupéré depuis la route ou un select
  const siteId = 1;

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getSiteDashboard(siteId);

        console.log("Dashboard :", response);

        setDashboard(response.data);
      } catch (error) {
        console.error(
          "Erreur chargement dashboard :",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <MainLayout>
        <p className="text-center mt-10">
          Chargement...
        </p>
      </MainLayout>
    );
  }

  if (!dashboard) {
    return (
      <MainLayout>
        <p className="text-center text-red-500 mt-10">
          Impossible de charger le dashboard.
        </p>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Dashboard SEO
      </h1>

      {/* Informations Site */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-2">
          {dashboard.site.nom}
        </h2>

        <p className="text-gray-600">
          {dashboard.site.url}
        </p>
      </div>

      {/* Cartes statistiques */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">
            Score SEO
          </h3>

          <p className="text-4xl font-bold text-blue-600">
            {dashboard.audit.dernier_score}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">
            Mots-clés
          </h3>

          <p className="text-4xl font-bold text-green-600">
            {dashboard.mots_cles.total}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">
            Recommandations
          </h3>

          <p className="text-4xl font-bold text-orange-600">
            {dashboard.recommandations.total_ouvertes}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">
            Santé globale
          </h3>

          <p className="text-4xl font-bold text-purple-600">
            {dashboard.sante_globale.score}
          </p>

          <p className="mt-2 text-sm">
            {dashboard.sante_globale.niveau}
          </p>
        </div>
      </div>

      {/* Top mots-clés */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Top 5 mots-clés
        </h2>

        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">
                Expression
              </th>

              <th className="text-left py-2">
                Position
              </th>

              <th className="text-left py-2">
                Tendance
              </th>
            </tr>
          </thead>

          <tbody>
            {dashboard.mots_cles.top5_positions.map(
              (keyword, index) => (
                <tr
                  key={index}
                  className="border-b"
                >
                  <td className="py-2">
                    {keyword.expression}
                  </td>

                  <td className="py-2">
                    {keyword.position_actuelle}
                  </td>

                  <td className="py-2">
                    {keyword.tendance}
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>

      {/* Recommandations */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <h2 className="text-xl font-bold mb-4">
          Recommandations prioritaires
        </h2>

        {dashboard.recommandations.dernieres.length >
        0 ? (
          <ul className="space-y-3">
            {dashboard.recommandations.dernieres.map(
              (reco) => (
                <li
                  key={reco.id}
                  className="border-l-4 border-red-500 pl-4"
                >
                  {reco.message}
                </li>
              )
            )}
          </ul>
        ) : (
          <p>Aucune recommandation.</p>
        )}
      </div>

      {/* Calendrier éditorial */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">
          Prochains contenus
        </h2>

        {dashboard.calendrier.a_venir.length >
        0 ? (
          <ul className="space-y-3">
            {dashboard.calendrier.a_venir.map(
              (contenu) => (
                <li key={contenu.id}>
                  <strong>
                    {contenu.titre}
                  </strong>

                  <span className="ml-2 text-gray-500">
                    {new Date(
                      contenu.date_publication
                    ).toLocaleDateString()}
                  </span>
                </li>
              )
            )}
          </ul>
        ) : (
          <p>
            Aucun contenu programmé.
          </p>
        )}
      </div>
    </MainLayout>
  );
}

export default Dashboard;