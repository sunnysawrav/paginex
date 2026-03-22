import { useState, useEffect, useRef } from 'react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { LayoutGrid, AlignJustify, Printer, Users, MessageSquare, ArrowRight, CheckCircle } from 'lucide-react';

export default function LandingPage({ onLogin }) {
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const inviteRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToInvite = () => {
    inviteRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const handleInviteSubmit = async () => {
    setError('');
    if (!inviteName.trim()) { setError('Please enter your name.'); return; }
    if (!inviteEmail.trim() || !inviteEmail.includes('@')) { setError('Please enter a valid email.'); return; }
    try {
      setSubmitting(true);
      await addDoc(collection(db, 'inviteRequests'), {
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        note: inviteNote.trim(),
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (e) {
      setError('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="landing-shell">
      {/* Noise texture overlay */}
      <div className="landing-noise" />

      {/* ── NAVBAR ── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="landing-nav-inner">
          <div className="landing-nav-logo">
            <img src="/paginex/favicon.ico" alt="Paginex" className="landing-logo-img" />
            <span className="landing-logo-text">Paginex</span>
          </div>
          <button className="landing-nav-login" onClick={onLogin}>
            Sign In <ArrowRight size={13} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-hero-logo">
            <img src="/paginex/paginex_logo.svg" alt="Paginex" className="landing-hero-logo-img" />
          </div>
          <h1 className="landing-hero-headline">
            Block. Plan.<br />
            <em>Publish.</em>
          </h1>
          <p className="landing-hero-sub">
            Paginex gives editorial teams a shared visual space to plan every page —
            before a single article is written.
          </p>
          <div className="landing-hero-actions">
            <button className="landing-btn-primary" onClick={scrollToInvite}>
              Request Invite
            </button>
            <button className="landing-btn-ghost" onClick={onLogin}>
              Sign In
            </button>
          </div>
          <div className="landing-hero-meta">
            <span>Gallery View</span>
            <span className="landing-hero-dot" />
            <span>Scroll View</span>
            <span className="landing-hero-dot" />
            <span>Print Order</span>
            <span className="landing-hero-dot" />
            <span>Team Collaboration</span>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="landing-scroll-indicator" aria-hidden="true">
          <div className="landing-scroll-arrow" />
        </div>

        {/* Decorative page grid preview */}
        <div className="landing-hero-preview" aria-hidden="true">
          {[
            { label: 'Cover', tag: 'Locked', accent: true },
            { label: 'IFC', tag: 'Ad' },
            { label: 'Page 3', tag: 'Editorial' },
            { label: 'Page 4', tag: 'Received', received: true },
            { label: 'Page 5', tag: 'Ad' },
            { label: 'Page 6', tag: 'Editorial' },
            { label: 'Page 7', tag: 'Received', received: true },
            { label: 'Page 8', tag: 'Ad' },
            { label: 'Centerfold', tag: 'Special', centerfold: true },
            { label: 'Page 10', tag: 'Editorial' },
            { label: 'IBC', tag: 'Ad' },
            { label: 'Back Cover', tag: 'Locked', accent: true },
          ].map((p, i) => (
            <div
              key={i}
              className={`landing-preview-page ${p.accent ? 'accent' : ''} ${p.received ? 'received' : ''} ${p.centerfold ? 'centerfold' : ''}`}
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <span className="landing-preview-label">{p.label}</span>
              <span className="landing-preview-tag">{p.tag}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="landing-features">
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">Features</div>
          <h2 className="landing-section-heading">Everything your editorial team needs</h2>
          <div className="landing-features-grid">
            {[
              {
                Icon: LayoutGrid,
                title: 'Gallery View',
                desc: 'See your entire issue at a glance. Each page as a tile — content, status, and comments visible instantly.',
              },
              {
                Icon: AlignJustify,
                title: 'Scroll View',
                desc: 'Read through your magazine in sequence. Ideal for editorial review and flow checking.',
              },
              {
                Icon: Printer,
                title: 'Print Order',
                desc: 'Visualise the physical spread order. Know exactly how your pages fold before going to print.',
              },
              {
                Icon: Users,
                title: 'Team Collaboration',
                desc: 'Invite editors and designers with Edit or Read roles. Everyone stays on the same page — literally.',
              },
              {
                Icon: MessageSquare,
                title: 'Page Comments',
                desc: 'Leave notes on any page. Track pending vs resolved comments across the whole issue.',
              },
              {
                Icon: CheckCircle,
                title: 'Content Tracking',
                desc: 'Mark pages as received. Watch your issue fill up with a live received count.',
              },
            ].map(({ Icon, title, desc }, i) => (
              <div key={i} className="landing-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="landing-feature-icon">
                  <Icon size={18} />
                </div>
                <h3>{title}</h3>
                <p>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="landing-how">
        <div className="landing-section-inner">
          <div className="landing-section-eyebrow">How It Works</div>
          <h2 className="landing-section-heading">From blank canvas to print-ready</h2>
          <div className="landing-steps">
            {[
              {
                num: '01',
                title: 'Create your magazine',
                desc: 'Set the title, issue number, and total page count. Paginex auto-generates your layout with cover, IFC, centerfold, and back cover.',
              },
              {
                num: '02',
                title: 'Block every page',
                desc: 'Assign content types to each page — editorial, ad, special. Mark pages as received as content comes in.',
              },
              {
                num: '03',
                title: 'Collaborate & ship',
                desc: 'Invite your team, leave comments, reorder pages with drag-and-drop, then hand off a clean print order.',
              },
            ].map(({ num, title, desc }, i) => (
              <div key={i} className="landing-step">
                <div className="landing-step-num">{num}</div>
                <div className="landing-step-body">
                  <h3>{title}</h3>
                  <p>{desc}</p>
                </div>
                {i < 2 && <div className="landing-step-arrow"><ArrowRight size={16} /></div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── REQUEST INVITE ── */}
      <section className="landing-invite" ref={inviteRef}>
        <div className="landing-invite-inner">
          <div className="landing-section-eyebrow">Early Access</div>
          <h2 className="landing-section-heading">Request an invite</h2>
          <p className="landing-invite-sub">
            Paginex is currently in private beta. Drop your details and we'll be in touch.
          </p>

          {submitted ? (
            <div className="landing-invite-success">
              <CheckCircle size={28} />
              <h3>You're on the list.</h3>
              <p>We'll reach out to <strong>{inviteEmail}</strong> when your invite is ready.</p>
            </div>
          ) : (
            <div className="landing-invite-form">
              <div className="landing-invite-field">
                <label>Name</label>
                <input
                  type="text"
                  placeholder="Your name"
                  value={inviteName}
                  onChange={e => setInviteName(e.target.value)}
                />
              </div>
              <div className="landing-invite-field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={inviteEmail}
                  onChange={e => setInviteEmail(e.target.value)}
                />
              </div>
              <div className="landing-invite-field">
                <label>Note <span className="landing-invite-optional">(optional)</span></label>
                <textarea
                  placeholder="Tell us about your publication…"
                  value={inviteNote}
                  onChange={e => setInviteNote(e.target.value)}
                  rows={3}
                />
              </div>
              {error && <div className="landing-invite-error">{error}</div>}
              <button
                className="landing-btn-primary"
                onClick={handleInviteSubmit}
                disabled={submitting}
              >
                {submitting ? 'Submitting…' : 'Request Invite'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-logo">
            <img src="/paginex/favicon.ico" alt="Paginex" className="landing-logo-img small" />
            <span style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>Paginex</span>
          </div>
          <p className="landing-footer-copy">© {new Date().getFullYear()} Paginex. All rights reserved.</p>
          <button className="landing-footer-login" onClick={onLogin}>Sign In →</button>
        </div>
      </footer>
    </div>
  );
}