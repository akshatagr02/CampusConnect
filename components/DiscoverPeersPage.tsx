import React, { useState, useMemo } from 'react';
import { UserProfile, View } from '../types';
import { COLLEGES, YEARS } from '../constants';
import Avatar from './Avatar';

const UserCard: React.FC<{ user: UserProfile; onViewProfile: () => void }> = ({ user, onViewProfile }) => {
  const truncatedInterests = user.interests.length > 100 ? user.interests.substring(0, 100) + '...' : user.interests;
  
  return (
    <div className="bg-white rounded-lg shadow-md flex flex-col sm:flex-row p-4 transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.02]">
        {/* Image on left */}
        <div className="flex-shrink-0 sm:mr-4 mb-4 sm:mb-0 mx-auto sm:mx-0">
            <Avatar name={user.name} className="h-28 w-28 text-4xl rounded-md" />
        </div>
        
        {/* Main content area */}
        <div className="flex-1 flex flex-col text-center sm:text-left">
            <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start">
                <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
                </div>
                <div className="text-center sm:text-right flex-shrink-0 sm:ml-4 mt-2 sm:mt-0">
                    <p className="text-sm font-semibold text-indigo-600 truncate max-w-[200px] sm:max-w-[150px]">{user.college}</p>
                    <p className="text-xs text-gray-500">{user.year}</p>
                </div>
            </div>
            
            <p className="text-sm text-gray-600 mt-2 flex-grow">{truncatedInterests}</p>
            
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mt-4 gap-4">
                <div className="flex flex-wrap gap-2 items-center justify-center sm:justify-start">
                    {user.skills.slice(0, 3).map(skill => (
                        <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">{skill}</span>
                    ))}
                    {user.skills.length > 3 && <span className="text-xs font-medium text-gray-500">+{user.skills.length - 3} more</span>}
                </div>
                <button
                    onClick={onViewProfile}
                    className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap shadow-sm w-full sm:w-auto flex-shrink-0"
                >
                    View Profile
                </button>
            </div>
        </div>
    </div>
  );
};


export const DiscoverPeersPage: React.FC<{
  currentUser: UserProfile;
  users: UserProfile[];
  setView: (view: View) => void;
}> = ({ currentUser, users, setView }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [collegeFilter, setCollegeFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => user.uid !== currentUser.uid)
      .filter(user => {
        const lowerSearch = searchTerm.toLowerCase();
        const matchesName = user.name.toLowerCase().includes(lowerSearch);
        const matchesCollege = user.college.toLowerCase().includes(lowerSearch);
        const matchesInterests = user.interests.toLowerCase().includes(lowerSearch);
        const matchesSkills = user.skills.some(skill => skill.toLowerCase().includes(lowerSearch));
        
        const matchesCollegeFilter = !collegeFilter || user.college === collegeFilter;
        const matchesYearFilter = !yearFilter || user.year === yearFilter;

        return (matchesName || matchesCollege || matchesSkills || matchesInterests) && matchesCollegeFilter && matchesYearFilter;
      });
  }, [users, currentUser.uid, searchTerm, collegeFilter, yearFilter]);

  return (
    <div className="container mx-auto p-4 md:p-8">
        <main className="w-full">
            <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Discover Peers</h1>
                <p className="text-gray-600 mt-2">Find and connect with students from various colleges and fields of study.</p>
                <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                    type="text"
                    placeholder="Search by name, interests, skill..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900 md:col-span-3"
                />
                <select value={collegeFilter} onChange={e => setCollegeFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900 md:col-span-2">
                    <option value="">All Colleges</option>
                    {COLLEGES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={yearFilter} onChange={e => setYearFilter(e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg bg-white text-gray-900">
                    <option value="">All Years</option>
                    {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                </div>
            </div>

            {filteredUsers.length > 0 ? (
                <div className="space-y-4">
                {filteredUsers.map(user => (
                    <UserCard key={user.uid} user={user} onViewProfile={() => setView({ type: 'PROFILE_DETAIL', user })} />
                ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-white rounded-2xl shadow-xl">
                    <h3 className="text-xl font-semibold text-gray-700">No users found.</h3>
                    <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
                </div>
            )}
        </main>
    </div>
  );
};
