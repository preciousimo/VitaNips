// src/pages/LandingPage.tsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    HeartIcon, 
    BellAlertIcon, 
    CalendarDaysIcon, 
    UserGroupIcon, 
    ShieldCheckIcon, 
    DevicePhoneMobileIcon,
    CheckCircleIcon,
    ArrowRightIcon,
    PlayIcon,
    StarIcon,
    ChatBubbleLeftRightIcon,
    MapPinIcon,
    ClockIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';

const LandingPage: React.FC = () => {
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    const features = [
        {
            icon: CalendarDaysIcon,
            title: 'Smart Appointment Booking',
            description: 'Book appointments with your preferred doctors in seconds. Get instant confirmations and reminders.',
            color: 'text-blue-600'
        },
        {
            icon: BellAlertIcon,
            title: 'Medication Reminders',
            description: 'Never miss a dose with intelligent medication reminders and refill notifications.',
            color: 'text-green-600'
        },
        {
            icon: HeartIcon,
            title: 'Health Tracking',
            description: 'Monitor your vitals, symptoms, and health metrics in one comprehensive dashboard.',
            color: 'text-red-600'
        },
        {
            icon: UserGroupIcon,
            title: 'Doctor Network',
            description: 'Connect with qualified healthcare professionals across various specialties.',
            color: 'text-purple-600'
        },
        {
            icon: ShieldCheckIcon,
            title: 'Secure & Private',
            description: 'Your health data is protected with enterprise-grade security and privacy controls.',
            color: 'text-indigo-600'
        },
        {
            icon: DevicePhoneMobileIcon,
            title: 'Mobile First',
            description: 'Access your health information anywhere, anytime with our mobile-optimized platform.',
            color: 'text-orange-600'
        }
    ];

    const testimonials = [
        {
            name: 'Sarah Johnson',
            role: 'Patient',
            content: 'VitaNips has completely transformed how I manage my health. The medication reminders are a lifesaver!',
            rating: 5,
            avatar: '/api/placeholder/40/40'
        },
        {
            name: 'Dr. Michael Chen',
            role: 'Cardiologist',
            content: 'The platform makes it so easy to stay connected with my patients and provide better care.',
            rating: 5,
            avatar: '/api/placeholder/40/40'
        },
        {
            name: 'Emily Rodriguez',
            role: 'Caregiver',
            content: 'Managing my mother\'s medications and appointments has never been easier. Highly recommended!',
            rating: 5,
            avatar: '/api/placeholder/40/40'
        }
    ];

    const stats = [
        { number: '50K+', label: 'Active Users' },
        { number: '500+', label: 'Healthcare Providers' },
        { number: '99.9%', label: 'Uptime' },
        { number: '24/7', label: 'Support' }
    ];

    const benefits = [
        'Reduce medication errors by 80%',
        'Save 2+ hours per week on health management',
        'Get instant access to your health records',
        'Connect with specialists in minutes',
        'Receive personalized health insights',
        'Secure HIPAA-compliant platform'
    ];

    return (
        <div className="min-h-screen bg-white">
            {/* Navigation */}
            <nav className="bg-white shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center">
                            <img src="/logo.png" alt="VitaNips" className="h-8 w-auto" />
                            <span className="ml-2 text-xl font-bold text-primary">VitaNips</span>
                        </div>
                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
                            <a href="#testimonials" className="text-gray-600 hover:text-primary transition-colors">Testimonials</a>
                            <a href="#pricing" className="text-gray-600 hover:text-primary transition-colors">Pricing</a>
                            <Link to="/login" className="text-gray-600 hover:text-primary transition-colors">Login</Link>
                            <Link to="/register" className="btn-primary px-6 py-2 rounded-lg">
                                Get Started
                            </Link>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-primary via-primary-dark to-primary-light text-white overflow-hidden">
                <div className="absolute inset-0 bg-black opacity-10"></div>
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                                Your Health, 
                                <span className="block text-yellow-300">Simplified</span>
                            </h1>
                            <p className="text-xl lg:text-2xl text-gray-100 mb-8 leading-relaxed">
                                The all-in-one platform that connects you with healthcare providers, 
                                manages your medications, and tracks your health journey.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link 
                                    to="/register" 
                                    className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                                >
                                    Start Your Health Journey
                                    <ArrowRightIcon className="ml-2 h-5 w-5" />
                                </Link>
                                <button 
                                    onClick={() => setIsVideoModalOpen(true)}
                                    className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors inline-flex items-center justify-center"
                                >
                                    <PlayIcon className="mr-2 h-5 w-5" />
                                    Watch Demo
                                </button>
                            </div>
                            <div className="mt-8 flex items-center space-x-6 text-sm">
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                    <span>Free to start</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                    <span>No credit card required</span>
                                </div>
                                <div className="flex items-center">
                                    <CheckCircleIcon className="h-5 w-5 text-green-400 mr-2" />
                                    <span>Setup in 2 minutes</span>
                                </div>
                            </div>
                        </div>
                        <div className="relative">
                            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <CalendarDaysIcon className="h-6 w-6 text-yellow-300" />
                                            <span className="font-semibold">Next Appointment</span>
                                        </div>
                                        <p className="text-sm">Dr. Sarah Wilson - Cardiology</p>
                                        <p className="text-xs text-gray-300">Tomorrow at 2:00 PM</p>
                                    </div>
                                    <div className="bg-white/20 rounded-lg p-4">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <BellAlertIcon className="h-6 w-6 text-green-300" />
                                            <span className="font-semibold">Medication Due</span>
                                        </div>
                                        <p className="text-sm">Lisinopril 10mg</p>
                                        <p className="text-xs text-gray-300">In 30 minutes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {stats.map((stat, index) => (
                            <div key={index} className="text-center">
                                <div className="text-3xl md:text-4xl font-bold text-primary mb-2">{stat.number}</div>
                                <div className="text-gray-600">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Everything you need for better health
                        </h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                            VitaNips combines cutting-edge technology with compassionate care to deliver 
                            a healthcare experience that puts you first.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                                <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center mb-6`}>
                                    <feature.icon className={`h-6 w-6 ${feature.color}`} />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-20 bg-gradient-to-r from-primary to-primary-dark text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">
                                Why choose VitaNips?
                            </h2>
                            <p className="text-xl text-gray-100 mb-8">
                                Join thousands of users who have transformed their health management 
                                with our comprehensive platform.
                            </p>
                            <div className="space-y-4">
                                {benefits.map((benefit, index) => (
                                    <div key={index} className="flex items-center space-x-3">
                                        <CheckCircleIcon className="h-6 w-6 text-green-400 flex-shrink-0" />
                                        <span className="text-lg">{benefit}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                            <div className="space-y-6">
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                        <HeartIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Health Score</h4>
                                        <p className="text-sm text-gray-300">Excellent - 92/100</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                        <CalendarDaysIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Next Checkup</h4>
                                        <p className="text-sm text-gray-300">In 3 months</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                                        <BellAlertIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Active Reminders</h4>
                                        <p className="text-sm text-gray-300">3 medications</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            Loved by patients and providers
                        </h2>
                        <p className="text-xl text-gray-600">
                            See what our community has to say about their VitaNips experience.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                                <div className="flex items-center mb-4">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <StarIcon key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                                <div className="flex items-center">
                                    <img 
                                        src={testimonial.avatar} 
                                        alt={testimonial.name}
                                        className="w-10 h-10 rounded-full mr-3"
                                    />
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-500">{testimonial.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-primary text-white">
                <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl md:text-4xl font-bold mb-6">
                        Ready to take control of your health?
                    </h2>
                    <p className="text-xl text-gray-100 mb-8">
                        Join thousands of users who have already transformed their healthcare experience.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link 
                            to="/register" 
                            className="bg-white text-primary px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
                        >
                            Get Started Free
                            <ArrowRightIcon className="ml-2 h-5 w-5" />
                        </Link>
                        <Link 
                            to="/login" 
                            className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-primary transition-colors"
                        >
                            Sign In
                        </Link>
                    </div>
                    <p className="text-sm text-gray-300 mt-4">
                        No credit card required • Free forever plan • Setup in 2 minutes
                    </p>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div>
                            <div className="flex items-center mb-4">
                                <img src="/logo.png" alt="VitaNips" className="h-8 w-auto" />
                                <span className="ml-2 text-xl font-bold">VitaNips</span>
                            </div>
                            <p className="text-gray-400 mb-4">
                                Your health, simplified. The all-in-one platform for better healthcare management.
                            </p>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">Twitter</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                                    <span className="sr-only">LinkedIn</span>
                                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Product</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Security</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold mb-4">Support</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Status</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-gray-800 mt-8 pt-8 text-center">
                        <p className="text-gray-400">
                            © 2024 VitaNips. All rights reserved.
                        </p>
                    </div>
                </div>
            </footer>

            {/* Video Modal */}
            {isVideoModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={() => setIsVideoModalOpen(false)}></div>
                        <div className="relative bg-white rounded-lg max-w-4xl w-full p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-lg font-semibold">VitaNips Platform Demo</h3>
                                <button 
                                    onClick={() => setIsVideoModalOpen(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>
                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                <div className="text-center">
                                    <PlayIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Demo video coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LandingPage; 