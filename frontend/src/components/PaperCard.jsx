import { Link } from "react-router-dom";

const PaperCard = ({ paper }) => {
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
        <a
          href={paper.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800"
        >
          Download
        </a>
      </div>
    </article>
  );
};

export default PaperCard;
