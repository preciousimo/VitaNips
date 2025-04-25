// src/pages/PharmacyListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getPharmacies } from '../api/pharmacy'; // Import the API function
import { Pharmacy } from '../types/pharmacy'; // Import the Pharmacy type
import PharmacyCard from '../features/pharmacy/components/PharmacyCard'; // Import the Card component
// Import Loading/Error components if you have them

const PharmacyListPage: React.FC = () => {
  const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');

  const fetchPharmacies = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: { search?: string } = {};
      if (searchTerm) {
        params.search = searchTerm;
      }
      // Assuming API returns direct array as per getPharmacies definition
      const pharmaciesArray = await getPharmacies(params);
      setPharmacies(pharmaciesArray);
    } catch (err) {
      console.error("Error fetching pharmacies:", err);
      setError('Failed to load pharmacies. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    fetchPharmacies();
  }, [fetchPharmacies]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
  };

   const handleSearchSubmit = (event: React.FormEvent) => {
       event.preventDefault();
       fetchPharmacies(); // Refetch with current term
   };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find a Pharmacy</h1>

      {/* Search Bar */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow">
         <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
             <div className="relative flex-grow w-full md:w-auto">
                 <input
                   type="text"
                   placeholder="Search by name or address..."
                   value={searchTerm}
                   onChange={handleSearchChange}
                   className="input-field pl-10 w-full"
                 />
                 <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
             </div>
             {/* Add filters for 'Offers Delivery' or '24 Hours' if needed */}
             <button type="submit" className="btn-primary w-full md:w-auto px-6">
                 Search
             </button>
         </form>
      </div>

      {/* Pharmacy List / Loading / Error Handling */}
      <div>
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted">Loading pharmacies...</p>
             {/* <LoadingSpinner /> */}
          </div>
        ) : error ? (
           <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md">
             <p>{error}</p>
           </div>
        ) : pharmacies.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6"> {/* Adjusted grid cols */}
            {pharmacies.map((pharmacy) => (
              <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-muted">No pharmacies found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PharmacyListPage;