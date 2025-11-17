import React, { useState } from 'react';
import { COLLEGES } from '../constants';

interface CreateCommunityPageProps {
    onCreateCommunity: (name: string, description: string, profilePictureUrl: string, college: string) => void;
    onBack: () => void;
}

export const CreateCommunityPage: React.FC<CreateCommunityPageProps> = ({ onCreateCommunity, onBack }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [profilePictureUrl, setProfilePictureUrl] = useState('');
    const [college, setCollege] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !college) return;
        setLoading(true);
        // The logic in App.tsx handles the redirect to the new community page
        onCreateCommunity(name, description, profilePictureUrl, college);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl w-full">
                <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Home
                </button>
                <div className="bg-white p-10 rounded-xl shadow-lg">
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">Register Your Community</h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Create a dedicated space for your club, study group, or project.
                    </p>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="community-name" className="block text-sm font-medium text-gray-700">Community Name</label>
                            <input id="community-name" type="text" required value={name} onChange={e => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="community-description" className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea id="community-description" rows={3} required value={description} onChange={e => setDescription(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="community-profile-picture" className="block text-sm font-medium text-gray-700">Profile Picture URL (Optional)</label>
                            <input id="community-profile-picture" type="text" placeholder="https://example.com/image.png" value={profilePictureUrl} onChange={e => setProfilePictureUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
                        </div>
                        <div>
                            <label htmlFor="community-college" className="block text-sm font-medium text-gray-700">Associated College</label>
                            <select id="community-college" required value={college} onChange={e => setCollege(e.target.value)} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900">
                                <option value="">Select a college</option>
                                {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="pt-6">
                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50">
                                {loading ? 'Creating...' : 'Create Community'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};