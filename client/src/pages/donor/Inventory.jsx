import { Link } from "react-router-dom";
import InventoryPanel from "./InventoryPanel";

const Inventory = () => (
  <div className="mx-auto max-w-7xl">
    <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Shop inventory</p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950">Inventory</h1>
        <p className="mt-1 text-sm text-slate-500">
          Add shop goods, monitor stock, and publish selected items as donation or sale listings.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          to="/donor/inventory/add"
          className="inline-flex items-center justify-center rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
        >
          Add stock
        </Link>
        <Link
          to="/donor/create-listing"
          className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-black text-white shadow-sm transition hover:bg-emerald-700"
        >
          Create listing
        </Link>
      </div>
    </div>

    <InventoryPanel />
  </div>
);

export default Inventory;
