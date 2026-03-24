import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { registerSW } from 'virtual:pwa-register';
import { AppShell } from './components/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AuthPage } from './pages/AuthPage';
import { CustomersPage } from './pages/CustomersPage';
import { DashboardPage } from './pages/DashboardPage';
import { ElectronicDispatchPage } from './pages/ElectronicDispatchPage';
import { ElectronicDocumentsPage } from './pages/ElectronicDocumentsPage';
import { InvoicesPage } from './pages/InvoicesPage';
import { PaymentsPage } from './pages/PaymentsPage';
import './styles.css';

registerSW({
  immediate: true,
  onRegisteredSW(swUrl: string) {
    console.info('Service worker registrado', swUrl);
  },
  onOfflineReady() {
    console.info('Shell offline listo para uso controlado.');
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { path: 'auth', element: <AuthPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'customers', element: <CustomersPage /> },
          { path: 'electronic-documents', element: <ElectronicDocumentsPage /> },
          { path: 'payments', element: <PaymentsPage /> },
          { path: 'invoices', element: <InvoicesPage /> },
          { path: 'electronic-dispatch', element: <ElectronicDispatchPage /> },
        ],
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
