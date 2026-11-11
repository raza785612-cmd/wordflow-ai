import React, { useState } from 'react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    age: '',
    gender: '',
    targetAudience: 'student'
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
      // TODO: חיבור עתידי ל-Supabase
      console.log("Data to save in Supabase:", formData);
      
      setTimeout(() => {
        setLoading(false);
        alert("נרשמת בהצלחה! מעבר לאפליקציה...");
      }, 1000);

    } catch (err) {
      console.error("Error saving data:", err);
      setLoading(false);
      alert("אירעה שגיאה בשמירת הנתונים, נסה שוב.");
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        
        {/* כותרת ולוגו */}
        <div className="text-center mb-8">
          <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
            WordFlow AI
          </span>
          <h1 className="text-2xl font-bold text-gray-900 mt-3">ברוכים הבאים לאנגלית חכמה</h1>
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

        {/* שלב 2: נתונים נוספים והתאמה אישית */}
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
                {loading ? "שומר נתונים..." : "סיום והתחל ללמוד 🚀"}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}