import React, { useMemo } from 'react';
import { UserProfile, View, Session } from '../types';
import Avatar from './Avatar';
import { SessionCard } from './SessionCard';
import { AcademicCapIcon } from './Icons';


const UserCard: React.FC<{ user: UserProfile; onViewProfile: () => void }> = ({ user, onViewProfile }) => {
  return (
    <div className="bg-white rounded-xl shadow-md flex items-center p-4 w-full transition-all duration-300 ease-in-out hover:shadow-xl hover:scale-[1.01]">
      {/* Left Image */}
      <div className="flex-shrink-0 mr-6">
        <Avatar name={user.name} className="h-28 w-28 text-4xl rounded-lg" />
      </div>

      {/* Right Content */}
      <div className="flex-1 flex flex-col">
        {/* Top part: Title and College */}
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900">{user.name}</h3>
          <div className="text-right ml-4 flex-shrink-0">
              <p className="text-md font-semibold text-indigo-600 truncate max-w-[200px]">{user.college}</p>
              <p className="text-sm text-gray-500">{user.year}</p>
          </div>
        </div>
        
        {/* Bottom part: Interests and Button */}
        <div className="flex justify-between items-end mt-2 flex-grow">
            <p className="text-sm text-gray-600 mr-4">
                {user.interests.length > 200 ? user.interests.substring(0, 200) + '...' : user.interests}
            </p>
            <button
                onClick={onViewProfile}
                className="px-5 py-2 bg-gray-700 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap shadow-sm flex-shrink-0"
            >
                View Profile
            </button>
        </div>
      </div>
    </div>
  );
};

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};


export const HomePage: React.FC<{
  currentUser: UserProfile;
  users: UserProfile[];
  sessions: Session[];
  setView: (view: View) => void;
  onJoinOrLeaveSession: (session: Session, action: 'join' | 'leave') => void;
}> = ({ currentUser, users, sessions, setView, onJoinOrLeaveSession }) => {

  const randomUsers = useMemo(() => {
    const otherUsers = users.filter(user => user.uid !== currentUser.uid);
    return shuffleArray(otherUsers).slice(0, 3);
  }, [users, currentUser.uid]);

  const randomSessions = useMemo(() => {
    const upcomingSessions = sessions.filter(s => s.status === 'scheduled' && s.creatorId !== currentUser.uid);
    return shuffleArray(upcomingSessions).slice(0, 3);
  }, [sessions, currentUser.uid]);

  const discoverItems = useMemo(() => {
      const userItems = randomUsers.map(user => ({ type: 'user' as const, data: user, id: user.uid }));
      const sessionItems = randomSessions.map(session => ({ type: 'session' as const, data: session, id: session.id }));
      return shuffleArray([...userItems, ...sessionItems]);
  }, [randomUsers, randomSessions]);

  return (
    <div className="container mx-auto p-4 md:p-8 space-y-12">
      {/* Welcome banner */}
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-4xl font-bold text-gray-800">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
        <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Here's a quick look at what's happening on Campus Connect. Discover new sessions to join and peers to connect with.</p>
      </div>

      {/* Unified Discover Section */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Discover What's New</h2>
        </div>
        {discoverItems.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {discoverItems.map(item => {
                if (item.type === 'session') {
                    // SessionCard is a vertical card by design
                    return (
                        <SessionCard 
                            key={item.id} 
                            session={item.data} 
                            currentUser={currentUser} 
                            onJoinOrLeaveSession={onJoinOrLeaveSession} 
                        />
                    );
                }
                if (item.type === 'user') {
                     // UserCard is the new horizontal card
                     return (
                        <UserCard 
                            key={item.id} 
                            user={item.data} 
                            onViewProfile={() => setView({ type: 'PROFILE_DETAIL', user: item.data })} 
                        />
                     );
                }
                return null;
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-2xl shadow-lg">
              <AcademicCapIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700">Nothing new to show right now.</h3>
              <p className="text-gray-500 mt-1">Check back later or create your own session!</p>
          </div>
        )}
      </div>
    </div>
  );
};