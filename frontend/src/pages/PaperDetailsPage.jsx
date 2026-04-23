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
  const [error, setError] = useState("");

  const fetchDetails = async () => {
    try {
      const [paperRes, commentsRes] = await Promise.all([
        api.get(`/papers/${id}`),
        api.get(`/comments/paper/${id}`),
      ]);

      setPaper(paperRes.data.paper);
      setRatingSummary(paperRes.data.ratingSummary);
      setComments(commentsRes.data.comments);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not load paper details");
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

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

  if (error) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-red-700">{error}</main>;
  }

  if (!paper) {
    return <main className="mx-auto max-w-4xl px-4 py-10 text-slate-600">Loading paper...</main>;
  }

  const isDemoPaper = paper.isDemo === true;
  const previewUrl = `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/papers/${id}/preview`;

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6">
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
              className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white"
            >
              Open PDF
            </a>
            <a
              href={paper.fileUrl}
              download
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-800"
            >
              Download PDF
            </a>
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
        </aside>
      </div>
    </main>
  );
};

export default PaperDetailsPage;
