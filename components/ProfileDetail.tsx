import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { MailIcon, LightBulbIcon, WrenchScrewdriverIcon, ChatBubbleIcon, XCircleIcon } from './Icons';
import ChatView from './ChatView';
import Avatar from './Avatar';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

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

interface ProfileDetailProps {
  user: UserProfile;
  currentUser: UserProfile;
  onBack: () => void;
}

export const ProfileDetail: React.FC<ProfileDetailProps> = ({ user, currentUser, onBack }) => {
  const [chatId, setChatId] = useState<string | null>(null);
  const [isChatLoading, setIsChatLoading] = useState(true);
  const [isChatPopupOpen, setIsChatPopupOpen] = useState(false);

  useEffect(() => {
    const setupChat = async () => {
      if (!currentUser) return;
      setIsChatLoading(true);
      const participants = [currentUser.uid, user.uid].sort();
      const generatedChatId = participants.join('_');
      const chatRef = doc(db, 'chats', generatedChatId);
      
      try {
        const chatSnap = await getDoc(chatRef);
        if (!chatSnap.exists()) {
            await setDoc(chatRef, {
                participants: participants,
                createdAt: serverTimestamp(),
            });
        }
        setChatId(generatedChatId);
      } catch (error) {
          console.error("Failed to create/get chat session:", error);
      } finally {
        setIsChatLoading(false);
      }
    };

    setupChat();
  }, [currentUser, user.uid]);
  
  const ChatContent = () => {
      if (isChatLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
      }
      if (chatId) {
        return (
            <ChatView
                chatId={chatId}
                currentUser={currentUser}
                otherUser={user}
                onBack={() => setIsChatPopupOpen(false)}
                hideBackButton={true}
            />
        );
      }
      return (
        <div className="flex items-center justify-center h-full text-gray-500 p-8 text-center min-h-[400px]">
            Could not load chat session. Please try again later.
        </div>
      );
  }

  return (
    <div className="bg-slate-50">
      <div className="container mx-auto p-4 md:p-8">
        <button onClick={onBack} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back to Discover
        </button>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Side: Profile Details */}
          <div className="w-full md:w-2/5 space-y-6">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className={`h-28 bg-gradient-to-r ${stringToColor(user.uid)}`}></div>
              <div className="p-4">
                <div className="flex flex-col items-center -mt-20">
                  <Avatar name={user.name} className="h-28 w-28 text-4xl border-4 border-white shadow-lg" />
                  <div className="mt-4 text-center">
                    <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                    <p className="text-md text-gray-600">{user.college}</p>
                    <p className="text-sm text-gray-500">{user.year}</p>
                  </div>
                </div>
                <div className="p-4 text-center md:hidden">
                    <button
                        onClick={() => setIsChatPopupOpen(true)}
                        className="mt-2 w-full flex justify-center items-center px-4 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-indigo-400/50"
                    >
                        <ChatBubbleIcon className="w-5 h-5 mr-2" />
                        Message {user.name.split(' ')[0]}
                    </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center mb-4">
                <MailIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-800 ml-3">Contact</h2>
              </div>
              <div className="space-y-3 text-gray-700 border-t pt-4">
                <p><strong>Email:</strong> <a href={`mailto:${user.email}`} className="text-indigo-600 hover:underline">{user.email}</a></p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center mb-4">
                <LightBulbIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-800 ml-3">Interests</h2>
              </div>
              <p className="text-gray-700 whitespace-pre-wrap border-t pt-4">{user.interests}</p>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-4">
              <div className="flex items-center mb-4">
                <WrenchScrewdriverIcon className="h-6 w-6 text-indigo-500" />
                <h2 className="text-xl font-bold text-gray-800 ml-3">Skills</h2>
              </div>
              <div className="flex flex-wrap gap-3 border-t pt-4">
                {user.skills.map(skill => (
                  <span key={skill} className="px-4 py-2 bg-slate-100 text-slate-800 font-medium rounded-lg shadow-sm">{skill}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side: Chat View (Desktop) */}
          <div className="hidden md:flex w-full md:w-3/5 flex-col bg-white rounded-2xl shadow-lg overflow-hidden">
            <ChatContent />
          </div>
        </div>
      </div>
      
      {/* Chat Popup (Mobile) */}
      {isChatPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 md:hidden animate-fade-in">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg h-[85vh] flex flex-col relative animate-slide-up">
                <button
                    onClick={() => setIsChatPopupOpen(false)}
                    aria-label="Close chat"
                    className="absolute -top-2 -right-2 text-gray-600 bg-white rounded-full p-1 shadow-lg hover:text-red-500 z-20 transition-transform transform hover:scale-110"
                >
                    <XCircleIcon className="w-8 h-8" />
                </button>
                <div className="w-full h-full overflow-hidden rounded-2xl">
                    <ChatContent />
                </div>
            </div>
        </div>
      )}
    </div>
  );
};