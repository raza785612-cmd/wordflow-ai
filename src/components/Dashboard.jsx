import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import UploadWords from './UploadWords';
import MyWords from './MyWords';

export default function Dashboard({ user, onSignOut }) {
  const [firstName, setFirstName] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' | 'upload' | 'my-words'

  // שליפת השם הפרטי מטבלת users לפי ה-ID של המשתמש המחובר
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        if (!user?.id) return;
        
        const { data, error } = await supabase
          .from('users')
          .select('first_name')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data) {
          setFirstName(data.first_name);
        }
      } catch (err) {
        console.error("Error fetching user profile:", err.message);
      }
    }

    fetchUserProfile();
  }, [user]);

  // ניהול מעבר מסכים בהתאם לבחירת המשתמש
  if (currentView === 'upload') {
    return <UploadWords user={user} onBack={() => setCurrentView('dashboard')} />;
  }

  if (currentView === 'my-words') {
    return <MyWords user={user} onBack={() => setCurrentView('dashboard')} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col w-full" dir="rtl">
      {/* סרגל עליון */}
      <header className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3 space-x-reverse">
          <span className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-xl text-sm">WordFlow AI</span>
          <span className="text-gray-700 font-medium">
            שלום, {firstName || user?.email || 'לומד יקר'}! 👋
          </span>
        </div>
        <button 
          onClick={onSignOut}
          className="text-sm bg-red-50 text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-100 transition">
          התנתק
        </button>
      </header>

      {/* תוכן דף הבית */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        
        {/* כרטיס אוצר המילים שלי */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">📚 אוצר המילים שלי</h3>
            <p className="text-gray-500 text-sm mb-4">נהל את המילים ששמרת ותרגל חזרה מרווחת לפי רמות.</p>
          </div>
          <button 
            onClick={() => setCurrentView('my-words')}
            className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
            צפה במילים
          </button>
        </div>

        {/* כרטיס סיפורי AI */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">🤖 סיפורי AI</h3>
            <p className="text-gray-500 text-sm mb-4">קרא סיפורים מותאמים אישית המשלבים את אוצר המילים שלך.</p>
          </div>
          <button className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
            צור סיפור חדש
          </button>
        </div>

        {/* כרטיס העלאת חומרים */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-gray-800 text-lg mb-2">📁 העלאת חומרים</h3>
            <p className="text-gray-500 text-sm mb-4">ייבא קבצי Excel, Word או טקסטים לחילוץ מילים אוטומטי.</p>
          </div>
          <button 
            onClick={() => setCurrentView('upload')}
            className="w-full bg-indigo-50 text-indigo-600 py-2 rounded-lg font-medium hover:bg-indigo-100 transition">
            העלה מילים
          </button>
        </div>

      </main>
    </div>
  );
}