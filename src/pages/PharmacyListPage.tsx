// src/pages/PharmacyListPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline'; // Added MapPinIcon
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';
// Assuming PaginatedResponse is defined
// import { PaginatedResponse } from '../types/common';
// Import Loading/Error components if available

const PharmacyListPage: React.FC = () => {
    // State for accumulated results
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    // State for pagination
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    // Initial loading and error state
    const [isLoading, setIsLoading] = useState<boolean>(true); // For initial/search fetch
    const [error, setError] = useState<string | null>(null);
    // Search state
    const [searchTerm, setSearchTerm] = useState<string>('');

    // --- Location State ---
    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5); // Default radius
    const [isNearMeSearch, setIsNearMeSearch] = useState<boolean>(false); // Toggle for proximity search
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    // --- End Location State ---

    // Ref to track if initial location attempt was made
    const initialLocationAttempted = useRef(false);


    // --- Get User Location ---
    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsNearMeSearch(false); // Cannot search near me
            return;
        }
        setIsGettingLocation(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setUserLocation({
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                });
                setIsGettingLocation(false);
                initialLocationAttempted.current = true;
                // If 'near me' was intended, trigger fetch now that location is available
                if(isNearMeSearch) {
                    fetchInitialPharmacies(searchTerm, true, { lat: position.coords.latitude, lon: position.coords.longitude }, searchRadiusKm);
                }
            },
            (geoError) => {
                console.error("Geolocation Error:", geoError);
                setLocationError(`Location Error: ${geoError.message}. Showing results based on search term only.`);
                 // Fallback - disable near me search if location fails
                setUserLocation(null);
                setIsNearMeSearch(false);
                setIsGettingLocation(false);
                initialLocationAttempted.current = true;
                // Still fetch based on search term if location fails
                fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);

            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 } // Adjust options as needed
        );
    }, [isNearMeSearch, searchTerm, searchRadiusKm]); // Re-run if these change *while* getting location? Maybe not needed here


    // --- Fetch Pharmacies ---
    const fetchInitialPharmacies = useCallback(async (
        currentSearchTerm: string,
        nearMe: boolean, // Pass the current toggle state
        location: { lat: number; lon: number } | null, // Pass current location
        radius: number // Pass current radius
    ) => {
        setIsLoading(true);
        setError(null); // Clear previous API errors
        setPharmacies([]); // Reset results
        setNextPageUrl(null);
        setTotalCount(0);

        // Build params based on current state
        const params: { search?: string; lat?: number; lon?: number; radius?: number } = {};
        if (currentSearchTerm) {
            params.search = currentSearchTerm;
        }
        // Add location only if 'near me' is toggled AND location is available
        if (nearMe && location) {
            params.lat = location.lat;
            params.lon = location.lon;
            params.radius = radius;
        }

        try {
            // Fetch first page using the combined params
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
        // Note: We don't depend on userLocation directly here, pass it as arg
    }, []); // Dependency array for useCallback (fetch logic itself is stable)


     // --- Load More (includes location params if nearMe is active) ---
    const loadMorePharmacies = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        // Note: nextPageUrl from DRF *should* already contain all necessary
        // query parameters (search, lat, lon, radius) used in the initial fetch.
        try {
            const response = await getPharmacies(nextPageUrl); // Use the URL directly
            if (response && Array.isArray(response.results)) {
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


    // --- Effects and Handlers ---

    // Fetch on initial mount (without location initially)
    useEffect(() => {
        fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        initialLocationAttempted.current = false; // Reset flag on mount
    }, []); // Run once

    // Handle search term input
     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
     };

     // Handle form submission (search button click)
     const handleSearchSubmit = (event: React.FormEvent) => {
         event.preventDefault();
         // If "Near Me" is checked but we don't have location yet, get it first.
         // The callback in getUserLocation will trigger the fetch.
         if (isNearMeSearch && !userLocation && !isGettingLocation && !locationError) {
             getUserLocation();
         } else {
             // Otherwise, fetch immediately with current state
             fetchInitialPharmacies(searchTerm, isNearMeSearch, userLocation, searchRadiusKm);
         }
     };

     // Handle "Near Me" toggle change
     const handleNearMeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsNearMeSearch(checked);
        setLocationError(null); // Clear location error on toggle

        if (checked) {
            // If user checks the box, try to get location
            if (!userLocation) {
                getUserLocation(); // This will trigger fetch on success
            } else {
                 // Location already available, just fetch with location params
                 fetchInitialPharmacies(searchTerm, true, userLocation, searchRadiusKm);
            }
        } else {
            // If user unchecks the box, fetch without location params
            fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        }
    };

    // Handle Radius Change
    const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = Math.max(1, parseInt(event.target.value) || 1);
        setSearchRadiusKm(newRadius);
        // If near me search is active, refetch with new radius
        if (isNearMeSearch && userLocation) {
            fetchInitialPharmacies(searchTerm, true, userLocation, newRadius);
        }
    }
    // --- End Effects and Handlers ---


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find a Pharmacy</h1>

      {/* Search and Filter Bar */}
      <div className="mb-8 bg-white p-4 rounded-lg shadow space-y-4">
         <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
            {/* Search Input */}
            <div className="flex-grow w-full">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">Search by Name/Address</label>
                <div className="relative mt-1">
                    <input
                        type="text"
                        id="search"
                        placeholder="e.g., Vita Pharmacy, Ring Road..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="input-field pl-10 w-full"
                    />
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                </div>
            </div>

            {/* Location Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full md:w-auto">
                 <div className="flex items-center pt-5"> {/* pt-5 approx aligns checkbox with input bottom */}
                     <input
                         type="checkbox"
                         id="nearMe"
                         checked={isNearMeSearch}
                         onChange={handleNearMeToggle}
                         disabled={isGettingLocation}
                         className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                     />
                     <label htmlFor="nearMe" className="ml-2 block text-sm text-gray-900 whitespace-nowrap">
                         Search near me
                     </label>
                      {isGettingLocation && <MapPinIcon className="h-4 w-4 text-primary animate-pulse ml-2" />}
                 </div>

                 {isNearMeSearch && ( // Conditionally show radius input
                    <div className='flex-shrink-0'>
                        <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Radius (km)</label>
                        <input
                            type="number"
                            id="radius"
                            min="1"
                            max="50"
                            value={searchRadiusKm}
                            onChange={handleRadiusChange}
                            className="input-field mt-1 py-1 w-24" // Adjusted size
                            disabled={!isNearMeSearch || isGettingLocation || isLoading}
                        />
                    </div>
                 )}
            </div>


            {/* Submit Button */}
            <button
                type="submit"
                className="btn-primary w-full md:w-auto px-6 self-start md:self-end mt-5 md:mt-0" // Adjust margin for alignment
                disabled={isLoading || isGettingLocation}
            >
                {isLoading && !isLoadingMore ? 'Searching...' : 'Search'}
            </button>
         </form>
         {/* Location Error Display */}
          {locationError && (
              <p className="text-sm text-orange-600 mt-2">{locationError}</p>
           )}
      </div>

      {/* Pharmacy List / Loading / Error Handling */}
      <div>
        {isLoading ? ( // Show main loading spinner only during initial/search fetch
          <div className="text-center py-10">
            <p className="text-muted">Loading pharmacies...</p>
          </div>
        ) : error ? ( // Show error if loading finished with error
           <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md">
             <p>{error}</p>
           </div>
        ) : ( // Show results or no results message
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
                 <div className="text-center py-10">
                     <p className="text-muted">No pharmacies found matching your criteria.</p>
                 </div>
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
             {/* Display loading more indicator separately if needed */}
             {/* {isLoadingMore && <p className="text-center text-muted mt-4">Loading more...</p>} */}
           </>
        )}
      </div>
    </div>
  );
};

export default PharmacyListPage;