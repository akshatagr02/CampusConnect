import React, { useState, useMemo } from 'react';
import { Session, UserProfile, View } from '../types';
import { SessionCard } from './SessionCard';
import { AcademicCapIcon } from './Icons';

interface SkillSharingPageProps {
  currentUser: UserProfile;
  sessions: Session[];
  onJoinOrLeaveSession: (session: Session, action: 'join' | 'leave') => void;
  setView: (view: View) => void;
}

export const SkillSharingPage: React.FC<SkillSharingPageProps> = ({
  currentUser,
  sessions,
  onJoinOrLeaveSession,
  setView,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sessionTypeFilter, setSessionTypeFilter] = useState<'All' | 'Lecture' | 'Skill Exchange'>('All');
  const [sortOrder, setSortOrder] = useState<'soonest' | 'type'>('soonest');

  const [upcomingSessions, pastSessions] = useMemo(() => {
    const upcoming: Session[] = [];
    const past: Session[] = [];

    sessions.forEach(session => {
        // Common filters
        const notMySession = session.creatorId !== currentUser.uid;
        const matchesSearch =
          session.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
          session.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType =
          sessionTypeFilter === 'All' || session.sessionType === sessionTypeFilter;

        if (notMySession && matchesSearch && matchesType) {
            if (session.status === 'completed') {
                past.push(session);
            } else if (session.status === 'scheduled') {
                upcoming.push(session);
            }
        }
    });

    // Apply sorting to upcoming sessions
    upcoming.sort((a, b) => {
      if (sortOrder === 'type') {
        if (a.sessionType < b.sessionType) return -1;
        if (a.sessionType > b.sessionType) return 1;
      }
      return a.scheduledAt.seconds - b.scheduledAt.seconds;
    });

    // Sort past sessions by completion date (most recent first)
    past.sort((a, b) => (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0));

    return [upcoming, past];

  }, [sessions, currentUser.uid, searchTerm, sessionTypeFilter, sortOrder]);


  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 border-b">
            <h1 className="text-2xl font-bold text-gray-900">Join a Session</h1>
            <p className="text-gray-600 mt-1">Connect with peers, learn new things, and share your skills.</p>
          </div>
          
          {/* Filters & Sorting */}
          <div className="p-4 bg-gray-50 border-b flex flex-col sm:flex-row gap-4 items-center flex-wrap">
            <div className="relative flex-grow w-full sm:w-auto">
                <input
                    type="text"
                    placeholder="Search by topic..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                />
            </div>
            <div className="w-full sm:w-auto">
                <select
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value as 'soonest' | 'type')}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
                    aria-label="Sort sessions"
                >
                    <option value="soonest">Sort by: Soonest</option>
                    <option value="type">Sort by: Session Type</option>
                </select>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSessionTypeFilter('All')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${sessionTypeFilter === 'All' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                All
              </button>
              <button
                onClick={() => setSessionTypeFilter('Lecture')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${sessionTypeFilter === 'Lecture' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Lectures
              </button>
              <button
                onClick={() => setSessionTypeFilter('Skill Exchange')}
                className={`px-4 py-2 text-sm font-medium rounded-full ${sessionTypeFilter === 'Skill Exchange' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
              >
                Skill Exchanges
              </button>
            </div>
          </div>
          
          <div className="p-4 sm:p-6 bg-gray-50 space-y-8">
            {/* Upcoming Sessions */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Upcoming Sessions</h2>
                {upcomingSessions.length === 0 ? (
                    <div className="py-10 text-center text-gray-500 flex flex-col items-center">
                        <AcademicCapIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No upcoming sessions found</h3>
                        <p className="max-w-xs mt-1">Try adjusting your filters or check back later. Why not create your own session?</p>
                    </div>
                ) : (
                    <ul className="space-y-6">
                        {upcomingSessions.map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                currentUser={currentUser}
                                onJoinOrLeaveSession={onJoinOrLeaveSession}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* Past Sessions */}
            {pastSessions.length > 0 && (
                <div>
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center" aria-hidden="true">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center">
                            <span className="bg-gray-50 px-3 text-lg font-medium text-gray-700">
                                Past Sessions
                            </span>
                        </div>
                    </div>
                    <ul className="space-y-6">
                        {pastSessions.map(session => (
                            <SessionCard
                                key={session.id}
                                session={session}
                                currentUser={currentUser}
                                onJoinOrLeaveSession={onJoinOrLeaveSession}
                            />
                        ))}
                    </ul>
                </div>
            )}
            </div>
        </div>
      </div>
    </div>
  );
};