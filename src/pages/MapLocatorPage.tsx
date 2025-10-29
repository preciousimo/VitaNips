// src/pages/MapLocatorPage.tsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L, { LatLngExpression } from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getPharmacies } from '../api/pharmacy';
import { getEmergencyServices, EmergencyService } from '../api/emergency';
import { Pharmacy } from '../types/pharmacy';
import { PaginatedResponse } from '../types/common';

import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

type Service = Pharmacy | EmergencyService;

const RecenterMap = ({ center }: { center: LatLngExpression }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center);
    }, [center, map]);
    return null;
};

const MapLocatorPage: React.FC = () => {
    const [mapCenter, setMapCenter] = useState<LatLngExpression>([7.3776, 3.9470]);
    const [userLocation, setUserLocation] = useState<LatLngExpression | null>(null);
    const [zoomLevel] = useState<number>(13);
    const [radiusKm, setRadiusKm] = useState<number>(5);
    const [serviceType, setServiceType] = useState<'all' | 'pharmacy' | 'hospital'>('all');
    const [services, setServices] = useState<Service[]>([]);
    const [isLoadingLocation, setIsLoadingLocation] = useState<boolean>(true);
    const [isLoadingServices, setIsLoadingServices] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const locationFetched = useRef(false);

     useEffect(() => {
        setIsLoadingLocation(true);
        setError(null);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const currentLoc: LatLngExpression = [latitude, longitude];
                setUserLocation(currentLoc);
                setMapCenter(currentLoc);
                locationFetched.current = true;
                setIsLoadingLocation(false);
                console.log("User location:", currentLoc);
            },
            (geoError) => {
                console.error("Geolocation Error:", geoError);
                setError(`Geolocation Error: ${geoError.message}. Please enable location services.`);
                setMapCenter([7.3776, 3.9470]);
                locationFetched.current = true;
                setIsLoadingLocation(false);
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    }, []);

    const fetchServices = useCallback(async () => {
        if (!userLocation && !error) return;

        const searchCenter = userLocation || mapCenter;
        const lat = Array.isArray(searchCenter) ? searchCenter[0] : searchCenter.lat;
        const lon = Array.isArray(searchCenter) ? searchCenter[1] : searchCenter.lng;

        setIsLoadingServices(true);
        setError(null);
        setServices([]);

        try {
            const fetchPromises: Promise<PaginatedResponse<Service>>[] = [];

            const params = { lat, lon, radius: radiusKm };

            if (serviceType === 'all' || serviceType === 'pharmacy') {
                fetchPromises.push(getPharmacies(params) as Promise<PaginatedResponse<Service>>);
            }
            if (serviceType === 'all' || serviceType === 'hospital') {
                fetchPromises.push(getEmergencyServices({ ...params, service_type: 'hospital' }) as Promise<PaginatedResponse<Service>>);
            }

            const responses = await Promise.all(fetchPromises) as PaginatedResponse<Service>[];

            let combinedResults: Service[] = [];
            responses.forEach(response => {
                if (response && Array.isArray(response.results)) {
                    combinedResults = combinedResults.concat(response.results);
                } else {
                     console.warn("Received unexpected structure in one of the service responses:", response);
                }
            });

            const uniqueResults = Array.from(new Map(combinedResults.map(item => [item.id, item])).values());
            setServices(uniqueResults);

        } catch (fetchError: unknown) {
            console.error("Failed to fetch services:", fetchError);
            const message = fetchError instanceof Error && fetchError.message ? fetchError.message : "Failed to load nearby services.";
            setError(message);
            setServices([]);
        } finally {
            setIsLoadingServices(false);
        }
    }, [userLocation, mapCenter, radiusKm, serviceType, error]);

    useEffect(() => {
        if (locationFetched.current) {
             fetchServices();
        }
    }, [fetchServices]);

     return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">Nearby Services</h1>

            <div className="bg-white p-4 rounded shadow mb-4 flex flex-wrap gap-4 items-center">
                <div>
                    <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700 mr-2">Service Type:</label>
                    <select
                        id="serviceType"
                        value={serviceType}
                        onChange={(e) => setServiceType(e.target.value as 'all' | 'pharmacy' | 'hospital')}
                        className="input-field py-1"
                        disabled={isLoadingServices}
                    >
                        <option value="all">All</option>
                        <option value="pharmacy">Pharmacies</option>
                        <option value="hospital">Hospitals</option>
                    </select>
                </div>
                <div>
                    <label htmlFor="radius" className="block text-sm font-medium text-gray-700 mr-2">Search Radius (km):</label>
                    <input
                        type="number"
                        id="radius"
                        min="1"
                        max="50"
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(Math.max(1, parseInt(e.target.value) || 1))}
                        className="input-field py-1 w-20"
                        disabled={isLoadingServices}
                    />
                </div>
                <button onClick={fetchServices} disabled={isLoadingServices || isLoadingLocation} className='btn-primary py-1 px-4 self-end'>
                    {isLoadingServices ? 'Searching...' : 'Search Area'}
                </button>
                {isLoadingLocation && <span className="text-sm text-muted self-end">Getting location...</span>}
            </div>

             {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
                   {error}
                </div>
             )}

            <div className="h-[60vh] w-full rounded shadow overflow-hidden relative">
                {(isLoadingServices || isLoadingLocation) && (
                    <div className="absolute inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-10">
                        <p className="text-white font-semibold bg-black bg-opacity-70 px-4 py-2 rounded">
                            {isLoadingLocation ? 'Getting Location...' : 'Loading Services...'}
                        </p>
                    </div>
                )}
                <MapContainer center={mapCenter} zoom={zoomLevel} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
                     {userLocation && <RecenterMap center={userLocation} />}

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {userLocation && (
                        <>
                            <Marker position={userLocation} title="Your Location">
                                <Popup>Your approximate location.</Popup>
                            </Marker>
                            <Circle center={userLocation} radius={radiusKm * 1000} pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }} />
                        </>
                    )}

                    {services.map(service => (
                         (typeof service.latitude === 'number' && typeof service.longitude === 'number') && (
                            <Marker key={`${('service_type' in service ? service.service_type : 'pharmacy')}-${service.id}`} position={[service.latitude, service.longitude]}>
                                <Popup>
                                    <b>{service.name}</b><br />
                                    {service.address}<br/>
                                    {'service_type' in service && `Type: ${service.service_type}`}<br/>
                                    {service.phone_number && `Phone: ${service.phone_number}`}
                                </Popup>
                            </Marker>
                         )
                    ))}
                </MapContainer>
            </div>
        </div>
    );

};

export default MapLocatorPage;