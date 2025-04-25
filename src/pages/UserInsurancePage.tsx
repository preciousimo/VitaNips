// src/pages/UserInsurancePage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { PlusIcon } from '@heroicons/react/24/solid';
import { getUserInsurances, addUserInsurance, updateUserInsurance, deleteUserInsurance } from '../api/insurance';
import { UserInsurance, UserInsurancePayload } from '../types/insurance';
import UserInsuranceCard from '../features/insurance/components/UserInsuranceCard';
import UserInsuranceForm from '../features/insurance/components/UserInsuranceForm';
import Modal from '../components/common/Modal';

const UserInsurancePage: React.FC = () => {
    const [insurances, setInsurances] = useState<UserInsurance[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [showFormModal, setShowFormModal] = useState<boolean>(false);
    const [editingInsurance, setEditingInsurance] = useState<UserInsurance | null>(null);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const loadInsurances = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getUserInsurances();
            // Sort primary first, then by provider name
            setInsurances(data.sort((a, b) => {
                if (a.is_primary && !b.is_primary) return -1;
                if (!a.is_primary && b.is_primary) return 1;
                return a.plan.provider.name.localeCompare(b.plan.provider.name);
            }));
        } catch (err) {
            setError("Failed to load your insurance records.");
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadInsurances();
    }, [loadInsurances]);

    const handleAddClick = () => {
        setEditingInsurance(null);
        setShowFormModal(true);
    };

    const handleEditClick = (insurance: UserInsurance) => {
        setEditingInsurance(insurance);
        setShowFormModal(true);
    };

    const handleFormCancel = () => {
        setShowFormModal(false);
        setEditingInsurance(null);
    };

    const handleFormSubmit = async (payload: UserInsurancePayload, id?: number) => {
        setIsSubmitting(true);
        try {
            if (id) {
                await updateUserInsurance(id, payload);
            } else {
                await addUserInsurance(payload);
            }
            setShowFormModal(false);
            setEditingInsurance(null);
            await loadInsurances(); // Reload list
        } catch (err: any) {
            console.error("Failed to save insurance:", err);
            // Re-throw to let the form display the error
            throw err;
        } finally {
             setIsSubmitting(false);
        }
    };

     const handleDelete = async (id: number) => {
        if (!window.confirm("Are you sure you want to remove this insurance plan from your profile?")) {
             return;
         }
         setError(null);
         try {
             await deleteUserInsurance(id);
             await loadInsurances(); // Refresh list
         } catch (err) {
             setError("Failed to remove insurance plan.");
             console.error(err);
         }
     };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Your Insurance Plans</h1>
                <button
                    onClick={handleAddClick}
                    className="btn-primary inline-flex items-center px-4 py-2"
                >
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Add Plan
                </button>
            </div>

            {/* Modal for Add/Edit Form */}
            <Modal isOpen={showFormModal} onClose={handleFormCancel} title={editingInsurance ? 'Edit Insurance Plan' : 'Add Insurance Plan'}>
                 <UserInsuranceForm
                    initialData={editingInsurance}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                    isSubmitting={isSubmitting}
                />
            </Modal>


            {/* List Area */}
            <div>
                {isLoading ? (
                    <p className="text-muted text-center py-4">Loading your insurance plans...</p>
                ) : error ? (
                    <p className="text-red-600 text-center py-4">{error}</p>
                ) : insurances.length > 0 ? (
                     <div className="space-y-4">
                        {insurances.map(ins => (
                            <UserInsuranceCard
                                key={ins.id}
                                insurance={ins}
                                onEdit={handleEditClick}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-10 bg-gray-50 rounded-md">
                        <p className="text-gray-600">You haven't added any insurance plans yet.</p>
                        <button onClick={handleAddClick} className="mt-4 btn-primary inline-flex items-center">
                           <PlusIcon className="h-5 w-5 mr-2" /> Add Your First Plan
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UserInsurancePage;