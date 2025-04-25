// src/features/pharmacy/components/PharmacyCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, PhoneIcon, ClockIcon, TruckIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Pharmacy } from '../../../types/pharmacy';

interface PharmacyCardProps {
  pharmacy: Pharmacy;
}

const PharmacyCard: React.FC<PharmacyCardProps> = ({ pharmacy }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 ease-in-out flex flex-col">
      {/* Placeholder for an image or map snippet later */}
      {/* <div className="h-32 bg-gray-200"></div> */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-2 flex items-center">
          <BuildingStorefrontIcon className="h-5 w-5 mr-2 text-primary" />
          {pharmacy.name}
        </h3>

        <div className="space-y-2 text-sm text-gray-600 mb-4 flex-grow">
          <p className="flex items-start">
            <MapPinIcon className="h-4 w-4 mr-2 mt-0.5 text-muted flex-shrink-0" />
            <span>{pharmacy.address}</span>
          </p>
          <p className="flex items-center">
            <PhoneIcon className="h-4 w-4 mr-2 text-muted flex-shrink-0" />
            <a href={`tel:${pharmacy.phone_number}`} className="hover:text-primary hover:underline">
              {pharmacy.phone_number}
            </a>
          </p>
          <p className="flex items-start">
             <ClockIcon className="h-4 w-4 mr-2 mt-0.5 text-muted flex-shrink-0" />
             <span className={pharmacy.is_24_hours ? 'font-semibold text-green-600' : ''}>
                {pharmacy.is_24_hours ? 'Open 24 Hours' : pharmacy.operating_hours}
             </span>
          </p>
          {pharmacy.offers_delivery && (
            <p className="flex items-center text-blue-600">
              <TruckIcon className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Offers Delivery</span>
            </p>
          )}
        </div>

        {/* Link to a future Pharmacy Detail Page or Map View */}
        <Link
          // to={`/pharmacy/${pharmacy.id}`} // Example route
          to="#" // Placeholder for now
          className="mt-auto block w-full text-center bg-primary-light text-primary-dark font-semibold py-2 px-4 rounded hover:bg-primary hover:text-white transition duration-150 ease-in-out text-sm"
          onClick={(e) => e.preventDefault()} // Prevent navigation for now
        >
          View Details / Map {/* Adjust text as needed */}
        </Link>
      </div>
    </div>
  );
};

export default PharmacyCard;