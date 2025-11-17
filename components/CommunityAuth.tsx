import React, { useState, useMemo } from 'react';
import { Community, UserProfile, View } from '../types';
import { BuildingOfficeIcon, PlusIcon, UsersGroupIcon } from './Icons';

// A new, more visually appealing card for each community.
const CommunityCard: React.FC<{ community: Community; onClick: () => void }> = ({ community, onClick }) => {
    const followerCount = community.followerIds?.length || 0;

    return (
        <div 
            onClick={onClick} 
            className="bg-white rounded-xl shadow-md overflow-hidden transform hover:-translate-y-1 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col h-full"
        >
            <div className="h-24 bg-gradient-to-r from-indigo-50 to-blue-100 relative">
                 <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 h-20 w-20 bg-gray-200 rounded-lg flex items-center justify-center border-4 border-white shadow-md">
                    {community.profilePictureUrl ? (
                        <img src={community.profilePictureUrl} alt={`${community.name} profile`} className="h-full w-full object-cover rounded-md" />
                    ) : (
                        <BuildingOfficeIcon className="h-10 w-10 text-gray-500" />
                    )}
                </div>
            </div>

            <div className="p-4 pt-12 text-center flex-grow flex flex-col">
                <h3 className="text-lg font-bold text-gray-800 truncate" title={community.name}>{community.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-1">{community.college}</p>
                <p className="text-sm text-gray-600 mt-3 line-clamp-3 flex-grow">{community.description}</p>
            </div>
            
            <div className="p-4 border-t mt-auto">
                <div className="flex items-center justify-center text-sm text-gray-600">
                    <UsersGroupIcon className="w-5 h-5 mr-2 text-gray-500" />
                    <span className="font-semibold">{followerCount}</span>
                    <span className="ml-1">Follower{followerCount !== 1 ? 's' : ''}</span>
                </div>
            </div>
        </div>
    );
};

interface CommunityAuthProps {
  communities: Community[];
  setView: (view: View) => void;
  currentUser: UserProfile | null;
}

export const CommunityAuth: React.FC<CommunityAuthProps> = ({ communities, setView, currentUser }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCommunities = useMemo(() => {
    return communities.filter(community => 
      community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      community.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [communities, searchTerm]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="text-center mb-8 md:mb-12">
            <BuildingOfficeIcon className="mx-auto h-12 w-12 text-indigo-600" />
            <h1 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                Student Communities
            </h1>
            <p className="mt-2 text-md text-gray-600 max-w-2xl mx-auto">
                Find and join student-led groups, or create your own to bring people together.
            </p>
        </div>
        
        {/* Search */}
        <div className="mb-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg flex flex-col sm:flex-row gap-4 items-center sticky top-20 sm:top-24 z-40">
            <div className="relative flex-grow w-full">
                <input
                    type="text"
                    placeholder="Search for a community by name or description..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                />
                <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
        </div>

        {/* Community Grid */}
        {filteredCommunities.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                {filteredCommunities.map(community => (
                    <CommunityCard
                        key={community.id}
                        community={community}
                        onClick={() => setView({ type: 'COMMUNITY_PAGE', community })}
                    />
                ))}
            </div>
        ) : (
            <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-4 text-xl font-semibold text-gray-700">No communities found.</h3>
                <p className="text-gray-500 mt-2">
                    {searchTerm ? "Try a different search term." : "Why not be the first to create one?"}
                </p>
            </div>
        )}
      </div>
    </div>
  );
};