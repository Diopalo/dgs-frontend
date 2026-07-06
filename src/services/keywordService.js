import api from "./api";

/** Récupère tous les mots-clés d'un site, avec filtre optionnel par priorité */
export const getKeywords = async (siteId, { priorite } = {}) => {
  const response = await api.get(`/sites/${siteId}/mots-cles`, {
    params: priorite ? { priorite } : undefined,
  });
  return response.data;
};

/** Crée un nouveau mot-clé pour un site */
export const createKeyword = async (siteId, keywordData) => {
  const response = await api.post(`/sites/${siteId}/mots-cles`, keywordData);
  return response.data;
};

/** Met à jour un mot-clé existant */
export const updateKeyword = async (siteId, keywordId, keywordData) => {
  const response = await api.put(
    `/sites/${siteId}/mots-cles/${keywordId}`,
    keywordData
  );
  return response.data;
};

/** Supprime un mot-clé */
export const deleteKeyword = async (siteId, keywordId) => {
  const response = await api.delete(`/sites/${siteId}/mots-cles/{keywordId}`);
  return response.data;
};

/** Récupère les statistiques agrégées des mots-clés d'un site */
export const getKeywordStats = async (siteId) => {
  const response = await api.get(`/sites/${siteId}/mots-cles/stats`);
  return response.data;
};

/** Récupère l'historique des positions d'un mot-clé */
export const getKeywordPositions = async (keywordId) => {
  const response = await api.get(`/keywords/${keywordId}/positions`);
  return response.data;
};