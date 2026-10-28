import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';

const STATS = [
  { key: 'mealsSaved', label: 'Meals saved', icon: 'bowl' },
  { key: 'pickups', label: 'Pickups completed', icon: 'truck' },
  { key: 'donors', label: 'Donors', icon: 'building' },
  { key: 'ngos', label: 'Partner NGOs', icon: 'heart' },
];

const STEPS = [
  { icon: 'plus', title: 'Post', text: 'Donors list surplus food with servings, pickup address and a pickup deadline.' },
  { icon: 'check', title: 'Claim', text: 'NGOs in the same city claim it in one click. Each listing goes to only one NGO.' },
  { icon: 'truck', title: 'Collect', text: 'The NGO picks the food up and the donor confirms it, adding to meals saved.' },
];

function HeroArt() {
  return (
    <svg viewBox="0 0 400 340" role="img" aria-label="A bowl of food being shared">
      <circle cx="200" cy="180" r="150" fill="#e6f1ea" />
      <circle cx="330" cy="72" r="30" fill="#fbe3c8" />
      <circle cx="62" cy="96" r="10" fill="#f3c48e" />
      <circle cx="350" cy="250" r="7" fill="#9cc7ae" />

      <g stroke="#a9cdb8" strokeWidth="7" fill="none" strokeLinecap="round">
        <path d="M160 100c-12-14 12-24 0-40" />
        <path d="M200 88c-12-14 12-24 0-40" />
        <path d="M240 100c-12-14 12-24 0-40" />
      </g>

      <circle cx="152" cy="168" r="26" fill="#f6c97b" />
      <circle cx="200" cy="156" r="34" fill="#f8d38f" />
      <circle cx="248" cy="168" r="26" fill="#f6c97b" />
      <path d="M212 136c10-20 34-22 44-15-7 15-27 24-44 15z" fill="#2f8f5b" />
      <path d="M170 146c-6-16-24-20-32-15 5 12 19 20 32 15z" fill="#3fa36b" />
      <circle cx="186" cy="150" r="4" fill="#e07b2e" />
      <circle cx="226" cy="162" r="4" fill="#e07b2e" />

      <path d="M82 180h236c0 72-53 118-118 118S82 252 82 180z" fill="#1f6b45" />
      <path d="M82 180h236" stroke="#17563a" strokeWidth="9" strokeLinecap="round" />
      <path d="M118 206c11 36 42 62 82 67" stroke="#2f8f5b" strokeWidth="8" fill="none" strokeLinecap="round" opacity=".55" />
      <rect x="160" y="292" width="80" height="14" rx="7" fill="#17563a" />

      <path
        transform="translate(296 196) scale(1.7)"
        d="M0 6C0 2.5 2.7 0 5.8 0 7.7 0 9.2 1 10 2.4 10.8 1 12.3 0 14.2 0 17.3 0 20 2.5 20 6c0 6-10 12-10 12S0 12 0 6z"
        fill="#e07b2e"
      />
    </svg>
  );
}

export default function Home({ user }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api
      .get('/stats')
      .then((res) => setStats(res.data))
      .catch((err) => console.error('Failed to load stats:', err));
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <h1>
              Surplus food, shared <em>before</em> it goes to waste.
            </h1>
            <p className="lead">
              Restaurants, hostels and caterers post extra meals. Nearby NGOs claim and collect them within the safe
              pickup window.
            </p>
            <div className="hero-actions">
              {user ? (
                <Link to="/dashboard" className="btn btn-primary btn-lg">
                  Go to dashboard <Icon name="arrowRight" size={18} />
                </Link>
              ) : (
                <>
                  <Link to="/register" className="btn btn-primary btn-lg">
                    Get started <Icon name="arrowRight" size={18} />
                  </Link>
                  <Link to="/login" className="btn btn-secondary btn-lg">
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hero-art">
            <HeroArt />
          </div>
        </div>
      </section>

      <section className="container stats-grid">
        {STATS.map((s, i) => (
          <div key={s.key} className="stat-card">
            <span className={`stat-icon ${i % 2 ? 'accent' : ''}`}>
              <Icon name={s.icon} size={22} />
            </span>
            <div>
              <div className="stat-value">{stats ? stats[s.key].toLocaleString('en-IN') : '–'}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </section>

      <section className="container section">
        <h2 className="section-title">How it works</h2>
        <div className="steps">
          {STEPS.map((step, i) => (
            <div key={step.title} className="step">
              <span className="step-num">0{i + 1}</span>
              <span className="stat-icon">
                <Icon name={step.icon} size={22} />
              </span>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
