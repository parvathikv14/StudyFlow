import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Activity, ArrowUpRight, LayoutDashboard, ListTodo, LogOut, Menu, Plus, Target, X } from 'lucide-react';
import { useAuth } from '../state/AuthContext.jsx';
import { useState } from 'react';

const navigation = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/tasks', label: 'My tasks', icon: ListTodo },
  { to: '/progress', label: 'Progress', icon: Activity }
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function signOut() {
    logout();
    navigate('/');
  }

  return (
    <div className="app-shell">
      <aside className={`sidebar ${menuOpen ? 'sidebar-open' : ''}`}>
        <NavLink to="/dashboard" className="brand" onClick={() => setMenuOpen(false)}><span className="brand-mark"><Target size={19} /></span><span>studyflow<span className="brand-dot">.</span></span></NavLink>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch"><span className="workspace-avatar">{user?.name?.charAt(0).toUpperCase()}</span><span><strong>{user?.name?.split(' ')[0]}'s space</strong><small>Personal workspace</small></span><ArrowUpRight size={15} /></div>
        <div className="nav-label">MENU</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} className={({ isActive }) => `nav-link ${isActive ? 'nav-active' : ''}`} onClick={() => setMenuOpen(false)}><Icon size={18} /><span>{label}</span>{label === 'My tasks' && <span className="nav-badge"><ListTodo size={12} /></span>}</NavLink>)}
        </nav>
        <div className="sidebar-spacer" />
        <div className="sidebar-tip"><span className="tip-icon"><Activity size={17} /></span><strong>Small steps add up.</strong><p>One focused task at a time is all it takes to make progress.</p><button onClick={() => navigate('/progress')}>View your progress <ArrowUpRight size={14} /></button></div>
        <button className="profile-button" onClick={signOut}><span className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</span><span><strong>{user?.name}</strong><small>{user?.email}</small></span><LogOut size={16} /></button>
      </aside>
      {menuOpen && <button className="mobile-scrim" aria-label="Close menu" onClick={() => setMenuOpen(false)} />}
      <main className="main-area">
        <header className="topbar">
          <button className="mobile-menu icon-plain" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}>{menuOpen ? <X size={21} /> : <Menu size={21} />}</button>
          <div className="breadcrumb"><span>Workspace</span><span className="breadcrumb-slash">/</span><strong>{navigation.find((item) => window.location.pathname.startsWith(item.to))?.label || 'Overview'}</strong></div>
          <div className="topbar-right"><span className="today-date">{new Date().toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span><button className="button button-primary top-add" onClick={() => navigate('/tasks?new=1')}><Plus size={16} /> New task</button></div>
        </header>
        <div className="page-content"><Outlet /></div>
        <footer className="app-footer"><span>© {new Date().getFullYear()} StudyFlow</span><span>Built for better study habits <span aria-hidden="true">✦</span></span></footer>
      </main>
    </div>
  );
}
