import React from 'react';
import { createRouter, createRoute, createRootRoute, Outlet } from '@tanstack/react-router';
import App from './App';
import GPAPage from './Pages/GPAPage';
import { DeviceProvider } from './Components/DeviceContext';

const rootRoute = createRootRoute({
  component: () => (
    <DeviceProvider>
      <Outlet />
    </DeviceProvider>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: App,
});

const gpaRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/gpa',
  component: GPAPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  gpaRoute,
]);

const router = createRouter({
  routeTree,
});

export default router;
