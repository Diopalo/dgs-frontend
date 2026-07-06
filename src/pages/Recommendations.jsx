import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getRecommendations,
  generateRecommendations,
  updateRecommendationStatus,
} from "../services/recommendationService";

function Recommendations() {
  const [siteId, setSiteId] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadRecommendations = async () => {
    if (!siteId) return;

    try {
      setLoading(true);

      const response =
        await getRecommendations(siteId);

    console.log("response.data :", response.data);
    setRecommendations(response.data.data || []);
    
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async () => {
    try {
      await generateRecommendations(siteId);

      loadRecommendations();
    } catch (error) {
      console.error(error);
    }
  };

  const handleStatusChange = async (
    recommendationId,
    statut
  ) => {
    try {
      await updateRecommendationStatus(
        siteId,
        recommendationId,
        statut
      );

      loadRecommendations();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Recommandations SEO
      </h1>

      <div className="bg-white p-6 rounded shadow mb-6">
        <div className="flex gap-4">
          <input
            type="number"
            placeholder="ID du site"
            value={siteId}
            onChange={(e) =>
              setSiteId(e.target.value)
            }
            className="border p-2 rounded w-full"
          />

          <button
            onClick={loadRecommendations}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Charger
          </button>

          <button
            onClick={handleGenerate}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Générer
          </button>
        </div>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <div className="space-y-4">
          {recommendations.map((reco) => (
            <div
              key={reco.id}
              className="bg-white p-5 rounded shadow"
            >
              <div className="flex justify-between">
                <div>
                  <h3 className="font-bold text-lg">
                    {reco.titre}
                  </h3>

                  <p className="text-gray-600 mt-2">
                    {reco.description}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded text-white ${
                    reco.priorite === "HAUTE"
                      ? "bg-red-500"
                      : reco.priorite === "MOYENNE"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                >
                  {reco.priorite}
                </span>
              </div>

              <div className="mt-4">
                <select
                  value={reco.statut}
                  onChange={(e) =>
                    handleStatusChange(
                      reco.id,
                      e.target.value
                    )
                  }
                  className="border p-2 rounded"
                >
                  <option value="OUVERTE">
                    OUVERTE
                  </option>

                  <option value="EN_COURS">
                    EN COURS
                  </option>

                  <option value="TERMINEE">
                    TERMINÉE
                  </option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </MainLayout>
  );
}

export default Recommendations;