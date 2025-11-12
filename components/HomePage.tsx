import React, { useState, useMemo } from 'react';
import { UserProfile, View } from '../types';
import { COLLEGES, YEARS } from '../constants';
import Avatar from './Avatar';

// Simple hashing function to get a consistent color for the banner
const stringToColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
      hash = hash & hash; // Ensure 32bit integer
    }
    const colorRange = [
        'from-indigo-500 to-blue-500', 
        'from-purple-500 to-pink-500', 
        'from-green-400 to-cyan-500',
        'from-orange-400 to-red-500',
        'from-teal-400 to-emerald-500'
    ];
    return colorRange[Math.abs(hash) % colorRange.length];
};


const UserCard: React.FC<{ user: UserProfile; onViewProfile: () => void }> = ({ user, onViewProfile }) => {
  const truncatedInterests = user.interests.length > 70 ? user.interests.substring(0, 70) + '...' : user.interests;
  
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transition-transform transform hover:-translate-y-2 flex flex-col">
      <div className={`h-24 bg-gradient-to-r ${stringToColor(user.uid)}`}></div>
      
      <div className="p-6 flex flex-col flex-grow text-center">
        <div className="-mt-16 mb-4">
          <Avatar name={user.name} className="h-24 w-24 text-3xl border-4 border-white shadow-lg mx-auto" />
        </div>
        
        <div>
            <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.college}</p>
            <p className="text-xs text-gray-400 mt-1">{user.year}</p>
        </div>

        <p className="text-sm text-gray-600 mt-4 flex-grow">
          "{truncatedInterests}"
        </p>

        <div className="mt-4 pt-4 border-t w-full">
            <h4 className="font-semibold text-sm text-gray-600 mb-3">Top Skills</h4>
            <div className="flex flex-wrap justify-center gap-2">
            {user.skills.slice(0, 3).map(skill => (
                <span key={skill} className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full">{skill}</span>
            ))}
            {user.skills.length > 3 && <span className="px-3 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">+{user.skills.length - 3} more</span>}
            </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 border-t mt-auto">
        <button
          onClick={onViewProfile}
          className="w-full px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
        >
          View Profile
        </button>
      </div>
    </div>
  );
};

export const HomePage: React.FC<{
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
        const matchesSkills = user.skills.some(skill => skill.toLowerCase().includes(lowerSearch));
        
        const matchesCollegeFilter = !collegeFilter || user.college === collegeFilter;
        const matchesYearFilter = !yearFilter || user.year === yearFilter;

        return (matchesName || matchesCollege || matchesSkills) && matchesCollegeFilter && matchesYearFilter;
      });
  }, [users, currentUser.uid, searchTerm, collegeFilter, yearFilter]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Discover Peers</h1>
        <p className="text-gray-600 mt-2">Find and connect with students from various colleges and fields of study.</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search by name, college, or skill..."
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredUsers.map(user => (
            <UserCard key={user.uid} user={user} onViewProfile={() => setView({ type: 'PROFILE_DETAIL', user })} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <h3 className="text-xl font-semibold text-gray-700">No users found.</h3>
            <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
        </div>
      )}
    </div>
  );
};