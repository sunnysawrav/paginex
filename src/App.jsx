import { useState, useEffect } from 'react';
import {
  LayoutGrid, AlignJustify, Printer, Plus,
  BookOpen, Save, Trash2
} from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
import ProjectSetup from './components/ProjectSetup';
import GalleryView from './components/GalleryView';
import ScrollView from './components/ScrollView';
import PrintOrderView from './components/PrintOrderView';
import CommentPanel from './components/CommentPanel';
import DeleteModal from './components/DeleteModal';

import './index.css';

const STORAGE_KEY = 'magazineBlocker_projects';
const THEME_KEY = 'magazineBlocker_theme';
const VIEWS = [
  { id: 'gallery', label: 'Gallery', Icon: LayoutGrid },
  { id: 'scroll', label: 'Scroll', Icon: AlignJustify },
  { id: 'print', label: 'Print Order', Icon: Printer },
];

function loadProjects() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
}

function saveProjects(projects) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export default function App() {
  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [projects, setProjects] = useState(loadProjects);
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [view, setView] = useState('gallery');
  const [commentPage, setCommentPage] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  const activeProject = projects.find(p => p.id === activeProjectId) || null;

  const handleCreateProject = (data) => {
    const project = { ...data, id: Date.now() };
    const updated = [...projects, project];
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(project.id);
    setShowSetup(false);
    setView('gallery');
  };

  const handleSave = () => {
    saveProjects(projects);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const handleDeleteConfirm = () => {
    const updated = projects.filter(p => p.id !== activeProjectId);
    setProjects(updated);
    saveProjects(updated);
    setActiveProjectId(updated.length ? updated[updated.length - 1].id : null);
    setShowDelete(false);
  };

  const updateProject = (updatedProject) => {
    const updated = projects.map(p => p.id === updatedProject.id ? updatedProject : p);
    setProjects(updated);
    saveProjects(updated);
  };

  const handleUpdateContent = (pageId, content) => {
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, content } : p);
    updateProject({ ...activeProject, pages });
  };

  const handleUpdateReceived = (pageId, val) => {
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, contentReceived: val } : p);
    updateProject({ ...activeProject, pages });
  };

  const handleUpdateComments = (pageId, comments) => {
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, comments } : p);
    updateProject({ ...activeProject, pages });
    setCommentPage(pages.find(p => p.id === pageId));
  };

  const receivedCount = activeProject ? activeProject.pages.filter(p => p.contentReceived).length : 0;
  const pendingComments = activeProject
    ? activeProject.pages.reduce((s, p) => s + p.comments.filter(c => c.status === 'pending').length, 0)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Folio</h1>
          <span>Magazine Blocker</span>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Projects</div>
          {projects.map(p => (
            <button
              key={p.id}
              className={`sidebar-btn ${p.id === activeProjectId ? 'active' : ''}`}
              onClick={() => { setActiveProjectId(p.id); setShowSetup(false); }}
            >
              <BookOpen size={14} />
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {p.name}{p.issue ? ` · ${p.issue}` : ''}
              </span>
            </button>
          ))}
          {projects.length === 0 && (
            <p style={{ fontSize: 11, color: 'rgba(245,242,236,0.25)', padding: '4px 10px', fontFamily: 'var(--font-mono)', letterSpacing: '0.05em' }}>
              No projects yet
            </p>
          )}
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-label">Actions</div>
          <button
            className={`sidebar-btn ${showSetup && !activeProjectId ? 'active' : ''}`}
            onClick={() => { setShowSetup(true); setActiveProjectId(null); }}
          >
            <Plus size={14} />
            New Magazine
          </button>
          {activeProject && (
            <>
              <button className="sidebar-btn" onClick={handleSave}>
                <Save size={14} />
                {savedIndicator ? '✓ Saved!' : 'Save Project'}
              </button>
              <button className="sidebar-btn" onClick={() => setShowDelete(true)}>
                <Trash2 size={14} />
                Delete Project
              </button>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div style={{ fontSize: 10, color: 'rgba(245,242,236,0.2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textAlign: 'center' }}>
            Free · 1 of 1 magazine used
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            {activeProject ? (
              <>
                <span className="topbar-title">{activeProject.name}</span>
                {activeProject.issue && <span className="topbar-sub">{activeProject.issue}</span>}
              </>
            ) : showSetup ? (
              <span className="topbar-title">New Project</span>
            ) : (
              <span className="topbar-title">Folio — Magazine Blocker</span>
            )}
          </div>
          <div className="topbar-right">
            {activeProject && (
              <div className="view-switcher">
                {VIEWS.map(({ id, label, Icon }) => (
                  <button key={id} className={`view-btn ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </div>

        {activeProject && (
          <div className="meta-bar">
            <span className="meta-chip"><BookOpen size={10} />{activeProject.totalPages} pages</span>
            <span className="meta-sep">·</span>
            <span className="meta-chip" style={{ color: receivedCount === activeProject.totalPages ? 'var(--received-border)' : undefined }}>
              {receivedCount}/{activeProject.totalPages} received
            </span>
            <span className="meta-sep">·</span>
            <span className="meta-chip" style={{ color: pendingComments > 0 ? 'var(--accent)' : undefined }}>
              {pendingComments} pending comment{pendingComments !== 1 ? 's' : ''}
            </span>
            {activeProject.hasCenterfold && (
              <><span className="meta-sep">·</span><span className="meta-chip" style={{ color: 'var(--centerfold-border)' }}>Centerfold</span></>
            )}
          </div>
        )}

        <div className="workspace">
          {showSetup && !activeProjectId && (
            <ProjectSetup onCreateProject={handleCreateProject} />
          )}
          {!showSetup && !activeProject && (
            <div className="no-project">
              <div className="no-project-icon"><BookOpen size={28} /></div>
              <h3>No Project Open</h3>
              <p>Create a new magazine layout or select one from the sidebar.</p>
              <button className="btn-outline" onClick={() => setShowSetup(true)}>+ New Magazine</button>
            </div>
          )}
          {activeProject && view === 'gallery' && (
            <GalleryView pages={activeProject.pages} onUpdateContent={handleUpdateContent} onUpdateReceived={handleUpdateReceived} onOpenComments={setCommentPage} />
          )}
          {activeProject && view === 'scroll' && (
            <ScrollView pages={activeProject.pages} onUpdateContent={handleUpdateContent} onUpdateReceived={handleUpdateReceived} onOpenComments={setCommentPage} />
          )}
          {activeProject && view === 'print' && (
            <PrintOrderView pages={activeProject.pages} project={activeProject} />
          )}
        </div>
      </div>

      {commentPage && (
        <CommentPanel page={commentPage} onClose={() => setCommentPage(null)} onUpdateComments={handleUpdateComments} />
      )}
      {showDelete && activeProject && (
        <DeleteModal projectName={activeProject.name} onConfirm={handleDeleteConfirm} onCancel={() => setShowDelete(false)} />
      )}
    </div>
  );
}
