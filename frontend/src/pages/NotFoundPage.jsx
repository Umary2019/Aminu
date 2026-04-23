import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="mx-auto max-w-xl px-4 py-20 text-center">
      <h1 className="font-display text-4xl font-bold text-slate-900">404</h1>
      <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
      <Link
        to="/"
        className="mt-6 inline-block rounded-lg bg-teal-700 px-5 py-2 text-sm font-semibold text-white"
      >
        Go Home
      </Link>
    </main>
  );
};

export default NotFoundPage;
