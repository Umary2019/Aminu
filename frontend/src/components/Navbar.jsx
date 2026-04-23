import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }) =>
  `text-sm font-semibold transition ${isActive ? "text-teal-700" : "text-slate-700 hover:text-teal-700"}`;

const Navbar = () => {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSearchClick = () => {
    if (user) {
      navigate("/search");
      return;
    }

    window.alert("You must register first to search papers.");
    navigate("/register");
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link to="/" className="font-display text-xl font-bold text-slate-900">
          PaperFinder
        </Link>

        <nav className="flex items-center gap-4">
          {user ? (
            <NavLink to="/search" className={navClass}>
              Search
            </NavLink>
          ) : (
            <button
              type="button"
              onClick={handleSearchClick}
              className="text-sm font-semibold text-slate-700 transition hover:text-teal-700"
            >
              Search
            </button>
          )}
          {user && (
            <NavLink to={isAdmin ? "/admin" : "/dashboard"} className={navClass}>
              Dashboard
            </NavLink>
          )}
          {!user && (
            <>
              <NavLink to="/login" className={navClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
              >
                Create Account
              </NavLink>
            </>
          )}
          {user && (
            <button
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
            >
              Logout
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
