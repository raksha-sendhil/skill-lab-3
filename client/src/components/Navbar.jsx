import React from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import Icon from './Icon';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <header className="site-header">
      <nav className="container nav">
        <Link to="/" className="brand">
          <span className="brand-mark">
            <Icon name="leaf" size={18} />
          </span>
          <span className="brand-name">Food Donation Portal</span>
        </Link>

        <div className="nav-actions">
          {user ? (
            <>
              <NavLink to="/dashboard" className="nav-link">
                Dashboard
              </NavLink>
              <div className="user-chip">
                <span className="avatar">{user.name?.charAt(0).toUpperCase()}</span>
                <span className="user-chip-text">
                  <strong>{user.name}</strong>
                  <small>{user.role === 'ngo' ? 'NGO' : 'Donor'}</small>
                </span>
              </div>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleLogout} title="Log out">
                <Icon name="logout" size={16} />
                <span className="hide-sm">Log out</span>
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="nav-link">
                Log in
              </NavLink>
              <Link to="/register" className="btn btn-primary btn-sm">
                Get started
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
