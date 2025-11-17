import React, { useState, useEffect } from 'react';
import { Community } from '../types';
import { COLLEGES } from '../constants';

interface EditCommunityFormProps {
    community: Community;
    onUpdateCommunity: (communityId: string, updatedData: Partial<Omit<Community, 'id'>>) => void;
    onClose: () => void;
}

export const EditCommunityForm: React.FC<EditCommunityFormProps> = ({ community, onUpdateCommunity, onClose }) => {
    const [name, setName] = useState(community.name);
    const [description, setDescription] = useState(community.description);
    const [profilePictureUrl, setProfilePictureUrl] = useState(community.profilePictureUrl);
    const [college, setCollege] = useState(community.college);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setName(community.name);
        setDescription(community.description);
        setProfilePictureUrl(community.profilePictureUrl);
        setCollege(community.college);
    }, [community]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !description.trim() || !college) return;
        setLoading(true);
        
        const updatedData = {
            name,
            description,
            profilePictureUrl,
            college,
        };
        
        onUpdateCommunity(community.id, updatedData);
        setLoading(false);
        onClose();
    };

    return (
        <div className="p-6">
            <form className="space-y-6" onSubmit={handleSubmit}>
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
                <div className="pt-6 flex justify-end space-x-3">
                     <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
                        Cancel
                    </button>
                    <button type="submit" disabled={loading} className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 disabled:opacity-50">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};