const FilterPanel = ({ filters, onChange, onSubmit, onReset, faculties, departments, levels, semesters, courses }) => {
  return (
    <form onSubmit={onSubmit} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <input
          type="text"
          name="q"
          value={filters.q}
          onChange={onChange}
          placeholder="Keyword search (title, course, faculty...)"
          className="rounded-lg border px-3 py-2"
        />
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
        >
          <option value="">Select Level</option>
          {levels.map((level) => (
            <option key={level} value={level}>
              {level}
            </option>
          ))}
        </select>
        <select
          name="semester"
          value={filters.semester}
          onChange={onChange}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">Select Semester</option>
          {semesters.map((semester) => (
            <option key={semester} value={semester}>
              {semester}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="courseCode"
          value={filters.courseCode}
          onChange={onChange}
          list="course-code-hints"
          placeholder="Type course code, e.g. CSC101"
          className="rounded-lg border px-3 py-2"
        />
        <datalist id="course-code-hints">
          {courses.map((item) => (
            <option key={item.code} value={item.code} />
          ))}
        </datalist>
        <input
          type="number"
          name="minYear"
          min="2000"
          max="2100"
          value={filters.minYear}
          onChange={onChange}
          placeholder="Min Year"
          className="rounded-lg border px-3 py-2"
        />
        <input
          type="number"
          name="maxYear"
          min="2000"
          max="2100"
          value={filters.maxYear}
          onChange={onChange}
          placeholder="Max Year"
          className="rounded-lg border px-3 py-2"
        />
        <select
          name="sort"
          value={filters.sort}
          onChange={onChange}
          className="rounded-lg border px-3 py-2"
        >
          <option value="newest">Sort: Newest</option>
          <option value="oldest">Sort: Oldest</option>
          <option value="highest-rated">Sort: Highest Rated</option>
          <option value="most-downloaded">Sort: Most Downloaded</option>
          <option value="relevance">Sort: Relevance</option>
        </select>
      </div>
      {courses.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {courses.map((item) => (
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
