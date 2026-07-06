import { Link } from "react-router-dom";

function Sidebar() {
  return (
    <div className="w-64 bg-slate-900 text-white min-h-screen">

      <div className="p-5 border-b border-slate-700">
        <h1 className="text-xl font-bold">
          DGS SEO
        </h1>
      </div>

      <nav className="p-4">

        <ul className="space-y-4">

          <li>
            <Link
              to="/dashboard"
              className="block hover:text-blue-400"
            >
              Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/sites"
              className="block hover:text-blue-400"
            >
              Sites
            </Link>
          </li>

          <li>
            <Link
              to="/keywords"
              className="block hover:text-blue-400"
            >
              Mots-clés
            </Link>
          </li>

          <li>
            <Link
              to="/projects"
              className="block hover:text-blue-400"
            >
              Projets
            </Link>
          </li>

          <li>
            <Link
              to="/audit"
              className="block hover:text-blue-400"
            >
              Audit
            </Link>
          </li>

          <li>
            <Link
              to="/recommendations"
              className="block hover:text-blue-400"
            >
              Recommendation
            </Link>
          </li>

          <li>
            <Link
              to="/contenus"
              className="block hover:text-blue-400"
            >
            Contenus
            </Link>
          </li>

        </ul>

      </nav>

    </div>
  );
}

export default Sidebar;