import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contentService from '../services/contentService';  // Assure-toi que le chemin est correct
import MainLayout from '../layouts/MainLayout';

export default function CreateContent() {
  const { siteId } = useParams();
  const navigate = useNavigate();
  
  // Alignement strict avec les champs de ton contrôleur et schéma Prisma
  const [formData, setFormData] = useState({
    titre: '',
    statut: 'IDEE', // Valeur par défaut imposée par ton contrôleur backend
    date_publication: '',
    notes: '',
    assigneA: '', // Optionnel
    recommandationId: '' // Optionnel
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.titre.trim()) {
      setError('Le titre est requis.');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      // Préparation du payload en gérant les types (ID optionnels en Number ou null)
      const payload = {
        titre: formData.titre,
        statut: formData.statut,
        date_publication: formData.date_publication || null,
        notes: formData.notes || null,
        assigneA: formData.assigneA ? Number(formData.assigneA) : null,
        recommandationId: formData.recommandationId ? Number(formData.recommandationId) : null,
      };

      // Execution via ton service unifié
      await ContentService.createContenu(siteId, payload);

      // Succès -> redirection
      navigate(`/sites/${siteId}/contenus`);
    } catch (err) {
      // Capture les erreurs de Joi / Zod renvoyées par ton middleware validate()
      const backendError = err.response?.data?.message || 'Une erreur est survenue lors de la création.';
      setError(backendError);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <MainLayout>
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h2>Créer un contenu éditorial</h2>
      <p style={{ color: '#666' }}>Planification pour le site #{siteId}</p>

      {error && (
        <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Titre du contenu *</label>
          <input
            type="text"
            name="titre"
            value={formData.titre}
            onChange={handleChange}
            placeholder="Ex: Optimiser son maillage interne"
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            required
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Statut initial</label>
            <select
              name="statut"
              value={formData.statut}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="IDEE">IDEE</option>
              <option value="REDACTION">REDACTION</option>
              <option value="PUBLIE">PUBLIE</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Date de publication</label>
            <input
              type="date"
              name="date_publication"
              value={formData.date_publication}
              onChange={handleChange}
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Notes / Brief éditorial</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="5"
            placeholder="Ajouter des consignes pour le rédacteur ou des mots-clés cibles..."
            style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID Rédacteur Assigné (Optionnel)</label>
            <input
              type="number"
              name="assigneA"
              value={formData.assigneA}
              onChange={handleChange}
              placeholder="Ex: 42"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ID Recommandation (Optionnel)</label>
            <input
              type="number"
              name="recommandationId"
              value={formData.recommandationId}
              onChange={handleChange}
              placeholder="Ex: 105"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => navigate(`/sites/${siteId}/contenus`)}
            style={{ padding: '10px 15px', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{ padding: '10px 15px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? 'Création en cours...' : 'Créer le contenu'}
          </button>
        </div>
      </form>
    </div>
    </MainLayout>
  );
}
