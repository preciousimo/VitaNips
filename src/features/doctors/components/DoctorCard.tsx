// src/features/doctors/components/DoctorCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, CheckBadgeIcon } from '@heroicons/react/24/solid';
import { Doctor } from '../../../types/doctors';
import SmartImage from '../../../components/common/SmartImage';

interface DoctorCardProps {
  doctor: Doctor;
}

const DoctorCard: React.FC<DoctorCardProps> = ({ doctor }) => {
  const placeholderImage = '/images/doctor-placeholder.svg';

  return (
    <div className="card overflow-hidden flex flex-col hover:scale-[1.02] transition-all duration-200">
      <div className="relative overflow-hidden aspect-video bg-gray-100">
        <SmartImage
          src={doctor.profile_picture || placeholderImage}
          placeholderSrc={placeholderImage}
          alt={`Dr. ${doctor.first_name} ${doctor.last_name}`}
          className="absolute inset-0"
          eager={false}
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 100vw"
        />
      </div>
      <div className="p-5 flex flex-col flex-grow">
        <div className="flex items-center justify-between mb-2">
           <h3 className="text-xl font-semibold text-gray-800 truncate">
             {doctor.full_name}
           </h3>
           {doctor.is_verified && (
                <CheckBadgeIcon className="h-6 w-6 text-primary flex-shrink-0 ml-2" title="Verified"/>
           )}
        </div>

        <p className="text-primary font-medium text-sm mb-3">
           {doctor.specialties.map(spec => spec.name).join(', ')}
        </p>

        <div className="flex items-center text-sm text-muted mb-3">
          <StarIcon className="h-4 w-4 text-yellow-400 mr-1 flex-shrink-0" />
          <span>{doctor.average_rating > 0 ? doctor.average_rating.toFixed(1) : 'No ratings'}</span>
          <span className="mx-2">|</span>
          <span>{doctor.years_of_experience} Yrs Experience</span>
        </div>

        <p className="text-sm text-muted mb-4 line-clamp-2 flex-grow">
          {doctor.bio || "No bio available."}
        </p>

        <Link
          to={`/doctors/${doctor.id}`}
          className="mt-auto btn btn-outline text-sm py-2 px-4 text-center"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
};

export default DoctorCard;