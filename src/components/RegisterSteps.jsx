import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

export default function RegisterSteps({ onRegisterSuccess, switchToLogin }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    targetAudience: 'student',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleNext = (e) => {
    e.preventDefault();
    if (step === 1 && (!formData.firstName.trim() || !formData.lastName.trim())) {
      alert('נא למלא שם פרטי ושם משפחה');
      return;
    }
    setStep((prev) => prev + 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. יצירת משתמש ב-Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      // בדיקה האם האימייל כבר קיים (Supabase מחזיר identities ריק במקרה שהמשתמש כבר רשום)
      if (authData.user && authData.user.identities && authData.user.identities.length === 0) {
        setLoading(false);
        alert("כתובת האימייל הזו כבר רשומה במערכת! אנא התחבר במקום להירשם מחדש.");
        return;
      }

      const userId = authData.user?.id;

      // 2. שמירת הנתונים הנוספים בטבלת ה-users
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: userId,
            first_name: formData.firstName,
            last_name: formData.lastName,
            age: parseInt(formData.age),
            gender: formData.gender,
            target_audience: formData.targetAudience
          }
        ]);

      if (dbError) throw dbError;

      setLoading(false);
      alert("נרשמת בהצלחה! 📧 שלחנו לך אימייל אימות. אנא לחץ על הקישור במייל ואז התחבר למערכת.");
      
      // העברה חזרה למסך התחברות כדי שיתחבר אחרי האימות
      switchToLogin();

    } catch (err) {
      console.error("Error during registration:", err.message);
      setLoading(false);
      
      // זיהוי שגיאת אימייל קיים גם מתוך הודעות השרת
      if (err.message.includes("already registered") || err.message.includes("already been registered")) {
        alert("כתובת האימייל הזו כבר קיימת במערכת.");
      } else {
        alert("אירעה שגיאה בהרשמה: " + err.message);
      }
    }
  };

  return (
    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
      <div className="text-center mb-8">
        <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
          WordFlow AI
        </span>
        <h1 className="text-2xl font-bold text-gray-900 mt-3">יצירת חשבון חדש</h1>
        <p className="text-sm text-gray-500 mt-1">בנה את אוצר המילים שלך בקלות בעזרת בינה מלאכותית</p>
      </div>

      {/* אינדיקטור שלבים */}
      <div className="flex items-center justify-center mb-6">
        <div className={`h-2 w-16 rounded-full mx-1 transition-all duration-300 ${step >= 1 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
        <div className={`h-2 w-16 rounded-full mx-1 transition-all duration-300 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
      </div>

      {/* שלב 1: פרטים אישיים */}
      {step === 1 && (
        <form onSubmit={handleNext} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם פרטי</label>
            <input 
              type="text" 
              name="firstName" 
              required 
              value={formData.firstName} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="למשל: דניאל"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">שם משפחה</label>
            <input 
              type="text" 
              name="lastName" 
              required 
              value={formData.lastName} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="למשל: כהן"
            />
          </div>
          <button 
            type="submit" 
            className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 shadow-md">
            המשך
          </button>
        </form>
      )}

      {/* שלב 2: נתונים נוספים, אימייל וסיסמה */}
      {step === 2 && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">גיל</label>
              <input 
                type="number" 
                name="age" 
                min="10" 
                max="120"
                required 
                value={formData.age} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="גיל"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מגדר</label>
              <select 
                name="gender" 
                required
                value={formData.gender} 
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
                <option value="">בחר/י</option>
                <option value="male">זכר</option>
                <option value="female">נקבה</option>
                <option value="other">אחר</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מסגרת לימודים / מטרה</label>
            <select 
              name="targetAudience" 
              value={formData.targetAudience} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-white">
              <option value="highschool">תלמיד/ה תיכון (י&quot;א-י&quot;ב / בגרות)</option>
              <option value="student">סטודנט/ית (אקדמיה / אמי&quot;ר)</option>
              <option value="general">שיפור אנגלית כללי / קריירה</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input 
              type="email" 
              name="email" 
              required 
              value={formData.email} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="name@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה</label>
            <input 
              type="password" 
              name="password" 
              required 
              minLength="6"
              value={formData.password} 
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              placeholder="לפחות 6 תווים"
            />
          </div>

          <div className="flex space-x-3 space-x-reverse pt-2">
            <button 
              type="button" 
              onClick={() => setStep(1)}
              disabled={loading}
              className="w-1/3 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-200 transition duration-200">
              חזור
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="w-2/3 bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition duration-200 shadow-md flex items-center justify-center">
              {loading ? "יוצר חשבון..." : "סיום והתחל ללמוד 🚀"}
            </button>
          </div>
        </form>
      )}

      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          כבר יש לך חשבון?{' '}
          <button onClick={switchToLogin} className="text-indigo-600 font-semibold hover:underline">
            התחבר כאן
          </button>
        </p>
      </div>
    </div>
  );
}