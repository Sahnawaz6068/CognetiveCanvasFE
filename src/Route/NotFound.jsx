const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <h1 className="text-2xl font-semibold text-gray-900 mb-3">
          This page isn’t available right now
        </h1>
        <p className="text-gray-600 mb-6">
          The route you’re trying to access is not part of the official 
          <span className="bg-yellow-100 px-2  rounded-md font-bold">Cognetive Canvas</span> experience, or our team is currently working on it.
        </p>
        <p className="text-sm text-gray-400 mb-8">
          Error code: 404
        </p>

        <a
          href="/"
          className="inline-block px-6 py-3 rounded-lg bg-black text-white text-sm font-medium hover:bg-gray-800 transition"
        >
          Go back to Dashboard
        </a>
      </div>
    </div>
  );
};

export default NotFound;
