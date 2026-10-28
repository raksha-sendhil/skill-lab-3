import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Home({ user }) {
  const [stats, setStats] = useState({
    mealsSaved: 0,
    pickups: 0,
    donors: 0,
    ngos: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/stats')
      .then((res) => {
        if (res.data) {
          setStats(res.data);
        }
      })
      .catch((err) => {
        console.error('Failed to load stats:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="container" style={{ padding: '2rem 0' }}>
      <section style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>
          Food Donation Coordination Portal
        </h1>
        <p style={{ fontSize: '1.25rem', color: 'var(--pico-muted-color)' }}>
          Connecting surplus cooked food from donors with local shelters and NGOs in real time.
        </p>

        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          {user ? (
            <Link to="/dashboard" role="button">
              Go to dashboard &rarr;
            </Link>
          ) : (
            <>
              <Link to="/register" role="button">
                Get Started
              </Link>
              <Link to="/login" role="button" className="secondary outline">
                Login
              </Link>
            </>
          )}
        </div>
      </section>

      <section>
        <h3 style={{ textAlign: 'center', marginBottom: '1rem' }}>Our Community Impact</h3>
        <div className="stats-strip">
          <div className="stat-item">
            <h3>{loading ? '...' : stats.mealsSaved ?? 0}</h3>
            <p>Meals Saved</p>
          </div>
          <div className="stat-item">
            <h3>{loading ? '...' : stats.pickups ?? 0}</h3>
            <p>Pickups Completed</p>
          </div>
          <div className="stat-item">
            <h3>{loading ? '...' : stats.donors ?? 0}</h3>
            <p>Active Donors</p>
          </div>
          <div className="stat-item">
            <h3>{loading ? '...' : stats.ngos ?? 0}</h3>
            <p>Partner NGOs</p>
          </div>
        </div>
      </section>
    </main>
  );
}
