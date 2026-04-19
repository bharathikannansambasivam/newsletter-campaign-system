import React from "react";

function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white shadow-lg rounded-2xl p-8 text-center max-w-md w-full">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>

        <h1 className="text-3xl font-bold text-gray-800">404</h1>

        <p className="mt-2 text-gray-500">Page not found</p>

        <a
          href="/"
          className="inline-block mt-6 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
}

export default NotFound;
