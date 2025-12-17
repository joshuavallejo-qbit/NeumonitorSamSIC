import React from 'react';

export default function Page() {
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
     
      {/* Imagen principal */}
      <img 
        src="/logo.jpg" 
        alt="Imagen principal" 
        style={{ width: '300px', marginBottom: '20px' }} 
      />

      {/* Texto de bienvenida */}
      <h1>Bienvenido a NeuroMonitor</h1>
    </div>
  );
}
