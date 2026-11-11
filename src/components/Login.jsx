import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function Login({ onLoginSuccess, switchToRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // בדיקה ספציפית לשגיאת אימות אימייל
        if (error.message.includes("Email not confirmed")) {
          throw new Error("טרם אימתת את כתובת האימייל שלך. אנא בדק/י את תיבת הדואר הנכנס ולחיצה על קישור האימות.");
        }
        throw error;
      }

      setLoading(false);
      onLoginSuccess(data.user);

    } catch (err) {
      console.error("Error signing in:", err.message);
      setLoading(false);
      alert(err.message);
    }
  };
  
  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-6">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          WordFlow AI
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">התחברות למערכת</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
          <input 
            type="email" 
            required 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="name@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
          <input 
            type="password" 
            required 
            value={password} 
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md">
          {loading ? "מתחבר..." : "התחבר 🚀"}
        </button>
      </form>

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          עדיין אין לך חשבון?{' '}
          <button onClick={switchToRegister} className="text-indigo-600 font-semibold hover:underline">
            הירשם כאן
          </button>
        </p>
      </div>
    </div>
  );
}