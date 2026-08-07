const currency = (n) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

// items: [{ category, name, brand, specs, price OR priceAtSelection }]
export default function PriceBreakdown({ items = [], total, onRemove }) {
  const getPrice = (item) => (item.price !== undefined ? item.price : item.priceAtSelection);

  return (
    <div className="card overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50">
        <h3 className="font-semibold text-slate-800">Component-wise Price Breakdown</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-slate-500 border-b border-slate-100">
              <th className="px-4 py-2 font-medium">Category</th>
              <th className="px-4 py-2 font-medium">Component</th>
              <th className="px-4 py-2 font-medium hidden sm:table-cell">Specs</th>
              <th className="px-4 py-2 font-medium text-right">Price</th>
              {onRemove && <th className="px-4 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  No components selected yet.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => (
                <tr key={item.component || item._id || idx} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2">
                    <span className="inline-block px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-800">
                    {item.name}
                    {item.brand ? <span className="text-slate-400"> · {item.brand}</span> : null}
                  </td>
                  <td className="px-4 py-2 text-slate-500 hidden sm:table-cell">{item.specs}</td>
                  <td className="px-4 py-2 text-right font-medium text-slate-800">{currency(getPrice(item))}</td>
                  {onRemove && (
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => onRemove(item.component || item._id)}
                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
          <tfoot>
            <tr className="bg-slate-50">
              <td colSpan={onRemove ? 3 : 3} className="px-4 py-3 font-semibold text-slate-700 hidden sm:table-cell">
                Total
              </td>
              <td colSpan={onRemove ? 1 : 2} className="px-4 py-3 font-semibold text-slate-700 sm:hidden">
                Total
              </td>
              <td className="px-4 py-3 text-right font-bold text-brand-700 text-base">
                {currency(total !== undefined ? total : items.reduce((s, i) => s + (getPrice(i) || 0), 0))}
              </td>
              {onRemove && <td></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export { currency };
