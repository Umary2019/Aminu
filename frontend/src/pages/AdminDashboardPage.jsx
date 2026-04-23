import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { facultyNames, getCoursesByDepartment, getDepartmentsByFaculty, gsuCatalog } from "../data/gsuCatalog";

const emptyUploadForm = {
  title: "",
  courseCode: "",
  faculty: "",
  department: "",
  level: "",
  year: "",
  semester: "First",
  paper: null,
};

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [papers, setPapers] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [comments, setComments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [paperFilters, setPaperFilters] = useState({ search: "", status: "", includeDeleted: false, page: 1, limit: 20 });
  const [userFilters, setUserFilters] = useState({ search: "", role: "", page: 1, limit: 20 });
  const [paperPagination, setPaperPagination] = useState(null);
  const [userPagination, setUserPagination] = useState(null);
  const [uploadForm, setUploadForm] = useState(emptyUploadForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busyAction, setBusyAction] = useState("");

  const fetchDashboardData = async () => {
    try {
      const [analyticsRes, papersRes, usersRes] = await Promise.all([
        api.get("/admin/analytics"),
        api.get("/admin/papers", { params: paperFilters }),
        api.get("/admin/users", { params: userFilters }),
      ]);
      setAnalytics(analyticsRes.data);
      setPapers(papersRes.data.papers);
      setUsers(usersRes.data.users);
      setPaperPagination(papersRes.data.pagination || null);
      setUserPagination(usersRes.data.pagination || null);
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not load admin dashboard");
    }
  };

  const fetchModerationFeeds = async () => {
    try {
      const [reportsRes, commentsRes, auditRes] = await Promise.all([
        api.get("/admin/reports", { params: { limit: 10 } }),
        api.get("/admin/comments", { params: { limit: 10 } }),
        api.get("/admin/audit", { params: { limit: 10 } }),
      ]);
      setReports(reportsRes.data.reports || []);
      setComments(commentsRes.data.comments || []);
      setAuditLogs(auditRes.data.logs || []);
    } catch (_error) {
      // Keep dashboard resilient if optional feeds fail.
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchModerationFeeds();
  }, [paperFilters, userFilters]);

  const handleUploadInputChange = (event) => {
    const { name, value } = event.target;

    if (name === "faculty") {
      const nextDepartments = getDepartmentsByFaculty(value);
      setDepartments(nextDepartments);
      setCourses([]);
      setUploadForm((prev) => ({ ...prev, faculty: value, department: "" }));
      return;
    }

    if (name === "department") {
      const nextCourses = getCoursesByDepartment(uploadForm.faculty, value);
      setCourses(nextCourses);
      setUploadForm((prev) => ({ ...prev, department: value, courseCode: "" }));
      return;
    }

    setUploadForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpload = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setBusyAction("upload");

    try {
      const formData = new FormData();
      Object.entries(uploadForm).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          formData.append(key, value);
        }
      });

      if (!uploadForm.paper) {
        setError("Please select a PDF file to upload.");
        return;
      }

      if (!uploadForm.faculty || !uploadForm.department || !uploadForm.level) {
        setError("Please select faculty, department, and level.");
        return;
      }

      await api.post("/papers/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage("Paper uploaded successfully");
      setUploadForm(emptyUploadForm);
      setDepartments([]);
      setCourses([]);
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Upload failed. Confirm Cloudinary credentials in backend .env.");
    } finally {
      setBusyAction("");
    }
  };

  const handleReview = async (paperId, status) => {
    try {
      setBusyAction(`review-${paperId}-${status}`);
      setError("");
      await api.patch(`/admin/papers/${paperId}/review`, { status });
      setMessage(`Paper ${status} successfully`);
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not update paper status");
    } finally {
      setBusyAction("");
    }
  };

  const handleDelete = async (paperId) => {
    try {
      setBusyAction(`delete-${paperId}`);
      setError("");
      await api.delete(`/admin/papers/${paperId}`);
      setMessage("Paper deleted successfully");
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not delete paper");
    } finally {
      setBusyAction("");
    }
  };

  const handleRestorePaper = async (paperId) => {
    try {
      setBusyAction(`restore-${paperId}`);
      setError("");
      await api.patch(`/admin/papers/${paperId}/restore`);
      setMessage("Paper restored successfully");
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not restore paper");
    } finally {
      setBusyAction("");
    }
  };

  const handlePermanentDelete = async (paperId) => {
    try {
      setBusyAction(`permanent-${paperId}`);
      setError("");
      await api.delete(`/admin/papers/${paperId}/permanent`);
      setMessage("Paper permanently deleted");
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not permanently delete paper");
    } finally {
      setBusyAction("");
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setBusyAction(`delete-user-${userId}`);
      setError("");
      await api.delete(`/admin/users/${userId}`);
      setMessage("User deleted successfully");
      await fetchDashboardData();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not delete user");
    } finally {
      setBusyAction("");
    }
  };

  const handleHideComment = async (commentId) => {
    try {
      await api.patch(`/admin/comments/${commentId}/hide`);
      await fetchModerationFeeds();
      setMessage("Comment hidden successfully");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not hide comment");
    }
  };

  const handleReportStatus = async (reportId, status) => {
    try {
      await api.patch(`/admin/reports/${reportId}/status`, { status });
      await fetchModerationFeeds();
      setMessage("Report updated successfully");
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not update report");
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await api.get(`/admin/export?type=${type}`, { responseType: "blob" });
      const blobUrl = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = `${type}-report.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (apiError) {
      setError(apiError.response?.data?.message || "Could not export report");
    }
  };

  const pendingQueue = papers.filter((paper) => paper.status === "pending");
  const topFeedbackPapers = [...papers]
    .sort((a, b) => (b.commentCount || 0) + (b.totalRatings || 0) - ((a.commentCount || 0) + (a.totalRatings || 0)))
    .slice(0, 5);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 md:px-6">
      <section className="relative overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-6 text-white shadow-glass md:p-8">
        <div className="pointer-events-none absolute -right-12 -top-10 h-44 w-44 rounded-full bg-teal-300/20 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-8 h-36 w-36 rounded-full bg-amber-200/20 blur-2xl" />
        <p className="text-xs font-bold uppercase tracking-widest text-teal-200">Control Center</p>
        <h1 className="mt-2 font-display text-3xl font-bold md:text-4xl">Admin Operations Dashboard</h1>
        <p className="mt-2 max-w-3xl text-slate-200">
          Publish papers, moderate quality, monitor student engagement, and keep the past-question library accurate.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            to="/search"
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
          >
            Open Search Experience
          </Link>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Refresh Live Metrics
          </button>
          <button
            type="button"
            onClick={() => handleExport("papers")}
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Export Papers CSV
          </button>
          <button
            type="button"
            onClick={() => handleExport("users")}
            className="rounded-xl border border-white/40 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Export Users CSV
          </button>
        </div>
      </section>

      {error && <p className="mt-4 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {message && <p className="mt-4 rounded-lg bg-emerald-50 p-3 text-emerald-700">{message}</p>}

      {analytics && (
        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Users</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-900">{analytics.totalUsers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Total Papers</p>
            <p className="mt-1 font-display text-3xl font-bold text-slate-900">{analytics.totalPapers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Approved</p>
            <p className="mt-1 font-display text-3xl font-bold text-emerald-700">{analytics.approvedPapers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="mt-1 font-display text-3xl font-bold text-amber-700">{analytics.pendingPapers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Rejected</p>
            <p className="mt-1 font-display text-3xl font-bold text-rose-700">{analytics.rejectedPapers}</p>
          </article>
          <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Pending Queue</p>
            <p className="mt-1 font-display text-3xl font-bold text-amber-700">{pendingQueue.length}</p>
          </article>
        </section>
      )}

      <section className="mt-6 grid gap-6 xl:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Moderation Priority</h2>
          <p className="mt-1 text-sm text-slate-600">Papers awaiting admin decision right now.</p>
          <div className="mt-4 space-y-2">
            {pendingQueue.length === 0 ? (
              <p className="text-sm text-slate-500">No pending papers. Queue is clear.</p>
            ) : (
              pendingQueue.slice(0, 5).map((paper) => (
                <div key={paper._id} className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{paper.courseCode} - {paper.title}</p>
                  <Link to={`/papers/${paper._id}`} className="text-xs font-bold text-teal-700">
                    Review
                  </Link>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Student Feedback Pulse</h2>
          <p className="mt-1 text-sm text-slate-600">Most discussed or rated papers this cycle.</p>
          <div className="mt-4 space-y-2">
            {topFeedbackPapers.length === 0 ? (
              <p className="text-sm text-slate-500">No feedback data yet.</p>
            ) : (
              topFeedbackPapers.map((paper) => (
                <div key={paper._id} className="rounded-lg bg-slate-50 px-3 py-2">
                  <p className="text-sm font-semibold text-slate-800">{paper.courseCode} - {paper.title}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {paper.commentCount || 0} comments • {paper.averageRating || 0} / 5 ({paper.totalRatings || 0} ratings)
                  </p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_1.35fr]">
        <form onSubmit={handleUpload} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Upload New Paper</h2>
          <p className="mt-1 text-sm text-slate-600">Structured metadata improves discoverability in smart search.</p>

          <div className="mt-4 grid gap-3">
            <input
              type="text"
              name="title"
              placeholder="Paper title"
              value={uploadForm.title}
              onChange={handleUploadInputChange}
              className="rounded-lg border px-3 py-2"
              required
            />
            <input
              type="text"
              name="courseCode"
              list="admin-course-code-hints"
              placeholder="Course code (manual input)"
              value={uploadForm.courseCode}
              onChange={handleUploadInputChange}
              className="rounded-lg border px-3 py-2"
              required
            />
            <datalist id="admin-course-code-hints">
              {courses.map((item) => (
                <option key={item.code} value={item.code} />
              ))}
            </datalist>

            <select
              name="faculty"
              value={uploadForm.faculty}
              onChange={handleUploadInputChange}
              className="rounded-lg border px-3 py-2"
              required
            >
              <option value="">Select Faculty</option>
              {facultyNames.map((faculty) => (
                <option key={faculty} value={faculty}>
                  {faculty}
                </option>
              ))}
            </select>

            <select
              name="department"
              value={uploadForm.department}
              onChange={handleUploadInputChange}
              className="rounded-lg border px-3 py-2"
              disabled={!uploadForm.faculty}
              required
            >
              <option value="">Select Department</option>
              {departments.map((department) => (
                <option key={department} value={department}>
                  {department}
                </option>
              ))}
            </select>

            <select
              name="level"
              value={uploadForm.level}
              onChange={handleUploadInputChange}
              className="rounded-lg border px-3 py-2"
              required
            >
              <option value="">Select Level</option>
              {gsuCatalog.levels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                name="year"
                min="2000"
                max="2100"
                placeholder="Year"
                value={uploadForm.year}
                onChange={handleUploadInputChange}
                className="rounded-lg border px-3 py-2"
                required
              />

              <select
                name="semester"
                value={uploadForm.semester}
                onChange={handleUploadInputChange}
                className="rounded-lg border px-3 py-2"
                required
              >
                {gsuCatalog.semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>
            </div>

            <input
              type="file"
              accept="application/pdf"
              onChange={(event) =>
                setUploadForm((prev) => ({
                  ...prev,
                  paper: event.target.files?.[0] || null,
                }))
              }
              className="rounded-lg border px-3 py-2"
              required
            />
          </div>

          <button
            className="mt-4 rounded-lg bg-teal-700 px-4 py-2 font-semibold text-white disabled:opacity-70"
            disabled={busyAction === "upload"}
          >
            {busyAction === "upload" ? "Uploading..." : "Upload Paper"}
          </button>
        </form>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold text-slate-900">Paper Moderation Queue</h2>
          <p className="mt-1 text-sm text-slate-600">Open papers to review first page and monitor student feedback.</p>
          <div className="mt-3 grid gap-2 md:grid-cols-4">
            <input
              type="text"
              value={paperFilters.search}
              onChange={(event) => setPaperFilters((prev) => ({ ...prev, page: 1, search: event.target.value }))}
              placeholder="Search papers"
              className="rounded-lg border px-3 py-2"
            />
            <select
              value={paperFilters.status}
              onChange={(event) => setPaperFilters((prev) => ({ ...prev, page: 1, status: event.target.value }))}
              className="rounded-lg border px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
              <option value="deleted">Deleted</option>
            </select>
            <label className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={paperFilters.includeDeleted}
                onChange={(event) =>
                  setPaperFilters((prev) => ({ ...prev, page: 1, includeDeleted: event.target.checked }))
                }
              />
              Include Recycle Bin
            </label>
            <button
              type="button"
              onClick={fetchDashboardData}
              className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
            >
              Apply
            </button>
          </div>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-2 pr-3">Title</th>
                  <th className="py-2 pr-3">Course</th>
                  <th className="py-2 pr-3">Uploaded By</th>
                  <th className="py-2 pr-3">Feedback</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {papers.map((paper) => (
                  <tr key={paper._id} className="border-b align-top">
                    <td className="py-3 pr-3 text-slate-800">
                      <Link to={`/papers/${paper._id}`} className="font-semibold text-teal-700 hover:underline">
                        {paper.title}
                      </Link>
                    </td>
                    <td className="py-3 pr-3 font-semibold text-teal-700">{paper.courseCode}</td>
                    <td className="py-3 pr-3 text-slate-700">{paper.uploadedBy?.name || "Unknown"}</td>
                    <td className="py-3 pr-3 text-slate-700">
                      <p>{paper.commentCount || 0} comments</p>
                      <p>{paper.averageRating || 0} / 5 ({paper.totalRatings || 0})</p>
                    </td>
                    <td className="py-3 pr-3 capitalize">{paper.status}</td>
                    <td className="py-3 pr-3">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          to={`/papers/${paper._id}`}
                          className="rounded bg-slate-100 px-2 py-1 font-semibold text-slate-700"
                        >
                          View
                        </Link>
                        <button
                          onClick={() => handleReview(paper._id, "approved")}
                          disabled={busyAction.startsWith("review-") || busyAction === `delete-${paper._id}`}
                          className="rounded bg-emerald-100 px-2 py-1 font-semibold text-emerald-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(paper._id, "rejected")}
                          disabled={busyAction.startsWith("review-") || busyAction === `delete-${paper._id}`}
                          className="rounded bg-amber-100 px-2 py-1 font-semibold text-amber-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleDelete(paper._id)}
                          disabled={busyAction.startsWith("review-") || busyAction === `delete-${paper._id}`}
                          className="rounded bg-rose-100 px-2 py-1 font-semibold text-rose-700 disabled:opacity-60"
                        >
                          Recycle
                        </button>
                        {paper.isDeleted && (
                          <>
                            <button
                              onClick={() => handleRestorePaper(paper._id)}
                              disabled={busyAction === `restore-${paper._id}`}
                              className="rounded bg-blue-100 px-2 py-1 font-semibold text-blue-700 disabled:opacity-60"
                            >
                              Restore
                            </button>
                            <button
                              onClick={() => handlePermanentDelete(paper._id)}
                              disabled={busyAction === `permanent-${paper._id}`}
                              className="rounded bg-rose-200 px-2 py-1 font-semibold text-rose-800 disabled:opacity-60"
                            >
                              Delete Forever
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {paperPagination && (
            <p className="mt-3 text-xs text-slate-500">
              Page {paperPagination.page} of {paperPagination.pages} ({paperPagination.total} papers)
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="font-display text-xl font-bold text-slate-900">User Management</h2>
        <p className="mt-1 text-sm text-slate-600">Monitor registered users and remove student accounts when needed.</p>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          <input
            type="text"
            value={userFilters.search}
            onChange={(event) => setUserFilters((prev) => ({ ...prev, page: 1, search: event.target.value }))}
            placeholder="Search users"
            className="rounded-lg border px-3 py-2"
          />
          <select
            value={userFilters.role}
            onChange={(event) => setUserFilters((prev) => ({ ...prev, page: 1, role: event.target.value }))}
            className="rounded-lg border px-3 py-2"
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="admin">Admin</option>
          </select>
          <button
            type="button"
            onClick={fetchDashboardData}
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700"
          >
            Apply
          </button>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2 pr-3">Name</th>
                <th className="py-2 pr-3">Email</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Joined</th>
                <th className="py-2 pr-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id} className="border-b">
                  <td className="py-2 pr-3 text-slate-800">{u.name}</td>
                  <td className="py-2 pr-3">{u.email}</td>
                  <td className="py-2 pr-3 capitalize">{u.role}</td>
                  <td className="py-2 pr-3">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-2 pr-3">
                    <button
                      type="button"
                      onClick={() => handleDeleteUser(u._id)}
                      disabled={u.role === "admin" || busyAction === `delete-user-${u._id}`}
                      className="rounded bg-rose-100 px-3 py-1 font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                      title={u.role === "admin" ? "Admin accounts are protected" : "Delete user"}
                    >
                      {busyAction === `delete-user-${u._id}` ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {userPagination && (
          <p className="mt-3 text-xs text-slate-500">
            Page {userPagination.page} of {userPagination.pages} ({userPagination.total} users)
          </p>
        )}
      </section>

      <section className="mt-8 grid gap-6 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">Reported Papers</h3>
          <div className="mt-3 space-y-2">
            {reports.length === 0 ? (
              <p className="text-sm text-slate-500">No reports yet.</p>
            ) : (
              reports.map((report) => (
                <div key={report._id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{report.paperId?.courseCode} - {report.reason}</p>
                  <p className="text-xs text-slate-600">{report.details || "No details"}</p>
                  <div className="mt-2 flex gap-2">
                    <button
                      type="button"
                      onClick={() => handleReportStatus(report._id, "reviewed")}
                      className="rounded bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-700"
                    >
                      Mark Reviewed
                    </button>
                    <button
                      type="button"
                      onClick={() => handleReportStatus(report._id, "resolved")}
                      className="rounded bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700"
                    >
                      Resolve
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">Comment Moderation</h3>
          <div className="mt-3 space-y-2">
            {comments.length === 0 ? (
              <p className="text-sm text-slate-500">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm text-slate-800">{comment.comment}</p>
                  <button
                    type="button"
                    onClick={() => handleHideComment(comment._id)}
                    className="mt-2 rounded bg-rose-100 px-2 py-1 text-xs font-semibold text-rose-700"
                  >
                    Hide
                  </button>
                </div>
              ))
            )}
          </div>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="font-display text-lg font-bold text-slate-900">Audit Trail</h3>
          <div className="mt-3 space-y-2">
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-500">No audit logs yet.</p>
            ) : (
              auditLogs.map((log) => (
                <div key={log._id} className="rounded-lg bg-slate-50 p-3">
                  <p className="text-sm font-semibold text-slate-800">{log.action}</p>
                  <p className="text-xs text-slate-600">{log.actorId?.name || "System"} • {new Date(log.createdAt).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </article>
      </section>
    </main>
  );
};

export default AdminDashboardPage;
