import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useMemo, useState } from "react";
import api from "../services/api";
import PaperCard from "../components/PaperCard";

const StudentDashboardPage = () => {
  const { user } = useAuth();
  const [papers, setPapers] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadLatest = async () => {
      try {
        const [papersRes, favoritesRes, recRes, noteRes, activityRes] = await Promise.all([
          api.get("/papers", { params: { limit: 6 } }),
          api.get("/student/favorites"),
          api.get("/student/recommendations"),
          api.get("/student/notifications"),
          api.get("/student/activity", { params: { limit: 20 } }),
        ]);
        setPapers(papersRes.data.papers || []);
        setFavorites(favoritesRes.data.papers || []);
        setRecommendations(recRes.data.recommendations || []);
        setNotifications(noteRes.data.notifications || []);
        setActivities(activityRes.data.activities || []);
        localStorage.setItem("pqf_dashboard_cache", JSON.stringify(papersRes.data.papers || []));
      } catch (apiError) {
        const cached = localStorage.getItem("pqf_dashboard_cache");
        if (cached) {
          setPapers(JSON.parse(cached));
          setError("Network issue: showing cached dashboard papers.");
        } else {
          setError(apiError.response?.data?.message || "Unable to load your dashboard data");
        }
      } finally {
        setLoading(false);
      }
    };

    loadLatest();
  }, []);

  const dashboardInsights = useMemo(() => {
    const faculties = new Set();
    const departments = new Set();
    const levels = new Set();
    const courseFrequency = {};

    papers.forEach((paper) => {
      if (paper.faculty) faculties.add(paper.faculty);
      if (paper.department) departments.add(paper.department);
      if (paper.level) levels.add(paper.level);
      if (paper.courseCode) {
        courseFrequency[paper.courseCode] = (courseFrequency[paper.courseCode] || 0) + 1;
      }
    });

    const topCourseCodes = Object.entries(courseFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([code, count]) => ({ code, count }));

    return {
      facultyCount: faculties.size,
      departmentCount: departments.size,
      levelCount: levels.size,
      topCourseCodes,
    };
  }, [papers]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-glass md:p-8">
        <div className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-teal-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-32 w-32 rounded-full bg-amber-200/20 blur-2xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-teal-200">Student Workspace</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Welcome back, {user?.name}</h1>
        <p className="mt-2 max-w-3xl text-slate-200">
          Track available papers, discover trending course codes, and move from search to preview to download in one flow.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/search"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Start Smart Search
          </Link>
          <Link
            to="/search"
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Filter by Faculty / Level
          </Link>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Available Now</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{papers.length}</p>
          <p className="mt-1 text-sm text-slate-600">Approved papers in your latest feed</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Faculties Covered</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{dashboardInsights.facultyCount}</p>
          <p className="mt-1 text-sm text-slate-600">From your current recommendation window</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Departments Covered</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{dashboardInsights.departmentCount}</p>
          <p className="mt-1 text-sm text-slate-600">Diverse course neighborhoods available</p>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs uppercase tracking-wider text-slate-500">Levels Active</p>
          <p className="mt-2 font-display text-3xl font-bold text-slate-900">{dashboardInsights.levelCount}</p>
          <p className="mt-1 text-sm text-slate-600">100 to 600 level coverage snapshots</p>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">Study List (Favorites)</h2>
            <span className="text-xs font-bold text-amber-700">{favorites.length} saved</span>
          </div>
          <div className="mt-4 space-y-2">
            {favorites.length === 0 ? (
              <p className="text-sm text-slate-500">Save papers from search to build your revision list.</p>
            ) : (
              favorites.slice(0, 6).map((paper) => (
                <Link key={paper._id} to={`/papers/${paper._id}`} className="block rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{paper.courseCode} - {paper.title}</p>
                  <p className="text-xs text-slate-600">{paper.department} • {paper.year}</p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold text-slate-900">Recommendations</h2>
            <span className="text-xs font-bold text-teal-700">AI-like matching</span>
          </div>
          <div className="mt-4 space-y-2">
            {recommendations.length === 0 ? (
              <p className="text-sm text-slate-500">Use search and paper views to train recommendations.</p>
            ) : (
              recommendations.slice(0, 6).map((paper) => (
                <Link key={paper._id} to={`/papers/${paper._id}`} className="block rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{paper.courseCode} - {paper.title}</p>
                  <p className="text-xs text-slate-600">{paper.faculty} • {paper.level} Level</p>
                </Link>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Notifications</h2>
          <div className="mt-4 space-y-2">
            {notifications.length === 0 ? (
              <p className="text-sm text-slate-500">No notifications yet.</p>
            ) : (
              notifications.slice(0, 8).map((notification) => (
                <Link
                  key={notification._id}
                  to={notification.paperId ? `/papers/${notification.paperId}` : "/search"}
                  className="block rounded-lg bg-slate-50 px-3 py-2"
                >
                  <p className="text-sm font-semibold text-slate-800">{notification.title}</p>
                  <p className="text-xs text-slate-600">{notification.message}</p>
                </Link>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Recent Activity</h2>
          <div className="mt-4 space-y-2">
            {activities.length === 0 ? (
              <p className="text-sm text-slate-500">No activity recorded yet.</p>
            ) : (
              activities.slice(0, 8).map((item) => (
                <div key={item._id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold capitalize text-slate-800">{item.action}</p>
                  <p className="text-xs text-slate-600">{item.paperId?.courseCode || "General"} - {item.paperId?.title || "Search Event"}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl font-bold text-slate-900">Latest Papers</h2>
            <Link to="/search" className="text-sm font-semibold text-teal-700">
              View all →
            </Link>
          </div>

          {loading && <p className="mt-4 text-slate-600">Loading latest papers...</p>}
          {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}

          {!loading && !error && (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {papers.length === 0 ? (
                <article className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                  <h3 className="font-display text-lg font-bold text-slate-900">No Papers Yet</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    There are no approved papers yet. Once admins upload and approve, they will appear here instantly.
                  </p>
                </article>
              ) : (
                papers.map((paper) => <PaperCard key={paper._id} paper={paper} />)
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900">Trending Course Codes</h3>
            <p className="mt-1 text-sm text-slate-600">Most frequent codes in your current feed.</p>
            <div className="mt-3 space-y-2">
              {dashboardInsights.topCourseCodes.length === 0 ? (
                <p className="text-sm text-slate-500">No trend data yet.</p>
              ) : (
                dashboardInsights.topCourseCodes.map((item) => (
                  <div key={item.code} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                    <span className="font-semibold text-slate-800">{item.code}</span>
                    <span className="text-xs font-bold text-teal-700">{item.count} papers</span>
                  </div>
                ))
              )}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="font-display text-lg font-bold text-slate-900">Study Workflow</h3>
            <ol className="mt-3 space-y-2 text-sm text-slate-600">
              <li>1. Use Smart Search with faculty, department, and level filters.</li>
              <li>2. Open paper details to preview first page before download.</li>
              <li>3. Drop ratings and comments to help other students.</li>
            </ol>
          </section>
        </aside>
      </section>
    </main>
  );
};

export default StudentDashboardPage;
