import { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import AuthScreen from './components/AuthScreen';
import LandingPage from './components/LandingPage';
import { useProjects } from './hooks/useProjects';
import {
  LayoutGrid, AlignJustify, Printer, Plus,
  BookOpen, Save, Trash2, Settings, ArrowLeftRight, LogOut, Share2, Users
} from 'lucide-react';

import ThemeToggle from './components/ThemeToggle';
import ProjectSetup from './components/ProjectSetup';
import GalleryView from './components/GalleryView';
import ScrollView from './components/ScrollView';
import PrintOrderView from './components/PrintOrderView';
import CommentPanel from './components/CommentPanel';
import DeleteModal from './components/DeleteModal';
import ShareModal from './components/ShareModal';
import UpgradeModal from './components/UpgradeModal';

import './index.css';

const THEME_KEY = 'magazineBlocker_theme';
const VIEWS = [
  { id: 'gallery', label: 'Gallery', Icon: LayoutGrid },
  { id: 'scroll', label: 'Scroll', Icon: AlignJustify },
  { id: 'print', label: 'Print Order', Icon: Printer },
];

function relabelPages(pages) {
  const total = pages.length;
  return pages.map((p, i) => {
    const num = i + 1;
    if (p.isCenterfold) return { ...p, number: num };
    let label = `Page ${num}`;
    if (num === 1) label = 'Cover';
    else if (num === 2) label = 'Inside Front Cover';
    else if (num === total) label = 'Back Cover';
    else if (num === total - 1) label = 'Inside Back Cover';
    return { ...p, number: num, label, isBack: num === total };
  });
}

function isPageLocked(page, totalPages) {
  return page.number === 1 || page.number === totalPages || page.isCenterfold;
}

/** Derive the current user's role for a project */
function getProjectRole(project, user) {
  if (!project || !user) return null;
  if (project.owner === user.uid) return 'owner';
  if (project._role) return project._role;
  return 'owner';
}

export default function App() {
  const { user, loading, logout } = useAuth();
  const {
    projects, sharedProjects, loadingProjects, plan, atFreeLimit,
    createProject, updateProject, deleteProject,
    inviteCollaborator, removeCollaborator,
  } = useProjects(user);

  const [dark, setDark] = useState(() => localStorage.getItem(THEME_KEY) === 'dark');
  const [activeProjectId, setActiveProjectId] = useState(null);
  const [activeIsShared, setActiveIsShared] = useState(false);
  const [view, setView] = useState('gallery');
  const [commentPage, setCommentPage] = useState(null);
  const [showSetup, setShowSetup] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [showEditSettings, setShowEditSettings] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [savedIndicator, setSavedIndicator] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);

  // Landing page state: null = auto (show landing), 'auth' = show AuthScreen
  const [unauthScreen, setUnauthScreen] = useState(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => { setReorderMode(false); }, [activeProjectId, view]);

  // Auto-select first project when projects load
  useEffect(() => {
    if (!loadingProjects && !activeProjectId) {
      if (projects.length > 0) {
        setActiveProjectId(projects[0].id);
        setActiveIsShared(false);
      } else if (sharedProjects.length > 0) {
        setActiveProjectId(sharedProjects[0].id);
        setActiveIsShared(true);
      }
    }
  }, [loadingProjects, projects, sharedProjects, activeProjectId]);

  const activeProject = activeIsShared
    ? sharedProjects.find(p => p.id === activeProjectId) || null
    : projects.find(p => p.id === activeProjectId) || null;

  const role = getProjectRole(activeProject, user);
  const canEdit = role === 'owner' || role === 'edit';

  const handleCreateProject = async (data) => {
    const project = await createProject(data);
    if (project) {
      setActiveProjectId(project.id);
      setActiveIsShared(false);
      setShowSetup(false);
      setView('gallery');
    }
  };

  const handleEditProject = async (data) => {
    const updated = { ...activeProject, ...data };
    await updateProject(updated);
    setShowEditSettings(false);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const handleSave = async () => {
    if (activeProject) await updateProject(activeProject);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  };

  const handleDeleteConfirm = async () => {
    await deleteProject(activeProjectId);
    const remaining = projects.filter(p => p.id !== activeProjectId);
    if (remaining.length) {
      setActiveProjectId(remaining[remaining.length - 1].id);
      setActiveIsShared(false);
    } else if (sharedProjects.length) {
      setActiveProjectId(sharedProjects[0].id);
      setActiveIsShared(true);
    } else {
      setActiveProjectId(null);
    }
    setShowDelete(false);
  };

  const handleUpdateProject = async (updatedProject) => {
    await updateProject(updatedProject);
  };

  const handleUpdateContent = (pageId, content) => {
    if (!canEdit) return;
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, content } : p);
    handleUpdateProject({ ...activeProject, pages });
  };

  const handleUpdateReceived = (pageId, val) => {
    if (!canEdit) return;
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, contentReceived: val } : p);
    handleUpdateProject({ ...activeProject, pages });
  };

  const handleUpdateComments = (pageId, comments) => {
    const pages = activeProject.pages.map(p => p.id === pageId ? { ...p, comments } : p);
    handleUpdateProject({ ...activeProject, pages });
    setCommentPage(pages.find(p => p.id === pageId));
  };

  const handleSwap = (fromNumber, toNumber) => {
    if (!canEdit || fromNumber === toNumber) return;
    const pages = [...activeProject.pages];
    const fromIdx = pages.findIndex(p => p.number === fromNumber);
    const toIdx = pages.findIndex(p => p.number === toNumber);
    if (fromIdx === -1 || toIdx === -1) return;
    const from = pages[fromIdx];
    const to = pages[toIdx];
    pages[fromIdx] = { ...from, content: to.content, contentReceived: to.contentReceived, comments: to.comments };
    pages[toIdx] = { ...to, content: from.content, contentReceived: from.contentReceived, comments: from.comments };
    handleUpdateProject({ ...activeProject, pages: relabelPages(pages) });
  };

  const handleShift = (fromNumber, toNumber) => {
    if (!canEdit || fromNumber === toNumber) return;
    const pages = [...activeProject.pages];
    const total = pages.length;
    const fromIdx = pages.findIndex(p => p.number === fromNumber);
    const toIdx = pages.findIndex(p => p.number === toNumber);
    if (fromIdx === -1 || toIdx === -1) return;
    const lockedSet = new Set(
      pages.map((p, i) => isPageLocked(p, total) ? i : -1).filter(i => i !== -1)
    );
    const moveableIndices = pages.map((_, i) => i).filter(i => !lockedSet.has(i));
    const fromMoveablePos = moveableIndices.indexOf(fromIdx);
    const toMoveablePos = moveableIndices.indexOf(toIdx);
    if (fromMoveablePos === -1 || toMoveablePos === -1) return;
    const reordered = [...moveableIndices];
    reordered.splice(fromMoveablePos, 1);
    reordered.splice(toMoveablePos, 0, fromIdx);
    const newPayloads = reordered.map(i => ({
      content: pages[i].content,
      contentReceived: pages[i].contentReceived,
      comments: pages[i].comments,
    }));
    const finalPages = pages.map((p, i) => {
      if (lockedSet.has(i)) return p;
      const slotPos = moveableIndices.indexOf(i);
      return { ...p, ...newPayloads[slotPos] };
    });
    handleUpdateProject({ ...activeProject, pages: relabelPages(finalPages) });
  };

  const handleInvite = async (inviteeEmail, inviteRole) => {
    const updated = await inviteCollaborator(activeProject, inviteeEmail, inviteRole);
    return updated;
  };

  const handleRemove = async (collaboratorEmail) => {
    await removeCollaborator(activeProject, collaboratorEmail);
  };

  const receivedCount = activeProject ? activeProject.pages.filter(p => p.contentReceived).length : 0;
  const pendingComments = activeProject
    ? activeProject.pages.reduce((s, p) => s + p.comments.filter(c => c.status === 'pending').length, 0)
    : 0;

  const collaboratorCount = activeProject?.sharedWith ? Object.keys(activeProject.sharedWith).length : 0;
  const showReorderBtn = activeProject && canEdit && !showEditSettings && (view === 'gallery' || view === 'scroll');

  // ── Auth loading
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="auth-loading">Loading…</div>
      </div>
    );
  }

  // ── Not logged in: show Landing or AuthScreen
  if (!user) {
    if (unauthScreen === 'auth') {
      return <AuthScreen onBack={() => setUnauthScreen(null)} />;
    }
    return <LandingPage onLogin={() => setUnauthScreen('auth')} />;
  }

  if (loadingProjects) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-primary)' }}>
        <div className="auth-loading">Loading projects…</div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>Paginex</h1>
          <span>Magazine Blocker</span>
        </div>

        {/* Own projects */}
        <div className="sidebar-section">
          <div className="sidebar-section-label">My Projects</div>
          {projects.map(p => (
            <button
              key={p.id}
              className={`sidebar-btn ${p.id === activeProjectId && !activeIsShared ? 'active' : ''}`}
              onClick={() => { setActiveProjectId(p.id); setActiveIsShared(false); setShowSetup(false); setShowEditSettings(false); setShowShare(false); }}
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

        {/* Shared projects */}
        {sharedProjects.length > 0 && (
          <div className="sidebar-section">
            <div className="sidebar-section-label">
              <Users size={10} style={{ display: 'inline', marginRight: 4 }} />
              Shared with me
            </div>
            {sharedProjects.map(p => (
              <button
                key={p.id}
                className={`sidebar-btn ${p.id === activeProjectId && activeIsShared ? 'active' : ''}`}
                onClick={() => { setActiveProjectId(p.id); setActiveIsShared(true); setShowSetup(false); setShowEditSettings(false); setShowShare(false); }}
              >
                <BookOpen size={14} />
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  {p.name}{p.issue ? ` · ${p.issue}` : ''}
                </span>
                <span className={`sidebar-role-badge ${p._role}`}>{p._role}</span>
              </button>
            ))}
          </div>
        )}

        <div className="sidebar-section">
          <div className="sidebar-section-label">Actions</div>
          <button
            className={`sidebar-btn ${showSetup && !activeProjectId ? 'active' : ''}`}
            onClick={() => { if (atFreeLimit) { setShowUpgrade(true); return; } setShowSetup(true); setActiveProjectId(null); setShowEditSettings(false); setShowShare(false); }}
          >
            <Plus size={14} />
            New Magazine
          </button>
          {activeProject && role === 'owner' && (
            <>
              <button
                className={`sidebar-btn ${showShare ? 'active' : ''}`}
                onClick={() => { setShowShare(true); setShowEditSettings(false); setShowSetup(false); }}
              >
                <Share2 size={14} />
                Share
                {collaboratorCount > 0 && (
                  <span className="sidebar-collab-count">{collaboratorCount}</span>
                )}
              </button>
              <button
                className={`sidebar-btn ${showEditSettings ? 'active' : ''}`}
                onClick={() => { setShowEditSettings(true); setShowSetup(false); setReorderMode(false); setShowShare(false); }}
              >
                <Settings size={14} />
                Project Settings
              </button>
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
          {activeProject && role === 'edit' && (
            <button className="sidebar-btn" onClick={handleSave}>
              <Save size={14} />
              {savedIndicator ? '✓ Saved!' : 'Save Project'}
            </button>
          )}
        </div>

        <div className="sidebar-footer">
          <div style={{ fontSize: 10, color: 'rgba(245,242,236,0.2)', fontFamily: 'var(--font-mono)', letterSpacing: '0.08em', textAlign: 'center', marginBottom: 8 }}>
            {plan === 'free' ? `Free · ${projects.length} of 1 magazine used` : 'Premium · Unlimited magazines'}
          </div>
          <div className="sidebar-user">
            <span className="sidebar-user-email" title={user.email}>{user.email}</span>
            <button className="sidebar-logout" onClick={logout} title="Sign out">
              <LogOut size={13} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-content">
        <div className="topbar">
          <div className="topbar-left">
            {activeProject && !showEditSettings ? (
              <>
                <span className="topbar-title">{activeProject.name}</span>
                {activeProject.issue && <span className="topbar-sub">{activeProject.issue}</span>}
                {role !== 'owner' && (
                  <span className={`topbar-role-badge ${role}`}>
                    {role === 'edit' ? '✏ Edit' : '👁 Read'}
                  </span>
                )}
              </>
            ) : showEditSettings ? (
              <>
                <span className="topbar-title">{activeProject.name}</span>
                <span className="topbar-sub">Project Settings</span>
              </>
            ) : showSetup ? (
              <span className="topbar-title">New Project</span>
            ) : (
              <span className="topbar-title">Paginex — Magazine Blocker</span>
            )}
          </div>
          <div className="topbar-right">
            {activeProject && !showEditSettings && (
              <div className="view-switcher">
                {VIEWS.map(({ id, label, Icon }) => (
                  <button key={id} className={`view-btn ${view === id ? 'active' : ''}`} onClick={() => setView(id)}>
                    <Icon size={12} />{label}
                  </button>
                ))}
              </div>
            )}
            {showReorderBtn && (
              <button
                className={`reorder-toggle-btn ${reorderMode ? 'active' : ''}`}
                onClick={() => setReorderMode(r => !r)}
                title="Toggle reorder mode"
              >
                <ArrowLeftRight size={12} />
                {reorderMode ? 'Done' : 'Reorder'}
              </button>
            )}
            <ThemeToggle dark={dark} onToggle={() => setDark(d => !d)} />
          </div>
        </div>

        {activeProject && !showEditSettings && (
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
            {role === 'owner' && collaboratorCount > 0 && (
              <><span className="meta-sep">·</span>
              <span className="meta-chip" style={{ color: 'var(--accent)', cursor: 'pointer' }} onClick={() => setShowShare(true)}>
                <Users size={10} /> {collaboratorCount} collaborator{collaboratorCount !== 1 ? 's' : ''}
              </span></>
            )}
          </div>
        )}

        {reorderMode && (
          <div className="reorder-banner">
            <ArrowLeftRight size={11} />
            <span>Reorder Mode — <strong>drag</strong> to shift · <strong>click two tiles</strong> to swap · locked pages cannot be moved</span>
          </div>
        )}

        <div className="workspace">
          {showSetup && !activeProjectId && (
            <ProjectSetup onCreateProject={handleCreateProject} />
          )}
          {showEditSettings && activeProject && (
            <ProjectSetup
              editMode
              initialData={activeProject}
              onCreateProject={handleEditProject}
              onCancel={() => setShowEditSettings(false)}
            />
          )}
          {!showSetup && !showEditSettings && !activeProject && (
            <div className="no-project">
              <div className="no-project-icon"><BookOpen size={28} /></div>
              <h3>No Project Open</h3>
              <p>Create a new magazine layout or select one from the sidebar.</p>
              <button className="btn-outline" onClick={() => { if (atFreeLimit) { setShowUpgrade(true); } else { setShowSetup(true); } }}>+ New Magazine</button>
            </div>
          )}
          {activeProject && !showEditSettings && view === 'gallery' && (
            <GalleryView
              pages={activeProject.pages}
              onUpdateContent={handleUpdateContent}
              onUpdateReceived={handleUpdateReceived}
              onOpenComments={setCommentPage}
              reorderMode={reorderMode && canEdit}
              onSwap={handleSwap}
              onShift={handleShift}
              role={role}
            />
          )}
          {activeProject && !showEditSettings && view === 'scroll' && (
            <ScrollView
              pages={activeProject.pages}
              onUpdateContent={handleUpdateContent}
              onUpdateReceived={handleUpdateReceived}
              onOpenComments={setCommentPage}
              reorderMode={reorderMode && canEdit}
              onSwap={handleSwap}
              onShift={handleShift}
              role={role}
            />
          )}
          {activeProject && !showEditSettings && view === 'print' && (
            <PrintOrderView pages={activeProject.pages} project={activeProject} />
          )}
        </div>
      </div>

      {commentPage && (
        <CommentPanel
          page={commentPage}
          onClose={() => setCommentPage(null)}
          onUpdateComments={handleUpdateComments}
          role={role}
        />
      )}
      {showDelete && activeProject && (
        <DeleteModal projectName={activeProject.name} onConfirm={handleDeleteConfirm} onCancel={() => setShowDelete(false)} />
      )}
      {showUpgrade && (
        <UpgradeModal onClose={() => setShowUpgrade(false)} />
      )}
      {showShare && activeProject && role === 'owner' && (
        <ShareModal
          project={activeProject}
          currentUser={user}
          onClose={() => setShowShare(false)}
          onInvite={handleInvite}
          onRemove={handleRemove}
        />
      )}
    </div>
  );
}