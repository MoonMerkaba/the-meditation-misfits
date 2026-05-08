import React from 'react';

const DiagnosticTest: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
      <div className="bg-white/10 backdrop-blur-lg p-8 rounded-2xl shadow-2xl max-w-2xl w-full mx-4">
        <h1 className="text-4xl font-bold text-white mb-6">
          🎉 App is Loading Successfully!
        </h1>
        <div className="space-y-4 text-white">
          <p className="text-lg">
            ✅ React is working
          </p>
          <p className="text-lg">
            ✅ Vite is serving the app
          </p>
          <p className="text-lg">
            ✅ Tailwind CSS is working
          </p>
          <p className="text-lg">
            ✅ TypeScript is compiling
          </p>
          <div className="mt-8 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <p className="font-semibold">Success!</p>
            <p className="text-sm mt-2">
              Your app is now loading correctly. The routing and base path issues have been fixed.
            </p>
          </div>
          <a 
            href="/"
            className="mt-6 block text-center bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            Go to Full App
          </a>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTest;
