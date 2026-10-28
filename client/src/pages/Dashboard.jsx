import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ListingCard from '../components/ListingCard';
import Icon from '../components/Icon';

const STATUSES = [
  ['available', 'Available'],
  ['claimed', 'Claimed'],
  ['picked_up', 'Picked up'],
  ['expired', 'Expired'],
];

function EmptyState({ children }) {
  return (
    <div className="empty">
      <Icon name="inbox" size={28} />
      <p>{children}</p>
    </div>
  );
}

export default function Dashboard({ user }) {
  const isDonor = user?.role === 'donor';

  // Donor: own listings. NGO: own claims.
  const [myListings, setMyListings] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);

  // NGO state
  const [cityFilter, setCityFilter] = useState(user?.city || '');
  const [availableListings, setAvailableListings] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchMyListings = async () => {
    try {
      setLoadingMine(true);
      const res = await api.get('/listings/mine');
      setMyListings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch my listings:', err);
      setActionError(err.response?.data?.message || 'Failed to load your listings');
    } finally {
      setLoadingMine(false);
    }
  };

  const fetchAvailableListings = async (city = cityFilter) => {
    try {
      setLoadingAvailable(true);
      const query = city ? `?city=${encodeURIComponent(city.trim())}` : '';
      const res = await api.get(`/listings${query}`);
      setAvailableListings(res.data || []);
    } catch (err) {
      console.error('Failed to fetch available listings:', err);
      setActionError(err.response?.data?.message || 'Failed to load available listings');
    } finally {
      setLoadingAvailable(false);
    }
  };

  // Load once when the dashboard opens; the city filter only refetches on submit
  useEffect(() => {
    if (!isDonor) fetchAvailableListings(user?.city || '');
    fetchMyListings();
  }, []);

  // Runs an action, shows its result, then refreshes the lists
  const runAction = async (request, successMessage, fallbackError) => {
    setActionError('');
    setActionSuccess('');
    try {
      await request();
      setActionSuccess(successMessage);
      if (!isDonor) fetchAvailableListings();
      fetchMyListings();
    } catch (err) {
      setActionError(err.response?.data?.message || fallbackError);
    }
  };

  const handleDelete = (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    runAction(() => api.delete(`/listings/${id}`), 'Listing deleted.', 'Failed to delete listing.');
  };

  const handleMarkPickedUp = (id) =>
    runAction(() => api.post(`/listings/${id}/pickup`), 'Marked as picked up.', 'Failed to mark as picked up.');

  const handleClaim = (id) =>
    runAction(
      () => api.post(`/listings/${id}/claim`),
      'Listing claimed. Contact the donor to arrange pickup.',
      'Could not claim listing.'
    );

  const handleUnclaim = (id) =>
    runAction(() => api.post(`/listings/${id}/unclaim`), 'Claim released.', 'Failed to unclaim listing.');

  const handleCitySearch = (e) => {
    e.preventDefault();
    setActionError('');
    fetchAvailableListings(cityFilter);
  };

  const clearCity = () => {
    setCityFilter('');
    fetchAvailableListings('');
  };

  return (
    <main className="container page">
      <div className="page-header">
        <div>
          <h1>{isDonor ? 'Your donations' : 'Find surplus food'}</h1>
          <p>
            {isDonor
              ? 'Post surplus food and track each listing until it is collected.'
              : 'Claim available food nearby and keep track of your pickups.'}
          </p>
        </div>
        {isDonor && (
          <Link to="/listings/new" className="btn btn-primary">
            <Icon name="plus" size={18} />
            Post surplus food
          </Link>
        )}
      </div>

      {actionError && (
        <div className="alert alert-error" role="alert">
          <Icon name="alert" size={18} />
          {actionError}
        </div>
      )}
      {actionSuccess && (
        <div className="alert alert-success" role="status">
          <Icon name="check" size={18} />
          {actionSuccess}
        </div>
      )}

      {isDonor ? (
        <>
          {!loadingMine && myListings.length > 0 && (
            <div className="summary">
              {STATUSES.map(([key, label]) => (
                <div key={key} className="summary-item">
                  <span>
                    <i className={`dot dot-${key}`} />
                    {label}
                  </span>
                  <strong>{myListings.filter((l) => l.status === key).length}</strong>
                </div>
              ))}
            </div>
          )}

          <section>
            <div className="section-head">
              <h2>My listings</h2>
            </div>
            {loadingMine ? (
              <p className="loading" aria-busy="true">Loading your listings…</p>
            ) : myListings.length === 0 ? (
              <EmptyState>You haven't posted any food yet. Use “Post surplus food” to create your first listing.</EmptyState>
            ) : (
              <div className="card-grid">
                {myListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} contact="claimer">
                    {listing.status === 'available' && (
                      <>
                        <Link to={`/listings/${listing._id}/edit`} className="btn btn-secondary btn-sm">
                          <Icon name="edit" size={15} />
                          Edit
                        </Link>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(listing._id)}>
                          <Icon name="trash" size={15} />
                          Delete
                        </button>
                      </>
                    )}
                    {listing.status === 'claimed' && (
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => handleMarkPickedUp(listing._id)}>
                        <Icon name="check" size={15} />
                        Mark picked up
                      </button>
                    )}
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </>
      ) : (
        <>
          <section className="block">
            <div className="section-head">
              <h2>
                Available food
                {!loadingAvailable && <span className="count">{availableListings.length}</span>}
              </h2>
              <form className="search" onSubmit={handleCitySearch}>
                <div className="search-field">
                  <Icon name="search" size={16} />
                  <input
                    type="text"
                    placeholder="Filter by city"
                    aria-label="Filter by city"
                    value={cityFilter}
                    onChange={(e) => setCityFilter(e.target.value)}
                  />
                </div>
                <button type="submit" className="btn btn-secondary">
                  Search
                </button>
                {cityFilter && (
                  <button type="button" className="btn btn-ghost" onClick={clearCity}>
                    Clear
                  </button>
                )}
              </form>
            </div>

            {loadingAvailable ? (
              <p className="loading" aria-busy="true">Loading available food…</p>
            ) : availableListings.length === 0 ? (
              <EmptyState>No food is available {cityFilter ? `in ${cityFilter}` : ''} right now. Check back soon.</EmptyState>
            ) : (
              <div className="card-grid">
                {availableListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} contact="donor">
                    <button type="button" className="btn btn-primary btn-block" onClick={() => handleClaim(listing._id)}>
                      Claim this food
                    </button>
                  </ListingCard>
                ))}
              </div>
            )}
          </section>

          <section>
            <div className="section-head">
              <h2>
                My claims
                {!loadingMine && <span className="count">{myListings.length}</span>}
              </h2>
            </div>
            {loadingMine ? (
              <p className="loading" aria-busy="true">Loading your claims…</p>
            ) : myListings.length === 0 ? (
              <EmptyState>You haven't claimed any food yet.</EmptyState>
            ) : (
              <div className="card-grid">
                {myListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing} contact="donor">
                    {listing.status === 'claimed' && (
                      <button type="button" className="btn btn-secondary btn-block" onClick={() => handleUnclaim(listing._id)}>
                        <Icon name="undo" size={15} />
                        Release claim
                      </button>
                    )}
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}
