// src/pages/PharmacyListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
// Assuming PaginatedResponse is defined
// import { PaginatedResponse } from '../types/common';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';
// Import Loading/Error components if available

const PharmacyListPage: React.FC = () => {
    // State for accumulated results
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    // State for pagination
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    // Initial loading and error state
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Search state
    const [searchTerm, setSearchTerm] = useState<string>('');

    const fetchInitialPharmacies = useCallback(async (currentSearchTerm: string) => {
        setIsLoading(true);
        setError(null);
        setPharmacies([]); // Reset
        setNextPageUrl(null);
        setTotalCount(0);
        try {
            const params: { search?: string } = {};
             if (currentSearchTerm) {
                 params.search = currentSearchTerm;
             }
            // Fetch first page
            const response = await getPharmacies(params);
            if (response && Array.isArray(response.results)) {
                 setPharmacies(response.results);
                 setNextPageUrl(response.next);
                 setTotalCount(response.count);
            } else {
                console.warn("Received unexpected pharmacy response:", response);
                 setError("Failed to process pharmacy data.");
                 setPharmacies([]);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load pharmacies. Please try again later.');
            console.error(err);
            setPharmacies([]);
        } finally {
            setIsLoading(false);
        }
    }, []); // Dependency array correct

    const loadMorePharmacies = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            // Fetch next page
            const response = await getPharmacies(nextPageUrl);
            if (response && Array.isArray(response.results)) {
                  // Append results
                  setPharmacies(prev => [...prev, ...response.results]);
                  setNextPageUrl(response.next);
            } else {
                console.warn("Received unexpected pharmacy response on load more:", response);
                  setError("Failed to process additional pharmacy data.");
                  setNextPageUrl(null);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load more pharmacies.');
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    };

    // Initial fetch on mount
    useEffect(() => {
        fetchInitialPharmacies(searchTerm);
    }, [fetchInitialPharmacies]); // Runs once as fetch is stable

     // --- Search Handling ---
     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
     };
     const handleSearchSubmit = (event: React.FormEvent) => {
         event.preventDefault();
         fetchInitialPharmacies(searchTerm); // Trigger initial fetch with new term
     };
    // --- End Search Handling ---


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
             <button type="submit" className="btn-primary w-full md:w-auto px-6" disabled={isLoading}>
                 {isLoading && !isLoadingMore ? 'Searching...' : 'Search'}
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
        ) : (
           <>
             {totalCount > 0 ? (
                <p className="text-sm text-muted mb-4">Showing {pharmacies.length} of {totalCount} pharmacies.</p>
             ) : null}

             {pharmacies.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {pharmacies.map((pharmacy) => (
                   <PharmacyCard key={pharmacy.id} pharmacy={pharmacy} />
                 ))}
               </div>
             ) : (
                 !isLoading && !error && ( // Show only if load finished without results
                     <div className="text-center py-10">
                         <p className="text-muted">No pharmacies found matching your criteria.</p>
                     </div>
                 )
             )}

             {/* Load More Button */}
             {nextPageUrl && (
                 <div className="mt-8 text-center">
                     <button
                         onClick={loadMorePharmacies}
                         disabled={isLoadingMore}
                         className="btn-primary px-6 py-2 disabled:opacity-50"
                     >
                         {isLoadingMore ? 'Loading...' : 'Load More Pharmacies'}
                     </button>
                 </div>
             )}
           </>
        )}
      </div>
    </div>
  );
};

export default PharmacyListPage;