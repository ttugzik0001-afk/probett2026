# Bethel & Promise — Wedding Website

A custom, fully responsive wedding website built for the marriage of **Bethel & Promise** on **Saturday, 19 December 2026** at FlamesHouse International Church, Nnewi.

## ✨ Features

- **Public Facing:**
  - Elegant, responsive design with smooth scroll animations.
  - Live countdown to the big day.
  - Interactive schedule and color palette.
  - Direct Google Maps links for the Church and Reception.
  - "Add to Calendar" functionality.
  - Gift Registry page with direct store links and bank transfer details.
  - RSVP form directly integrated with a live database.

- **Admin Portal (Private):**
  - Secure login using Supabase Auth.
  - Live RSVP dashboard with metric cards (Total, Confirmed, Declined).
  - Detailed attendee breakdown by relationship category.
  - "Share via WhatsApp" button for quick guest invitations.
  - Dynamic security PIN generator for onboarding new administrators.
  - Dark/Light mode toggle.

## 🛠️ Tech Stack

- **Frontend:** HTML5, Vanilla CSS (Custom properties, Flexbox/Grid), Vanilla JavaScript.
- **Backend / Database:** [Supabase](https://supabase.com/) (PostgreSQL, Row Level Security, Auth).
- **Hosting:** Vercel (or Netlify).
- **Fonts:** Google Fonts (Cormorant Garamond & Jost).

## 🚀 Running Locally

To run this project locally on your machine:

1. Clone the repository or download the folder.
2. Open the folder in VS Code.
3. Use an extension like **Live Server** (right-click `index.html` and select "Open with Live Server").
   - *Alternatively, run `python3 -m http.server` in the terminal.*
4. Open `http://localhost:8000` (or whatever port Live Server assigns).

## 🔐 Admin Access

To view the RSVP dashboard, navigate to `/admin-login.html`. 
*Note: Access is restricted to authorized administrators only. Master security PINs are required for new operator registration.*

## 🗄️ Database Structure (Supabase)

The project relies on the following tables in Supabase:
- `rsvp_responses`: Stores guest names, emails, attendance status, relationship category, and notes.
- `system_secrets`: Stores the temporary 6-digit registration PIN.

## 💌 Credits

Designed and developed with love for the beautiful union of Bethel & Promise.