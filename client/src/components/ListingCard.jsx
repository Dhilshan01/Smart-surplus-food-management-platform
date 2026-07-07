import ReportListingButton from "./ReportListingButton";

const safetyConfig = {
  safe: {
    label: "Safe",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
    bar: "bg-emerald-600",
  },
  moderate_risk: {
    label: "Moderate",
    className: "border-amber-200 bg-amber-50 text-amber-700",
    bar: "bg-amber-500",
  },
  unsafe: {
    label: "Unsafe",
    className: "border-red-200 bg-red-50 text-red-700",
    bar: "bg-red-500",
  },
};

const statusConfig = {
  available: "border-emerald-200 bg-emerald-50 text-emerald-700",
  claimed: "border-blue-200 bg-blue-50 text-blue-700",
  collected: "border-slate-200 bg-slate-50 text-slate-700",
  expired: "border-red-200 bg-red-50 text-red-700",
  flagged: "border-amber-200 bg-amber-50 text-amber-700",
};

const ListingCard = ({ listing, showActions, onClaim, onEdit, onDelete, allowReport = false, onReported }) => {
  const safety = safetyConfig[listing.live_safety?.score || listing.safety_score] || safetyConfig.safe;
  const status = statusConfig[listing.status] || statusConfig.available;
  const primaryBadge =
    listing.status === "collected"
      ? { label: "Collected", className: status }
      : listing.status === "claimed"
        ? { label: "Claimed", className: status }
        : listing.status === "expired"
          ? { label: "Expired", className: status }
          : listing.status === "flagged"
            ? { label: "Flagged", className: status }
            : { label: safety.label, className: safety.className };
  const expiresAt = new Date(listing.expires_at);
  const hoursLeft = listing.live_safety?.hoursRemaining;

  return (
    <article className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition hover:border-emerald-200 hover:shadow-md">
      <div className={`h-1.5 ${safety.bar}`} />
      {listing.image_url && (
        <img src={listing.image_url} alt={listing.title} className="aspect-[4/3] w-full object-cover" />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-black text-slate-950">{listing.title}</h3>
            <p className="mt-1 text-xs font-semibold text-slate-500">{listing.food_category}</p>
          </div>
          <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-black ${primaryBadge.className}`}>
            {primaryBadge.label}
          </span>
        </div>

        <div className="mt-3">
          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-black capitalize ${status}`}>
            {listing.status}
          </span>
        </div>

        {listing.description && (
          <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-slate-500">{listing.description}</p>
        )}

        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs font-semibold text-slate-500">Quantity</dt>
            <dd className="mt-1 font-bold text-slate-900">{listing.quantity}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold text-slate-500">City</dt>
            <dd className="mt-1 font-bold text-slate-900">{listing.city}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-xs font-semibold text-slate-500">Expires</dt>
            <dd className="mt-1 font-bold text-slate-900">{expiresAt.toLocaleString()}</dd>
          </div>
          {hoursLeft && (
            <div className="col-span-2 rounded-lg bg-slate-50 p-3">
              <dt className="text-xs font-semibold text-slate-500">Time remaining</dt>
              <dd className="mt-1 font-black text-slate-950">{hoursLeft} hours</dd>
            </div>
          )}
        </dl>

        {listing.donor_name && (
          <div className="mt-4 border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
            Supplier: <span className="text-slate-700">{listing.organization_name || listing.donor_name}</span>
          </div>
        )}

        {showActions && (onClaim || onEdit || onDelete || allowReport) && (
          <div className="mt-4 flex flex-wrap gap-2">
            {onClaim && (
              <button
                type="button"
                onClick={() => onClaim(listing.id)}
                className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-black text-white transition hover:bg-emerald-700"
              >
                Claim
              </button>
            )}
            {onEdit && (
              <button
                type="button"
                onClick={() => onEdit(listing.id)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                type="button"
                onClick={() => onDelete(listing.id)}
                className="flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-black text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-700"
              >
                Delete
              </button>
            )}
            {allowReport && (
              <ReportListingButton
                listingId={listing.id}
                listingTitle={listing.title}
                onReported={onReported}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
};

export default ListingCard;
