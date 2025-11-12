import React from 'react';
import { Session, UserProfile, View } from '../types';
import { AcademicCapIcon, ArrowPathRoundedSquareIcon, BellIcon } from './Icons';

interface NotificationsPageProps {
  currentUser: UserProfile;
  sessions: Session[];
  setView: (view: View) => void;
  onBack: () => void;
}

const formatTimestamp = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
};

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ currentUser, sessions, setView, onBack }) => {
  const relevantSessions = sessions.filter(session => {
    // Basic criteria: session must be in the future, not created by the current user, and new since last check.
    const isFuture = session.scheduledAt.seconds * 1000 > new Date().getTime();
    const notMySession = session.creatorId !== currentUser.uid;
    const isNew = currentUser.lastCheckedNotifications ? session.createdAt.seconds > currentUser.lastCheckedNotifications.seconds : true;

    if (!isFuture || !notMySession || !isNew) {
      return false;
    }
    
    // Stricter Audience Targeting Logic:
    // A user must match BOTH the college and year criteria.
    const collegeMatch = session.targetColleges.includes('All') || session.targetColleges.includes(currentUser.college);
    const yearMatch = session.targetYears.includes('All') || session.targetYears.includes(currentUser.year);
    
    // The session is only considered relevant if the user fits the specified audience.
    return collegeMatch && yearMatch;
  });

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Home
        </button>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
                <p className="text-gray-600 mt-1">New sessions that might interest you.</p>
            </div>
            <div>
                {relevantSessions.length === 0 ? (
                     <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                        <BellIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">All Caught Up!</h3>
                        <p className="max-w-xs mt-1">You have no new notifications.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {relevantSessions.map(session => (
                            <li key={session.id} className="p-4 hover:bg-gray-50 cursor-pointer" onClick={() => setView({type: 'SKILL_SHARING'})}>
                                <div className="flex items-center space-x-4">
                                    <div className={`flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center ${session.sessionType === 'Lecture' ? 'bg-blue-100' : 'bg-green-100'}`}>
                                        {session.sessionType === 'Lecture' ? 
                                            <AcademicCapIcon className="h-6 w-6 text-blue-600" /> :
                                            <ArrowPathRoundedSquareIcon className="h-6 w-6 text-green-600" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            New {session.sessionType}: <span className="font-bold">{session.topic}</span>
                                        </p>
                                        <p className="text-sm text-gray-500 truncate">
                                            Hosted by {session.creator}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500 whitespace-nowrap">
                                            {formatTimestamp(session.createdAt)}
                                        </p>
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};