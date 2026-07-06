import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getAuditResult } from "../services/auditService";
import MainLayout from "../layouts/MainLayout";

const POLL_INTERVAL_MS = 4000;
const PENDING_STATUSES = ["pending", "running", "en_cours", "in_progress"];

const SEVERITY_STYLES = {
  critique: "bg-red-50 text-red-800 border-red-500",
  critical: "bg-red-50 text-red-800 border-red-500",
  avertissement: "bg-amber-50 text-amber-800 border-amber-500",
  warning: "bg-amber-50 text-amber-800 border-amber-500",
  info: "bg-blue-50 text-blue-800 border-blue-500",
};

const SEVERITY_LABELS = {
  critique: "Critique",
  critical: "Critique",
  avertissement: "Avertissement",
  warning: "Avertissement",
  info: "Info",
};

function AuditResults() {
  const { id } = useParams(); // Récupère l'identifiant du site (ou de l'audit) depuis l'URL

  const [audit, setAudit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(false);

  const pollTimeoutRef = useRef(null);
  const isMountedRef = useRef(true);

  const extractAudit = (response) => {
    const data = response?.data || response;
    if (Array.isArray(data) && data.length > 0) {
      // Prend l'audit le plus récent (en supposant un tri par date côté API ou id décroissant)
      return [...data].sort((a, b) => {
        const dateA = new Date(a.createdAt || a.date || 0).getTime();
        const dateB = new Date(b.createdAt || b.date || 0).getTime();
        return dateB - dateA;
      })[0];
    }
    if (data && (data.id || data.score !== undefined || data.status)) {
      return data;
    }
    return null;
  };

  const fetchAudit = useCallback(
    async ({ silent = false } = {}) => {
      try {
        if (!silent) setLoading(true);
        const response = await getAuditResult(id);
        if (!isMountedRef.current) return;

        const result = extractAudit(response);
        setAudit(result);
        setError(null);

        const status = (result?.status || "").toLowerCase();
        const stillPending = result && PENDING_STATUSES.includes(status);

        if (stillPending) {
          setIsPolling(true);
          pollTimeoutRef.current = setTimeout(
            () => fetchAudit({ silent: true }),
            POLL_INTERVAL_MS
          );
        } else {
          setIsPolling(false);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération de l'audit :", err);
        if (isMountedRef.current) {
          setError("Impossible de charger les résultats de l'audit.");
          setIsPolling(false);
        }
      } finally {
        if (isMountedRef.current && !silent) setLoading(false);
      }
    },
    [id]
  );

  useEffect(() => {
    isMountedRef.current = true;
    if (id) fetchAudit();

    return () => {
      isMountedRef.current = false;
      if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
    };
  }, [id, fetchAudit]);

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 50) return "text-orange-600 bg-orange-50 border-orange-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getScoreRingColor = (score) => {
    if (score >= 80) return "#16a34a";
    if (score >= 50) return "#ea580c";
    return "#dc2626";
  };

  // --- Normalise les anomalies, qu'elles soient des strings, du JSON stringifié, ou des objets {message, severity} ---
  const parsedIssues = (() => {
    if (!audit || !audit.issues) return [];
    let issuesList = audit.issues;

    if (typeof issuesList === "string") {
      try {
        issuesList = JSON.parse(issuesList);
      } catch {
        return [{ message: audit.issues, severity: "avertissement" }];
      }
    }

    if (!Array.isArray(issuesList)) return [];

    return issuesList.map((issue) => {
      if (typeof issue === "string") {
        return { message: issue, severity: "avertissement" };
      }
      return {
        message: issue.message || issue.description || JSON.stringify(issue),
        severity: (issue.severity || issue.niveau || "avertissement").toLowerCase(),
      };
    });
  })();

  const issuesBySeverity = parsedIssues.reduce((acc, issue) => {
    const key = SEVERITY_LABELS[issue.severity] ? issue.severity : "avertissement";
    acc[key] = acc[key] || [];
    acc[key].push(issue);
    return acc;
  }, {});

  const severityOrder = ["critique", "critical", "avertissement", "warning", "info"];
  const orderedSeverityKeys = severityOrder.filter((s) => issuesBySeverity[s]?.length);

  // --- Sous-scores par catégorie, si fournis par l'API (audit.details / audit.categories) ---
  const categoryScores = audit?.details || audit?.categories || null;

  const status = (audit?.status || "").toLowerCase();
  const isPending = PENDING_STATUSES.includes(status);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto mt-6 px-4">
        <Link
          to="/audit"
          className="text-sm text-slate-500 hover:text-blue-600 transition-colors block mb-4"
        >
          ← Retour aux audits
        </Link>

        {loading ? (
          <div className="flex justify-center items-center h-48 bg-white shadow rounded-lg">
            <p className="text-slate-500 font-medium animate-pulse">
              Chargement des résultats de l'audit...
            </p>
          </div>
        ) : error ? (
          <div className="p-6 text-center text-red-700 bg-red-50 rounded shadow border border-red-200">
            {error}
            <button
              onClick={() => fetchAudit()}
              className="block mx-auto mt-3 text-sm text-blue-600 hover:underline"
            >
              Réessayer
            </button>
          </div>
        ) : !audit ? (
          <div className="p-6 text-center text-red-700 bg-red-50 rounded shadow border border-red-200">
            Aucun résultat trouvé pour cet audit (ID du site : {id}).
          </div>
        ) : isPending ? (
          <div className="flex flex-col items-center justify-center h-56 bg-white shadow rounded-lg gap-3">
            <div className="h-10 w-10 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-slate-600 font-medium">
              Audit en cours d'exécution... les résultats s'afficheront automatiquement.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-start justify-between border-b pb-3 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Résultat de l'Audit #{audit.id ?? "—"} (Site #{id})
                </h2>
                {(audit.url || audit.createdAt) && (
                  <p className="text-sm text-slate-500 mt-1">
                    {audit.url && <span className="mr-3">{audit.url}</span>}
                    {audit.createdAt && (
                      <span>
                        Réalisé le{" "}
                        {new Date(audit.createdAt).toLocaleString("fr-FR")}
                      </span>
                    )}
                  </p>
                )}
              </div>
              <button
                onClick={() => fetchAudit()}
                className="text-sm px-3 py-1.5 rounded border hover:bg-slate-50 whitespace-nowrap"
              >
                Actualiser
              </button>
            </div>

            {/* --- Score global --- */}
            <div
              className={`mb-6 p-4 rounded-lg flex items-center justify-between border ${getScoreColor(
                audit.score
              )}`}
            >
              <span className="font-semibold text-lg">Score Global :</span>
              <span className="text-3xl font-black">{audit.score} / 100</span>
            </div>

            {/* --- Sous-scores par catégorie, si l'API les fournit --- */}
            {categoryScores && Object.keys(categoryScores).length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-slate-700">
                  Détail par catégorie
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(categoryScores).map(([key, value]) => {
                    const catScore =
                      typeof value === "object" ? value.score : value;
                    return (
                      <div
                        key={key}
                        className={`p-3 rounded border text-center ${getScoreColor(
                          catScore
                        )}`}
                      >
                        <p className="text-xs uppercase tracking-wide opacity-75">
                          {key}
                        </p>
                        <p className="text-xl font-bold">{catScore}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* --- Résumé des anomalies par sévérité --- */}
            <div className="flex flex-wrap gap-3 mb-6">
              {severityOrder
                .filter((s) => ["critique", "avertissement", "info"].includes(s))
                .map((s) => {
                  const count =
                    (issuesBySeverity[s]?.length || 0) +
                    (s === "critique" ? issuesBySeverity["critical"]?.length || 0 : 0) +
                    (s === "avertissement" ? issuesBySeverity["warning"]?.length || 0 : 0);
                  return (
                    <span
                      key={s}
                      className={`text-sm px-3 py-1 rounded-full border ${SEVERITY_STYLES[s]}`}
                    >
                      {SEVERITY_LABELS[s]} : {count}
                    </span>
                  );
                })}
            </div>

            <h3 className="text-lg font-semibold mb-3 text-slate-700">
              Points analysés et anomalies détectées
            </h3>

            {parsedIssues.length === 0 ? (
              <p className="text-green-600 bg-green-50 p-4 rounded text-sm font-medium border border-green-200">
                Aucun problème détecté lors de cet audit.
              </p>
            ) : (
              <div className="space-y-5">
                {orderedSeverityKeys.map((sevKey) => (
                  <div key={sevKey}>
                    <p className="text-sm font-semibold text-slate-600 mb-2">
                      {SEVERITY_LABELS[sevKey]} ({issuesBySeverity[sevKey].length})
                    </p>
                    <ul className="space-y-2">
                      {issuesBySeverity[sevKey].map((issue, index) => (
                        <li
                          key={index}
                          className={`p-3 rounded border-l-4 text-sm shadow-sm ${SEVERITY_STYLES[sevKey]}`}
                        >
                          {issue.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {isPolling && !loading && (
          <p className="text-xs text-slate-400 text-center mt-3">
            Mise à jour automatique en cours...
          </p>
        )}
      </div>
    </MainLayout>
  );
}

export default AuditResults;