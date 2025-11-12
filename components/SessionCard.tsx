import React from 'react';
import { Session, UserProfile } from '../types';
import { CalendarDaysIcon, VideoCameraIcon, UsersGroupIcon } from './Icons';

// Helper to format date and time
const formatDateTime = (timestamp: { seconds: number }) => {
    if (!timestamp) return 'Not scheduled';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};

interface SessionCardProps {
    session: Session;
    currentUser: UserProfile;
    onJoinOrLeaveSession: (session: Session, action: 'join' | 'leave') => void;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session, currentUser, onJoinOrLeaveSession }) => {
    const hasJoined = session.participantIds.includes(currentUser.uid);
    const isPast = session.scheduledAt.seconds * 1000 < new Date().getTime();

    const handleJoin = () => {
        onJoinOrLeaveSession(session, 'join');
    };

    const handleLeave = () => {
        onJoinOrLeaveSession(session, 'leave');
    };

    return (
        <li className="p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-4">
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold text-indigo-700">{session.topic}</h2>
                    <p className="text-sm text-gray-500">Hosted by {session.creator}</p>
                </div>
                <div className={`text-xs font-semibold px-3 py-1 rounded-full ${session.sessionType === 'Skill Exchange' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                    {session.sessionType}
                </div>
            </div>

            <p className="text-sm text-gray-600">{session.description}</p>

            <div className="flex items-start space-x-3 pt-4 border-t text-sm text-gray-600">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{formatDateTime(session.scheduledAt)}</span>
            </div>

            <div className="flex items-start space-x-3 text-sm text-gray-600">
                <UsersGroupIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>{session.participantIds.length} participant{session.participantIds.length !== 1 ? 's' : ''}</span>
            </div>

            {session.sessionType === 'Skill Exchange' && (
                <div className="space-y-3 pt-4 border-t">
                    {session.skillsToOffer && session.skillsToOffer.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-800 mb-2">Host Offers:</h4>
                            <div className="flex flex-wrap gap-2">
                                {session.skillsToOffer.map(skill => <span key={skill} className="px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-md">{skill}</span>)}
                            </div>
                        </div>
                    )}
                    {session.skillsSought && session.skillsSought.length > 0 && (
                        <div>
                            <h4 className="font-semibold text-sm text-gray-800 mb-2">Host Seeks:</h4>
                            <div className="flex flex-wrap gap-2">
                                {session.skillsSought.map(skill => <span key={skill} className="px-2 py-1 bg-pink-100 text-pink-800 text-xs rounded-md">{skill}</span>)}
                            </div>
                        </div>
                    )}
                </div>
            )}

            <div className="pt-4 border-t">
                {isPast ? (
                    <button
                        disabled
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-400 cursor-not-allowed"
                    >
                        Session has ended
                    </button>
                ) : hasJoined ? (
                     <button
                        onClick={handleLeave}
                        className="w-full flex justify-center items-center px-4 py-2 border border-red-500 text-sm font-medium rounded-md shadow-sm text-red-600 bg-white hover:bg-red-50 transition-colors"
                    >
                        Leave Session
                    </button>
                ) : (
                    <button
                        onClick={handleJoin}
                        className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 transition-colors"
                    >
                        <VideoCameraIcon className="w-5 h-5 mr-2" />
                        Join Session
                    </button>
                )}
            </div>
        </li>
    );
};
