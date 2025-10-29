// src/pages/DoctorDetailPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeftIcon, StarIcon, CheckBadgeIcon, LanguageIcon, AcademicCapIcon, UserPlusIcon } from '@heroicons/react/24/solid';

import { getDoctorById, getDoctorReviews, getDoctorAvailability, PostReviewPayload, postDoctorReview } from '../api/doctors';
import { Doctor, DoctorReview, DoctorAvailability } from '../types/doctors';
import { Appointment } from '../types/appointments'; // Removed unused AppointmentPayload import
import { PaginatedResponse } from '../types/common';
import toast from 'react-hot-toast';

import ReviewCard from '../features/doctors/components/ReviewCard';
import AvailabilityDisplay from '../features/doctors/components/AvailabilityDisplay';
import AppointmentBookingForm from '../features/appointments/components/AppointmentBookingForm';
import Modal from '../components/common/Modal';
import SmartImage from '../components/common/SmartImage';
import { useAuth } from '../contexts/AuthContext';

const LoadingSpinner: React.FC = () => <div className="text-center py-4"><p className="text-muted">Loading...</p></div>;
const ErrorMessage: React.FC<{ message: string }> = ({ message }) => <p className="text-red-600 bg-red-50 p-3 rounded-md text-sm">{message}</p>;

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
    if (rating === 0) { setFormError("Please select a rating."); return; }
    setIsSubmitting(true); setFormError(null);
    const payload: PostReviewPayload = { rating, comment };
    try {
      await postDoctorReview(doctorId, payload);
      toast.success("Review submitted successfully!");
      setRating(0); setComment('');
      onSubmitSuccess(); // This should re-fetch reviews
    } catch (err) {
      const apiError = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: unknown } }).response?.data 
        : undefined;
      let errMsg = "Failed to submit review.";
      if (apiError && typeof apiError === 'object') {
        if ('non_field_errors' in apiError && Array.isArray(apiError.non_field_errors)) {
          errMsg = apiError.non_field_errors.join(' ');
        } else if ('rating' in apiError && Array.isArray(apiError.rating)) {
          errMsg = `Rating: ${apiError.rating.join(' ')}`;
        } else if ('detail' in apiError && typeof apiError.detail === 'string') {
          errMsg = apiError.detail;
        }
      }
      setFormError(errMsg);
      toast.error(errMsg);
    } finally { setIsSubmitting(false); }
  };
  
  return (
    <form onSubmit={handleSubmit} className="mt-6 border-t pt-6 space-y-4">
      <h4 className="text-lg font-semibold text-gray-700">Write a Review</h4>
      {formError && <ErrorMessage message={formError} />}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Your Rating *</label>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map(star => (
            <button type="button" key={star} onClick={() => setRating(star)}
              className={`p-1 rounded focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-300'}`}>
              <StarIcon className="h-7 w-7" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700">Your Comment (Optional)</label>
        <textarea id="comment" value={comment} onChange={(e) => setComment(e.target.value)}
          rows={3} className="input-field mt-1" placeholder="Share your experience..." />
      </div>
      <button type="submit" className="btn-primary text-sm py-2 px-4" disabled={isSubmitting || rating === 0}>
        {isSubmitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

// Interface for location state for follow-up
interface FollowUpLocationState {
  isFollowUp?: boolean;
  originalAppointmentId?: number;
  prefillReason?: string;
  openBookingModalDirectly?: boolean;
}

const DoctorDetailPage: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const followUpState = location.state as FollowUpLocationState | null;

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
  const [reviews, setReviews] = useState<DoctorReview[]>([]);
  const [reviewsNextPageUrl, setReviewsNextPageUrl] = useState<string | null>(null);
  const [reviewsTotalCount, setReviewsTotalCount] = useState<number>(0);
  const [isLoadingMoreReviews, setIsLoadingMoreReviews] = useState<boolean>(false);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingReviews, setIsLoadingReviews] = useState<boolean>(true);
  const [errorReviews, setErrorReviews] = useState<string | null>(null);

  const [showBookingModal, setShowBookingModal] = useState<boolean>(false);

  const placeholderImage = '/images/doctor-placeholder.svg';

  const followUpHandledRef = useRef(false);

  const loadDoctorData = useCallback(async (refreshAll: boolean = false, refreshJustReviews: boolean = false) => {
    if (!doctorId) { setError("Doctor ID not found."); setIsLoading(false); return; }
    const id = parseInt(doctorId, 10);
    if (isNaN(id)) { setError("Invalid Doctor ID."); setIsLoading(false); return; }

    if (refreshAll) {
      setIsLoading(true);
      setDoctor(null);
      setAvailability([]);
    }
    if (refreshAll || refreshJustReviews) {
      setIsLoadingReviews(true);
      setReviews([]);
      setReviewsNextPageUrl(null);
      setReviewsTotalCount(0);
    }
    setError(null); setErrorReviews(null);

    try {
      const promises = [];
      if (refreshAll || !doctor) {
        promises.push(getDoctorById(id));
      } else {
        promises.push(Promise.resolve(doctor));
      }
      if (refreshAll || refreshJustReviews || reviews.length === 0) {
        promises.push(getDoctorReviews(id));
      } else {
        promises.push(Promise.resolve({ results: reviews, next: reviewsNextPageUrl, previous: null, count: reviewsTotalCount } as PaginatedResponse<DoctorReview>));
      }
      if (refreshAll || availability.length === 0) {
        promises.push(getDoctorAvailability(id));
      } else {
        promises.push(Promise.resolve({ results: availability, next: null, previous: null, count: availability.length } as PaginatedResponse<DoctorAvailability>));
      }

      const [docResult, reviewResult, availResult] = await Promise.allSettled(promises);

      if (docResult.status === 'fulfilled') setDoctor(docResult.value as Doctor);
      else if (refreshAll || !doctor) throw docResult.reason;

      if (reviewResult.status === 'fulfilled') {
        const reviewResponse = reviewResult.value as PaginatedResponse<DoctorReview>;
        setReviews(reviewResponse.results);
        setReviewsNextPageUrl(reviewResponse.next);
        setReviewsTotalCount(reviewResponse.count);
      } else if (refreshAll || refreshJustReviews) {
        setErrorReviews((reviewResult.reason as Error)?.message || "Failed to load reviews.");
      }

      if (availResult.status === 'fulfilled') {
        const availResponse = availResult.value as PaginatedResponse<DoctorAvailability>;
        setAvailability(availResponse.results);
      } else if (refreshAll || availability.length === 0) {
        // Don't overwrite main error if doc load failed
        if (!error) setError((availResult.reason as Error)?.message || "Failed to load availability.");
      }

    } catch (err) {
      console.error("Error loading doctor data:", err);
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsLoadingReviews(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [doctorId]);

  useEffect(() => {
    loadDoctorData(true);
  }, [loadDoctorData]);

useEffect(() => {
  if (
    followUpState?.openBookingModalDirectly &&
    doctor &&
    availability.length > 0 &&
    !showBookingModal &&
    !followUpHandledRef.current
  ) {
    setShowBookingModal(true);
    followUpHandledRef.current = true;

    // Clean the location.state without causing another render loop
    navigate(location.pathname, { replace: true });
  }
}, [followUpState, doctor, availability, showBookingModal, navigate, location.pathname]);


  const loadMoreReviews = async () => {
    if (!reviewsNextPageUrl || isLoadingMoreReviews || !doctorId) return;

    setIsLoadingMoreReviews(true);
    setErrorReviews(null);

    try {
      const response = await getDoctorReviews(parseInt(doctorId, 10), reviewsNextPageUrl);
      if (response && Array.isArray(response.results)) {
        setReviews(prevReviews => [...prevReviews, ...response.results]);
        setReviewsNextPageUrl(response.next);
      } else {
        console.warn("Unexpected load more reviews structure:", response);
        setErrorReviews("Failed to process more reviews.");
        setReviewsNextPageUrl(null);
      }
    } catch (err) {
      console.error("Failed to load more reviews:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to load more reviews.";
      setErrorReviews(errorMessage);
    } finally {
      setIsLoadingMoreReviews(false);
    }
  };

  const handleReviewSubmitSuccess = () => {
    loadDoctorData(false, true);
  };

  const handleOpenBookingModal = () => setShowBookingModal(true);
  const handleCloseBookingModal = () => setShowBookingModal(false);

  const handleBookingSuccess = (newAppointment: Appointment) => {
    setShowBookingModal(false);
    toast.success(`Appointment booked successfully for ${new Date(newAppointment.date + 'T00:00:00Z').toLocaleDateString()} at ${formatTime(newAppointment.start_time)}!`);
    navigate(`/appointments/${newAppointment.id}`);
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

  if (isLoading && !doctor) return <LoadingSpinner />;
  if (error && !doctor) return <div className="text-center py-10"><ErrorMessage message={error} /><Link to="/doctors" className="mt-4 btn-primary">Back to Doctors</Link></div>;
  if (!doctor) return <div className="text-center py-10"><p className="text-muted">Doctor not found.</p><Link to="/doctors" className="mt-4 btn-primary">Back to Doctors</Link></div>;

  // Check if the current user has already reviewed this doctor
  const hasUserReviewed = reviews.some(review => review.user === user?.id);

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <Link to="/doctors" className="inline-flex items-center text-primary hover:text-primary-dark mb-4 text-sm group">
        <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" />
        Back to Doctors List
      </Link>

      {/* Main doctor info card */}
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="p-6 md:flex md:items-center md:space-x-8 bg-gradient-to-br from-sky-50 via-indigo-50 to-purple-50">
          <div className="md:w-1/3 lg:w-1/4 flex justify-center md:justify-start mb-6 md:mb-0">
            <SmartImage
              src={doctor.profile_picture || placeholderImage}
              placeholderSrc={placeholderImage}
              alt={doctor.full_name}
              width={160}
              height={160}
              eager={true}
              className="h-40 w-40 rounded-full overflow-hidden border-4 border-white shadow-lg"
            />
          </div>
          <div className="text-center md:text-left md:flex-grow">
            <div className="flex items-center justify-center md:justify-start mb-1">
              <h1 className="text-3xl font-bold text-gray-900 mr-2">{doctor.full_name}</h1>
              {doctor.is_verified && <CheckBadgeIcon className="h-7 w-7 text-primary" title="Verified Doctor" />}
            </div>
            <p className="text-primary font-semibold text-lg mb-2">
              {doctor.specialties.map(spec => spec.name).join(', ')}
            </p>
            <div className="flex items-center justify-center md:justify-start text-sm text-gray-600 space-x-4">
              <span className="flex items-center">
                <StarIcon className="h-5 w-5 text-yellow-400 mr-1" />
                {doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'New'} ({reviewsTotalCount} reviews)
              </span>
              <span className="flex items-center">
                <AcademicCapIcon className="h-5 w-5 text-gray-500 mr-1" />
                {doctor.years_of_experience} Yrs Experience
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-2 line-clamp-3 md:line-clamp-none">{doctor.bio || "No biography provided."}</p>
          </div>
          <div className="mt-6 md:mt-0 flex flex-col items-center md:items-end space-y-3 md:w-1/4 lg:w-auto">
            <span className="text-2xl font-bold text-primary">
              Fee: {doctor.consultation_fee ? `₦${parseFloat(doctor.consultation_fee).toLocaleString()}` : 'N/A'}
            </span>
            {isAuthenticated ? (
              <button onClick={handleOpenBookingModal} className="btn-primary w-full md:w-auto px-6 py-2.5 text-base inline-flex items-center justify-center">
                <UserPlusIcon className="h-5 w-5 mr-2" /> Book Appointment
              </button>
            ) : (
              <Link to="/login" state={{ from: location }} className="btn-primary w-full md:w-auto px-6 py-2.5 text-base text-center inline-flex items-center justify-center">
                <UserPlusIcon className="h-5 w-5 mr-2" /> Login to Book
              </Link>
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 space-y-8">
          {doctor.bio && (
            <section>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">About Dr. {doctor.last_name}</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{doctor.bio}</p>
            </section>
          )}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <LanguageIcon className="h-5 w-5 mr-2 text-primary" /> Languages Spoken
              </h4>
              <p className="text-gray-700">{doctor.languages_spoken || 'Not specified'}</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-2 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2 text-primary" /> Education & Credentials
              </h4>
              <p className="text-gray-700 whitespace-pre-line">{doctor.education || 'Not specified'}</p>
            </div>
          </section>

          <section>
            <AvailabilityDisplay availability={availability} />
            {availability.length === 0 && !isLoading && (
              <p className="text-muted text-sm mt-2">Availability information is currently not set up for this doctor.</p>
            )}
          </section>

          <section>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Patient Reviews ({reviewsTotalCount})</h3>
            {isLoadingReviews && !reviews.length && <LoadingSpinner />}
            {!isLoadingReviews && errorReviews && <ErrorMessage message={errorReviews} />}
            {!isLoadingReviews && !errorReviews && reviews.length === 0 && (
              <p className="text-muted text-sm">No reviews yet for this doctor. Be the first to share your experience!</p>
            )}
            {reviews.length > 0 && (
              <div className="space-y-5 max-h-[500px] overflow-y-auto pr-2 -mr-2 custom-scrollbar">
                {reviews.map(review => <ReviewCard key={review.id} review={review} />)}
                {/* Add Load More button if there are more reviews */}
                {reviewsNextPageUrl && (
                  <div className="text-center py-2">
                    <button 
                      onClick={loadMoreReviews} 
                      disabled={isLoadingMoreReviews}
                      className="text-primary hover:text-primary-dark text-sm font-medium"
                    >
                      {isLoadingMoreReviews ? 'Loading...' : 'Load More Reviews'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {isAuthenticated && !hasUserReviewed && (
              <ReviewForm doctorId={doctor.id} onSubmitSuccess={handleReviewSubmitSuccess} />
            )}
            {isAuthenticated && hasUserReviewed && (
              <p className="text-sm text-green-600 mt-4 p-3 bg-green-50 rounded-md">Thanks for your review!</p>
            )}
            {!isAuthenticated && (
              <p className="text-muted text-sm mt-6">Please <Link to="/login" state={{ from: location }} className='text-primary underline hover:text-primary-dark'>login</Link> to write a review.</p>
            )}
          </section>
        </div>
      </div>

      <Modal isOpen={showBookingModal} onClose={handleCloseBookingModal} title={`Book with ${doctor.full_name}`}>
        <AppointmentBookingForm
          doctorId={doctor.id}
          doctorName={doctor.full_name}
          availability={availability}
          onBookingSuccess={handleBookingSuccess}
          onCancel={handleCloseBookingModal}
          isFollowUp={followUpState?.isFollowUp}
          prefillReason={followUpState?.prefillReason}
        />
      </Modal>
    </div>
  );
};

export default DoctorDetailPage;