const RatingStars = ({ rating, onChange, interactive = false }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((value) => {
        const active = value <= rating;
        return (
          <button
            key={value}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange(value)}
            className={`text-2xl leading-none ${active ? "text-amber-500" : "text-slate-300"} ${
              interactive ? "hover:scale-105" : "cursor-default"
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
};

export default RatingStars;
