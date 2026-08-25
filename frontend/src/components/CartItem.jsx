function CartItem({
  item,
  onIncrease,
  onDecrease,
  onRemove,
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

      <div className="flex gap-3">

        {/* Image */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-50 border border-slate-100 p-1">
          {item.image ? (
            <img
              src={item.image}
              alt={item.name}
              className="h-full w-full object-cover rounded-lg"
            />
          ) : (
            <span className="text-2xl">💊</span>
          )}
        </div>


        {/* Details */}
        <div className="min-w-0 flex-1">

          <h3 className="truncate font-bold text-slate-800">
            {item.name}
          </h3>

          <p className="text-xs text-slate-500">
            {item.category}
          </p>

          <p className="mt-1 font-bold text-emerald-700">
            ₹{item.price}
          </p>


          {/* Controls */}
          <div className="mt-3 flex items-center justify-between">

            <div className="flex items-center gap-2">

              <button
                type="button"
                onClick={() =>
                  onDecrease(item.id)
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-700 hover:bg-slate-200"
              >
                −
              </button>

              <span className="w-6 text-center text-sm font-bold">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={() =>
                  onIncrease(item.id)
                }
                disabled={
                  item.quantity >= item.stock
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 font-bold text-white hover:bg-emerald-700 disabled:bg-slate-300"
              >
                +
              </button>

            </div>


            <p className="font-bold text-slate-800">
              ₹{item.price * item.quantity}
            </p>

          </div>


          {/* Remove */}
          <button
            type="button"
            onClick={() =>
              onRemove(item.id)
            }
            className="mt-2 text-xs font-semibold text-red-500 hover:text-red-700"
          >
            Remove
          </button>

        </div>

      </div>

    </div>
  );
}

export default CartItem;