// src/pages/DoctorDetailPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, CheckBadgeIcon, LanguageIcon, BanknotesIcon, CalendarDaysIcon, AcademicCapIcon } from '@heroicons/react/24/solid';

import { getDoctorById, getDoctorReviews, getDoctorAvailability, PostReviewPayload, postDoctorReview } from '../api/doctors';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { Appointment } from '../types/appointments';
import { PaginatedResponse } from '../types/common';

import ReviewCard from '../features/doctors/components/ReviewCard';
import AvailabilityDisplay from '../features/doctors/components/AvailabilityDisplay';
import AppointmentBookingForm from '../features/appointments/components/AppointmentBookingForm';
import Modal from '../components/common/Modal';
import { useAuth } from '../contexts/AuthContext';

const LoadingSpinner: React.FC = () => <p className="text-muted">Loading...</p>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <p className="text-red-600">{message}</p>;
interface ReviewFormProps {
    doctorId: number;
    onSubmitSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ doctorId, onSubmitSuccess }) => {
    const [rating, setRating] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [formError, setFormError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            setFormError("Please select a rating.");
            return;
        }
        setIsSubmitting(true);
        setFormError(null);
        const payload: PostReviewPayload = { rating, comment };
        try {
            await postDoctorReview(doctorId, payload);
            setRating(0);
            setComment('');
            onSubmitSuccess();
        } catch (err: any) {
            const apiError = err.response?.data;
            if (apiError?.non_field_errors) {
                setFormError(apiError.non_field_errors.join(' '));
            } else if (apiError?.rating) {
                setFormError(`Rating: ${apiError.rating.join(' ')}`);
            } else {
                setFormError(err.message || "Failed to submit review.");
            }
            console.error(err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 border-t pt-4 space-y-3">
            <h4 className="text-md font-semibold text-gray-700">Write a Review</h4>
            {formError && <ErrorMessage message={formError} />}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Rating *</label>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            type="button"
                            key={star}
                            onClick={() => setRating(star)}
                            className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-gray-400'}`}
                        >
                            <StarIcon className="h-6 w-6" />
                        </button>
                    ))}
                </div>
            </div>
            <div>
                <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Comment (Optional)</label>
                <textarea
                    id="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={3}
                    className="input-field"
                    placeholder="Share your experience..."
                />
            </div>
            <button type="submit" className="btn-primary text-sm" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
        </form>
    );
};

const DoctorDetailPage: React.FC = () => {
    const { doctorId } = useParams<{ doctorId: string }>();
    const navigate = useNavigate();
    const location = useLocation();
    const { isAuthenticated } = useAuth();
    const [doctor, setDoctor] = useState<Doctor | null>(null);
    const [availability, setAvailability] = useState<DoctorAvailability[]>([]);

    const [reviews, setReviews] = useState<DoctorReview[]>([]);
    const [reviewsNextPageUrl, setReviewsNextPageUrl] = useState<string | null>(null);
    const [reviewsTotalCount, setReviewsTotalCount] = useState<number>(0);
    const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState<boolean>(false);
    const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
    const [errorReviews, setErrorReviews] = useState<string | null>(null);

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showBookingModal, setShowBookingModal] = useState<boolean>(false);
    const [bookingSuccess, setBookingSuccess] = useState<string | null>(null);

    const placeholderImage = '/default-doctor-avatar.png';

    const loadDoctorData = useCallback(async (refreshReviews: boolean = false) => {
        if (!doctorId) {
            setError("Doctor ID not found in URL.");
            setIsLoading(false);
            setIsLoadingReviews(false);
            return;
        }
        
        if (!refreshReviews) {
            setIsLoading(true);
        }
        setIsLoadingReviews(true);
        setError(null);
        setErrorReviews(null);
        setBookingSuccess(null);

        if (refreshReviews) {
            setReviews([]);
            setReviewsNextPageUrl(null);
            setReviewsTotalCount(0);
        }

        try {
            const id = parseInt(doctorId!, 10);
            if (isNaN(id)) {
                throw new Error("Invalid Doctor ID format.");
            }

            const results = await Promise.allSettled([
                (!doctor || !refreshReviews) ? getDoctorById(id) : Promise.resolve(doctor),
                getDoctorReviews(id),
                (availability.length === 0 || !refreshReviews) ? 
                    getDoctorAvailability(id) : 
                    Promise.resolve({ results: availability, next: null, previous: null, count: availability.length }),
            ]);

            const docResult = results[0];
            if (docResult.status === 'fulfilled') {
                setDoctor(docResult.value as Doctor);
            } else if (!refreshReviews) {
                console.error("Failed to load doctor details:", docResult.reason);
                throw new Error(docResult.reason?.message || "Failed to load doctor details.");
            }

            const reviewResult = results[1];
            if (reviewResult.status === 'fulfilled') {
                const reviewResponse = reviewResult.value as PaginatedResponse<DoctorReview>;
                if (reviewResponse && Array.isArray(reviewResponse.results)) {
                    setReviews(reviewResponse.results);
                    setReviewsNextPageUrl(reviewResponse.next);
                    setReviewsTotalCount(reviewResponse.count);
                } else {
                    console.warn("Unexpected review response structure:", reviewResponse);
                    setErrorReviews("Failed to process reviews.");
                    setReviews([]);
                }
            } else {
                console.error("Failed to load reviews:", reviewResult.reason);
                setErrorReviews(reviewResult.reason?.message || "Failed to load reviews.");
                setReviews([]);
            }

            const availResult = results[2];
            if (availResult.status === 'fulfilled') {
                const availResponse = availResult.value as PaginatedResponse<DoctorAvailability>;
                if (availResponse && Array.isArray(availResponse.results)) {
                    setAvailability(availResponse.results);
                } else {
                    console.warn("Unexpected availability response structure:", availResponse);
                    setError(prev => prev ? `${prev} & Failed to process availability.` : "Failed to process availability.");
                }
            } else if (!refreshReviews) {
                console.error("Failed to load availability:", availResult.reason);
                setError(prev => prev ? `${prev} & Failed to load availability.` : availResult.reason?.message || "Failed to load availability.");
                setAvailability([]);
            }

        } catch (err: any) {
            console.error("Error in loadDoctorData:", err);
            setError(err.message || "An unexpected error occurred.");
            setDoctor(null);
            setReviews([]);
            setAvailability([]);
        } finally {
            setIsLoading(false);
            setIsLoadingReviews(false);
        }
    }, [doctorId]);
    useEffect(() => {
        loadDoctorData();
    }, [loadDoctorData]);

    const loadMoreReviews = async () => {
        if (!reviewsNextPageUrl || isLoadingMoreReviews) return;

        setIsLoadingMoreReviews(true);
        setErrorReviews(null);

        try {
            const response = await getDoctorReviews(parseInt(doctorId!, 10), reviewsNextPageUrl);
            if (response && Array.isArray(response.results)) {
                setReviews(prevReviews => [...prevReviews, ...response.results]);
                setReviewsNextPageUrl(response.next);
            } else {
                console.warn("Unexpected load more reviews structure:", response);
                setErrorReviews("Failed to process more reviews.");
                setReviewsNextPageUrl(null);
            }
        } catch (err: any) {
            console.error("Failed to load more reviews:", err);
            setErrorReviews(err.message || "Failed to load more reviews.");
        } finally {
            setIsLoadingMoreReviews(false);
        }
    };

    const handleReviewSubmitSuccess = () => {
        loadDoctorData(true);
    };

    const handleOpenBookingModal = () => {
        setBookingSuccess(null);
        setShowBookingModal(true);
    };

    const handleCloseBookingModal = () => {
        setShowBookingModal(false);
    };

    const handleBookingSuccess = (newAppointment: Appointment) => {
        setShowBookingModal(false);
        setBookingSuccess(`Appointment booked successfully for ${newAppointment.date} at ${formatTime(newAppointment.start_time)}!`);
    };

    const formatTime = (timeStr: string): string => {
        if (!timeStr) return '';
        try {
            const [hours, minutes] = timeStr.split(':');
            const date = new Date();
            date.setHours(parseInt(hours, 10), parseInt(minutes, 10));
            return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
        } catch { return timeStr; }
    };
    
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <LoadingSpinner />
            </div>
        );
    }

    if (error && !doctor) {
        return (
            <div className="text-center py-10 bg-red-50 text-red-700 p-4 rounded-md max-w-2xl mx-auto">
                <ErrorMessage message={error} />
                <Link to="/doctors" className="mt-4 inline-block text-primary hover:underline">
                    &larr; Back to Doctors List
                </Link>
            </div>
        );
    }

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

    const displayedRating = doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'No ratings';

    return (
        <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <Link to="/doctors" className="inline-flex items-center text-primary hover:text-primary-dark mb-4 text-sm">
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Doctors List
            </Link>

            {error && <ErrorMessage message={error} />}

            {bookingSuccess && (
                <div className="mb-4 p-3 bg-green-50 text-green-700 border border-green-200 rounded-md text-sm">
                    {bookingSuccess} Check your <Link to="/appointments" className="font-medium underline hover:text-green-800">Appointments page</Link> for details.
                </div>
            )}

            <div className="bg-white rounded-lg shadow-xl overflow-hidden">
                {/* Header Section */}
                <div className="p-6 md:flex md:items-center md:space-x-6 bg-gradient-to-r from-primary-light/20 to-primary/5">
                    <div className="md:w-1/4 flex justify-center md:justify-start mb-4 md:mb-0">
                         <img
                             src={doctor.profile_picture || placeholderImage}
                             alt={doctor.full_name}
                             className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-md"
                             onError={(e) => { (e.target as HTMLImageElement).src = placeholderImage; }}
                         />
                     </div>
                     <div className="text-center md:text-left md:flex-grow">
                         <div className="flex items-center justify-center md:justify-start mb-1">
                             <h1 className="text-2xl font-bold text-gray-800 mr-2">{doctor.full_name}</h1>
                             {doctor.is_verified && <CheckBadgeIcon className="h-6 w-6 text-primary" title="Verified" />}
                         </div>
                         <p className="text-primary font-semibold mb-2">
                             {doctor.specialties.map(spec => spec.name).join(', ')}
                         </p>
                         <div className="flex items-center justify-center md:justify-start text-sm text-muted space-x-3">
                             <span className="flex items-center">
                                 <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
                                 {displayedRating} ({reviewsTotalCount} reviews)
                             </span>
                             <span>|</span>
                             <span>{doctor.years_of_experience} Yrs Experience</span>
                         </div>
                     </div>
                     <div className="mt-4 md:mt-0 flex flex-col items-center md:items-end space-y-2">
                        <span className="text-xl font-bold text-primary">
                             Fee: {doctor.consultation_fee ? `$${doctor.consultation_fee}` : 'N/A'}
                        </span>
                        {isAuthenticated ? (
                             <button
                                onClick={handleOpenBookingModal}
                                className="btn-primary px-6 py-2 w-full md:w-auto"
                            >
                                 Book Appointment
                             </button>
                         ) : (
                             <Link to="/login" state={{ from: location }} className="btn-primary px-6 py-2 w-full md:w-auto text-center">Login to Book</Link>
                         )}
                     </div>
                </div>

                <div className="p-6 border-t border-gray-200">
                    <div className="mb-6">
                         <h3 className="text-lg font-semibold text-gray-800 mb-2">About Dr. {doctor.last_name}</h3>
                         <p className="text-gray-600 leading-relaxed whitespace-pre-line">{doctor.bio || "No biography provided."}</p>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                             <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                                 <LanguageIcon className="h-5 w-5 mr-2 text-primary" /> Languages
                             </h4>
                             <p className="text-gray-600">{doctor.languages_spoken || 'Not specified'}</p>
                        </div>
                        <div>
                             <h4 className="text-md font-semibold text-gray-700 mb-2 flex items-center">
                                 <AcademicCapIcon className="h-5 w-5 mr-2 text-primary" /> Education & Experience
                             </h4>
                             <p className="text-gray-600 whitespace-pre-line">{doctor.education || 'Not specified'}</p>
                             <p className="text-sm text-muted mt-1">{doctor.years_of_experience} years of experience</p>
                        </div>
                     </div>

                    <div className="mb-6 border-t pt-4">
                        <AvailabilityDisplay availability={availability} />
                        {availability.length === 0 && !isLoading && (
                             <p className="text-muted text-sm mt-2">Availability information could not be loaded.</p>
                        )}
                    </div>

                    <div className="border-t pt-4">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">Patient Reviews ({reviewsTotalCount})</h3>
                        {isLoadingReviews && <LoadingSpinner />}
                        {!isLoadingReviews && errorReviews && <ErrorMessage message={errorReviews} />}

                        {!isLoadingReviews && !errorReviews && reviews.length > 0 ? (
                            <>
                                <div className="space-y-4 max-h-96 overflow-y-auto pr-2 border rounded p-2 bg-gray-50">
                                    {reviews.map(review => (
                                        <ReviewCard key={review.id} review={review} />
                                    ))}
                                </div>
                                {reviewsNextPageUrl && (
                                    <div className="mt-4 pt-4 text-center">
                                        <button
                                            onClick={loadMoreReviews}
                                            disabled={isLoadingMoreReviews}
                                            className="text-primary hover:underline text-sm disabled:opacity-50 disabled:cursor-wait"
                                        >
                                            {isLoadingMoreReviews ? 'Loading...' : 'Load More Reviews'}
                                        </button>
                                    </div>
                                )}
                            </>
                        ) : (
                            !isLoadingReviews && !errorReviews && (
                                <p className="text-muted text-sm">No reviews yet for this doctor.</p>
                            )
                        )}
                         {isAuthenticated && (
                             <ReviewForm doctorId={doctor.id} onSubmitSuccess={handleReviewSubmitSuccess} />
                         )}
                          {!isAuthenticated && (
                             <p className="text-muted text-sm mt-4">Please <Link to="/login" state={{ from: location }} className='text-primary underline'>login</Link> to write a review.</p>
                         )}
                    </div>
                </div>
            </div>
             <Modal isOpen={showBookingModal} onClose={handleCloseBookingModal} title={`Book Appointment with ${doctor.full_name}`}>
                 <AppointmentBookingForm
                    doctorId={doctor.id}
                    doctorName={doctor.full_name}
                    availability={availability}
                    onBookingSuccess={handleBookingSuccess}
                    onCancel={handleCloseBookingModal}
                 />
            </Modal>
        </div>
    );
};

export default DoctorDetailPage;