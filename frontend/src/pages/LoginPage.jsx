import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { user } = await login(form);
      const destination = location.state?.from || (user.role === "admin" ? "/admin" : "/dashboard");
      navigate(destination, { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass lg:grid-cols-2">
        <div className="relative bg-slate-900 p-8 text-white md:p-10">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-teal-400/30 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-amber-300">Student Portal</p>
          <h1 className="relative mt-3 font-display text-3xl font-bold leading-tight md:text-4xl">Welcome back</h1>
          <p className="relative mt-3 max-w-md text-sm text-slate-200 md:text-base">
            Sign in to search by faculty, department, and course code, then preview or download past papers instantly.
          </p>
          <ul className="relative mt-6 space-y-2 text-sm text-slate-200">
            <li>Role-based access for students and admins</li>
            <li>Structured smart search for faster revision</li>
            <li>Comment and rating support for peer quality</li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <h2 className="font-display text-2xl font-bold text-slate-900">Login to Continue</h2>
          <p className="mt-2 text-sm text-slate-600">Use your registered account credentials.</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="mt-5 space-y-3">
            <input
              type="text"
              placeholder="Email address"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-6 w-full rounded-xl bg-teal-700 px-4 py-3 font-semibold text-white transition hover:bg-teal-800 disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
          </button>

          <p className="mt-4 text-sm text-slate-600">
            No account?{" "}
            <Link to="/register" className="font-semibold text-teal-700">
              Register
            </Link>
          </p>
        </form>
      </section>
    </main>
  );
};

export default LoginPage;
