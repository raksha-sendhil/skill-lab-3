import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';

function toDatetimeLocal(isoString) {
  if (!isoString) return '';
  const d = new Date(isoString);
  const pad = (num) => String(num).padStart(2, '0');
  const yyyy = d.getFullYear();
  const MM = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  return `${yyyy}-${MM}-${dd}T${hh}:${mm}`;
}

export default function ListingForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    foodType: 'veg',
    servings: '',
    pickupAddress: '',
    city: '',
    expiresAt: '',
    notes: '',
  });

  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode) {
      api
        .get(`/listings/${id}`)
        .then((res) => {
          const item = res.data;
          setFormData({
            title: item.title || '',
            foodType: item.foodType || 'veg',
            servings: item.servings || '',
            pickupAddress: item.pickupAddress || '',
            city: item.city || '',
            expiresAt: toDatetimeLocal(item.expiresAt),
            notes: item.notes || '',
          });
        })
        .catch((err) => {
          setError(
            err.response?.data?.message || 'Failed to load listing for editing.'
          );
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.expiresAt) {
      setError('Please select a pickup deadline.');
      return;
    }

    const payload = {
      title: formData.title.trim(),
      foodType: formData.foodType,
      servings: Number(formData.servings),
      pickupAddress: formData.pickupAddress.trim(),
      city: formData.city.trim(),
      expiresAt: new Date(formData.expiresAt).toISOString(),
      notes: formData.notes.trim(),
    };

    setSubmitting(true);
    try {
      if (isEditMode) {
        await api.put(`/listings/${id}`, payload);
      } else {
        await api.post('/listings', payload);
      }
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to save listing. Please check input.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container" style={{ padding: '2rem 0' }}>
        <p aria-busy="true">Loading listing details...</p>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: '650px', padding: '2rem 0' }}>
      <article>
        <h2>{isEditMode ? 'Edit Food Listing' : 'Post Surplus Food'}</h2>
        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <label htmlFor="title">
            Food Title / Description
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Veg biryani and curd rice"
              required
            />
          </label>

          <div className="grid">
            <label htmlFor="foodType">
              Food Type
              <select
                id="foodType"
                name="foodType"
                value={formData.foodType}
                onChange={handleChange}
                required
              >
                <option value="veg">Veg</option>
                <option value="non-veg">Non-Veg</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>

            <label htmlFor="servings">
              Approximate Servings
              <input
                type="number"
                id="servings"
                name="servings"
                min="1"
                value={formData.servings}
                onChange={handleChange}
                placeholder="e.g. 40"
                required
              />
            </label>
          </div>

          <div className="grid">
            <label htmlFor="city">
              City
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Bengaluru"
                required
              />
            </label>

            <label htmlFor="expiresAt">
              Pickup Deadline
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label htmlFor="pickupAddress">
            Full Pickup Address
            <textarea
              id="pickupAddress"
              name="pickupAddress"
              rows="2"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="e.g. 12 MG Road, Ground Floor Kitchen"
              required
            />
          </label>

          <label htmlFor="notes">
            Optional Notes
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Bring your own containers, call before arrival"
            />
          </label>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="submit" aria-busy={submitting} disabled={submitting}>
              {submitting
                ? 'Saving...'
                : isEditMode
                ? 'Update Listing'
                : 'Publish Listing'}
            </button>
            <Link
              to="/dashboard"
              role="button"
              className="secondary outline"
              style={{ width: 'auto' }}
            >
              Cancel
            </Link>
          </div>
        </form>
      </article>
    </main>
  );
}
