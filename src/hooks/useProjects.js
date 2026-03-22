import { useState, useEffect, useCallback } from 'react';
import {
  collection, doc, getDocs, getDoc, setDoc, deleteDoc,
  query, orderBy, serverTimestamp, where,
} from 'firebase/firestore';
import { db } from '../firebase';

/**
 * useProjects — Firestore-backed project management with sharing + free tier.
 *
 * Own projects:    users/{uid}/projects/{projectId}
 * Shared projects: projects/{projectId}  (top-level collection)
 * Account plan:    users/{uid}/account  { plan: 'free' | 'premium' }
 */
export function useProjects(user) {
  const [projects, setProjects] = useState([]);
  const [sharedProjects, setSharedProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [plan, setPlan] = useState('free'); // 'free' | 'premium'

  const FREE_PROJECT_LIMIT = 1;
  const atFreeLimit = plan === 'free' && projects.length >= FREE_PROJECT_LIMIT;

  // ── Load own projects ────────────────────────────────────────────────────────
  const fetchOwnProjects = useCallback(async () => {
    if (!user) return [];
    const ref = collection(db, 'users', user.uid, 'projects');
    const q = query(ref, orderBy('createdAt', 'asc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id, _isOwn: true }));
  }, [user]);

  // ── Load shared projects ─────────────────────────────────────────────────────
  const fetchSharedProjects = useCallback(async () => {
    if (!user?.email) return [];
    try {
      const ref = collection(db, 'projects');
      const q = query(ref, where('collaborators', 'array-contains', user.email));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(d => ({
        ...d.data(),
        id: d.id,
        _isOwn: false,
        _role: d.data().sharedWith?.[user.email] || 'read',
      }));
    } catch (err) {
      console.error('Failed to load shared projects:', err);
      return [];
    }
  }, [user]);

  // ── Load account plan ────────────────────────────────────────────────────────
  const fetchPlan = useCallback(async () => {
    if (!user) return 'free';
    try {
      const ref = doc(db, 'users', user.uid, 'account', 'plan');
      const snap = await getDoc(ref);
      return snap.exists() ? (snap.data().plan || 'free') : 'free';
    } catch {
      return 'free';
    }
  }, [user]);

  // ── Initial load ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!user) {
      setProjects([]);
      setSharedProjects([]);
      setLoadingProjects(false);
      setPlan('free');
      return;
    }

    const load = async () => {
      setLoadingProjects(true);
      try {
        const [own, shared, userPlan] = await Promise.all([
          fetchOwnProjects(),
          fetchSharedProjects(),
          fetchPlan(),
        ]);
        setProjects(own);
        setSharedProjects(shared);
        setPlan(userPlan);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoadingProjects(false);
      }
    };

    load();
  }, [user, fetchOwnProjects, fetchSharedProjects, fetchPlan]);

  // ── Save own project ─────────────────────────────────────────────────────────
  const saveProject = useCallback(async (project) => {
    if (!user) return;
    try {
      const { _isOwn, _role, ...cleanProject } = project;
      cleanProject.collaborators = Object.keys(cleanProject.sharedWith || {});

      const ownRef = doc(db, 'users', user.uid, 'projects', String(project.id));
      await setDoc(ownRef, cleanProject, { merge: true });

      if (cleanProject.collaborators.length > 0) {
        const topRef = doc(db, 'projects', String(project.id));
        await setDoc(topRef, cleanProject, { merge: true });
      }
    } catch (err) {
      console.error('Failed to save project:', err);
    }
  }, [user]);

  // ── Create project ────────────────────────────────────────────────────────────
  const createProject = useCallback(async (data) => {
    if (!user) return null;
    const id = String(Date.now());
    const project = {
      ...data,
      id,
      createdAt: serverTimestamp(),
      owner: user.uid,
      ownerEmail: user.email,
      sharedWith: {},
      collaborators: [],
      _isOwn: true,
    };
    setProjects(prev => [...prev, project]);
    await saveProject(project);
    return project;
  }, [user, saveProject]);

  // ── Update project ────────────────────────────────────────────────────────────
  const updateProject = useCallback(async (updatedProject) => {
    const { _isOwn, _role, ...cleanProject } = updatedProject;
    cleanProject.collaborators = Object.keys(cleanProject.sharedWith || {});

    if (_isOwn !== false) {
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      await saveProject(updatedProject);
    } else {
      setSharedProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
      try {
        const topRef = doc(db, 'projects', String(updatedProject.id));
        await setDoc(topRef, cleanProject, { merge: true });

        if (updatedProject.owner) {
          const ownerRef = doc(db, 'users', updatedProject.owner, 'projects', String(updatedProject.id));
          await setDoc(ownerRef, cleanProject, { merge: true });
        }
      } catch (err) {
        console.error('Failed to update shared project:', err);
      }
    }
  }, [saveProject]);

  // ── Delete project ────────────────────────────────────────────────────────────
  const deleteProject = useCallback(async (projectId) => {
    if (!user) return;
    setProjects(prev => prev.filter(p => p.id !== projectId));
    try {
      await deleteDoc(doc(db, 'users', user.uid, 'projects', String(projectId)));
      try { await deleteDoc(doc(db, 'projects', String(projectId))); } catch {}
    } catch (err) {
      console.error('Failed to delete project:', err);
    }
  }, [user]);

  // ── Invite collaborator ───────────────────────────────────────────────────────
  const inviteCollaborator = useCallback(async (project, inviteeEmail, role) => {
    if (!user) return;

    const updatedSharedWith = { ...(project.sharedWith || {}), [inviteeEmail]: role };
    const updatedCollaborators = Object.keys(updatedSharedWith);
    const updatedProject = {
      ...project,
      sharedWith: updatedSharedWith,
      collaborators: updatedCollaborators,
    };

    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));

    const { _isOwn, _role, ...cleanProject } = updatedProject;

    const ownRef = doc(db, 'users', user.uid, 'projects', String(project.id));
    await setDoc(ownRef, { sharedWith: updatedSharedWith, collaborators: updatedCollaborators }, { merge: true });

    const topRef = doc(db, 'projects', String(project.id));
    await setDoc(topRef, cleanProject, { merge: true });

    const inviteId = `${project.id}_${inviteeEmail.replace(/[.@]/g, '_')}`;
    await setDoc(doc(db, 'invites', inviteId), {
      projectId: project.id,
      projectName: project.name,
      ownerEmail: user.email,
      ownerUid: user.uid,
      inviteeEmail,
      role,
      status: 'pending',
      createdAt: serverTimestamp(),
    });

    return updatedProject;
  }, [user]);

  // ── Remove collaborator ───────────────────────────────────────────────────────
  const removeCollaborator = useCallback(async (project, collaboratorEmail) => {
    if (!user) return;

    const updatedSharedWith = { ...(project.sharedWith || {}) };
    delete updatedSharedWith[collaboratorEmail];
    const updatedCollaborators = Object.keys(updatedSharedWith);
    const updatedProject = {
      ...project,
      sharedWith: updatedSharedWith,
      collaborators: updatedCollaborators,
    };

    setProjects(prev => prev.map(p => p.id === project.id ? updatedProject : p));

    const ownRef = doc(db, 'users', user.uid, 'projects', String(project.id));
    await setDoc(ownRef, { sharedWith: updatedSharedWith, collaborators: updatedCollaborators }, { merge: true });

    if (updatedCollaborators.length === 0) {
      try { await deleteDoc(doc(db, 'projects', String(project.id))); } catch {}
    } else {
      const topRef = doc(db, 'projects', String(project.id));
      await setDoc(topRef, { sharedWith: updatedSharedWith, collaborators: updatedCollaborators }, { merge: true });
    }

    return updatedProject;
  }, [user]);

  return {
    projects,
    sharedProjects,
    setProjects,
    plan,
    atFreeLimit,
    loadingProjects,
    createProject,
    updateProject,
    deleteProject,
    inviteCollaborator,
    removeCollaborator,
  };
}
