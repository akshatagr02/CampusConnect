import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { UserProfile, View, ChatConversation } from '../types';
import Avatar from './Avatar';
import { ChatBubbleEmptyIcon } from './Icons';

interface ChatInboxProps {
  currentUser: UserProfile;
  allUsers: UserProfile[];
  setView: (view: View) => void;
  onBack: () => void;
}

const formatTimestamp = (timestamp: { seconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    const diffDays = Math.floor(diffSeconds / 86400);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays < 7) return date.toLocaleDateString([], { weekday: 'short' });
    return date.toLocaleDateString();
};

const ChatInbox: React.FC<ChatInboxProps> = ({ currentUser, allUsers, setView, onBack }) => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [loading, setLoading] = useState(true);

  const usersMap = useMemo(() => {
    const map = new Map<string, UserProfile>();
    allUsers.forEach(user => map.set(user.uid, user));
    return map;
  }, [allUsers]);

  useEffect(() => {
    const q = query(
      collection(db, 'chats'),
      where('participants', 'array-contains', currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      let convos = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const convo: ChatConversation = {
            id: doc.id,
            participants: data.participants,
            lastMessage: data.lastMessage && data.lastMessage.createdAt ? {
                text: data.lastMessage.text,
                senderId: data.lastMessage.senderId,
                createdAt: { seconds: data.lastMessage.createdAt.seconds }
            } : undefined,
            unreadCount: data.unreadCount,
        };
        return convo;
      });
      
      convos.sort((a, b) => {
        const timeA = a.lastMessage?.createdAt?.seconds ?? 0;
        const timeB = b.lastMessage?.createdAt?.seconds ?? 0;
        return timeB - timeA;
      });

      setConversations(convos);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching conversations: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser.uid]);

  const handleSelectChat = (convo: ChatConversation, otherUser: UserProfile | null) => {
    if (otherUser) {
        const isBlocked = (currentUser.blockedUsers || []).includes(otherUser.uid);
        if (isBlocked) {
            setView({ type: 'PROFILE_DETAIL', user: otherUser });
        } else {
            setView({ type: 'CHAT', chatId: convo.id, otherUser });
        }
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
       <div className="max-w-4xl mx-auto p-4 md:p-8">
        <button onClick={onBack} className="mb-6 text-blue-600 hover:text-blue-800 font-medium flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Back to Discover Peers
        </button>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b">
                <h1 className="text-2xl font-bold text-gray-900">Your Conversations</h1>
            </div>
            <div>
                {loading && <p className="p-10 text-center text-gray-500">Loading chats...</p>}
                {!loading && conversations.length === 0 && (
                    <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                        <ChatBubbleEmptyIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">No Messages Yet</h3>
                        <p className="max-w-xs mt-1">Find a peer from the discover page and start a conversation!</p>
                    </div>
                )}
                {conversations.map(convo => {
                    const otherUserId = convo.participants.find(p => p !== currentUser.uid);
                    const otherUser = otherUserId ? usersMap.get(otherUserId) : null;
                    const lastMessageText = convo.lastMessage ? `${convo.lastMessage.senderId === currentUser.uid ? "You: " : ""}${convo.lastMessage.text}` : 'No messages yet...';

                    if (!otherUser) return null; // Don't render if the other user data is not available yet

                    const isBlockedByMe = (currentUser.blockedUsers || []).includes(otherUser.uid);
                    const isUnread = convo.unreadCount && convo.unreadCount[currentUser.uid] > 0;

                    return (
                        <div key={convo.id} onClick={() => handleSelectChat(convo, otherUser)} className={`p-4 cursor-pointer flex items-center space-x-4 border-b last:border-b-0 transition-colors duration-200 ${isBlockedByMe ? 'bg-gray-100' : 'hover:bg-gray-50'}`}>
                            <div className={`flex-shrink-0 ${isBlockedByMe ? 'grayscale' : ''}`}>
                                <Avatar name={otherUser?.name || '??'} className="h-14 w-14 text-xl" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <p className={`text-md truncate ${isUnread && !isBlockedByMe ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                      {otherUser?.name || 'Unknown User'}
                                      {isBlockedByMe && <span className="text-xs font-bold text-white bg-gray-700 px-2 py-1 rounded-full ml-2">BLOCKED</span>}
                                    </p>
                                    {convo.lastMessage?.createdAt && (
                                        <p className="text-xs text-gray-500 whitespace-nowrap">
                                            {formatTimestamp(convo.lastMessage.createdAt)}
                                        </p>
                                    )}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className={`text-sm truncate ${isUnread && !isBlockedByMe ? 'font-semibold text-gray-800' : 'text-gray-500'}`}>
                                      {isBlockedByMe ? 'You have blocked this user.' : lastMessageText}
                                    </p>
                                    {isUnread && !isBlockedByMe && (
                                         <span className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0 ml-2"></span>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInbox;