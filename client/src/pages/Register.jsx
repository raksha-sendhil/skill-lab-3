import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

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
      setError(
        err.response?.data?.message || 'Registration failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container" style={{ maxWidth: '550px', padding: '2rem 0' }}>
      <article>
        <h2>Register</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="name">
            Organization / Name
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="e.g. Annapoorna Restaurant or Hope Shelter"
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
              placeholder="name@example.com"
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

          <label htmlFor="role">
            Role
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
            >
              <option value="donor">Donor (Restaurant, Mess, Caterer, etc.)</option>
              <option value="ngo">NGO (Shelter, Food Bank, Kitchen, etc.)</option>
            </select>
          </label>

          <button type="submit" aria-busy={loading} disabled={loading}>
            {loading ? 'Creating account...' : 'Register'}
          </button>
        </form>

        <footer style={{ marginTop: '1rem', textAlign: 'center' }}>
          <small>
            Already have an account? <Link to="/login">Login here</Link>
          </small>
        </footer>
      </article>
    </main>
  );
}
