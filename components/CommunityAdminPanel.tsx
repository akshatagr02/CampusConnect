import React, { useState, useMemo } from 'react';
import { Community, UserProfile, View } from '../types';
import Avatar from './Avatar';
import { XCircleIcon, PlusIcon } from './Icons';

interface CommunityAdminPanelProps {
  community: Community;
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setView: (view: View) => void;
  onManageAdmin: (communityId: string, adminId: string, action: 'add' | 'remove') => void;
}

export const CommunityAdminPanel: React.FC<CommunityAdminPanelProps> = ({
  community,
  currentUser,
  allUsers,
  setView,
  onManageAdmin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const admins = useMemo(() => {
    return allUsers.filter(user => community.adminIds.includes(user.uid));
  }, [allUsers, community.adminIds]);

  const nonAdmins = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    if (!lowerSearch) return [];
    
    return allUsers.filter(user => 
      !community.adminIds.includes(user.uid) &&
      (user.name.toLowerCase().includes(lowerSearch) || user.email.toLowerCase().includes(lowerSearch))
    ).slice(0, 5); // Limit results for performance
  }, [allUsers, community.adminIds, searchTerm]);

  const handleAddAdmin = (user: UserProfile) => {
    onManageAdmin(community.id, user.uid, 'add');
    setSearchTerm('');
  };

  const handleRemoveAdmin = (user: UserProfile) => {
    if (user.uid === community.ownerId) {
      alert("The community owner cannot be removed.");
      return;
    }
    if (window.confirm(`Are you sure you want to remove ${user.name} as an admin?`)) {
      onManageAdmin(community.id, user.uid, 'remove');
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen">
        <div className="container mx-auto p-4 md:p-8 max-w-2xl">
            <button onClick={() => setView({ type: 'COMMUNITY_PAGE', community })} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Back to {community.name}
            </button>
            
            <div className="bg-white rounded-2xl shadow-xl p-6 space-y-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Manage Admins</h1>
                    <p className="text-gray-600 mt-2">Add or remove administrators for your community.</p>
                </div>

                {/* Add New Admin Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Admin</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                        />
                         {nonAdmins.length > 0 && (
                            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {nonAdmins.map(user => (
                                    <li key={user.uid} className="p-3 hover:bg-gray-100 flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-gray-500">{user.email}</p>
                                        </div>
                                        <button onClick={() => handleAddAdmin(user)} className="p-2 rounded-full bg-green-100 text-green-700 hover:bg-green-200">
                                            <PlusIcon className="w-5 h-5" />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>

                {/* Current Admins Section */}
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Current Admins ({admins.length})</h2>
                    <ul className="space-y-3">
                        {admins.map(admin => (
                            <li key={admin.uid} className="p-3 border rounded-lg flex justify-between items-center">
                                <div className="flex items-center space-x-3">
                                    <Avatar name={admin.name} className="h-10 w-10 text-sm" />
                                    <div>
                                        <p className="font-semibold text-gray-800">{admin.name}</p>
                                        <p className="text-xs text-gray-500">{admin.uid === community.ownerId ? 'Owner' : 'Admin'}</p>
                                    </div>
                                </div>
                                {currentUser.uid === community.ownerId && admin.uid !== community.ownerId && (
                                     <button onClick={() => handleRemoveAdmin(admin)} className="p-2 rounded-full hover:bg-red-100 text-red-600">
                                        <XCircleIcon className="w-6 h-6" />
                                     </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    </div>
  );
};
