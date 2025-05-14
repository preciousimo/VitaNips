// src/pages/articles/HealthyEatingTipsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const HealthyEatingTipsPage: React.FC = () => {
    return (
        <div className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
            <Link to="/health-library" className="inline-flex items-center text-primary hover:underline mb-6 text-sm group">
                <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:-translate-x-0.5 transition-transform" /> Back to Health Library
            </Link>

            <article className="prose lg:prose-lg xl:prose-xl mx-auto bg-white p-6 sm:p-8 rounded-xl shadow-lg">
                <div className="flex items-center text-primary mb-4">
                    <BookOpenIcon className="h-8 w-8 mr-3"/>
                    <h1 className="!text-3xl !mb-0 font-bold text-gray-800">Healthy Eating for a Better Life</h1>
                </div>
                <p className="text-sm text-gray-500 mb-6">Published: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

                <p>
                    Eating a healthy diet is not about strict limitations, staying unrealistically thin, or depriving yourself of the foods you love.
                    Rather, it’s about feeling great, having more energy, improving your health, and boosting your mood.
                </p>

                <h2>Key Principles of Healthy Eating</h2>
                <ol>
                    <li><strong>Eat plenty of fruits and vegetables:</strong> Aim for at least five servings a day. They are packed with vitamins, minerals, and fiber.</li>
                    <li><strong>Choose whole grains:</strong> Opt for whole-grain bread, pasta, rice, and oats over refined grains.</li>
                    <li><strong>Include lean protein:</strong> Good sources include fish, poultry, beans, lentils, nuts, and seeds.</li>
                    <li><strong>Limit unhealthy fats:</strong> Reduce saturated and trans fats. Choose healthy unsaturated fats from sources like avocados, nuts, and olive oil.</li>
                    <li><strong>Reduce sugar intake:</strong> Be mindful of added sugars in drinks, sweets, and processed foods.</li>
                    <li><strong>Stay hydrated:</strong> Drink plenty of water throughout the day.</li>
                    <li><strong>Practice mindful eating:</strong> Pay attention to your hunger and fullness cues. Eat slowly and savor your food.</li>
                </ol>

                <h2>Tips for Success</h2>
                <ul>
                    <li>Plan your meals ahead of time.</li>
                    <li>Read food labels to make informed choices.</li>
                    <li>Control portion sizes.</li>
                    <li>Don't skip breakfast.</li>
                    <li>Allow yourself occasional treats in moderation.</li>
                </ul>
                <p className="mt-6 text-xs text-gray-500">
                    Disclaimer: This article provides general information and does not constitute medical advice. Always consult with a healthcare professional or registered dietitian for personalized dietary guidance.
                </p>
            </article>
        </div>
    );
};
export default HealthyEatingTipsPage;