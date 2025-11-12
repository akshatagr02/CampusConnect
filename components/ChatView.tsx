import React, { useState, useEffect, useRef } from 'react';
import { db, serverTimestamp } from '../firebase';
import { collection, addDoc, query, orderBy, onSnapshot, doc, updateDoc, increment } from 'firebase/firestore';
import { UserProfile, ChatMessage } from '../types';
import { SendIcon } from './Icons';
import Avatar from './Avatar';

interface ChatViewProps {
  chatId: string;
  currentUser: UserProfile;
  otherUser: UserProfile;
  onBack: () => void;
  hideBackButton?: boolean;
}

const formatMessageTimestamp = (timestamp: { seconds: number } | null) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const ChatView: React.FC<ChatViewProps> = ({ chatId, currentUser, otherUser, onBack, hideBackButton = false }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  useEffect(() => {
    const messagesRef = collection(db, 'chats', chatId, 'messages');
    const q = query(messagesRef, orderBy('createdAt'));

    const chatRef = doc(db, 'chats', chatId);
    updateDoc(chatRef, {
        [`unreadCount.${currentUser.uid}`]: 0
    }).catch(error => {
        // This can fail if the field doesn't exist yet, which is fine.
    });

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt 
            ? { seconds: data.createdAt.seconds, nanoseconds: data.createdAt.nanoseconds }
            : { seconds: Date.now() / 1000, nanoseconds: 0 }; // Fallback for optimistic updates
        return { ...data, id: doc.id, createdAt } as ChatMessage;
      });
      setMessages(msgs);
    }, (error) => {
        console.error("Error fetching messages:", error);
    });

    return () => unsubscribe();
  }, [chatId, currentUser.uid]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;

    const messageText = newMessage;
    setNewMessage('');

    const messagesRef = collection(db, 'chats', chatId, 'messages');
    await addDoc(messagesRef, {
      text: messageText,
      senderId: currentUser.uid,
      createdAt: serverTimestamp(),
    });

    const chatRef = doc(db, 'chats', chatId);
    await updateDoc(chatRef, {
      lastMessage: {
        text: messageText,
        createdAt: serverTimestamp(),
        senderId: currentUser.uid,
      },
      [`unreadCount.${otherUser.uid}`]: increment(1)
    });
  };

  const shouldShowAvatar = (currentMsg: ChatMessage, prevMsg: ChatMessage | undefined) => {
    if (!prevMsg) return true; // Always show for the first message
    if (prevMsg.senderId !== currentMsg.senderId) return true; // Show if sender changes
    // Show if more than 5 minutes have passed
    const timeDiff = currentMsg.createdAt.seconds - prevMsg.createdAt.seconds;
    if (timeDiff > 300) return true;
    return false;
  };

  return (
    <div className="h-full bg-white flex flex-col">
      <header className="flex items-center p-3 border-b shadow-sm sticky top-0 bg-white z-10 flex-shrink-0">
        {!hideBackButton && (
            <button onClick={onBack} className="text-blue-600 hover:text-blue-800 font-bold p-2 rounded-full hover:bg-gray-100">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            </button>
        )}
        <div className={`flex items-center space-x-3 ${!hideBackButton ? 'ml-2' : ''}`}>
            <Avatar name={otherUser.name} className="h-10 w-10" />
            <div>
              <h2 className="text-lg font-semibold">{otherUser.name}</h2>
              {/* This is a placeholder, a real presence system would be more complex */}
              <p className="text-xs text-gray-500">Online</p> 
            </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-2 bg-gray-100">
        {messages.map((msg, index) => {
          const isCurrentUser = msg.senderId === currentUser.uid;
          const prevMsg = messages[index - 1];
          const displayAvatar = !isCurrentUser && shouldShowAvatar(msg, prevMsg);

          return (
            <div key={msg.id} className={`flex items-end gap-2 ${isCurrentUser ? 'justify-end' : 'justify-start'} ${displayAvatar ? 'mt-4' : ''}`}>
              {/* Avatar and spacer column */}
              <div className="w-10 flex-shrink-0">
                {displayAvatar && <Avatar name={otherUser.name} className="h-10 w-10" />}
              </div>

              {/* Message Bubble */}
              <div className={`px-4 py-2 rounded-2xl max-w-sm md:max-w-md relative ${isCurrentUser ? 'bg-blue-600 text-white rounded-br-lg' : 'bg-white text-gray-900 rounded-bl-lg shadow-sm'}`}>
                <p className="break-words">{msg.text}</p>
                <p className={`text-xs mt-1 text-right ${isCurrentUser ? 'text-blue-200' : 'text-gray-400'}`}>
                  {formatMessageTimestamp(msg.createdAt)}
                </p>
              </div>

              {/* Spacer for current user to align with avatar */}
              {isCurrentUser && <div className="w-10 flex-shrink-0"></div>}
            </div>
          )
        })}
        <div ref={messagesEndRef} />
      </main>

      <footer className="p-3 border-t bg-white sticky bottom-0 flex-shrink-0">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 w-full p-3 border border-gray-200 bg-gray-100 rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
            autoComplete="off"
          />
          <button type="submit" className="bg-blue-600 text-white rounded-full p-3 hover:bg-blue-700 transition-transform transform hover:scale-110 disabled:bg-blue-300 disabled:scale-100" disabled={!newMessage.trim()}>
            <SendIcon className="h-6 w-6" />
          </button>
        </form>
      </footer>
    </div>
  );
};

export default ChatView;