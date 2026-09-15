import React from 'react';
import { ArrowLeft, Mail, Moon, Sun } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import MobileAppShell from '../dashboard/MobileAppShell';
import '../../pages/LandingPage.css';

export default function StitchLegalLayout({ icon, title, updated, children, activeTab }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { language, t, toggleLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();
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
      {/* Site header — reuses the exact landing-page navbar classes/styling so it's
          the same navbar as the homepage, just sized for this page. Left untouched
          on dashboard routes, where MobileAppShell already renders the app's own nav. */}
      {!isDashboardRoute && (
        <header className="landing-navbar-wrapper">
          <div className="landing-navbar">
            <button className="landing-brand-btn" type="button" onClick={() => navigate('/')} aria-label="Go home">
              <img src="/logo-mascot.png" alt="KOTCHOMNOL" className="landing-brand-icon" />
              <span className="landing-brand-title">KOTCHOMNOL</span>
            </button>

            <nav className="landing-nav-links" aria-label="Site navigation">
              <Link to="/about">{t('about')}</Link>
              <Link to="/terms">{t('terms')}</Link>
              <Link to="/privacy">{t('privacy')}</Link>
              <Link to="/contact">{t('contact')}</Link>
            </nav>

            <div className="landing-nav-right">
              <div className="desktop-controls">
                <button
                  type="button"
                  className="landing-theme-btn"
                  onClick={toggleTheme}
                  aria-label="Toggle theme mode"
                >
                  {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  type="button"
                  className="landing-lang-btn"
                  onClick={toggleLanguage}
                  aria-label="Toggle language"
                >
                  {language === 'en' ? 'KM' : 'EN'}
                </button>
              </div>

              <div className="landing-auth-buttons">
                <button
                  type="button"
                  className="landing-primary-btn compact"
                  onClick={() => navigate('/')}
                >
                  {t('home')}
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      <main className="stitch-legal-shell">
        {/* Existing "back" nav — kept exactly as before. */}
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

      {!isDashboardRoute && (
        <footer className="legal-site-footer" aria-label={t('footerLabel')}>
          <div className="legal-footer-brand">
            <img src="/logo-mascot.png" alt="KOTCHOMNOL" className="legal-site-logo" />
            <span>KOTCHOMNOL</span>
          </div>
          <p className="legal-footer-desc">{t('footerDescription')}</p>
          <nav className="legal-footer-nav" aria-label={t('footerNavigation')}>
            <Link to="/">{t('home')}</Link>
            <Link to="/about">{t('about')}</Link>
            <Link to="/terms">{t('terms')}</Link>
            <Link to="/privacy">{t('privacy')}</Link>
            <Link to="/contact"><Mail size={14} /> {t('contact')}</Link>
          </nav>
          <p className="legal-footer-copyright">
            {(t('copyright') || '').replace('{year}', String(new Date().getFullYear()))}
          </p>
        </footer>
      )}
    </div>
  );

  if (isDashboardRoute) {
    return <MobileAppShell activeTab={activeTab}>{content}</MobileAppShell>;
  }

  return content;
}