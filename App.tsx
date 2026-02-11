
import React, { useState, useEffect } from 'react';
import { CustomerView } from './views/CustomerView';
import { AdminView } from './views/AdminView';

const App: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const handleHash = () => {
      setIsAdmin(window.location.hash === '#admin');
    };
    window.addEventListener('hashchange', handleHash);
    handleHash();
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-purple-50 to-pink-100 selection:bg-rose-200">
      {/* Header fijo solo para admin, el cliente tiene su propio header dinámico */}
      {isAdmin && (
        <nav className="bg-white/40 backdrop-blur-md border-b border-rose-100 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
          <div className="flex flex-col">
            <h1 className="text-2xl font-cursive text-rose-600">Flor Viera Admin</h1>
          </div>
          <button 
            onClick={() => { window.location.hash = ''; }}
            className="text-xs font-bold text-rose-500 bg-rose-50 px-4 py-2 rounded-full"
          >
            Vista Cliente
          </button>
        </nav>
      )}

      <main className="container mx-auto p-4 max-w-lg">
        {isAdmin ? <AdminView /> : <CustomerView />}
      </main>

      {/* Decoración de fondo */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-rose-200/20 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="fixed -bottom-40 -right-40 w-96 h-96 bg-purple-200/20 rounded-full blur-[100px] -z-10 animate-pulse delay-1000"></div>
    </div>
  );
};

export default App;
