import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeftIcon, BookOpenIcon, HeartIcon, ArrowRightIcon } from '@heroicons/react/24/outline';


const HealthyEatingTipsPage = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  
  // Animation for content reveal on page load
  useEffect(() => {
    setIsVisible(true);
  }, []);
  
  // Animation for scrolling through tips
  const nextTip = () => {
    setActiveSection((prev) => (prev + 1) % 3);
  };
  
  const prevTip = () => {
    setActiveSection((prev) => (prev === 0 ? 2 : prev - 1));
  };
  
  // Food items that will float across the screen
  interface FoodItemProps {
    emoji: string;
    delay: number;
    position: string;
  }

  const FoodItem: React.FC<FoodItemProps> = ({ emoji, delay, position }) => {
    return (
      <div 
        className={`absolute ${position} text-2xl animate-float opacity-70`} 
        style={{ animationDelay: `${delay}s` }}
      >
        {emoji}
      </div>
    );
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Floating food emojis in background */}
        <FoodItem emoji="🥦" delay={0} position="top-20 right-10" />
        <FoodItem emoji="🍎" delay={4} position="bottom-40 left-5" />
        <FoodItem emoji="🥑" delay={7} position="top-40 left-20" />
        <FoodItem emoji="🍋" delay={2} position="bottom-20 right-20" />
        <FoodItem emoji="🥕" delay={5} position="top-60 right-40" />
        
        {/* Back link with enhanced animation */}
        <div className={`transition-all duration-700 ${isVisible ? 'opacity-100' : 'opacity-0 -translate-x-4'}`}>
          <Link to="/health-library" className="inline-flex items-center text-green-600 hover:text-green-700 font-medium mb-8 text-sm group">
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Health Library</span>
          </Link>
        </div>
        
        {/* Main article with enhanced styling */}
        <article className={`bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
          {/* Hero section with decorative graphic */}
          <div className="bg-gradient-to-r from-green-400 to-blue-500 h-24 sm:h-32 relative flex items-end">
            <div className="absolute inset-0 opacity-20">
              <div className="flex justify-between px-8 pt-4">
                {['🥗', '🍓', '🥝', '🥬', '🍊', '🥦', '🍅', '🥑'].map((emoji, i) => (
                  <span key={i} className="text-xl sm:text-2xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{emoji}</span>
                ))}
              </div>
            </div>
            <div className="bg-white h-12 w-full rounded-t-3xl" />
          </div>
          
          {/* Article content */}
          <div className="p-6 sm:p-10">
            <div className="flex items-center mb-6">
              <div className="bg-green-100 p-3 rounded-full mr-4">
                <BookOpenIcon className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 leading-tight">Healthy Eating for a Better Life</h1>
                <p className="text-sm text-gray-500 mt-1">Published: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            
            <div className="prose lg:prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed">
                Eating a healthy diet is not about strict limitations, staying unrealistically thin, or depriving yourself of the foods you love.
                Rather, it's about feeling great, having more energy, improving your health, and boosting your mood.
              </p>
              
              <div className="my-8 bg-green-50 p-6 rounded-xl border-l-4 border-green-500 animate-pulse-slow">
                <div className="flex items-center mb-3">
                  <HeartIcon className="h-5 w-5 text-green-600 mr-2" />
                  <h2 className="text-xl font-semibold text-gray-800 m-0">Quick Health Benefits</h2>
                </div>
                <p className="text-gray-700 mb-0">A healthy diet can reduce your risk of heart disease, stroke, and diabetes, while improving your mood, energy levels, and overall quality of life.</p>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-800 mt-10 mb-6">Key Principles of Healthy Eating</h2>
              
              {/* Interactive tip carousel */}
              <div className="bg-blue-50 rounded-xl p-4 my-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-4">
                  <button onClick={prevTip} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
                    <ArrowLeftIcon className="h-4 w-4 text-blue-600" />
                  </button>
                  <h3 className="text-lg font-medium text-blue-800">Daily Nutrition Tips</h3>
                  <button onClick={nextTip} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition-colors">
                    <ArrowRightIcon className="h-4 w-4 text-blue-600" />
                  </button>
                </div>
                
                <div className="relative h-40">
                  <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeSection === 0 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                    <div className="flex">
                      <div className="bg-green-200 rounded-lg p-4 text-3xl mr-4">🥦</div>
                      <div>
                        <h4 className="font-medium text-gray-800">Eat colorful vegetables</h4>
                        <p className="text-gray-600">Aim for at least 5 servings daily of different colored fruits and vegetables to get a wide range of nutrients.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeSection === 1 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                    <div className="flex">
                      <div className="bg-amber-200 rounded-lg p-4 text-3xl mr-4">🌾</div>
                      <div>
                        <h4 className="font-medium text-gray-800">Choose whole grains</h4>
                        <p className="text-gray-600">Whole grains provide more nutrients and fiber than refined grains, helping you feel fuller longer.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className={`absolute inset-0 transition-all duration-500 ease-in-out ${activeSection === 2 ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}>
                    <div className="flex">
                      <div className="bg-blue-200 rounded-lg p-4 text-3xl mr-4">💧</div>
                      <div>
                        <h4 className="font-medium text-gray-800">Stay hydrated</h4>
                        <p className="text-gray-600">Drink plenty of water throughout the day. It helps maintain energy levels and aids in digestion.</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-center mt-2">
                  {[0, 1, 2].map((i) => (
                    <button 
                      key={i} 
                      onClick={() => setActiveSection(i)}
                      className={`h-2 w-2 rounded-full mx-1 transition-all ${activeSection === i ? 'bg-blue-600 w-4' : 'bg-blue-200'}`}
                    />
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mt-8">
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Healthy Eating Principles</h3>
                  <ol className="space-y-3 text-gray-700 pl-5">
                    <li><strong>Eat plenty of fruits and vegetables:</strong> Aim for at least five servings a day.</li>
                    <li><strong>Choose whole grains:</strong> Opt for whole-grain bread, pasta, rice, and oats.</li>
                    <li><strong>Include lean protein:</strong> Fish, poultry, beans, lentils, nuts, and seeds.</li>
                    <li><strong>Limit unhealthy fats:</strong> Reduce saturated and trans fats.</li>
                    <li><strong>Reduce sugar intake:</strong> Be mindful of added sugars.</li>
                    <li><strong>Stay hydrated:</strong> Drink plenty of water.</li>
                    <li><strong>Practice mindful eating:</strong> Pay attention to hunger cues.</li>
                  </ol>
                </div>
                
                <div className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition-shadow">
                  <h3 className="font-bold text-lg text-gray-800 mb-3">Tips for Success</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Plan your meals ahead of time.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Read food labels to make informed choices.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Control portion sizes.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Don't skip breakfast.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Allow yourself occasional treats in moderation.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Enjoy your food - eat slowly and savor each bite.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 italic">
                Disclaimer: This article provides general information and does not constitute medical advice. Always consult with a healthcare professional or registered dietitian for personalized dietary guidance.
              </p>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
};

// Add the required CSS styles for animations
const style = document.createElement('style');
style.textContent = `
  @keyframes float {
    0% { transform: translate(0, 0) rotate(0deg); }
    33% { transform: translate(15px, -15px) rotate(5deg); }
    66% { transform: translate(-15px, 15px) rotate(-5deg); }
    100% { transform: translate(0, 0) rotate(0deg); }
  }
  
  .animate-float {
    animation: float 12s ease-in-out infinite;
  }
  
  .animate-pulse-slow {
    animation: pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;

export default HealthyEatingTipsPage;