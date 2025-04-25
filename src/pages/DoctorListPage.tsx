// src/pages/DoctorListPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { getDoctors } from '../api/doctors'; // Import the API function
import { Doctor } from '../types/doctors'; // Import the Doctor type
import DoctorCard from '../features/doctors/components/DoctorCard'; // Import the Card component
// import LoadingSpinner from '../components/common/LoadingSpinner'; // Create or import a loading component
// import ErrorMessage from '../components/common/ErrorMessage'; // Create or import an error component

const DoctorListPage: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>('');
    // Add state for other filters like specialty if needed
    // const [selectedSpecialty, setSelectedSpecialty] = useState<number | null>(null);

    // Use useCallback to memoize the fetch function
    const fetchDoctors = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
          const params: { search?: string } = {};
          if (searchTerm) {
            params.search = searchTerm;
          }
      
          // CHANGE THIS LINE: Use the response directly VVVVVV
          const doctorsArray = await getDoctors(params);
          setDoctors(doctorsArray); // Set state with the array itself
      
        } catch (err) {
          console.error("Error fetching doctors:", err);
          setError('Failed to load doctors. Please try again later.');
        } finally {
          setIsLoading(false);
        }
      }, [searchTerm]); // Add other dependencies like selectedSpecialty if used

    // Fetch doctors on initial mount and when filters change
    useEffect(() => {
        fetchDoctors();
    }, [fetchDoctors]); // fetchDoctors is memoized, safe to use as dependency

    // Handle search input change
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(event.target.value);
        // Optional: Add debounce here if you don't want to search on every keystroke
    };

    // Handle submitting search (e.g., pressing Enter or a button)
    const handleSearchSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        fetchDoctors(); // Fetch again with the current search term
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Find a Doctor</h1>

            {/* Search and Filter Bar */}
            <div className="mb-8 bg-white p-4 rounded-lg shadow">
                <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full md:w-auto">
                        <input
                            type="text"
                            placeholder="Search by name, specialty, bio..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            className="input-field pl-10 w-full" // Added padding for icon
                        />
                        <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    </div>
                    {/* Add dropdowns or other filters here */}
                    {/* Example Specialty Filter (requires fetching specialties)
             <select className="input-field w-full md:w-auto">
                 <option value="">All Specialties</option>
                 {/* Map over specialties here *}
             </select>
             */}
                    <button type="submit" className="btn-primary w-full md:w-auto px-6">
                        Search
                    </button>
                </form>
            </div>


            {/* Doctor List / Loading / Error Handling */}
            <div>
                {isLoading ? (
                    // Replace with a proper loading component (e.g., skeletons, spinner)
                    <div className="text-center py-10">
                        <p className="text-muted">Loading doctors...</p>
                        {/* <LoadingSpinner /> */}
                    </div>
                ) : error ? (
                    // Replace with a proper error message component
                    <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md">
                        <p>{error}</p>
                    </div>
                ) : doctors.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {doctors.map((doctor) => (
                            <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10">
                        <p className="text-muted">No doctors found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DoctorListPage;