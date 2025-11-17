import React, { useEffect } from 'react';
import { Notification, View, Community, CommunityPost } from '../types';
import { AcademicCapIcon, BellIcon } from './Icons';
import Avatar from './Avatar';

interface NotificationsPageProps {
  notifications: Notification[];
  setView: (view: View) => void;
  onBack: () => void;
  markAsRead: () => void;
  communities: Community[];
  posts: CommunityPost[];
}

const formatTimestamp = (timestamp: { seconds: number; nanoseconds: number }) => {
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
};

const NotificationItem: React.FC<{ 
    notification: Notification; 
    setView: (view: View) => void;
    communities: Community[];
    posts: CommunityPost[];
}> = ({ notification, setView, communities, posts }) => {
    
    const handleClick = () => {
        if (notification.type === 'NEW_SESSION') {
            setView({ type: 'SKILL_SHARING' });
        } else if (notification.type === 'NEW_COMMUNITY_POST') {
            const community = communities.find(c => c.id === notification.communityId);
            const post = posts.find(p => p.id === notification.postId);
            if (community && post) {
                 setView({ type: 'COMMUNITY_POST_DETAIL', post, community });
            } else {
                alert("The post or community could not be found. It may have been deleted.");
            }
        }
    };

    const renderContent = () => {
        switch (notification.type) {
            case 'NEW_SESSION':
                return (
                    <>
                        <div className="flex-shrink-0 h-10 w-10 rounded-full flex items-center justify-center bg-blue-100">
                            <AcademicCapIcon className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">
                                New Session: <span className="font-semibold text-gray-900">{notification.sessionTopic}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                Hosted by {notification.sessionCreatorName}
                            </p>
                        </div>
                    </>
                );
            case 'NEW_COMMUNITY_POST':
                return (
                    <>
                        <div className="flex-shrink-0">
                           <Avatar name={notification.communityName} className="h-10 w-10 rounded-md"/>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-800">
                                New post in <span className="font-semibold text-gray-900">{notification.communityName}</span>
                            </p>
                            <p className="text-sm text-gray-500">
                                By {notification.postAuthorName}
                            </p>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <li
            onClick={handleClick}
            className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${!notification.isRead ? 'bg-indigo-50' : ''}`}
        >
            <div className="flex items-center space-x-4">
                {renderContent()}
                <div className="flex items-center space-x-3">
                    <p className="text-sm text-gray-500 whitespace-nowrap">
                        {formatTimestamp(notification.createdAt)}
                    </p>
                    {!notification.isRead && (
                        <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full flex-shrink-0"></div>
                    )}
                </div>
            </div>
        </li>
    );
};

export const NotificationsPage: React.FC<NotificationsPageProps> = ({ notifications, setView, onBack, markAsRead, communities, posts }) => {
  
  useEffect(() => {
    const timer = setTimeout(() => {
        markAsRead();
    }, 1000); // Mark as read after a short delay to allow user to see the unread state briefly.
    return () => clearTimeout(timer);
  }, [markAsRead]);

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
                <p className="text-gray-600 mt-1">Updates from your communities and sessions.</p>
            </div>
            <div>
                {notifications.length === 0 ? (
                     <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                        <BellIcon className="h-16 w-16 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700">All Caught Up!</h3>
                        <p className="max-w-xs mt-1">You have no new notifications.</p>
                    </div>
                ) : (
                    <ul className="divide-y divide-gray-200">
                        {notifications.map(notif => (
                           <NotificationItem 
                                key={notif.id} 
                                notification={notif} 
                                setView={setView} 
                                communities={communities}
                                posts={posts}
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