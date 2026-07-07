import { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import {
  getRecommendationSummary,
} from "../services/recommendationService";

function RecommendationSummary() {
  const [siteId, setSiteId] = useState("");
  const [summary, setSummary] = useState(null);

  const loadSummary = async () => {
    try {
      const response =
        await getRecommendationSummary(siteId);

      setSummary(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <MainLayout>
      <h1 className="text-3xl font-bold mb-6">
        Résumé des recommandations
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
            onClick={loadSummary}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Charger
          </button>
        </div>
      </div>

      {summary && (
        <div className="grid grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500">
              Total
            </h3>

            <p className="text-4xl font-bold">
              {summary.total}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500">
              Ouvertes
            </h3>

            <p className="text-4xl font-bold text-red-600">
              {summary.par_statut?.OUVERTE ?? 0}
            </p>
          </div>

          <div className="bg-white p-6 rounded shadow">
            <h3 className="text-gray-500">
              Résolues
            </h3>

            <p className="text-4xl font-bold text-green-600">
              {summary.par_statut?.RESOLUE ?? 0}
            </p>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

export default RecommendationSummary;