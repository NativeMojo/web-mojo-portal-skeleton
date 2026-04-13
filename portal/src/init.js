/**
 * Portal Initialization & Auth Gate
 *
 * This runs first. It checks for an access_token in localStorage.
 * If missing, the user is redirected to the auth page.
 * If present, the main portal app is lazy-loaded.
 */

import config from './config.js';

function checkAuth() {
  const token = localStorage.getItem('access_token');

  if (!token) {
    // Redirect to local auth page (same origin, so localStorage is shared).
    // Pass current path so the auth page can redirect back after login.
    const returnPath = window.location.pathname + window.location.search;
    const authUrl = `${config.authURL}?redirect=${encodeURIComponent(returnPath)}`;
    console.log('No access token found, redirecting to auth...');
    window.location.href = authUrl;
    return false;
  }

  return true;
}

async function init() {
  if (!checkAuth()) return;

  try {
    console.log(`Loading ${config.name}...`);
    await import('./portal.js');
  } catch (error) {
    console.error('Failed to load portal:', error);
    document.getElementById('app').innerHTML = `
      <div class="container mt-5">
        <div class="alert alert-danger">
          <h4 class="alert-heading">Failed to Load Portal</h4>
          <p>An error occurred while loading the application. Please try refreshing the page.</p>
          <hr>
          <p class="mb-0"><small>${error.message}</small></p>
        </div>
      </div>
    `;
  }
}

init();
