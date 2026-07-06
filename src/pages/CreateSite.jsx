import { useState } from "react";
import { useNavigate, Link } from "react-router-dom"; // 1. Importez useNavigate et Link
import axios from "axios";
import MainLayout from "../layouts/MainLayout";

function CreateSite() {
  const [nom, setNom] = useState("");
  const [url, setUrl] = useState("");
  const [projectId, setProjectId] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const navigate = useNavigate(); // 2. Initialisez le hook de navigation

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!nom || !url || !projectId) return;

    try {
      setLoading(true);
      setMessage({ text: "", type: "" });

      await axios.post(
        "http://localhost:3000/api/sites",
        {
          nom,
          url,
          projetId: Number(projectId),
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      // Optionnel : On attend une fraction de seconde pour afficher le message de succès avant de rediriger
      setMessage({
        text: "Site ajouté avec succès ! Redirection...",
        type: "success",
      });

      setTimeout(() => {
        navigate("/sites"); // 3. Redirige vers la page de liste (adaptez le chemin si nécessaire)
      }, 1500);

    } catch (error) {
      console.error("Erreur lors de la création du site :", error);
      setMessage({
        text: error.response?.data?.message || "Erreur lors de l'ajout du site.",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
    <div className="max-w-md mx-auto p-6 bg-white shadow rounded-lg mt-10">
      {/* Bouton retour optionnel pour améliorer l'expérience utilisateur */}
      <Link to="/sites" className="text-sm text-slate-500 hover:text-blue-600 flex items-center mb-4">
         ← Retour à la liste
      </Link>

      <h2 className="text-2xl font-bold mb-6 text-slate-800">
        Ajouter un site
      </h2>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded text-sm font-medium ${
            message.type === "success"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* ... vos champs de formulaire restent identiques ... */}
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Identifiant du Projet
          </label>
          <input
            type="number"
            placeholder="Ex : 1"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Nom du site
          </label>
          <input
            type="text"
            placeholder="Ex : DGS Sénégal"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            URL du site
          </label>
          <input
            type="url"
            placeholder="https://monsite.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full p-3 border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full p-3 rounded font-medium text-white transition-colors ${
            loading
              ? "bg-slate-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Ajout en cours..." : "Ajouter le site"}
        </button>
      </form>
    </div>
    </MainLayout>
  );
}

export default CreateSite;