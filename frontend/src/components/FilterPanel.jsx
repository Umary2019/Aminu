const FilterPanel = ({ filters, onChange, onSubmit, onReset, faculties, departments, levels, courses }) => {
  const visibleCourses = courses.filter((item) => !filters.level || item.level === filters.level);

  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3">
        <input
          type="text"
          name="q"
          value={filters.q || ""}
          onChange={onChange}
          placeholder="Quick search by title or course code, like COSC401"
          className="w-full rounded-lg border px-3 py-2"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <select
          name="faculty"
          value={filters.faculty}
          onChange={onChange}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">Select Faculty</option>
          {faculties.map((faculty) => (
            <option key={faculty} value={faculty}>
              {faculty}
            </option>
          ))}
        </select>
        <select
          name="department"
          value={filters.department}
          onChange={onChange}
          className="rounded-lg border px-3 py-2"
          disabled={!filters.faculty}
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
          value={filters.level}
          onChange={onChange}
          className="rounded-lg border px-3 py-2"
          disabled={!filters.department}
        >
          <option value="">Select Level</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="courseCode"
          value={filters.courseCode}
          onChange={onChange}
          list="course-code-hints"
          placeholder="Type course code"
          className="rounded-lg border px-3 py-2"
          disabled={!filters.level}
        />
        <datalist id="course-code-hints">
          {visibleCourses.map((item) => (
            <option key={item.code} value={item.code} />
          ))}
        </datalist>
      </div>
      {courses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {visibleCourses.map((item) => (
            <button
              key={item.code}
              type="button"
              onClick={() => onChange({ target: { name: "courseCode", value: item.code } })}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-200"
              title={item.title}
            >
              {item.code}
            </button>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap gap-2">
        <button className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white">Apply Filters</button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
        >
          Reset
        </button>
      </div>
    </form>
  );
};

export default FilterPanel;
