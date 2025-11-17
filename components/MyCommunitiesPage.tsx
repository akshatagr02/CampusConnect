import React, { useMemo } from 'react';
import { Community, UserProfile, View } from '../types';
import { BuildingOfficeIcon, PlusIcon } from './Icons';

interface MyCommunitiesPageProps {
  currentUser: UserProfile;
  communities: Community[];
  setView: (view: View) => void;
}

export const MyCommunitiesPage: React.FC<MyCommunitiesPageProps> = ({ currentUser, communities, setView }) => {
  const myAdminCommunities = useMemo(() => {
    return communities.filter(community => community.adminIds.includes(currentUser.uid));
  }, [communities, currentUser.uid]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => setView({ type: 'HOME' })} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Home
        </button>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Communities</h1>
              <p className="text-gray-600 mt-1">Communities where you are an admin.</p>
            </div>
             <button
                onClick={() => setView({ type: 'CREATE_COMMUNITY' })}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
                <PlusIcon className="w-5 h-5 mr-2" />
                Create Community
            </button>
          </div>

          <div className="p-4 sm:p-6 bg-gray-50">
            {myAdminCommunities.length > 0 ? (
              <ul className="space-y-4">
                {myAdminCommunities.map(community => (
                  <li key={community.id} className="p-4 bg-white border rounded-lg hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all flex items-start space-x-4" onClick={() => setView({ type: 'COMMUNITY_PAGE', community })}>
                    <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-md flex items-center justify-center">
                        {community.profilePictureUrl ? (
                            <img src={community.profilePictureUrl} alt={`${community.name} profile`} className="h-full w-full object-cover rounded-md" />
                        ) : (
                            <BuildingOfficeIcon className="h-8 w-8 text-gray-500" />
                        )}
                    </div>
                    <div className="flex-1">
                        <h4 className="font-bold text-gray-800">{community.name}</h4>
                        <p className="text-xs font-medium text-indigo-600 mt-1">{community.college}</p>
                        <p className="text-sm text-gray-600 line-clamp-2 mt-1">{community.description}</p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-16">
                  <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-4 text-xl font-semibold text-gray-700">You don't manage any communities.</h3>
                  <p className="text-gray-500 mt-2">
                      Click "Create Community" to start your own.
                  </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
