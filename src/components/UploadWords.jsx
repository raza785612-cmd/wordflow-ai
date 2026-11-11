import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export default function UploadWords({ user, onBack }) {
  const [tab, setTab] = useState('manual');
  const [targetDatabase, setTargetDatabase] = useState('user');
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [wordInput, setWordInput] = useState('');
  const [freeText, setFreeText] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('B1'); // ברירת מחדל רמת ביניים

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    async function checkAdminStatus() {
      try {
        if (!user?.id) return;
        const { data, error } = await supabase
          .from('users')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        if (data?.is_admin) setIsAdmin(true);
      } catch (err) {
        console.error("Error checking admin status:", err.message);
      }
    }
    checkAdminStatus();
  }, [user]);

  // פונקציית שמירה לדאטאבייס כולל רמת השפה (A1-C2)
  const saveWordsToDatabase = async (wordsArray) => {
    const tableName = targetDatabase === 'public' ? 'public_words' : 'user_words';
    
    const rowsToInsert = wordsArray.map((item) => {
      const baseObj = {
        word: item.word.trim(),
        translation: item.translation ? item.translation.trim() : null,
        difficulty_level: item.difficulty_level || selectedLevel,
      };

      if (targetDatabase === 'user') {
        baseObj.user_id = user.id;
        baseObj.source_type = item.source_type || 'file_upload';
      }

      return baseObj;
    });

    const { error } = await supabase.from(tableName).insert(rowsToInsert);
    if (error) throw error;
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    if (!wordInput.trim()) return;

    if (targetDatabase === 'public' && !isAdmin) {
      setMessage({ type: 'error', text: 'אין לך הרשאות אדמין לשמור למאגר הגלובלי!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const wordsArray = wordInput.split(',').map(w => ({ word: w.trim() })).filter(w => w.word);
      await saveWordsToDatabase(wordsArray);
      setMessage({ type: 'success', text: `המילים נשמרו בהצלחה ברמת ${selectedLevel}!` });
      setWordInput('');
    } catch (err) {
      setMessage({ type: 'error', text: 'שגיאה בשמירה: ' + err.message });
    } finally {
      setLoading(false);
    }
  };

  const handleBatchTextSubmit = async (e) => {
    e.preventDefault();
    if (!freeText.trim()) return;

    if (targetDatabase === 'public' && !isAdmin) {
      setMessage({ type: 'error', text: 'אין לך הרשאות אדמין לשמור למאגר הגלובלי!' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const lines = freeText.split(/\r?\n/);
      const wordsArray = lines.map(l => ({ word: l.trim(), source_type: 'text_paste' })).filter(l => l.word);

      if (wordsArray.length === 0) throw new Error('לא זוהו מילים בטקסט.');

      await saveWordsToDatabase(wordsArray);
      setMessage({ type: 'success', text: `הועלו ${wordsArray.length} מילים בהצלחה ברמת ${selectedLevel}!` });
      setFreeText('');
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center w-full" dir="rtl">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-md border border-gray-100 p-6">
        
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">העלאת מילים לפי רמות שפה (A1-C2)</h1>
            <p className="text-xs text-gray-500 mt-1">הזן מילים ובחר את רמת הקושי שלהן במאגר</p>
          </div>
          {onBack && (
            <button onClick={onBack} className="text-sm bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition">
              חזרה לדשבורד
            </button>
          )}
        </div>

        {message.text && (
          <div className={`mb-4 p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            {message.text}
          </div>
        )}

        {/* בחירת רמת שפה (A1-C2) */}
        <div className="mb-6 bg-indigo-50 p-4 rounded-xl flex items-center justify-between border border-indigo-100">
          <div>
            <span className="text-sm font-bold text-indigo-900 block">רמת קושי לשורת המילים:</span>
            <span className="text-xs text-indigo-700">הגדרת רמה עוזרת לסינון ולתרגולים מותאמים בהמשך</span>
          </div>
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value)}
            className="px-4 py-2 border rounded-lg text-sm font-semibold bg-white text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm">
            <option value="A1">A1 - מתחילים</option>
            <option value="A2">A2 - בסיסי</option>
            <option value="B1">B1 - ביניים (מומלץ)</option>
            <option value="B2">B2 - ביניים גבוה</option>
            <option value="C1">C1 - מתקדמים</option>
            <option value="C2">C2 - שפת אם / אקדמי</option>
            <option value="AI">🤖 סיווג אוטומטי ע&quot;י AI</option>
          </select>
        </div>

        {/* לשוניות ניווט */}
        <div className="flex border-b mb-6">
          <button
            onClick={() => setTab('manual')}
            className={`pb-3 px-4 font-medium text-sm transition ${tab === 'manual' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
            הוספת מילים
          </button>
          <button
            onClick={() => setTab('paste')}
            className={`pb-3 px-4 font-medium text-sm transition ${tab === 'paste' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-gray-400 hover:text-gray-600'}`}>
            מלל חופשי (רשימה)
          </button>
        </div>

        {tab === 'manual' && (
          <form onSubmit={handleSingleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הכנס מילים באנגלית</label>
              <input
                type="text"
                required
                dir="ltr"
                value={wordInput}
                onChange={(e) => setWordInput(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                placeholder="e.g. resilient, comprehensive, concise"
              />
              <p className="text-xs text-gray-400 mt-1">ניתן להכניס מילה אחת או כמה מילים מופרדות בפסיקים.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md">
              {loading ? 'שומר...' : `שמור מילים ברמת ${selectedLevel}`}
            </button>
          </form>
        )}

        {tab === 'paste' && (
          <form onSubmit={handleBatchTextSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הדבק רשימת מילים (כל שורה מילה)</label>
              <textarea
                rows="6"
                dir="ltr"
                value={freeText}
                onChange={(e) => setFreeText(e.target.value)}
                className="w-full p-4 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm"
                placeholder={`resilience\nubiquitous\narticulate`}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white py-2.5 rounded-lg font-medium hover:bg-indigo-700 transition shadow-md">
              {loading ? 'מעבד ומעלה...' : `העלה רשימה ברמת ${selectedLevel}`}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}