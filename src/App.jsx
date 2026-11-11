import React, { useState } from 'react';
import Login from './components/Login';
import RegisterSteps from './components/RegisterSteps';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null); // null = לא מחובר, אובייקט = מחובר
  const [view, setView] = useState('login'); // 'login' או 'register'

  // אם המשתמש מחובר – מציגים את דף הבית
  if (user) {
    return <Dashboard user={user} onSignOut={() => setUser(null)} />;
  }

  // אם לא מחובר – מציגים מעטפת מרכזית שבה בוחרים בין התחברות להרשמה
  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      {view === 'login' ? (
        <Login 
          onLoginSuccess={(userData) => setUser(userData)} 
          switchToRegister={() => setView('register')} 
        />
      ) : (
        <RegisterSteps 
          onRegisterSuccess={(userData) => setUser(userData)} 
          switchToLogin={() => setView('login')} 
        />
      )}
    </div>
  );
}