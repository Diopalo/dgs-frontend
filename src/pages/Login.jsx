import { useState } from "react";
import { login } from "../services/authService";
import { useNavigate, Link } from "react-router-dom";



function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [erreur, setErreur] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await login({
        email,
        password,
      });

      console.log(response);

     const tokenToStore = response.token || response.accessToken || (response.data && response.data.token);

if (tokenToStore) {
  localStorage.setItem("token", tokenToStore);
  navigate("/dashboard");
} else {
  console.error("Structure de réponse inconnue :", response);
  setErreur("Erreur de configuration du serveur de connexion.");
}

      navigate("/dashboard");
    } catch (error) {
      console.error(error);

      setErreur(
        "Email ou mot de passe incorrect."
      );
    }
  };

  return (
    
    <div className="min-h-screen flex items-center justify-center bg-slate-100">

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-6">
          DGS SEO Platforme
        </h1>

        <p className="text-center text-gray-500 mb-6">
          Connexion à votre compte
        </p>

        {erreur && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4">
            {erreur}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-4">
            <label className="block mb-2">
              Email
            </label>

            <input
              type="email"
              className="w-full border rounded p-3"
              placeholder="email@gmail.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
            />
          </div>

          <div className="mb-4">
            <label className="block mb-2">
              Mot de passe
            </label>

            <input
              type="password"
              className="w-full border rounded p-3"
              placeholder="********"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700">
            Se connecter
          </button>

            
          <p>
            <br />
            Pas encore de compte ? <Link to="/inscription"> <b> S'inscrire</b></Link>
          </p>

        </form>

      </div>

    </div>
    
  );
}

export default Login;