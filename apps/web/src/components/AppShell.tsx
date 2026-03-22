import { Outlet } from 'react-router-dom';
import { NavMenu } from './NavMenu';

export function AppShell() {
  return (
    <div className="layout">
      <aside className="sidebar">
        <h1>Innova Web</h1>
        <p>Shell inicial del frontend moderno.</p>
        <NavMenu />
      </aside>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
