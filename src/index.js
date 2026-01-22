import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const initViewProWidget = () => {
  // Use document instead of window.top.document to avoid cross-origin issues
  // Try window.top.document first (for iframe scenarios), fallback to document
  let doc;
  try {
    doc = window.top && window.top !== window ? window.top.document : document;
  } catch (e) {
    // Cross-origin error, use current document
    doc = document;
  }

  let container = doc.getElementById('viewpro-widget');
  if (!container) {
    // Wait for body to be available
    if (!doc.body) {
      console.warn('ViewProWidget: Document body not ready yet');
      return;
    }
    container = doc.createElement('div');
    container.id = 'viewpro-widget';
    doc.body.appendChild(container);
  }

  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('ViewProWidget element not found');
  }
};

// Wait for DOM to be ready before rendering
const renderViewProWidget = () => {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initViewProWidget);
  } else {
    // DOM is already ready
    initViewProWidget();
  }
};

// Initialize when script loads
renderViewProWidget();

const ViewProWidget = {
  render: renderViewProWidget,
};

export default ViewProWidget;
