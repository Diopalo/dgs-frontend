import api from "./api";

// Liste des recommandations d'un site
export const getRecommendations = (siteId) => {
  return api.get(`/sites/${siteId}/recommandations`, {
    params: { _t: Date.now() },
  });
};


// Résumé des recommandations
export const getRecommendationSummary = async (siteId) => {
  const response = await api.get(
    `/sites/${siteId}/recommandations/resume`
  );

  return response.data;
};

// Génération automatique
export const generateRecommendations = async (siteId) => {
  const response = await api.post(
    `/sites/${siteId}/recommandations/generer`
  );

  return response.data;
};

// Changer le statut
export const updateRecommendationStatus = async (
  siteId,
  recommendationId,
  statut
) => {
  const response = await api.patch(
    `/sites/${siteId}/recommandations/${recommendationId}`,
    { statut }
  );

  return response.data;
};