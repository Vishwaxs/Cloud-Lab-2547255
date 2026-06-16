import React, { useEffect, useState } from 'react';
import ProfileCard from './ProfileCard';

function App() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('https://api.api-ninjas.com/v1/cars?model=camry', {
      headers: {
        'X-Api-Key': 't1Hf5iLNLjH7CtmfyJBPrA==XOnMpIj8N5jIFqC',
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch car data');
        return res.json();
      })
      .then((data) => {
        setCars(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-8">
      <h1 className="text-3xl font-bold text-pink-700 mb-6">Car Profiles: Toyota Camry</h1>

      {loading && <p className="text-gray-600">Loading...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
      {!loading && !error && cars.length === 0 && (
        <p className="text-gray-600">No cars found.</p>
      )}

      <div className="flex flex-wrap justify-center">
        {cars.map((car, index) => (
          <ProfileCard
            key={index}
            title={`${car.make} ${car.model}`}
            handle={`Year: ${car.year}, Type: ${car.class || 'N/A'}`}
            image="https://cdn.pixabay.com/photo/2012/05/29/00/43/car-49278_1280.jpg"
          />
        ))}
      </div>
    </div>
  );
}

export default App;
