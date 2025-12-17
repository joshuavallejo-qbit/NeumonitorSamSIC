// frontend/src/lib/config.ts
export const config = {
  // Determinar entorno
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // URLs base
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 
    (typeof window !== 'undefined' && window.location.hostname === 'localhost' 
      ? 'http://localhost:8000' 
      : 'https://neumonitor2.onrender.com'),
  
  // Configuración de autenticación
  auth: {
    tokenKey: 'auth_token',
    userKey: 'persona_data'
  }
};

// Función para probar conexión
export const testConnection = async () => {
  try {
    const response = await fetch(`${config.apiUrl}/test`);
    return await response.json();
  } catch (error) {
    console.error('Error de conexión:', error);
    return { status: 'error', message: 'No se pudo conectar al backend' };
  }
};