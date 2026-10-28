# Food Donation Coordination Portal

A MERN web app that connects **food donors** (restaurants, hostels, caterers, event venues) with **NGOs**. Donors post surplus cooked food with a pickup deadline. NGOs in the same city browse what's available, claim a listing and collect it. Each listing can be claimed by only one NGO, listings past their deadline expire automatically, and the home page shows the total meals saved.

```text
available ──claim──▶ claimed ──pickup──▶ picked_up
    │                   │
    │                   └──unclaim──▶ available
    └──deadline passes──▶ expired
```

## Tech stack

| Layer | Tools |
|---|---|
| Database | MongoDB Atlas, Mongoose |
| Backend | Node.js, Express 5, JWT (jsonwebtoken), bcryptjs |
| Frontend | React (Vite), React Router, Axios, Pico CSS |

## Project structure

```text
server/   Express REST API (models, routes, auth middleware, seed script)
client/   React frontend
```

## Running locally

You need Node.js 18 or newer and a MongoDB connection string (a free MongoDB Atlas cluster works).

### 1. Backend

```bash
cd server
npm install
cp .env.example .env      # then fill in MONGO_URI and JWT_SECRET
npm run seed              # optional: loads demo users and listings
npm run dev               # http://localhost:5000
```

### 2. Frontend

```bash
cd client
npm install
cp .env.example .env      # VITE_API_URL=http://localhost:5000/api
npm run dev               # http://localhost:5173
```

## Demo accounts (after `npm run seed`)

All accounts use the password `password123`.

| Email | Role | City |
|---|---|---|
| donor1@demo.com | Donor (Hotel Annapoorna) | Bengaluru |
| donor2@demo.com | Donor (Green Leaf Caterers) | Mysuru |
| ngo1@demo.com | NGO (Feed Bengaluru Foundation) | Bengaluru |
| ngo2@demo.com | NGO (Mysuru Care Trust) | Mysuru |

## API

Base URL: `http://localhost:5000/api`. Protected routes need the header `Authorization: Bearer <token>`. Errors are returned as `{ "message": "..." }`.

| Method | Path | Who | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Body `{name,email,password,role,phone,city}` → `{token,user}`. `role` is `donor` or `ngo` |
| POST | `/auth/login` | public | Body `{email,password}` → `{token,user}` |
| GET | `/listings?city=X` | logged in | Available listings, soonest deadline first; optional city filter |
| GET | `/listings/mine` | logged in | Donor: own listings. NGO: listings they claimed |
| GET | `/listings/:id` | logged in | One listing |
| POST | `/listings` | donor | Create. Body `{title,foodType,servings,pickupAddress,city,expiresAt,notes?}` |
| PUT | `/listings/:id` | owner donor | Edit (only while `available`) |
| DELETE | `/listings/:id` | owner donor | Delete (not allowed while `claimed`) |
| POST | `/listings/:id/claim` | NGO | Claim an available listing |
| POST | `/listings/:id/unclaim` | claiming NGO | Release a claim |
| POST | `/listings/:id/pickup` | owner donor | Mark a claimed listing as picked up |
| GET | `/stats` | public | `{mealsSaved, pickups, donors, ngos}` |

Status codes: `400` invalid input, `401` not logged in, `403` wrong role or not the owner, `404` not found, `409` conflict (already claimed, wrong status, email taken).

## Business rules

- Only one NGO can claim a listing. The availability check is part of the database update itself, so two simultaneous claims can't both succeed.
- Listings past their pickup deadline are marked `expired` and hidden from NGOs.
- Donors can only edit `available` listings and can't delete a listing that's currently `claimed`.
- Meals saved is the total servings across all picked-up listings.
