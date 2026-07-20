import React from 'react';

export interface AppProps {
  appName?: string;
}

export const App: React.FC<AppProps> = ({ appName = "React TS Gateway Example" }) => {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      backgroundColor: '#282c34',
      color: 'white',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ color: '#61dafb' }}>{appName}</h1>
      <p>This is a structured React Frontend written in TypeScript.</p>
      <p>Configured behind the proxy gateway on port 3000.</p>
    </div>
  );
};
