function CategoryCard({
  name,
  icon,
  description,
  count,
  isSelected,
  onClick,
}) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === "Enter" && onClick && onClick()}
      className={`group relative flex flex-col justify-between overflow-hidden rounded-3xl border p-6 text-left transition duration-300 cursor-pointer ${
        isSelected
          ? "border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500 shadow-lg -translate-y-1"
          : "border-slate-200 bg-white hover:-translate-y-1 hover:border-emerald-300 hover:shadow-xl"
      }`}
    >
      {/* Icon & Count */}
      <div className="flex items-center justify-between">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl text-2xl transition duration-300 ${
            isSelected
              ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
              : "bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white"
          }`}
        >
          {icon || "💊"}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            isSelected
              ? "bg-emerald-600 text-white"
              : "bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-800"
          }`}
        >
          {count ? `${count} Items` : "Available"}
        </span>
      </div>

      {/* Details */}
      <div className="mt-5">
        <h3 className="text-lg font-black text-slate-800 group-hover:text-emerald-700 transition">
          {name}
        </h3>
        <p className="mt-1 text-xs leading-5 text-slate-500 line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer link arrow */}
      <div className="mt-4 flex items-center gap-1 text-xs font-extrabold text-emerald-600 group-hover:translate-x-1 transition">
        <span>Explore Category</span>
        <span>→</span>
      </div>
    </div>
  );
}

export default CategoryCard;