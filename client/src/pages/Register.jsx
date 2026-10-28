import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';

const ROLES = [
  { value: 'donor', label: 'Donor', hint: 'Restaurant, hostel, caterer', icon: 'building' },
  { value: 'ngo', label: 'NGO', hint: 'Shelter, food bank, kitchen', icon: 'heart' },
];

export default function Register({ onLogin }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    city: '',
    role: 'donor',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData);
      onLogin(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-card auth-card-wide">
        <span className="brand-mark brand-mark-lg">
          <Icon name="leaf" size={22} />
        </span>
        <h1>Create your account</h1>
        <p className="auth-sub">Join as a donor sharing food, or an NGO collecting it.</p>

        {error && (
          <div className="alert alert-error" role="alert">
            <Icon name="alert" size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <fieldset className="role-picker">
            <legend>I am a</legend>
            {ROLES.map((r) => (
              <label key={r.value} className={`role-option ${formData.role === r.value ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value={r.value}
                  checked={formData.role === r.value}
                  onChange={handleChange}
                />
                <span className="role-icon">
                  <Icon name={r.icon} size={20} />
                </span>
                <span>
                  <strong>{r.label}</strong>
                  <small>{r.hint}</small>
                </span>
              </label>
            ))}
          </fieldset>

          <label htmlFor="name">
            {formData.role === 'ngo' ? 'Organisation name' : 'Business or organisation name'}
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder={formData.role === 'ngo' ? 'e.g. Hope Shelter' : 'e.g. Hotel Annapoorna'}
            />
          </label>

          <label htmlFor="email">
            Email
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="you@example.com"
              autoComplete="email"
            />
          </label>

          <label htmlFor="password">
            Password
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              placeholder="At least 6 characters"
              autoComplete="new-password"
            />
          </label>

          <div className="grid">
            <label htmlFor="phone">
              Phone
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                placeholder="10-digit number"
              />
            </label>

            <label htmlFor="city">
              City
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                required
                placeholder="e.g. Bengaluru"
              />
            </label>
          </div>

          <button type="submit" className="btn btn-primary btn-block btn-lg" aria-busy={loading} disabled={loading}>
            {loading ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </main>
  );
}
