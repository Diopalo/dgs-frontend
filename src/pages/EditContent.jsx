import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import contentService from '../services/contentService';
import MainLayout from '../layouts/MainLayout';

export default function EditContent() {
  const { siteId, id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    titre: '',
    statut: 'IDEE',
    date_publication: '',
    notes: '',
    assigneA: '',
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Charge les données existantes du contenu
  useEffect(() => {
    const fetchContenu = async () => {
      try {
        const res = await contentService.getContenu(siteId, id);
        const item = res.data || res;

        setFormData({
          titre: item.titre || '',
          statut: item.statut || 'IDEE',
          // Convertit la date ISO en format HTML (YYYY-MM-DD)
          date_publication: item.date_publication
            ? item.date_publication.slice(0, 10)
            : '',
          notes: item.notes || '',
          assigneA: item.assigneA || '',
        });
      } catch (err) {
        setError('Impossible de charger ce contenu.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContenu();
  }, [siteId, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.titre.trim()) {
      setError('Le titre est requis.');
      return;
    }

    const payload = {
      titre: formData.titre,
      statut: formData.statut,
      date_publication: formData.date_publication
        ? new Date(formData.date_publication).toISOString()
        : null,
      notes: formData.notes || null,
      assigneA: formData.assigneA || null,
    };

    try {
      setSubmitting(true);
      setError('');
      await contentService.updateContenu(siteId, id, payload);
      navigate(`/sites/${siteId}/contenus`);
    } catch (err) {
      const backendError = err.response?.data?.message || 'Erreur lors de la modification.';
      setError(backendError);
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          Chargement du contenu...
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', fontFamily: 'sans-serif' }}>
        <h2>Modifier le contenu</h2>
        <p style={{ color: '#666' }}>Site #{siteId} — Contenu #{id}</p>

        {error && (
          <div style={{ padding: '10px', background: '#f8d7da', color: '#721c24', borderRadius: '4px', marginBottom: '15px' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Titre du contenu *
            </label>
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Statut
              </label>
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
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                Date de publication
              </label>
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
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Notes / Brief éditorial
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows="5"
              placeholder="Consignes pour le rédacteur..."
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
              Rédacteur Assigné (Optionnel)
            </label>
            <input
              type="text"
              name="assigneA"
              value={formData.assigneA}
              onChange={handleChange}
              placeholder="Ex: Babacar Fall"
              style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
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
              style={{ padding: '10px 15px', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', opacity: submitting ? 0.7 : 1 }}
            >
              {submitting ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
}