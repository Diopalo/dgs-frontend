import { useState, useRef, useEffect } from "react";
import { launchAudit, getAuditResult } from "../services/auditService"; 
import MainLayout from "../layouts/MainLayout";

function AuditPage() {
  const [siteId, setSiteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [auditResult, setAuditResult] = useState(null);
  
  const pollingInterval = useRef(null);

  useEffect(() => {
    return () => {
      if (pollingInterval.current) clearInterval(pollingInterval.current);
    };
  }, []);

  // Fonction de vérification cyclique améliorée
  const startPolling = (idDuSite) => {
  if (pollingInterval.current) clearInterval(pollingInterval.current);

  let attempts = 0;

  pollingInterval.current = setInterval(async () => {
    attempts++;
    try {
      const response = await getAuditResult(idDuSite);

      console.log(`[Polling essai #${attempts}] Réponse reçue :`, response);

      let data = response?.data || response;

      let audit = null;
      if (Array.isArray(data)) {
        audit = data[data.length - 1];
      } else {
        audit = data;
      }

      console.log(`[Polling essai #${attempts}] Audit extrait :`, audit);

      if (audit && audit.score !== undefined && audit.score !== null) {
        console.log("Score détecté ! Arrêt du polling.", audit.score);
        setAuditResult(audit);
        setLoading(false);
        setMessage({ text: "Audit terminé avec succès !", type: "success" });
        clearInterval(pollingInterval.current);
      } else {
        console.log("Pas encore de score, on continue...");
      }
    } catch (err) {
      console.error("Erreur lors du polling :", err);
    }

    if (attempts > 20) {
      console.warn("Délai dépassé. Arrêt du polling.");
      setMessage({ text: "L'audit prend plus de temps que prévu.", type: "info" });
      setLoading(false);
      clearInterval(pollingInterval.current);
    }
  }, 3000);
};

  const handleAudit = async (e) => {
    e.preventDefault();
    if (!siteId) return;

    try {
      setLoading(true);
      setMessage({ text: "Initialisation de l'audit en cours...", type: "info" });
      setAuditResult(null); 

      console.log(`Lancement de l'audit pour le site ID: ${siteId}`);
      await launchAudit(siteId);
      
      setMessage({
        text: `Audit lancé. Analyse et calcul du score en cours, veuillez patienter...`,
        type: "success",
      });

      // On lance la vérification en boucle
      startPolling(siteId);
      setSiteId(""); 
    } catch (error) {
      console.error("Erreur lors du déclenchement initial :", error);
      setMessage({
        text: "Impossible de démarrer l'audit. Vérifiez l'ID du site.",
        type: "error",
      });
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const renderIssues = () => {
    if (!auditResult || !auditResult.issues) return null;
    
    let issuesList = auditResult.issues;
    if (typeof issuesList === 'string') {
      try {
        issuesList = JSON.parse(issuesList);
      } catch (e) {
        return <li className="p-3 bg-red-50 text-red-800 rounded text-sm shadow-sm">{auditResult.issues}</li>;
      }
    }

    if (Array.isArray(issuesList) && issuesList.length > 0) {
      return issuesList.map((issue, index) => (
        <li key={index} className="p-3 bg-red-50 text-red-800 rounded border-l-4 border-red-500 text-sm shadow-sm">
          {issue}
        </li>
      ));
    }

    return (
      <p className="text-green-600 bg-green-50 p-4 rounded text-sm font-medium border border-green-200">
        Aucun problème détecté lors de cet audit ! 👍
      </p>
    );
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto mt-10 px-4 space-y-6">
        
        <div className="p-6 bg-white shadow rounded-lg border border-slate-200">
          <h2 className="text-2xl font-bold mb-6 text-slate-800">Lancer un audit</h2>

          {message.text && (
            <div className={`mb-4 p-3 rounded text-sm font-medium ${
              message.type === "success" ? "bg-blue-50 text-blue-800 border border-blue-200" : 
              message.type === "error" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleAudit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-600 mb-1">Identifiant du site</label>
              <input
                type="number"
                placeholder="Ex: 12"
                value={siteId}
                onChange={(e) => setSiteId(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading || !siteId}
              className={`w-full p-3 rounded font-medium text-white transition-colors flex justify-center items-center gap-2 ${
                loading || !siteId ? "bg-slate-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading && (
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {loading ? "Analyse en cours..." : "Lancer l'audit"}
            </button>
          </form>
        </div>

        {/* Zone de résultats */}
        {auditResult && !loading && (
          <div className="bg-white shadow rounded-lg p-6 border border-slate-200 animate-fadeIn">
            <h2 className="text-xl font-bold mb-4 text-slate-800 border-b pb-3">
              Résultats de l'Audit {auditResult.id ? `#${auditResult.id}` : ""}
            </h2>

            <div className={`mb-6 p-4 rounded-lg flex items-center justify-between border ${getScoreColor(auditResult.score)}`}>
              <span className="font-semibold text-base">Score Global du Site :</span>
              <span className="text-3xl font-black">{auditResult.score} / 100</span>
            </div>

            <h3 className="text-base font-semibold mb-3 text-slate-700">Anomalies détectées à corriger</h3>
            <ul className="space-y-2">{renderIssues()}</ul>
          </div>
        )}

      </div>
    </MainLayout>
  );
}

export default AuditPage;