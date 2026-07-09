import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import contentService from '../services/contentService';
import { getSites } from '../services/siteService';
import MainLayout from '../layouts/MainLayout';

export default function Contents() {
  const { siteId: siteIdParam } = useParams();
  const [selectedSiteId, setSelectedSiteId] = useState(siteIdParam || '');
  const [sites, setSites] = useState([]);
  const [contents, setContents] = useState([]);
  const [calendar, setCalendar] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('list');

  // Charge la liste des sites au montage
  useEffect(() => {
    const fetchSites = async () => {
      try {
        const data = await getSites();
        setSites(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Erreur chargement sites :", err);
      }
    };
    fetchSites();
  }, []);

  // Charge les contenus quand un site est sélectionné
  useEffect(() => {
    if (!selectedSiteId) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');
        const [listRes, calendarRes] = await Promise.all([
          contentService.listContenus(selectedSiteId),
          contentService.getCalendrier(selectedSiteId)
        ]);
        setContents(listRes.data || []);
        setCalendar(calendarRes.data || {});
      } catch (err) {
        setError('Erreur lors du chargement des contenus éditoriaux.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSiteId]);

  const handleDelete = async (id, currentStatus) => {
    if (currentStatus === 'PUBLIE') {
      alert('Impossible de supprimer un contenu déjà publié.');
      return;
    }
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce contenu ?')) {
      try {
        await contentService.deleteContenu(selectedSiteId, id);
        setContents(prev => prev.filter(item => item.id !== id));
        const calendarRes = await contentService.getCalendrier(selectedSiteId);
        setCalendar(calendarRes.data || {});
      } catch (err) {
        alert(err.response?.data?.message || 'Erreur lors de la suppression.');
      }
    }
  };

  return (
    <MainLayout>
      <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>

        {/* Sélecteur de site */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ fontWeight: 'bold', marginRight: '10px' }}>
            Site :
          </label>
          <select
            value={selectedSiteId}
            onChange={(e) => setSelectedSiteId(e.target.value)}
            style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ccc', minWidth: '200px' }}
          >
            <option value="">-- Sélectionner un site --</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.nom} (#{s.id})
              </option>
            ))}
          </select>
        </div>

        {/* Message si aucun site sélectionné */}
        {!selectedSiteId && (
          <div style={{ padding: '40px', textAlign: 'center', color: '#666', background: '#f9f9f9', borderRadius: '8px' }}>
            Sélectionnez un site pour afficher ses contenus éditoriaux.
          </div>
        )}

        {/* Contenu principal */}
        {selectedSiteId && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>Contenus — Site #{selectedSiteId}</h2>
              <div>
                <button
                  onClick={() => setViewMode('list')}
                  style={{ marginRight: '10px', padding: '8px 12px', background: viewMode === 'list' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Vue Liste
                </button>
                <button
                  onClick={() => setViewMode('calendar')}
                  style={{ marginRight: '20px', padding: '8px 12px', background: viewMode === 'calendar' ? '#007bff' : '#ccc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                  Calendrier
                </button>
                <Link to={`/sites/${selectedSiteId}/contenus/creer`}>
                  <button style={{ padding: '8px 12px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                    + Créer un contenu
                  </button>
                </Link>
              </div>
            </div>

            {error && <div style={{ color: 'red', marginBottom: '15px' }}>{error}</div>}

            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
                Chargement des contenus...
              </div>
            ) : viewMode === 'list' ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f4f4', textAlign: 'left', borderBottom: '2px solid #ddd' }}>
                    <th style={{ padding: '12px' }}>Titre</th>
                    <th style={{ padding: '12px' }}>Statut</th>
                    <th style={{ padding: '12px' }}>Date de publication</th>
                    <th style={{ padding: '12px' }}>Notes</th>
                    <th style={{ padding: '12px' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {contents.length === 0 ? (
                    <tr>
                      <td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
                        Aucun contenu planifié.
                      </td>
                    </tr>
                  ) : (
                    contents.map((item) => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #ddd' }}>
                        <td style={{ padding: '12px', fontWeight: 'bold' }}>{item.titre}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{
                            padding: '4px 8px', borderRadius: '4px', fontSize: '12px',
                            background: item.statut === 'PUBLIE' ? '#d4edda' : item.statut === 'REDACTION' ? '#fff3cd' : '#e2e3e5',
                            color: item.statut === 'PUBLIE' ? '#155724' : item.statut === 'REDACTION' ? '#856404' : '#383d41'
                          }}>
                            {item.statut}
                          </span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          {item.date_publication ? new Date(item.date_publication).toLocaleDateString() : 'Non planifiée'}
                        </td>
                        <td style={{ padding: '12px', color: '#666', fontSize: '14px' }}>{item.notes || '-'}</td>
                        <td style={{ padding: '12px' }}>
                          <Link
                            to={`/sites/${selectedSiteId}/contenus/editer/${item.id}`}
                            style={{ marginRight: '10px', color: '#007bff', textDecoration: 'none' }}
                          >
                            Éditer
                          </Link>
                          <button
                            onClick={() => handleDelete(item.id, item.statut)}
                            style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', padding: 0 }}
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <div style={{ marginTop: '20px' }}>
                <h3>Aperçu Mensuel</h3>
                {Object.keys(calendar).length === 0 ? (
                  <p style={{ color: '#666' }}>Aucun contenu avec une date de publication définie.</p>
                ) : (
                  Object.entries(calendar).map(([mois, items]) => (
                    <div key={mois} style={{ marginBottom: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '6px', background: '#fafafa' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#007bff' }}>{mois}</h4>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {items.map((c) => (
                          <li key={c.id} style={{ marginBottom: '5px' }}>
                            <strong>{c.titre}</strong> — {new Date(c.date_publication).toLocaleDateString()} ({c.statut})
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </MainLayout>
  );
}