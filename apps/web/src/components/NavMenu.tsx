import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/customers', label: 'Clientes' },
  { to: '/electronic-documents', label: 'FE' },
  { to: '/payments', label: 'Cobros' },
  { to: '/invoices', label: 'Facturas' },
  { to: '/electronic-dispatch', label: 'Dispatch FE' },
];

export function NavMenu() {
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
