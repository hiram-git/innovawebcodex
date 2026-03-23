import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/auth';

const protectedLinks = [
  { to: '/', label: 'Dashboard' },
  { to: '/customers', label: 'Clientes' },
  { to: '/electronic-documents', label: 'FE' },
  { to: '/payments', label: 'Cobros' },
  { to: '/invoices', label: 'Facturas' },
  { to: '/electronic-dispatch', label: 'Dispatch FE' },
];

export function NavMenu() {
  const { session } = useAuthStore();
  const links = session ? [{ to: '/auth', label: 'Auth' }, ...protectedLinks] : [{ to: '/auth', label: 'Auth' }];

  return (
    <nav className="nav-menu">
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  );
}
