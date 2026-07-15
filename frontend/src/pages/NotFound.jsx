import React from 'react';



const NotFound = () => {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      
      <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        
        <main className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-9xl font-black text-indigo-500/20">404</h1>
            <p className="text-2xl font-bold text-foreground mt-4">Oops! Page not found.</p>
            <p className="text-muted-foreground mt-2">The page you are looking for doesn't exist or has been moved.</p>
            <a href="/dashboard" className="mt-8 inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-foreground font-medium rounded-xl transition-colors">
              Go to Dashboard
            </a>
          </div>
        </main>
      </div>
    </div>
  );
};

export default NotFound;
