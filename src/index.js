import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

const renderViewProWidget = () => {
  const container = document.getElementById('viewpro-widget');
  if (container) {
    const root = createRoot(container);
    root.render(<App />);
  } else {
    console.error('ViewProWidget element not found');
  }
};

renderViewProWidget();

const ViewProWidget = {
  render: renderViewProWidget,
};

export default ViewProWidget;
