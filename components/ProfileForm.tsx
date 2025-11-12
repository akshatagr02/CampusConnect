import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { COLLEGES, YEARS } from '../constants';
import { generateSkills } from '../services/geminiService';
import { TagInput } from './TagInput';
import { SparklesIcon } from './Icons';

const TestimonialCreator: React.FC<{ onSave: (quote: string) => void }> = ({ onSave }) => {
    const [quote, setQuote] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (quote.trim()) {
            onSave(quote.trim());
            setSubmitted(true);
        }
    };
    
    if (submitted) {
        return (
            <div className="bg-white p-8 rounded-2xl shadow-lg text-center border border-green-200">
                <h3 className="text-xl font-bold text-green-600">Thank you!</h3>
                <p className="text-gray-600 mt-2">Your testimonial has been submitted.</p>
            </div>
        );
    }

    return (
        <div className="bg-white p-8 rounded-2xl shadow-lg border">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Share Your Experience</h2>
            <form onSubmit={handleSubmit}>
                <textarea
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    placeholder="Tell us what you like about Campus Connect..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    rows={3}
                    maxLength={250}
                    required
                />
                <div className="flex justify-end items-center mt-3">
                    <span className="text-sm text-gray-500 mr-4">{quote.length}/250</span>
                    <button type="submit" className="px-6 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors">
                        Submit Testimonial
                    </button>
                </div>
            </form>
        </div>
    );
};


interface ProfileFormProps {
  user: UserProfile | (Omit<UserProfile, 'uid'> & { uid: string });
  onSave: (profileData: Omit<UserProfile, 'uid'>, uid: string) => void;
  isUpdating: boolean;
  onBack?: () => void;
  onSaveTestimonial?: (quote: string) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ user, onSave, isUpdating, onBack, onSaveTestimonial }) => {
  const [profile, setProfile] = useState(user);
  const [isGeneratingSkills, setIsGeneratingSkills] = useState(false);

  useEffect(() => {
    setProfile(user);
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSkillsChange = (newSkills: string[]) => {
    setProfile(prev => ({ ...prev, skills: newSkills }));
  };

  const handleGenerateSkills = async () => {
    if (!profile.interests) {
      alert("Please enter some interests first to generate skills.");
      return;
    }
    setIsGeneratingSkills(true);
    try {
      const suggestedSkills = await generateSkills(profile.interests);
      // Avoid adding duplicate skills and the error message skill
      const filteredSkills = suggestedSkills.filter(s => s !== "AI suggestion failed. Please add skills manually.");
      const newSkills = [...new Set([...profile.skills, ...filteredSkills])];
      setProfile(prev => ({ ...prev, skills: newSkills }));
    } catch (error) {
      console.error("Failed to generate skills:", error);
      // Optionally show an error to the user
    } finally {
      setIsGeneratingSkills(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { uid, ...profileData } = profile;
    onSave(profileData, uid);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        {isUpdating && onBack && (
            <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to Home
            </button>
        )}
        <div className="bg-white p-10 rounded-xl shadow-lg">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              {isUpdating ? 'Update Your Profile' : 'Create Your Profile'}
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Let others know who you are.
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="rounded-md shadow-sm space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                  <input id="name" name="name" type="text" required value={profile.name} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                  <input id="email" name="email" type="email" value={profile.email} disabled className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed" />
                </div>
                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input id="mobile" name="mobile" type="tel" required value={profile.mobile} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                </div>
                <div>
                  <label htmlFor="college" className="block text-sm font-medium text-gray-700">College</label>
                  <select id="college" name="college" required value={profile.college} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900">
                    <option value="">Select your college</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="year" className="block text-sm font-medium text-gray-700">Year of Study</label>
                  <select id="year" name="year" required value={profile.year} onChange={handleChange} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900">
                    <option value="">Select your year</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Your Interests</label>
                <textarea id="interests" name="interests" rows={4} required value={profile.interests} onChange={handleChange} placeholder="e.g., Artificial Intelligence, iOS Development, Quantum Computing..." className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"></textarea>
                <p className="mt-2 text-sm text-gray-500">Describe your academic and professional interests. This will be used to suggest relevant skills.</p>
              </div>
              <div>
                <label htmlFor="skills" className="block text-sm font-medium text-gray-700">Skills</label>
                <div className="mt-2">
                   <TagInput tags={profile.skills} setTags={handleSkillsChange} placeholder="Add a skill and press Enter" />
                </div>
                <button
                  type="button"
                  onClick={handleGenerateSkills}
                  disabled={isGeneratingSkills || !profile.interests}
                  className="mt-3 w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
                >
                  <SparklesIcon className="w-5 h-5 mr-2" />
                  {isGeneratingSkills ? 'Generating...' : 'Suggest Skills with AI'}
                </button>
              </div>
            </div>

            <div className="pt-6">
              <button
                type="submit"
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {isUpdating ? 'Save Changes' : 'Create Profile'}
              </button>
            </div>
          </form>
        </div>
        
        {isUpdating && onSaveTestimonial && (
          <div className="mt-8">
            <TestimonialCreator onSave={onSaveTestimonial} />
          </div>
        )}
      </div>
    </div>
  );
};