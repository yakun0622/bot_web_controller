import React from 'react';
import ReactDOM from 'react-dom/client';
import '@abc-design/react/styles.css';
import './index.css';
import { AbcProvider } from '@abc-design/react';
import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AbcProvider
      storageKey="bot_controller_abc_theme_v1"
      defaultTheme={{
        mode: 'system',
        brand: 'blue',
        density: 'default',
        radius: 'md',
        motion: 'smooth',
        componentSize: 'sm'
      }}
      defaultDrawerCascadeMode="adjacent"
      watermarkText={['Bot Web Controller', 'ROS Telemetry']}
      defaultWatermarkEnabled={false}
      toastContainerProps={{ position: 'bottom-right', maxCount: 4 }}
    >
      <App />
    </AbcProvider>
  </React.StrictMode>
);
