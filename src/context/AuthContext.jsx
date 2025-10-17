import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        return JSON.parse(storedUser);
      }
      return null;
    } catch (error) {
      console.error("Error al parsear el usuario desde localStorage:", error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  });

  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    const data = await loginUser(credentials);
    
    if (data.user && data.token) {
      // --- CAPA DE TRADUCCIÓN / NORMALIZACIÓN ---
      // Creamos un nuevo objeto de usuario con la convención camelCase que usaremos en toda la app.
      const normalizedUser = {
        id: data.user.id,
        firstName: data.user.firstname, // Convertimos firstname -> firstName
        lastName: data.user.lastname,   // Convertimos lastname -> lastName
        email: data.user.email,
        role: data.user.role
      };

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(normalizedUser)); // Guardamos el objeto normalizado
      setToken(data.token);
      setUser(normalizedUser); // Establecemos el objeto normalizado en el estado
    } else {
      throw new Error('Respuesta de login inválida desde el servidor.');
    }
  };

  const register = async (userData) => {
    await registerUser(userData);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const updateUserState = (updatedUserData) => {
    // Asumimos que updatedUserData ya vendrá en camelCase desde el servicio
    setUser(updatedUserData);
    localStorage.setItem('user', JSON.stringify(updatedUserData));
  };

  const isAuthenticated = !!token;

  const value = { user, token, isAuthenticated, loading, login, register, logout, updateUserState };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};