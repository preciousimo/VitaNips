// src/pages/HealthLibraryPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpenIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const articles = [
    { title: "Healthy Eating for a Better Life", path: "/health-library/healthy-eating", description: "Learn the key principles and tips for a balanced diet." },
    { title: "Understanding Diabetes", path: "/health-library/understanding-diabetes", description: "An overview of diabetes types, symptoms, and management." },
    // Add more articles here
];

const HealthLibraryPage: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <div className="mb-8 text-center">
                <BookOpenIcon className="h-12 w-12 text-primary mx-auto mb-2" />
                <h1 className="text-3xl font-bold text-gray-800">Health & Wellness Library</h1>
                <p className="mt-2 text-lg text-gray-600">Browse our collection of articles and resources.</p>
            </div>
            <div className="space-y-4">
                {articles.map(article => (
                    <Link key={article.path} to={article.path} className="block p-6 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 group">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-semibold text-primary group-hover:text-primary-dark">{article.title}</h2>
                                <p className="text-sm text-gray-600 mt-1">{article.description}</p>
                            </div>
                            <ChevronRightIcon className="h-6 w-6 text-gray-400 group-hover:text-primary transition-colors" />
                        </div>
                    </Link>
                ))}
                {articles.length === 0 && <p className="text-center text-gray-500">No articles available at the moment. Check back soon!</p>}
            </div>
        </div>
    );
};
export default HealthLibraryPage;