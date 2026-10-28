import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <nav className="container">
      <ul>
        <li>
          <Link to="/" style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>
            🍲 Food Donation Portal
          </Link>
        </li>
      </ul>
      <ul>
        {user ? (
          <>
            <li>
              <span>
                Hi, <strong>{user.name}</strong> ({user.role})
              </span>
            </li>
            <li>
              <Link to="/dashboard" role="button" className="outline">
                Dashboard
              </Link>
            </li>
            <li>
              <button
                type="button"
                className="secondary outline"
                onClick={handleLogout}
                style={{ padding: '0.4rem 0.8rem' }}
              >
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login">Login</Link>
            </li>
            <li>
              <Link to="/register" role="button">
                Register
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
