import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Lock, LogIn, UserPlus, Key, ShieldCheck, ArrowRight } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';

const Login = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    password: '',
    role: 'normal'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const adminCredentials = {
    username: 'Juan Díaz',
    password: '0611Jbda',
    role: 'admin'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLogin) {
      // Check admin hardcoded
      if (formData.username === adminCredentials.username && formData.password === adminCredentials.password) {
        onLogin({ ...adminCredentials, name: 'Juan Díaz', carrera: 'Desarrollador' });
        setLoading(false);
        return;
      }
      
      // Check Firestore with Local Storage handle fallback
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', formData.username), where('password', '==', formData.password));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty) {
          const user = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
          if (user.isBanned) {
            setError('Esta cuenta ha sido suspendida');
            setLoading(false);
            return;
          }
          onLogin(user);
          return;
        } 
        
        // If not in firestore, check local storage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const localUser = localUsers.find(u => u.username === formData.username && u.password === formData.password);
        
        if (localUser) {
          onLogin(localUser);
        } else {
          setError('Credenciales incorrectas');
        }
      } catch (err) {
        console.error("Firestore error, falling back to local:", err);
        // Emergency fallback to local storage
        const localUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const localUser = localUsers.find(u => u.username === formData.username && u.password === formData.password);
        
        if (localUser) {
          onLogin(localUser);
        } else {
          setError('Error de conexión. Verifique su base de datos Firebase.');
        }
      } finally {
        setLoading(false);
      }
    } else {
      // Register logic
      if (!formData.username || !formData.password || !formData.name) {
        setError('Por favor complete todos los campos');
        setLoading(false);
        return;
      }
      
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('username', '==', formData.username));
        const snapshot = await getDocs(q);
        
        if (!snapshot.empty || formData.username === adminCredentials.username) {
          setError('El nombre de usuario ya existe');
          setLoading(false);
          return;
        }
        
        const newUser = { 
          username: formData.username, 
          password: formData.password, 
          name: formData.name,
          role: 'normal',
          dateCreated: new Date().toISOString()
        };
        
        await addDoc(usersRef, newUser);
        setIsLogin(true);
        setError('Registro exitoso! Por favor inicie sesión');
      } catch (err) {
        setError('Error en el registro');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-container">
        <motion.div 
          className="login-brand"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="brand-logo">
            <ShieldCheck size={40} color="white" />
          </div>
          <h1>INVENTARIO</h1>
          <h1>CORPOELEC</h1>
          <p>Sistema de Gestión IT</p>
        </motion.div>

        <motion.div 
          className="login-card"
          layout
        >
          <div className="login-tabs">
            <button 
              className={isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(true)}
            >
              Iniciar Sesión
            </button>
            <button 
              className={!isLogin ? 'active' : ''} 
              onClick={() => setIsLogin(false)}
            >
              Registro
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div 
                  key="name"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="input-group"
                >
                  <label>Nombre Completo</label>
                  <div className="input-with-icon">
                    <User size={18} className="icon" />
                    <input 
                      type="text" 
                      name="name"
                      placeholder="Ej. Juan Pérez"
                      value={formData.name}
                      onChange={handleChange}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="input-group">
              <label>Usuario</label>
              <div className="input-with-icon">
                <User size={18} className="icon" />
                <input 
                  type="text" 
                  name="username"
                  placeholder="Ingrese su usuario"
                  value={formData.username}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>Contraseña</label>
              <div className="input-with-icon">
                <Lock size={18} className="icon" />
                <input 
                  type="password" 
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                />
              </div>
            </div>

            {error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`error-message ${error.includes('exitoso') ? 'success' : ''}`}
              >
                {error}
              </motion.div>
            )}

            <button type="submit" disabled={loading} className="login-submit">
              {loading ? 'Procesando...' : (isLogin ? (
                <>Acceder <LogIn size={18} /></>
              ) : (
                <>Completar Registro <UserPlus size={18} /></>
              ))}
            </button>
          </form>

          <div className="login-footer">
            {isLogin ? (
              <p>¿Olvidó su contraseña? <span className="link">Contactar a Soporte</span></p>
            ) : (
              <p>Al registrarte aceptas las políticas de <span className="link">CORPOELEC</span></p>
            )}
          </div>
        </motion.div>

        <div className="login-background-decor">
          <div className="blob"></div>
          <div className="blob second"></div>
        </div>
      </div>
    </div>
  );
};

export default Login;

