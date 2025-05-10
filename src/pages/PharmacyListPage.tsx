// src/pages/PharmacyListPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MagnifyingGlassIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { getPharmacies } from '../api/pharmacy';
import { Pharmacy } from '../types/pharmacy';
import PharmacyCard from '../features/pharmacy/components/PharmacyCard';

const PharmacyListPage: React.FC = () => {
    const [pharmacies, setPharmacies] = useState<Pharmacy[]>([]);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');

    const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
    const [searchRadiusKm, setSearchRadiusKm] = useState<number>(5);
    const [isNearMeSearch, setIsNearMeSearch] = useState<boolean>(false);
    const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const initialLocationAttempted = useRef(false);

    const getUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            setIsNearMeSearch(false);
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
                if(isNearMeSearch) {
                    fetchInitialPharmacies(searchTerm, true, { lat: position.coords.latitude, lon: position.coords.longitude }, searchRadiusKm);
                }
            },
            (geoError) => {
                console.error("Geolocation Error:", geoError);
                setLocationError(`Location Error: ${geoError.message}. Showing results based on search term only.`);
                setUserLocation(null);
                setIsNearMeSearch(false);
                setIsGettingLocation(false);
                initialLocationAttempted.current = true;
                fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);

            },
            { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 }
        );
    }, [isNearMeSearch, searchTerm, searchRadiusKm]);

    const fetchInitialPharmacies = useCallback(async (
        currentSearchTerm: string,
        nearMe: boolean,
        location: { lat: number; lon: number } | null,
        radius: number
    ) => {
        setIsLoading(true);
        setError(null);
        setPharmacies([]);
        setNextPageUrl(null);
        setTotalCount(0);

        const params: { search?: string; lat?: number; lon?: number; radius?: number } = {};
        if (currentSearchTerm) {
            params.search = currentSearchTerm;
        }
        if (nearMe && location) {
            params.lat = location.lat;
            params.lon = location.lon;
            params.radius = radius;
        }

        try {
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
    }, []);

    const loadMorePharmacies = async () => {
        if (!nextPageUrl || isLoadingMore) return;
        setIsLoadingMore(true);
        setError(null);
        try {
            const response = await getPharmacies(nextPageUrl);
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

    useEffect(() => {
        fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        initialLocationAttempted.current = false;
    }, []);

     const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
         setSearchTerm(event.target.value);
     };

     const handleSearchSubmit = (event: React.FormEvent) => {
         event.preventDefault();
         if (isNearMeSearch && !userLocation && !isGettingLocation && !locationError) {
             getUserLocation();
         } else {
             fetchInitialPharmacies(searchTerm, isNearMeSearch, userLocation, searchRadiusKm);
         }
     };

     const handleNearMeToggle = (event: React.ChangeEvent<HTMLInputElement>) => {
        const checked = event.target.checked;
        setIsNearMeSearch(checked);
        setLocationError(null);

        if (checked) {
            if (!userLocation) {
                getUserLocation();
            } else {
                 fetchInitialPharmacies(searchTerm, true, userLocation, searchRadiusKm);
            }
        } else {
            fetchInitialPharmacies(searchTerm, false, null, searchRadiusKm);
        }
    };

    const handleRadiusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newRadius = Math.max(1, parseInt(event.target.value) || 1);
        setSearchRadiusKm(newRadius);
        if (isNearMeSearch && userLocation) {
            fetchInitialPharmacies(searchTerm, true, userLocation, newRadius);
        }
    }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Find a Pharmacy</h1>

      <div className="mb-8 bg-white p-4 rounded-lg shadow space-y-4">
         <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-end">
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

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end w-full md:w-auto">
                 <div className="flex items-center pt-5">
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

                 {isNearMeSearch && (
                    <div className='flex-shrink-0'>
                        <label htmlFor="radius" className="block text-sm font-medium text-gray-700">Radius (km)</label>
                        <input
                            type="number"
                            id="radius"
                            min="1"
                            max="50"
                            value={searchRadiusKm}
                            onChange={handleRadiusChange}
                            className="input-field mt-1 py-1 w-24"
                            disabled={!isNearMeSearch || isGettingLocation || isLoading}
                        />
                    </div>
                 )}
            </div>

            <button
                type="submit"
                className="btn-primary w-full md:w-auto px-6 self-start md:self-end mt-5 md:mt-0"
                disabled={isLoading || isGettingLocation}
            >
                {isLoading && !isLoadingMore ? 'Searching...' : 'Search'}
            </button>
         </form>
          {locationError && (
              <p className="text-sm text-orange-600 mt-2">{locationError}</p>
           )}
      </div>

      <div>
        {isLoading ? (
          <div className="text-center py-10">
            <p className="text-muted">Loading pharmacies...</p>
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
                 <div className="text-center py-10">
                     <p className="text-muted">No pharmacies found matching your criteria.</p>
                 </div>
             )}

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
             {isLoadingMore && <p className="text-center text-muted mt-4">Loading more...</p>}
           </>
        )}
      </div>
    </div>
  );
};

export default PharmacyListPage;