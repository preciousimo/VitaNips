// src/features/health/components/FoodLogListItem.tsx
import React from 'react';
import { FoodLog } from '../../../types/healthLogs';
import { PencilSquareIcon, TrashIcon, ClockIcon, ShoppingBagIcon } from '@heroicons/react/24/outline'; // ShoppingBag for food

interface FoodLogListItemProps {
    log: FoodLog;
    onEdit: (log: FoodLog) => void;
    onDelete: (id: number) => void;
}

const formatDateTimeDisplay = (isoString: string | null | undefined) => {
    if (!isoString) return 'N/A';
    try {
        return new Date(isoString).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch { return isoString; }
};

const FoodLogListItem: React.FC<FoodLogListItemProps> = ({ log, onEdit, onDelete }) => {
    const nutritionSummary = [
        log.calories ? `${log.calories} kcal` : null,
        log.proteins ? `${log.proteins}g P` : null,
        log.carbohydrates ? `${log.carbohydrates}g C` : null,
        log.fats ? `${log.fats}g F` : null,
    ].filter(Boolean).join(' | ');

    return (
        <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-all duration-200 ease-in-out mb-3 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
                <div className="flex-grow">
                    <div className="flex items-center mb-1">
                        <ShoppingBagIcon className="h-5 w-5 mr-2 flex-shrink-0 text-green-600" />
                        <h3 className="font-semibold text-gray-800 text-md">{log.food_item}</h3>
                    </div>
                    <p className="text-sm text-gray-700 ml-7 capitalize">
                        Meal: <span className="font-medium">{log.meal_type}</span>
                    </p>
                    <p className="text-xs text-gray-600 ml-7 mt-1 flex items-center">
                        <ClockIcon className="h-3 w-3 mr-1"/> Eaten: {formatDateTimeDisplay(log.datetime)}
                    </p>
                    {nutritionSummary && (
                        <p className="text-xs text-gray-500 ml-7 mt-1">{nutritionSummary}</p>
                    )}
                    {log.notes && (
                        <p className="text-xs text-gray-500 mt-2 pt-2 border-t border-gray-200 ml-7">
                            <span className="font-medium">Notes:</span> {log.notes}
                        </p>
                    )}
                </div>
                <div className="flex flex-col space-y-1 flex-shrink-0 ml-2">
                    <button onClick={() => onEdit(log)} className="p-1.5 rounded-full text-blue-600 hover:text-blue-800 hover:bg-blue-100" title="Edit Log"><PencilSquareIcon className="h-5 w-5" /></button>
                    <button onClick={() => onDelete(log.id)} className="p-1.5 rounded-full text-red-500 hover:text-red-700 hover:bg-red-100" title="Delete Log"><TrashIcon className="h-5 w-5" /></button>
                </div>
            </div>
        </div>
    );
};
export default FoodLogListItem;