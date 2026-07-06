import axios from 'axios';

// Configuration de l'URL de base (à adapter selon ton fichier .env ou ta config Vite)
const API_BASE_URL = import.meta.env?.VITE_API_URL || 'http://localhost:3000/api';

/**
 * Récupère une instance Axios configurée avec le token d'authentification actuel
 */
const getApiClient = (siteId) => {
  const token = localStorage.getItem('token');
  return axios.create({
    baseURL: `${API_BASE_URL}/sites/${siteId}/contenus`,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    }
  });
};

const contentService = {
  /**
   * GET /api/sites/:siteId/contenus/calendrier
   * Récupère le calendrier éditorial du site (contenus groupés par mois)
   */
  async getCalendrier(siteId) {
    const client = getApiClient(siteId);
    const response = await client.get('/calendrier');
    return response.data;
  },

  /**
   * GET /api/sites/:siteId/contenus
   * Récupère la liste paginée des contenus éditoriaux du site
   */
  async listContenus(siteId, paginationParams = {}) {
    const client = getApiClient(siteId);
    const response = await client.get('/', { params: paginationParams });
    return response.data;
  },

  /**
   * POST /api/sites/:siteId/contenus
   * Crée un nouveau contenu éditorial
   */
  async createContenu(siteId, contenuData) {
    const client = getApiClient(siteId);
    const response = await client.post('/', contenuData);
    return response.data;
  },

  /**
   * PATCH /api/sites/:siteId/contenus/:id
   * Met à jour partiellement un contenu éditorial (soumis au validateur updateSchema)
   */
  async updateContenu(siteId, id, updatedData) {
    const client = getApiClient(siteId);
    const response = await client.patch(`/${id}`, updatedData);
    return response.data;
  },

  /**
   * DELETE /api/sites/:siteId/contenus/:id
   * Supprime un contenu éditorial du site
   */
  async deleteContenu(siteId, id) {
    const client = getApiClient(siteId);
    const response = await client.delete(`/${id}`);
    return response.data;
  }
};

export default contentService;