import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await register(form);
      navigate("/dashboard", { replace: true });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-12 md:px-6">
      <section className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-glass lg:grid-cols-2">
        <form onSubmit={handleSubmit} className="p-8 md:p-10">
          <h1 className="font-display text-2xl font-bold text-slate-900">Create your account</h1>
          <p className="mt-2 text-sm text-slate-600">Get personalized access to the GSU past paper library.</p>

          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <div className="mt-5 space-y-3">
            <input
              type="text"
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full rounded-xl border px-4 py-3"
              required
            />
            <input
              type="email"
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
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="mt-4 text-sm text-slate-600">
            Already registered?{" "}
            <Link to="/login" className="font-semibold text-teal-700">
              Login
            </Link>
          </p>
        </form>

        <aside className="relative bg-amber-50 p-8 md:p-10">
          <div className="pointer-events-none absolute -right-14 top-8 h-44 w-44 rounded-full bg-amber-200/50 blur-3xl" />
          <p className="relative text-xs font-bold uppercase tracking-[0.2em] text-amber-700">Why Register</p>
          <h2 className="relative mt-3 font-display text-3xl font-bold text-slate-900">Your exam prep hub</h2>
          <ul className="relative mt-5 space-y-3 text-sm text-slate-700">
            <li>Access structured faculty and department filters</li>
            <li>Preview and download available papers quickly</li>
            <li>Rate and comment on useful papers for others</li>
          </ul>
        </aside>
      </section>
    </main>
  );
};

export default RegisterPage;
