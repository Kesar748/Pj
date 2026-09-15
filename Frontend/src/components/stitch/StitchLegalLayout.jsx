import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import MobileAppShell from '../dashboard/MobileAppShell';

export default function StitchLegalLayout({ icon, title, updated, children, activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const isKhmer = language === 'km';

  // When these pages are opened from inside the dashboard (e.g. /dashboard/about,
  // /dashboard/contact), keep the app's nav (sidebar + bottom tab bar) visible by
  // wrapping the content in MobileAppShell. On the public routes (/about, /contact,
  // /terms, /privacy) we keep the standalone marketing-style layout.
  const isDashboardRoute = location.pathname.startsWith('/dashboard');

  const backLabel = isDashboardRoute
    ? (isKhmer ? 'ត្រឡប់ក្រោយ' : 'Back')
    : (isKhmer ? 'ត្រឡប់ទៅគេហទំព័រដើម' : 'Back to Website');

  const content = (
    <div className="stitch-legal-page">
      <main className="stitch-legal-shell">
        <header className="stitch-legal-header">
          <button
            type="button"
            className="legal-back-btn"
            onClick={() => navigate(isDashboardRoute ? '/dashboard' : '/')}
            title={backLabel}
          >
            <ArrowLeft size={16} />
            <span>{backLabel}</span>
          </button>
        </header>

        <section className="stitch-legal-title">
          {icon && <div className="stitch-legal-icon">{icon}</div>}
          <h1>{title}</h1>
          {updated && <p>{updated}</p>}
        </section>

        <article className="stitch-legal-card">{children}</article>
      </main>
    </div>
  );

  if (isDashboardRoute) {
    return <MobileAppShell activeTab={activeTab}>{content}</MobileAppShell>;
  }

  return content;
}