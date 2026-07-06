function Navbar() {
  return (
    <div className="bg-white shadow p-4 flex justify-between">

      <h2 className="font-semibold">
        Tableau de bord SEO
      </h2>

      <button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={() => {
          localStorage.removeItem("token");
          window.location.href = "/login";
        }}
      >
        Déconnexion
      </button>

    </div>
  );
}

export default Navbar;