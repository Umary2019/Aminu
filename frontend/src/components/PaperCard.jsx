import { Link } from "react-router-dom";
import { useState } from "react";
import api from "../services/api";
import { useAuth } from "../context/AuthContext";

const PaperCard = ({ paper }) => {
  const { isAuthenticated } = useAuth();
  const [saving, setSaving] = useState(false);

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      setSaving(true);
      await api.post("/student/favorites", { paperId: paper._id });
    } catch (_) {
      // Keep UI non-blocking for quick-save actions.
    } finally {
      setSaving(false);
    }
  };

  const handleDownload = async () => {
    if (!isAuthenticated) return;
    try {
      await api.post(`/papers/${paper._id}/download`);
    } catch (_) {
      // Ignore tracking failures and allow direct download.
    }
  };

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-glass">
      <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{paper.courseCode}</p>
      <h3 className="mt-2 font-display text-lg font-semibold text-slate-900">{paper.title}</h3>
      <p className="mt-2 text-sm text-slate-600">
        {paper.faculty} • {paper.department}
      </p>
      <p className="mt-1 text-sm text-slate-600">
        {paper.level} • {paper.semester} Semester • {paper.year}
      </p>

      <div className="mt-4 flex gap-2">
        <Link
          to={`/papers/${paper._id}`}
          className="rounded-lg bg-teal-700 px-3 py-2 text-sm font-semibold text-white transition hover:bg-teal-800"
        >
          View Details
        </Link>
        {isAuthenticated && (
          <button
            type="button"
            onClick={handleFavorite}
            disabled={saving}
            className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-semibold text-amber-700"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        )}
        <a
          href={paper.fileUrl}
          target="_blank"
          rel="noreferrer"
          onClick={handleDownload}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800"
        >
          Download
        </a>
      </div>
    </article>
  );
};

export default PaperCard;
