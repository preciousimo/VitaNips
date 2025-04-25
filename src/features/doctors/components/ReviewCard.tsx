// src/features/doctors/components/ReviewCard.tsx
import React from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { DoctorReview } from '../../../types/doctors';

interface ReviewCardProps {
    review: DoctorReview;
}

// Helper function to render star ratings
const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
        stars.push(
            <StarIcon
                key={i}
                className={`h-5 w-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
            />
        );
    }
    return <div className="flex">{stars}</div>;
};

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
    const reviewDate = new Date(review.created_at).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
    });

    return (
        <div className="border-t border-gray-200 py-4">
            <div className="flex items-center justify-between mb-2">
                {/* Ideally, fetch/show user name instead of ID */}
                <span className="font-semibold text-sm text-gray-700">User {review.user}</span>
                {renderStars(review.rating)}
            </div>
            {review.comment && (
                <p className="text-gray-600 text-sm mb-1">{review.comment}</p>
            )}
            <p className="text-xs text-gray-400">{reviewDate}</p>
        </div>
    );
};

export default ReviewCard;