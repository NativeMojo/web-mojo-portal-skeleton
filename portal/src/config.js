/**
 * Portal Configuration
 *
 * In dev mode, Vite injects __DEV_API_PORT__ and __DEV_API_URL__ from
 * config/dev_server.conf (set during the setup wizard).
 *
 * Two modes:
 *   Local  → api_url is empty, uses localhost:{api_port}
 *   Remote → api_url is set (e.g. https://api.example.com), uses that directly
 */

const PROD_BASE = 'https://api.example.com';       // TODO: set your production API URL

// Injected by vite.config.js from config/dev_server.conf
const DEV_API_PORT = typeof __DEV_API_PORT__ !== 'undefined' ? __DEV_API_PORT__ : 9009;
const DEV_API_URL = typeof __DEV_API_URL__ !== 'undefined' ? __DEV_API_URL__ : '';

const IS_DEV = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// If a remote api_url was configured in setup, use it. Otherwise use localhost:{port}.
const API_BASE = IS_DEV
  ? (DEV_API_URL || `http://localhost:${DEV_API_PORT}`)
  : PROD_BASE;

// Auth page — served locally on the same origin (uses mojo-auth.js to call the backend API).
// In production, you can host the auth page at /auth/ or use a custom domain.
const AUTH_URL = '/auth/';

export default {
  name: 'My Portal',
  basePath: '/',
  brand: 'My Portal',
  brandIcon: '/public/img/logo.svg',

  // API
  apiURL: API_BASE,
  apiTimeout: 15000,

  // Auth (local page using mojo-auth.js)
  authURL: AUTH_URL,

  // Default landing page after login
  defaultRoute: 'home',
};
