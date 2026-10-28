import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import ListingCard from '../components/ListingCard';

export default function Dashboard({ user }) {
  const isDonor = user?.role === 'donor';

  // Donor state
  const [myListings, setMyListings] = useState([]);
  const [loadingMine, setLoadingMine] = useState(true);

  // NGO state
  const [cityFilter, setCityFilter] = useState(user?.city || '');
  const [availableListings, setAvailableListings] = useState([]);
  const [loadingAvailable, setLoadingAvailable] = useState(true);

  // General error/action state
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

  // Donor Action: Delete listing
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    setActionError('');
    setActionSuccess('');
    try {
      await api.delete(`/listings/${id}`);
      setActionSuccess('Listing deleted successfully.');
      fetchMyListings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  // Donor Action: Mark picked up
  const handleMarkPickedUp = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.post(`/listings/${id}/pickup`);
      setActionSuccess('Marked as picked up!');
      fetchMyListings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to mark as picked up.');
    }
  };

  // NGO Action: Claim listing
  const handleClaim = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.post(`/listings/${id}/claim`);
      setActionSuccess('Listing claimed successfully!');
      fetchAvailableListings();
      fetchMyListings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Could not claim listing.');
    }
  };

  // NGO Action: Unclaim listing
  const handleUnclaim = async (id) => {
    setActionError('');
    setActionSuccess('');
    try {
      await api.post(`/listings/${id}/unclaim`);
      setActionSuccess('Listing unclaimed successfully.');
      fetchAvailableListings();
      fetchMyListings();
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to unclaim listing.');
    }
  };

  const handleCitySearch = (e) => {
    e.preventDefault();
    setActionError('');
    fetchAvailableListings(cityFilter);
  };

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      {actionError && <div className="error-message">{actionError}</div>}
      {actionSuccess && (
        <div style={{ color: '#2e7d32', backgroundColor: '#e8f5e9', border: '1px solid #c8e6c9', padding: '0.75rem 1rem', borderRadius: '4px', marginBottom: '1.25rem' }}>
          {actionSuccess}
        </div>
      )}

      {isDonor ? (
        /* ================= DONOR DASHBOARD ================= */
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ marginBottom: '0.25rem' }}>Donor Dashboard</h2>
              <p style={{ margin: 0, color: 'var(--pico-muted-color)' }}>
                Manage your food donations and mark collections.
              </p>
            </div>
            <Link to="/listings/new" role="button">
              + Post surplus food
            </Link>
          </div>

          <h3>My Listings</h3>
          {loadingMine ? (
            <p aria-busy="true">Loading your listings...</p>
          ) : myListings.length === 0 ? (
            <p>No listings yet. Click "+ Post surplus food" above to create one.</p>
          ) : (
            <div className="card-grid">
              {myListings.map((listing) => (
                <ListingCard key={listing._id} listing={listing}>
                  {listing.status === 'available' && (
                    <>
                      <Link
                        to={`/listings/${listing._id}/edit`}
                        role="button"
                        className="secondary outline"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        className="contrast outline"
                        onClick={() => handleDelete(listing._id)}
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                      >
                        Delete
                      </button>
                    </>
                  )}
                  {listing.status === 'claimed' && (
                    <button
                      type="button"
                      onClick={() => handleMarkPickedUp(listing._id)}
                      style={{ padding: '0.4rem 0.8rem', fontSize: '0.9rem' }}
                    >
                      Mark picked up
                    </button>
                  )}
                </ListingCard>
              ))}
            </div>
          )}
        </section>
      ) : (
        /* ================= NGO DASHBOARD ================= */
        <section>
          <div style={{ marginBottom: '2rem' }}>
            <h2>NGO Dashboard</h2>
            <p style={{ color: 'var(--pico-muted-color)' }}>
              Browse nearby surplus food to claim, or review your active claims.
            </p>
          </div>

          {/* Available Food Section */}
          <div style={{ marginBottom: '3rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
              <h3 style={{ margin: 0 }}>Available Food</h3>
              <form onSubmit={handleCitySearch} style={{ display: 'flex', gap: '0.5rem', margin: 0 }}>
                <input
                  type="text"
                  placeholder="Filter by city..."
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                  style={{ marginBottom: 0, width: '200px' }}
                />
                <button type="submit" className="outline" style={{ marginBottom: 0, padding: '0.4rem 0.8rem' }}>
                  Filter
                </button>
                {cityFilter && (
                  <button
                    type="button"
                    className="secondary outline"
                    style={{ marginBottom: 0, padding: '0.4rem 0.8rem' }}
                    onClick={() => {
                      setCityFilter('');
                      fetchAvailableListings('');
                    }}
                  >
                    Clear
                  </button>
                )}
              </form>
            </div>

            {loadingAvailable ? (
              <p aria-busy="true">Loading available food listings...</p>
            ) : availableListings.length === 0 ? (
              <p>No available listings found in this city right now.</p>
            ) : (
              <div className="card-grid">
                {availableListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing}>
                    <button
                      type="button"
                      onClick={() => handleClaim(listing._id)}
                      style={{ width: '100%' }}
                    >
                      Claim
                    </button>
                  </ListingCard>
                ))}
              </div>
            )}
          </div>

          {/* My Claims Section */}
          <section>
            <h3>My Claims</h3>
            {loadingMine ? (
              <p aria-busy="true">Loading your claims...</p>
            ) : myListings.length === 0 ? (
              <p>You haven't claimed any listings yet.</p>
            ) : (
              <div className="card-grid">
                {myListings.map((listing) => (
                  <ListingCard key={listing._id} listing={listing}>
                    {listing.status === 'claimed' && (
                      <button
                        type="button"
                        className="secondary outline"
                        onClick={() => handleUnclaim(listing._id)}
                        style={{ width: '100%' }}
                      >
                        Unclaim
                      </button>
                    )}
                  </ListingCard>
                ))}
              </div>
            )}
          </section>
        </section>
      )}
    </main>
  );
}
