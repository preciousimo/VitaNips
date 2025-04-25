// src/pages/DoctorDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, CheckBadgeIcon, LanguageIcon, BanknotesIcon, CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/solid'; // Using solid icons

import { getDoctorById, getDoctorReviews, getDoctorAvailability } from '../api/doctors';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';

import ReviewCard from '../features/doctors/components/ReviewCard';
import AvailabilityDisplay from '../features/doctors/components/AvailabilityDisplay';
// Import Loading/Error components if you have them
// import LoadingSpinner from '../components/common/LoadingSpinner';
// import ErrorMessage from '../components/common/ErrorMessage';

const DoctorDetailPage: React.FC = () => {
    const { doctorId } = useParams<{ doctorId: string }>();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [reviews, setReviews] = useState<DoctorReview[]>([]);
    const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const placeholderImage = '/default-doctor-avatar.png'; // Use the same placeholder

    const loadDoctorData = useCallback(async () => {
        if (!doctorId) {
            setError("Doctor ID not found.");
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const id = parseInt(doctorId, 10);
            // Fetch all data in parallel
            const [docData, reviewData, availData] = await Promise.all([
                getDoctorById(id),
                getDoctorReviews(id),
                getDoctorAvailability(id)
            ]);
            setDoctor(docData);
            setReviews(reviewData);
            setAvailability(availData);
        } catch (err) {
            console.error("Failed to load doctor data:", err);
            setError("Failed to load doctor details. Please try again.");
        } finally {
            setIsLoading(false);
        }
    }, [doctorId]);

    useEffect(() => {
        loadDoctorData();
    }, [loadDoctorData]);


    // ----- Loading State -----
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                 {/* <LoadingSpinner /> */}
                 <p className="text-muted">Loading doctor details...</p>
            </div>
        );
    }

    // ----- Error State -----
    if (error) {
         return (
           <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md max-w-2xl mx-auto">
               <p>{error}</p>
               <Link to="/doctors" className="mt-4 inline-block text-primary hover:underline">
                   &larr; Back to Doctors List
               </Link>
           </div>
       );
    }

    // ----- No Doctor Found State -----
    if (!doctor) {
        return (
             <div className="text-center py-10">
               <p className="text-muted">Doctor not found.</p>
                <Link to="/doctors" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Back to Doctors List
                </Link>
           </div>
        );
    }

    // ----- Success State (Render Profile) -----
    return (
        <div className="max-w-4xl mx-auto">
             {/* Back Button */}
             <Link to="/doctors" className="inline-flex items-center text-primary hover:text-primary-dark mb-4 text-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Doctors List
            </Link>

            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                 {/* Header Section */}
                <div className="p-6 md:flex md:items-center md:space-x-6 bg-gradient-to-r from-primary-light/20 to-primary/5">
                     <div className="md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
                        <img
                            src={doctor.profile_picture || placeholderImage}
                            alt={doctor.full_name}
                            className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                            onError={(e) => (e.currentTarget.src = placeholderImage)}
                        />
                     </div>
                     <div className="text-center md:text-left md:flex-grow">
                         <div className="flex items-center justify-center md:justify-start mb-1">
                            <h1 className="text-2xl font-bold text-gray-800 mr-2">{doctor.full_name}</h1>
                            {doctor.is_verified && <CheckBadgeIcon className="h-6 w-6 text-primary" title="Verified"/>}
                         </div>
                         <p className="text-primary font-semibold mb-2">
                            {doctor.specialties.map(spec => spec.name).join(', ')}
                         </p>
                         <div className="flex items-center justify-center md:justify-start text-sm text-muted space-x-3">
                            <span className="flex items-center">
                                <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'No ratings'} ({reviews.length} reviews)
                            </span>
                            <span>|</span>
                            <span>{doctor.years_of_experience} Yrs Experience</span>
                         </div>
                     </div>
                     <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end space-y-2">
                          <span className="text-xl font-bold text-primary">
                            Fee: {doctor.consultation_fee ? `$${doctor.consultation_fee}`: 'N/A'}
                          </span>
                          <button className="btn-primary px-6 py-2 w-full md:w-auto">
                              Book Appointment
                          </button>
                           {/* Add logic later to open booking modal/page */}
                     </div>
                </div>

                 {/* Details Section */}
                <div className="p-6 border-t border-gray-200">
                     {/* Bio */}
                    <div className="mb-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-2">About Dr. {doctor.last_name}</h3>
                         <p className="text-gray-600 leading-relaxed">{doctor.bio || "No biography provided."}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                         {/* Languages */}
                        <div>
                             <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                                 <LanguageIcon className="h-5 w-5 mr-2 text-primary" /> Languages
                             </h4>
                             <p className="text-gray-600">{doctor.languages_spoken || 'Not specified'}</p>
                        </div>

                         {/* Education */}
                        <div>
                            <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                                 <AcademicCapIcon className="h-5 w-5 mr-2 text-primary" /> Education & Experience
                             </h4>
                             <p className="text-gray-600 whitespace-pre-line">{doctor.education || 'Not specified'}</p>
                             <p className="text-sm text-muted mt-1">{doctor.years_of_experience} years of experience</p>
                         </div>
                    </div>

                     {/* Availability */}
                    <div className="mb-6 border-t pt-4">
                        <AvailabilityDisplay availability={availability} />
                    </div>

                     {/* Reviews Section */}
                    <div className="border-t pt-4">
                         <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Reviews ({reviews.length})</h3>
                         {reviews.length > 0 ? (
                            <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                                {reviews.map(review => (
                                    <ReviewCard key={review.id} review={review} />
                                ))}
                            </div>
                         ) : (
                            <p className="text-muted text-sm">No reviews yet for this doctor.</p>
                         )}
                         {/* Add a "Write a Review" button/form later */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorDetailPage;