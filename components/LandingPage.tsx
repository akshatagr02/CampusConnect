import React from 'react';
import { Testimonial, View } from '../types';
import { QuotationMarkIcon } from './Icons';
import Avatar from './Avatar';

interface LandingPageProps {
  testimonials: Testimonial[];
  setView: (view: View) => void;
}

const TestimonialCard: React.FC<{ testimonial: Testimonial }> = ({ testimonial }) => (
  <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col h-full">
    <QuotationMarkIcon className="w-10 h-10 text-indigo-200 mb-4" />
    <p className="text-gray-600 flex-grow">"{testimonial.quote}"</p>
    <div className="mt-6 flex items-center">
      <Avatar name={testimonial.userName} className="h-12 w-12" />
      <div className="ml-4">
        <p className="font-semibold text-gray-900">{testimonial.userName}</p>
        <p className="text-sm text-gray-500">{testimonial.userCollege}</p>
      </div>
    </div>
  </div>
);

export const LandingPage: React.FC<LandingPageProps> = ({ testimonials, setView }) => {
  return (
    <div className="bg-slate-50">
      <main>
        {/* Hero Section */}
        <section className="py-20 md:py-32 bg-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              Build Your Campus Community.
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
              Create a dedicated space for your club, study group, or project. Connect with peers who share your interests and build something amazing together.
            </p>
            <button
              onClick={() => setView({ type: 'AUTH', isSigningUp: true })}
              className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transform hover:scale-105 transition-transform"
            >
              Get Started
            </button>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-20 bg-slate-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900">What Students Are Saying</h2>
              <p className="mt-2 text-md text-gray-600">Real stories from students making real connections.</p>
            </div>
            {testimonials.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {testimonials.map(testimonial => (
                  <TestimonialCard key={testimonial.id} testimonial={testimonial} />
                ))}
              </div>
            ) : (
                <div className="text-center py-10 text-gray-500">
                    <p>Be the first to share your experience!</p>
                </div>
            )}
          </div>
        </section>

        {/* Create Community CTA Section */}
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-900">Start Your Own Community</h2>
                <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-600">
                Bring your club, group, or project to life. It's easy to get started and connect with like-minded students on campus.
                </p>
                <button
                onClick={() => setView({ type: 'AUTH', isSigningUp: true })}
                className="mt-8 px-8 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-full hover:bg-indigo-700 transform hover:scale-105 transition-transform"
                >
                Create Your Community Page
                </button>
            </div>
        </section>
      </main>

       {/* Footer */}
       <footer className="bg-white border-t">
        <div className="container mx-auto px-4 py-6 text-center text-gray-500">
            &copy; {new Date().getFullYear()} Campus Connect. All rights reserved.
        </div>
       </footer>
    </div>
  );
};