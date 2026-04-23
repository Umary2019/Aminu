import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";
import RatingStars from "../components/RatingStars";

const PaperDetailsPage = () => {
  const { id } = useParams();
  const { isAuthenticated } = useAuth();

  const [paper, setPaper] = useState(null);
  const [comments, setComments] = useState([]);
  const [ratingSummary, setRatingSummary] = useState({ averageRating: 0, totalRatings: 0 });
  const [userRating, setUserRating] = useState(0);
  const [commentText, setCommentText] = useState("");
  const [reportReason, setReportReason] = useState("wrong-paper");
  const [reportDetails, setReportDetails] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");

  const fetchDetails = async () => {
    setLoadError("");
    try {
      const paperRes = await api.get(`/papers/${id}`);
      setPaper(paperRes.data.paper);
      setRatingSummary(paperRes.data.ratingSummary);

      try {
        const commentsRes = await api.get(`/comments/paper/${id}`);
        setComments(commentsRes.data.comments || []);
      } catch (_commentsError) {
        setComments([]);
      }
    } catch (apiError) {
      setLoadError(apiError.response?.data?.message || "Could not load paper details");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  useEffect(() => {
    if (!isAuthenticated) return;
    api.post(`/papers/${id}/view`).catch(() => {});
  }, [id, isAuthenticated]);

  const submitRating = async (value) => {
    if (!isAuthenticated) {
      setError("Login to rate this paper.");
      return;
    }

    try {
      setError("");
      setUserRating(value);
      await api.post("/ratings", { paperId: id, rating: value });
      const summary = await api.get(`/ratings/paper/${id}`);
      setRatingSummary(summary.data);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to save rating");
    }
  };

  const submitComment = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError("Login to comment on this paper.");
      return;
    }

    if (!commentText.trim()) {
      return;
    }

    try {
      setError("");
      await api.post("/comments", { paperId: id, comment: commentText });
      setCommentText("");
      await fetchDetails();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Unable to post comment");
    }
  };

  const saveFavorite = async () => {
    if (!isAuthenticated) {
      setError("Login to save papers to your study list.");
      return;
    }

    try {
      setError("");
      await api.post("/student/favorites", { paperId: id });
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not save to favorites");
    }
  };

  const submitReport = async (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      setError("Login to report papers.");
      return;
    }

    try {
      setError("");
      await api.post("/student/reports", {
        paperId: id,
        reason: reportReason,
        details: reportDetails,
      });
      setReportDetails("");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not submit report");
    }
  };

  const trackDownload = () => {
    if (!isAuthenticated) return;
    api.post(`/papers/${id}/download`).catch(() => {});
  };

  if (!paper && loadError) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-red-700">{loadError}</main>;
  }

  if (!paper && !loadError) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Loading paper...</main>;
  }

  const isDemoPaper = paper.isDemo === true;
  const previewUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/papers/${id}/preview`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
      {error && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-amber-800">{error}</p>}
      {isDemoPaper && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Sample Paper:</strong> This is a starter sample paper. Replace with real uploads as admin.
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-teal-700">{paper.courseCode}</p>
          <h1 className="mt-2 font-display text-3xl font-bold text-slate-900">{paper.title}</h1>
          <p className="mt-3 text-slate-600">
            {paper.faculty} • {paper.department} • {paper.level} • {paper.semester} Semester • {paper.year}
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={paper.fileUrl}
              target="_blank"
              rel="noreferrer"
              onClick={trackDownload}
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Open PDF
            </a>
            <a
              href={paper.fileUrl}
              download
              onClick={trackDownload}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            >
              Download PDF
            </a>
            <button
              type="button"
              onClick={saveFavorite}
              className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700"
            >
              Save to Study List
            </button>
          </div>

          <div className="mt-6">
            <h2 className="font-display text-lg font-bold">Preview</h2>
            <iframe
              src={previewUrl}
              title={paper.title}
              className="mt-3 h-[500px] w-full rounded-lg border"
            />
            <p className="mt-2 text-xs text-slate-500">
              If preview does not load, use Open PDF to view in a new tab.
            </p>
          </div>
        </section>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-display text-lg font-bold">Rating</h2>
            <p className="mt-1 text-sm text-slate-600">
              Average: {ratingSummary.averageRating} / 5 ({ratingSummary.totalRatings} ratings)
            </p>
            {isDemoPaper && (
              <p className="mt-3 text-xs text-slate-500">Ratings disabled for sample papers.</p>
            )}
            {!isDemoPaper && (
              <div className="mt-3">
                <RatingStars rating={userRating} onChange={submitRating} interactive={isAuthenticated} />
              </div>
            )}
          </section>

          {!isDemoPaper && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Comments</h2>
              <form onSubmit={submitComment} className="mt-3">
                <textarea
                  value={commentText}
                  onChange={(event) => setCommentText(event.target.value)}
                  className="h-24 w-full rounded-lg border p-2"
                  placeholder="Share your feedback..."
                />
                <button className="mt-2 rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">
                  Post Comment
                </button>
              </form>

              <div className="mt-4 space-y-3">
                {comments.length === 0 ? (
                  <p className="text-sm text-slate-600">No comments yet.</p>
                ) : (
                  comments.map((item) => (
                    <article key={item._id} className="rounded-lg border border-slate-200 p-3">
                      <p className="text-sm font-bold text-slate-800">{item.userId?.name || "Student"}</p>
                      <p className="mt-1 text-sm text-slate-600">{item.comment}</p>
                    </article>
                  ))
                )}
              </div>
            </section>
          )}

          {!isDemoPaper && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg font-bold">Report Paper</h2>
              <form onSubmit={submitReport} className="mt-3 space-y-2">
                <select
                  value={reportReason}
                  onChange={(event) => setReportReason(event.target.value)}
                  className="w-full rounded-lg border px-3 py-2"
                >
                  <option value="wrong-paper">Wrong Paper</option>
                  <option value="bad-scan">Bad Scan</option>
                  <option value="wrong-course">Wrong Course Code</option>
                  <option value="duplicate">Duplicate</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  value={reportDetails}
                  onChange={(event) => setReportDetails(event.target.value)}
                  className="h-20 w-full rounded-lg border p-2"
                  placeholder="Optional details..."
                />
                <button className="rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700">
                  Submit Report
                </button>
              </form>
            </section>
          )}
        </aside>
      </div>
    </main>
  );
};

export default PaperDetailsPage;
