import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api';
import Icon from '../components/Icon';

// Formats a date for <input type="datetime-local"> in the user's local time
function toDatetimeLocal(value) {
  if (!value) return '';
  const d = new Date(value);
  const pad = (num) => String(num).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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
          setError(err.response?.data?.message || 'Failed to load listing for editing.');
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
      setError(err.response?.data?.message || 'Failed to save listing. Please check input.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <main className="container page form-page">
        <p className="loading" aria-busy="true">Loading listing details…</p>
      </main>
    );
  }

  return (
    <main className="container page form-page">
      <Link to="/dashboard" className="back-link">
        <Icon name="arrowLeft" size={16} />
        Back to dashboard
      </Link>

      <div className="form-card">
        <h1>{isEditMode ? 'Edit listing' : 'Post surplus food'}</h1>
        <p className="form-sub">
          {isEditMode
            ? 'Update the details while the listing is still available.'
            : 'NGOs in your city will see this listing until the pickup deadline.'}
        </p>

        {error && (
          <div className="alert alert-error" role="alert">
            <Icon name="alert" size={18} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h2 className="form-section-title">Food details</h2>
          <label htmlFor="title">
            What food is available?
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
              Food type
              <select id="foodType" name="foodType" value={formData.foodType} onChange={handleChange} required>
                <option value="veg">Veg</option>
                <option value="non-veg">Non-veg</option>
                <option value="mixed">Mixed</option>
              </select>
            </label>

            <label htmlFor="servings">
              Servings
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

          <hr className="form-divider" />

          <h2 className="form-section-title">Pickup</h2>
          <label htmlFor="pickupAddress">
            Pickup address
            <textarea
              id="pickupAddress"
              name="pickupAddress"
              rows="2"
              value={formData.pickupAddress}
              onChange={handleChange}
              placeholder="e.g. 12 MG Road, ground floor kitchen"
              required
            />
          </label>

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
              Pickup deadline
              <input
                type="datetime-local"
                id="expiresAt"
                name="expiresAt"
                value={formData.expiresAt}
                min={toDatetimeLocal(new Date())}
                onChange={handleChange}
                required
              />
            </label>
          </div>

          <label htmlFor="notes">
            Notes <span className="optional">(optional)</span>
            <input
              type="text"
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Bring your own containers"
            />
          </label>

          <div className="form-actions">
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button type="submit" className="btn btn-primary" aria-busy={submitting} disabled={submitting}>
              {submitting ? 'Saving…' : isEditMode ? 'Save changes' : 'Publish listing'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
