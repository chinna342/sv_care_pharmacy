import { useState } from "react";

function ProductCard({
  product,
  onAddToCart,
  onIncrease,
  onDecrease,
  onOpenDetails,
  cartQuantity = 0,
}) {
  const {
    name,
    genericName,
    manufacturer,
    price,
    mrp,
    discountPercent = 18,
    category,
    stock = 50,
    prescriptionRequired,
    form = "Tablet",
    image,
    genericSubstitute,
  } = product;

  const [imgError, setImgError] = useState(false);
  const isOutOfStock = stock <= 0;
  const isInCart = cartQuantity > 0;
  const savings = mrp && mrp > price ? mrp - price : 0;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:border-emerald-300 hover:shadow-md">
      {/* 1. Compact Top Media Stage with Real Photo */}
      <div className="relative flex h-36 w-full flex-col items-center justify-center bg-gradient-to-b from-slate-50 to-emerald-50/20 p-2 overflow-hidden">
        {/* Floating Top Left Discount Badge */}
        <div className="absolute left-2.5 top-2.5 flex items-center gap-1 z-10">
          {discountPercent > 0 && (
            <span className="rounded-md bg-emerald-600 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
              {discountPercent}% OFF
            </span>
          )}
          {prescriptionRequired && (
            <span className="rounded-md bg-amber-500 px-1.5 py-0.5 text-[9px] font-black text-white shadow-xs">
              Rx
            </span>
          )}
        </div>

        {/* Stock Badge Top Right */}
        {isOutOfStock && (
          <span className="absolute right-2.5 top-2.5 rounded-md bg-red-100 px-1.5 py-0.5 text-[9px] font-bold text-red-700 z-10">
            Out of Stock
          </span>
        )}

        {/* Medicine Product Image */}
        <div 
          onClick={() => onOpenDetails && onOpenDetails(product)}
          className="relative flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl bg-white p-1.5 shadow-xs border border-slate-100 transition duration-300 group-hover:scale-105 cursor-pointer"
        >
          {image && !imgError ? (
            <img
              src={image}
              alt={name}
              loading="lazy"
              onError={() => setImgError(true)}
              className="h-full w-full object-contain rounded-xl transition duration-300 group-hover:brightness-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-emerald-50 text-3xl rounded-xl">
              💊
            </div>
          )}
        </div>

        {/* Form/Pack Tag */}
        <p className="mt-1.5 text-[10px] font-bold text-slate-400 truncate max-w-[90%]">
          {form} • {category}
        </p>
      </div>

      {/* 2. Compact Body Info */}
      <div className="flex flex-1 flex-col p-3 space-y-2">
        {/* Title */}
        <div>
          <h3
            className="text-xs font-black text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition cursor-pointer"
            onClick={() => onOpenDetails && onOpenDetails(product)}
            title={name}
          >
            {name}
          </h3>
          {genericName && (
            <p className="text-[10px] text-emerald-700 font-medium truncate mt-0.5">
              🔬 {genericName}
            </p>
          )}
        </div>

        {/* Price & Savings Line */}
        <div className="pt-0.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm font-black text-slate-900">₹{price}</span>
            {mrp && (
              <span className="text-[10px] text-slate-400 line-through">₹{mrp}</span>
            )}
            {savings > 0 && (
              <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1 rounded">
                Save ₹{savings}
              </span>
            )}
          </div>
        </div>

        {/* Action Button: Eye Preview + Compact Add/Stepper */}
        <div className="mt-auto pt-2 flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onOpenDetails && onOpenDetails(product)}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 hover:border-emerald-500 hover:bg-emerald-50 transition shrink-0"
            title="Quick View"
          >
            👁️
          </button>

          {/* Stepper or ADD */}
          {isInCart ? (
            <div className="flex-1 flex items-center justify-between rounded-lg bg-emerald-700 p-0.5 text-white shadow-xs">
              <button
                type="button"
                onClick={() => onDecrease && onDecrease(product.id)}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-800 text-xs font-black text-white hover:bg-emerald-900 active:scale-90 transition"
              >
                −
              </button>
              <span className="text-[11px] font-black px-1.5">{cartQuantity}</span>
              <button
                type="button"
                onClick={() => {
                  if (cartQuantity < stock) {
                    onIncrease && onIncrease(product.id);
                  }
                }}
                disabled={cartQuantity >= stock}
                className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500 text-xs font-black text-white hover:bg-emerald-400 active:scale-90 transition"
              >
                +
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAddToCart(product)}
              disabled={isOutOfStock}
              className={`flex-1 flex items-center justify-center gap-1 rounded-lg py-1.5 text-xs font-black text-white shadow-xs transition active:scale-95 ${
                isOutOfStock
                  ? "bg-slate-300 cursor-not-allowed text-[10px]"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <span>+</span>
              <span>{isOutOfStock ? "Unavailable" : "ADD"}</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

export default ProductCard;