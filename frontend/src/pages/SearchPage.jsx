import { useEffect, useState } from "react";
import api from "../services/api";
import PaperCard from "../components/PaperCard";
import FilterPanel from "../components/FilterPanel";
import {
  facultyNames,
  getAllCourseDirectory,
  getCoursesByDepartment,
  getDepartmentsByFaculty,
  gsuCatalog,
} from "../data/gsuCatalog";

const initialFilters = {
  q: "",
  faculty: "",
  department: "",
  level: "",
  semester: "",
  courseCode: "",
  minYear: "",
  maxYear: "",
  sort: "newest",
};

const SearchPage = () => {
  const [filters, setFilters] = useState(initialFilters);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const courseDirectory = getAllCourseDirectory();

  const fetchPapers = async (searchFilters = filters) => {
    setLoading(true);
    setError("");

    try {
      const params = Object.fromEntries(
        Object.entries(searchFilters).filter(([, value]) => value !== "")
      );
      const { data } = await api.get("/papers", { params });
      setPapers(data.papers || []);
      localStorage.setItem("pqf_last_search_result", JSON.stringify(data.papers || []));
    } catch (apiError) {
      const cachedPapers = localStorage.getItem("pqf_last_search_result");
      if (cachedPapers) {
        setPapers(JSON.parse(cachedPapers));
        setError("Network issue: showing cached search results.");
      } else {
        setError(apiError.response?.data?.message || "Could not fetch papers");
      }
    } finally {
      setLoading(false);
    }
  };

  // No initial fetch - only fetch when user searches

  const handleChange = (event) => {
    const { name, value } = event.target;

    if (name === "faculty") {
      const nextDepartments = getDepartmentsByFaculty(value);
      setDepartments(nextDepartments);
      setCourses([]);
      setFilters((prev) => ({ ...prev, faculty: value, department: "", courseCode: "" }));
      return;
    }

    if (name === "department") {
      const nextCourses = getCoursesByDepartment(filters.faculty, value);
      setCourses(nextCourses);
      setFilters((prev) => ({ ...prev, department: value, courseCode: "" }));
      return;
    }

    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    fetchPapers(filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setDepartments([]);
    setCourses([]);
    setPapers([]);
  };

  const handleCourseCodeClick = (code) => {
    const nextFilters = { ...filters, courseCode: code };
    setFilters(nextFilters);
    fetchPapers(nextFilters);
  };

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 md:px-6">
      <h1 className="font-display text-3xl font-bold text-slate-900">Smart Search</h1>
      <p className="mt-2 text-slate-600">
        Search Gombe State University past papers using structured filters. Course code is linked by department and also
        available as a manual input.
      </p>

      <div className="mt-6">
        <FilterPanel
          filters={filters}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onReset={handleReset}
          faculties={facultyNames}
          departments={departments}
          levels={gsuCatalog.levels}
          semesters={gsuCatalog.semesters}
          courses={courses}
        />
      </div>

      {filters.department && (
        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="font-display text-lg font-bold text-slate-900">Department Course Codes</h2>
          <p className="mt-1 text-sm text-slate-600">
            Click a course code link to auto-fill search and fetch available papers.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {courses.map((item) => (
              <button
                key={`${item.department}-${item.code}`}
                type="button"
                onClick={() => handleCourseCodeClick(item.code)}
                className="rounded-full border border-slate-300 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-teal-600 hover:text-teal-700"
                title={`${item.title} (${item.department})`}
              >
                {item.code}
              </button>
            ))}
          </div>
        </section>
      )}

      {loading && <p className="mt-6 text-slate-600">Loading papers...</p>}
      {error && <p className="mt-6 rounded-lg bg-red-50 p-3 text-red-700">{error}</p>}
      {!loading && !error && (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {papers.length === 0 ? (
            <p className="text-slate-600">No papers found for your filters.</p>
          ) : (
            papers.map((paper) => <PaperCard key={paper._id} paper={paper} />)
          )}
        </section>
      )}
    </main>
  );
};

export default SearchPage;
