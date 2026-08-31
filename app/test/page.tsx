// app/test/page.tsx

'use client';

import { useEffect, useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/health/')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🧪 Test API DigiCol</h1>
      {loading ? (
        <p className="text-gray-500">Chargement...</p>
      ) : (
        <pre className="bg-gray-100 p-4 rounded-lg">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}