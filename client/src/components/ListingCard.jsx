import React from 'react';

function formatTimeLeft(expiresAt) {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const totalMinutes = Math.floor(diff / (1000 * 60));
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;

  if (days > 0) {
    return `Pickup within ${days}d ${hours}h`;
  }
  if (hours > 0) {
    return `Pickup within ${hours}h ${mins}m`;
  }
  return `Pickup within ${mins}m`;
}

export default function ListingCard({ listing, children }) {
  // A countdown only makes sense while the food is still waiting to be collected
  const isActive = listing.status === 'available' || listing.status === 'claimed';
  const timeLeft = isActive ? formatTimeLeft(listing.expiresAt) : '';
  const statusLabel = listing.status ? listing.status.replace('_', ' ') : 'available';

  return (
    <article className="listing-card">
      <div>
        <header>
          <div>
            <span className="food-type-tag">{listing.foodType}</span>
            <span className={`badge badge-${listing.status || 'available'}`}>
              {statusLabel}
            </span>
          </div>
          <small style={{ color: 'var(--pico-muted-color)' }}>{timeLeft}</small>
        </header>

        <h4 style={{ marginBottom: '0.5rem' }}>{listing.title}</h4>

        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Servings:</strong> {listing.servings}
        </p>

        <p style={{ marginBottom: '0.5rem' }}>
          <strong>Location:</strong> {listing.pickupAddress}, {listing.city}
        </p>

        {listing.notes && (
          <p style={{ marginBottom: '0.5rem', fontStyle: 'italic', fontSize: '0.9rem' }}>
            <strong>Notes:</strong> {listing.notes}
          </p>
        )}

        {listing.donor && listing.donor.name && (
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <strong>Donor:</strong> {listing.donor.name}
            {listing.donor.phone && ` (${listing.donor.phone})`}
          </p>
        )}

        {listing.claimedBy && listing.claimedBy.name && (
          <p style={{ marginBottom: '0.5rem', fontSize: '0.9rem' }}>
            <strong>Claimed by:</strong> {listing.claimedBy.name}
            {listing.claimedBy.phone && ` (${listing.claimedBy.phone})`}
          </p>
        )}
      </div>

      {children && <div className="listing-actions">{children}</div>}
    </article>
  );
}
