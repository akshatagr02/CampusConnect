import React, { useState, useEffect } from 'react';
import { Session, UserProfile, View } from '../types';
import { PlusIcon, VideoCameraIcon, CalendarDaysIcon, XCircleIcon } from './Icons';


// Helper to format date and time
const formatDateTime = (timestamp: { seconds: number }) => {
    if (!timestamp) return 'Not scheduled';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
};


// Countdown Timer component
const CountdownTimer: React.FC<{ scheduledAt: { seconds: number } }> = ({ scheduledAt }) => {
    const calculateTimeLeft = () => {
        const difference = scheduledAt.seconds * 1000 - new Date().getTime();
        let timeLeft = {};

        if (difference > 0) {
            timeLeft = {
                days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                minutes: Math.floor((difference / 1000 / 60) % 60),
                seconds: Math.floor((difference / 1000) % 60),
            };
        }
        return timeLeft as { days: number; hours: number; minutes: number; seconds: number };
    };

    const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

    useEffect(() => {
        const timer = setTimeout(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);
        return () => clearTimeout(timer);
    });

    const timerComponents: string[] = [];
    if (timeLeft.days > 0) timerComponents.push(`${timeLeft.days}d`);
    if (timeLeft.hours > 0) timerComponents.push(`${timeLeft.hours}h`);
    if (timeLeft.minutes > 0) timerComponents.push(`${timeLeft.minutes}m`);
    timerComponents.push(`${timeLeft.seconds}s`);
    
    // Prevents showing negative seconds briefly
    if (Object.keys(timeLeft).length === 0) return <span>Starting...</span>;

    return <span>Starts in {timerComponents.join(' ')}</span>;
};

const MySessionCard: React.FC<{ session: Session; onStart: (session: Session) => void; onEnd: (session: Session) => void }> = ({ session, onStart, onEnd }) => {
    const [isJoinable, setIsJoinable] = useState(false);

    useEffect(() => {
        if (!session.scheduledAt || session.status === 'completed') {
            setIsJoinable(false);
            return;
        }

        const checkJoinability = () => {
            const now = new Date().getTime();
            const scheduledTime = session.scheduledAt.seconds * 1000;
            // A host can join earlier, up to 15 mins before
            const fifteenMinutesBefore = scheduledTime - 15 * 60 * 1000;
            // Session is considered active for 2 hours after start
            const twoHoursAfter = scheduledTime + 2 * 60 * 60 * 1000;
            setIsJoinable(now >= fifteenMinutesBefore && now < twoHoursAfter);
        };

        checkJoinability();
        const interval = setInterval(checkJoinability, 1000);
        return () => clearInterval(interval);
    }, [session.scheduledAt, session.status]);

    return (
        <li className="p-4 sm:p-6 bg-white rounded-xl shadow-md space-y-4">
             <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-lg font-bold text-indigo-700">{session.topic}</h2>
                    <p className="text-sm text-gray-500">You are the host</p>
                </div>
                {session.status === 'completed' ? (
                    <div className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-200 text-gray-800">
                        Completed
                    </div>
                ) : (
                    <div className={`text-xs font-semibold px-3 py-1 rounded-full ${session.sessionType === 'Skill Exchange' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}`}>
                        {session.sessionType}
                    </div>
                )}
            </div>

            <div className="flex items-start space-x-3 pt-2 border-t text-sm text-gray-600">
                <CalendarDaysIcon className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                <span>
                    {session.status === 'completed' && session.completedAt ? 
                        `Completed on ${formatDateTime(session.completedAt)}` :
                        `Scheduled for ${formatDateTime(session.scheduledAt)}`
                    }
                </span>
            </div>
            
            <div className="pt-4 border-t">
                 {session.status === 'scheduled' ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={() => onStart(session)}
                            disabled={!isJoinable}
                            className="w-full flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                        >
                            <VideoCameraIcon className="w-5 h-5 mr-2" />
                            {isJoinable ? 'Manage & Join' : (session.scheduledAt ? <CountdownTimer scheduledAt={session.scheduledAt} /> : 'Not Yet Scheduled')}
                        </button>
                        <button
                            onClick={() => onEnd(session)}
                            className="w-full sm:w-auto flex justify-center items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                        >
                            <XCircleIcon className="w-5 h-5 mr-2 text-red-500" />
                            End Session
                        </button>
                    </div>
                 ) : (
                    <p className="text-center text-sm text-gray-500 font-medium">This session has been completed.</p>
                 )}
            </div>
        </li>
    );
};

interface MySessionsPageProps {
    currentUser: UserProfile;
    sessions: Session[];
    setView: (view: View) => void;
    onBack: () => void;
    onJoin: (session: Session, action: 'join' | 'leave') => void;
    onEndSession: (session: Session) => void;
}

export const MySessionsPage: React.FC<MySessionsPageProps> = ({ currentUser, sessions, setView, onBack, onJoin, onEndSession }) => {
    const mySessions = sessions.filter(s => s.creatorId === currentUser.uid);

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
                <div className="p-6 border-b flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
                        <p className="text-gray-600 mt-1">Manage the sessions you've created.</p>
                    </div>
                    <button
                        onClick={() => setView({ type: 'CREATE_SESSION' })}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Create New Session
                    </button>
                </div>
                <div className="p-4 sm:p-6 bg-gray-50">
                  {mySessions.length === 0 ? (
                    <div className="py-10 text-center text-gray-500 flex flex-col items-center">
                      <VideoCameraIcon className="h-16 w-16 text-gray-400 mb-4" />
                      <h3 className="text-lg font-semibold text-gray-700">You haven't created any sessions</h3>
                      <p className="max-w-xs mt-1">Click the button above to host a new session and share your knowledge!</p>
                    </div>
                  ) : (
                    <ul className="space-y-6">
                      {mySessions.map(session => (
                        <MySessionCard 
                            key={session.id} 
                            session={session} 
                            onStart={(s) => onJoin(s, 'join')}
                            onEnd={onEndSession}
                        />
                      ))}
                    </ul>
                  )}
                </div>
            </div>
          </div>
        </div>
      );
};