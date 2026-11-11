import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function MyWords({ user, onBack }) {
  const [activeTab, setActiveTab] = useState('user'); // 'user' (פרטי) | 'public' (גלובלי)
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState('ALL');

  // שליפת מילים מהדאטאבייס בהתאם ללשונית הנבחרת
  useEffect(() => {
    fetchWords();
  }, [activeTab, user]);

  async function fetchWords() {
    setLoading(true);
    try {
      if (activeTab === 'user') {
        if (!user?.id) return;
        const { data, error } = await supabase
          .from('user_words')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWords(data || []);
      } else {
        const { data, error } = await supabase
          .from('public_words')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setWords(data || []);
      }
    } catch (err) {
      console.error("Error fetching words:", err.message);
    } finally {
      setLoading(false);
    }
  }

  // מחיקת מילה מהמאגר הפרטי
  const handleDeleteWord = async (wordId) => {
    if (activeTab === 'public') return; // אי אפשר למחוק מהגלובלי
    
    if (!window.confirm('האם אתה בטוח שברצונך למחוק מילה זו?')) return;

    try {
      const { error } = await supabase
        .from('user_words')
        .delete()
        .eq('id', wordId);

      if (error) throw error;
      
      // עדכון הסטייט המקומי להסרת המילה מיד מהמסך
      setWords(words.filter(w => w.id !== wordId));
    } catch (err) {
      console.error("Error deleting word:", err.message);
      alert('שגיאה במחיקת המילה');
    }
  };

  // סינון מילים לפי חיפוש ורמת קושי
  const filteredWords = words.filter(item => {
    const matchesSearch = item.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.translation && item.translation.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLevel = selectedLevelFilter === 'ALL' || item.difficulty_level === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center w-full" dir="rtl">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        
        {/* כותרת וכפתור חזרה */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">📚 אוצר המילים שלי</h1>
            <p className="text-xs text-gray-500 mt-1">צפה, חפש ונהל את המילים שלמדת ושמרת</p>
          </div>
          {onBack && (
            <button 
              onClick={onBack}
              className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
              חזרה לדשבורד
            </button>
          )}
        </div>

        {/* מעבר בין מאגר פרטי לגלובלי */}
        <div className="flex space-x-2 space-x-reverse mb-6">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'user' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            🔒 המילים שלי
          </button>
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition ${
              activeTab === 'public' ? 'bg-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}>
            🌐 מאגר גלובלי
          </button>
        </div>

        {/* חיפוש וסינון לפי רמות */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="🔍 חפש מילה או תרגום..."
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
          />

          <select
            value={selectedLevelFilter}
            onChange={(e) => setSelectedLevelFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm bg-white">
            <option value="ALL">כל הרמות (A1-C2)</option>
            <option value="A1">A1 - מתחילים</option>
            <option value="A2">A2 - בסיסי</option>
            <option value="B1">B1 - ביניים</option>
            <option value="B2">B2 - ביניים גבוה</option>
            <option value="C1">C1 - מתקדמים</option>
            <option value="C2">C2 - שפת אם / אקדמי</option>
          </select>
        </div>

        {/* טבלת הצגת מילים */}
        {loading ? (
          <div className="text-center py-12 text-gray-400">טוען מילים...</div>
        ) : filteredWords.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            אין מילים להצגה כרגע. נהדר להתחיל להוסיף מהעלאת חומרים! 🚀
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">מילה באנגלית</th>
                  <th className="py-3 px-4">תרגום</th>
                  <th className="py-3 px-4">רמה</th>
                  <th className="py-3 px-4">מקור</th>
                  {activeTab === 'user' && <th className="py-3 px-4 text-center">פעולות</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredWords.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
                    <td className="py-3 px-4 font-bold text-gray-800" dir="ltr">{item.word}</td>
                    <td className="py-3 px-4 text-gray-600">{item.translation || <span className="text-gray-300 italic">טרם תורגם</span>}</td>
                    <td className="py-3 px-4">
                      <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs px-2.5 py-1 rounded-lg">
                        {item.difficulty_level || 'B1'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-xs text-gray-400">{item.source_type || 'manual'}</td>
                    {activeTab === 'user' && (
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleDeleteWord(item.id)}
                          className="text-red-500 hover:text-red-700 text-xs bg-red-50 px-2.5 py-1 rounded-lg transition">
                          מחק
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}