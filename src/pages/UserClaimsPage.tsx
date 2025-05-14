// src/pages/UserClaimsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon as PageIcon } from '@heroicons/react/24/outline';
import { getUserClaims, createInsuranceClaim } from '../api/insuranceClaims';
import { InsuranceClaim, InsuranceClaimPayload } from '../types/insuranceClaims';
import ClaimListItem from '../features/insurance/components/ClaimListItem';
import ClaimSubmissionForm from '../features/insurance/components/ClaimSubmissionForm';
import Modal from '../components/common/Modal';
import toast from 'react-hot-toast';

const UserClaimsPage: React.FC = () => {
    const [claims, setClaims] = useState<InsuranceClaim[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
    const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
    const [totalCount, setTotalCount] = useState<number>(0);

    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [isSubmittingForm, setIsSubmittingForm] = useState<boolean>(false);

    const sortClaims = (data: InsuranceClaim[]): InsuranceClaim[] => {
        return [...data].sort((a, b) => new Date(b.date_submitted).getTime() - new Date(a.date_submitted).getTime());
    };

    const fetchClaims = useCallback(async (url: string | null = null, reset: boolean = true) => {
        if (url) setIsLoadingMore(true);
        else if (reset) { setIsLoading(true); setClaims([]); setNextPageUrl(null); setTotalCount(0); }
        setError(null);

        try {
            const response = await getUserClaims(url);
            const newClaims = response.results;
            setClaims(prev => sortClaims(url ? [...prev, ...newClaims] : newClaims));
            setNextPageUrl(response.next);
            if (reset || !url) setTotalCount(response.count);
        } catch (err: any) { setError(err.message || "Failed to load your insurance claims.");
        } finally { setIsLoading(false); setIsLoadingMore(false); }
    }, []);

    useEffect(() => { fetchClaims(null, true); }, [fetchClaims]);

    const handleAddClick = () => { setShowFormModal(true); };
    const handleFormCancel = () => { setShowFormModal(false); };

    const handleFormSubmit = async (payload: InsuranceClaimPayload) => {
        setIsSubmittingForm(true);
        try {
            await createInsuranceClaim(payload);
            setShowFormModal(false);
            await fetchClaims(null, true); // Refresh list
        } catch (err) { throw err; // Let form display its own detailed error
        } finally { setIsSubmittingForm(false); }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-3 border-b">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
                    <PageIcon className="h-7 w-7 mr-2 text-primary" /> Your Insurance Claims
                </h1>
                <button onClick={handleAddClick} className="btn-primary inline-flex items-center px-3 py-2 sm:px-4 text-sm">
                    <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1.5 sm:mr-2" /> Submit New Claim
                </button>
            </div>

            <Modal isOpen={showFormModal} onClose={handleFormCancel} title="Submit New Insurance Claim">
                <ClaimSubmissionForm onSubmit={handleFormSubmit} onCancel={handleFormCancel} isSubmitting={isSubmittingForm} />
            </Modal>

            {isLoading && claims.length === 0 && <p className="text-center text-muted py-10">Loading your claims...</p>}
            {error && <p className="text-red-600 text-center py-4 bg-red-50 rounded my-4">{error}</p>}
            {!isLoading && !error && claims.length === 0 && (
                 <div className="text-center py-16 bg-gray-50 rounded-lg shadow">
                    <PageIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">No Claims Submitted Yet</h3>
                    <p className="mt-1 text-sm text-gray-500">You can submit and track your insurance claims here.</p>
                    <div className="mt-6">
                        <button onClick={handleAddClick} type="button" className="btn-primary inline-flex items-center">
                            <PlusIcon className="h-5 w-5 mr-2" /> Submit Your First Claim
                        </button>
                    </div>
                </div>
            )}

            {claims.length > 0 && (
                <div className="space-y-0"> {/* No space here, list item has margin-bottom */}
                    {claims.map(claim => <ClaimListItem key={claim.id} claim={claim} />)}
                </div>
            )}

            {nextPageUrl && !isLoadingMore && ( <div className="mt-8 text-center"> <button onClick={() => fetchClaims(nextPageUrl, false)} className="btn-primary px-6 py-2 text-sm"> Load More Claims </button> </div> )}
            {isLoadingMore && <p className="text-muted text-center py-4 text-sm">Loading more...</p>}
            {!isLoading && !nextPageUrl && totalCount > 0 && claims.length === totalCount && ( <p className="text-center text-muted text-sm mt-6">All {totalCount} claims loaded.</p> )}
        </div>
    );
};
export default UserClaimsPage;