import React, { useState } from 'react';
import { UserProfile, Session } from '../types';
import { TagInput } from './TagInput';
import { COLLEGES, YEARS } from '../constants';
import { Timestamp } from 'firebase/firestore';

interface CreateSessionPageProps {
  currentUser: UserProfile;
  addSession: (sessionData: Omit<Session, 'id' | 'createdAt' | 'status' | 'completedAt'>) => void;
  onBack: () => void;
}

export const CreateSessionPage: React.FC<CreateSessionPageProps> = ({ currentUser, addSession, onBack }) => {
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [sessionType, setSessionType] = useState<'Lecture' | 'Skill Exchange'>('Lecture');
  const [scheduledDateTime, setScheduledDateTime] = useState('');
  const [targetColleges, setTargetColleges] = useState<string[]>([]);
  const [targetYears, setTargetYears] = useState<string[]>([]);
  const [skillsToOffer, setSkillsToOffer] = useState<string[]>([]);
  const [skillsSought, setSkillsSought] = useState<string[]>([]);
  const [scheduleError, setScheduleError] = useState('');

  const handleCheckboxChange = (
    value: string,
    list: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (list.includes(value)) {
      setter(list.filter((item) => item !== value));
    } else {
      setter([...list, value]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleError(''); // Clear previous error on new submission

    if (!topic.trim() || !description.trim() || !scheduledDateTime) {
      return;
    }

    const scheduledDate = new Date(scheduledDateTime);
    if (isNaN(scheduledDate.getTime())) {
        setScheduleError('Invalid date/time format. Please check your input.');
        return;
    }
    
    const now = new Date();
    if (scheduledDate < now) {
      setScheduleError('You cannot schedule a session in the past. Please select a future date and time.');
      return;
    }

    const sessionData: Omit<Session, 'id' | 'createdAt' | 'status' | 'completedAt'> = {
      topic,
      description,
      creator: currentUser.name,
      creatorId: currentUser.uid,
      participantIds: [currentUser.uid],
      sessionType,
      scheduledAt: Timestamp.fromDate(scheduledDate),
      targetColleges: targetColleges.length > 0 ? targetColleges : ['All'],
      targetYears: targetYears.length > 0 ? targetYears : ['All'],
    };

    if (sessionType === 'Skill Exchange') {
      sessionData.skillsToOffer = skillsToOffer;
      sessionData.skillsSought = skillsSought;
    }

    addSession(sessionData);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to My Sessions
        </button>
        <div className="bg-white p-10 rounded-xl shadow-lg">
          <h2 className="text-center text-3xl font-extrabold text-gray-900">Create a New Session</h2>
          <form className="mt-8 space-y-8" onSubmit={handleSubmit}>
            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-gray-700">Topic</label>
                <input id="topic" type="text" required value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                <textarea id="description" rows={3} required value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900"></textarea>
              </div>
              <div>
                <label htmlFor="scheduledDateTime" className="block text-sm font-medium text-gray-700">Schedule Date & Time</label>
                <input 
                  id="scheduledDateTime" 
                  type="datetime-local" 
                  required 
                  value={scheduledDateTime} 
                  onChange={(e) => {
                    setScheduledDateTime(e.target.value)
                    if (scheduleError) {
                        setScheduleError('');
                    }
                  }}
                  className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm bg-white text-gray-900" 
                />
                {scheduleError && <p className="mt-2 text-sm text-red-600">{scheduleError}</p>}
              </div>
            </div>

            {/* Session Type */}
            <fieldset>
              <legend className="block text-sm font-medium text-gray-700">Session Type</legend>
              <div className="mt-2 space-y-2">
                <div className="flex items-center">
                  <input id="lecture" name="sessionType" type="radio" value="Lecture" checked={sessionType === 'Lecture'} onChange={() => setSessionType('Lecture')} className="h-4 w-4 text-indigo-600 border-gray-300" />
                  <label htmlFor="lecture" className="ml-3 block text-sm text-gray-900">Lecture / Presentation</label>
                </div>
                <div className="flex items-center">
                  <input id="skillExchange" name="sessionType" type="radio" value="Skill Exchange" checked={sessionType === 'Skill Exchange'} onChange={() => setSessionType('Skill Exchange')} className="h-4 w-4 text-indigo-600 border-gray-300" />
                  <label htmlFor="skillExchange" className="ml-3 block text-sm text-gray-900">Skill Exchange</label>
                </div>
              </div>
            </fieldset>

            {/* Skill Exchange Fields */}
            {sessionType === 'Skill Exchange' && (
              <div className="space-y-4 p-4 border rounded-md bg-gray-50">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills I Can Offer</label>
                  <TagInput tags={skillsToOffer} setTags={setSkillsToOffer} placeholder="e.g., Python, Public Speaking..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Skills I'm Looking For</label>
                  <TagInput tags={skillsSought} setTags={setSkillsSought} placeholder="e.g., UI/UX Design, Data Analysis..." />
                </div>
              </div>
            )}

            {/* Targeting */}
            <div className="space-y-4">
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700">Target Colleges (optional, leave blank for all)</legend>
                <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 border rounded-md">
                  {COLLEGES.map(college => (
                    <div key={college} className="flex items-center">
                      <input id={college} type="checkbox" checked={targetColleges.includes(college)} onChange={() => handleCheckboxChange(college, targetColleges, setTargetColleges)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label htmlFor={college} className="ml-2 block text-sm text-gray-900">{college}</label>
                    </div>
                  ))}
                </div>
              </fieldset>
              <fieldset>
                <legend className="block text-sm font-medium text-gray-700">Target Years (optional, leave blank for all)</legend>
                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
                  {YEARS.map(year => (
                    <div key={year} className="flex items-center">
                      <input id={year} type="checkbox" checked={targetYears.includes(year)} onChange={() => handleCheckboxChange(year, targetYears, setTargetYears)} className="h-4 w-4 text-indigo-600 border-gray-300 rounded" />
                      <label htmlFor={year} className="ml-2 block text-sm text-gray-900">{year}</label>
                    </div>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="pt-6">
              <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Create Session
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};