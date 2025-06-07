
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

console.log('Initializing React app...');

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}

try {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  console.log('React app initialized successfully');
} catch (error) {
  console.error('Failed to initialize React app:', error);
}
