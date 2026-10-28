import React from 'react';
import Icon from './Icon';

const FOOD_LABELS = { veg: 'Veg', 'non-veg': 'Non-veg', mixed: 'Mixed' };
const STATUS_LABELS = {
  available: 'Available',
  claimed: 'Claimed',
  picked_up: 'Picked up',
  expired: 'Expired',
};

function timeLeft(expiresAt) {
  const totalMinutes = Math.floor((new Date(expiresAt).getTime() - Date.now()) / 60000);
  if (totalMinutes <= 0) return { text: 'Pickup window closed', urgent: true };

  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const mins = totalMinutes % 60;
  const text = days > 0 ? `${days}d ${hours}h` : hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  return { text: `Pick up within ${text}`, urgent: totalMinutes < 120 };
}

// contact: which person's details to show, 'donor' (for NGOs) or 'claimer' (for donors)
export default function ListingCard({ listing, contact, children }) {
  // A countdown only makes sense while the food is still waiting to be collected
  const isActive = listing.status === 'available' || listing.status === 'claimed';
  const deadline = isActive ? timeLeft(listing.expiresAt) : null;
  const person = contact === 'donor' ? listing.donor : listing.claimedBy;

  return (
    <article className="listing-card">
      <div className="listing-top">
        <span className={`food-mark food-${listing.foodType}`}>
          <i />
          {FOOD_LABELS[listing.foodType]}
        </span>
        <span className={`badge badge-${listing.status}`}>{STATUS_LABELS[listing.status]}</span>
      </div>

      <h3 className="listing-title">{listing.title}</h3>

      <ul className="listing-meta">
        <li>
          <Icon name="users" size={16} />
          {listing.servings} servings
        </li>
        <li>
          <Icon name="pin" size={16} />
          {listing.pickupAddress}, {listing.city}
        </li>
        {deadline && (
          <li className={deadline.urgent ? 'urgent' : ''}>
            <Icon name="clock" size={16} />
            {deadline.text}
          </li>
        )}
      </ul>

      {listing.notes && <p className="listing-notes">{listing.notes}</p>}

      {(person || children) && (
        <div className="listing-foot">
          {person && (
            <div className="contact">
              <div>
                <small>{contact === 'donor' ? 'Donor' : 'Claimed by'}</small>
                <strong>{person.name}</strong>
              </div>
              <a href={`tel:${person.phone}`}>
                <Icon name="phone" size={14} />
                {person.phone}
              </a>
            </div>
          )}
          {children && <div className="listing-actions">{children}</div>}
        </div>
      )}
    </article>
  );
}
