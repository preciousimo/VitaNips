// src/features/doctors/components/DoctorCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Doctor } from '../../../types/doctors';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const placeholderImage = '/path/to/default-doctor-avatar.png';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      <div className="h-48 bg-gray-200 flex items-center justify-center">
        <img
          src={doctor.profile_picture || placeholderImage}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          className="w-full h-full object-cover"
          onError={(e) => (e.currentTarget.src = placeholderImage)}
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xl font-semibold text-gray-800 truncate">
             {doctor.full_name}
           </h3>
           {doctor.is_verified && (
                <CheckBadgeIcon className="h-6 w-6 text-primary" title="Verified"/>
           )}
        </div>

        <p className="text-primary font-medium text-sm mb-3">
           {doctor.specialties.map(spec => spec.name).join(', ')}
        </p>

        <div className="flex items-center text-sm text-muted mb-3">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1" />
          <span>{doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'No ratings'}</span>
          <span className="mx-2">|</span>
          <span>{doctor.years_of_experience} Yrs Experience</span>
        </div>

        <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">
          {doctor.bio || "No bio available."}
        </p>

        <Link
          to={`/doctors/${doctor.id}`}
          className="mt-auto block w-full text-center bg-primary-light text-primary-dark font-semibold py-2 px-4 rounded hover:bg-primary hover:text-white transition duration-150 ease-in-out"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;