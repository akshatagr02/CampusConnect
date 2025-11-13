import React, { useState, useEffect, useCallback } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  limit
} from 'firebase/firestore';

import { UserProfile, View, Session, Testimonial } from './types';

import { LandingPage } from './components/LandingPage';
import { Auth } from './components/Auth';
import { ProfileForm } from './components/ProfileForm';
import { HomePage } from './components/HomePage';
import { ProfileDetail } from './components/ProfileDetail';
import ChatInbox from './components/ChatInbox';
import ChatView from './components/ChatView';
import { NotificationsPage } from './components/NotificationsPage';
import { CreateSessionPage } from './components/CreateSessionPage';
import { MySessionsPage } from './components/MySessionsPage';
import { SkillSharingPage } from './components/SkillSharingPage';
import { VideoSessionPage } from './components/VideoSessionPage';
import { BellIcon, ChatBubbleIcon, LogoutIcon, PencilIcon, UsersGroupIcon, VideoCameraIcon, ChevronDownIcon } from './components/Icons';
import Avatar from './components/Avatar';

const Navbar: React.FC<{ currentUser: UserProfile; setView: (view: View) => void }> = ({ currentUser, setView }) => {
    const handleLogout = () => {
        auth.signOut();
    };
    
    const NavLink: React.FC<{view: View, children: React.ReactNode}> = ({view, children}) => {
        const baseClasses = "text-gray-600 hover:text-indigo-600 rounded-md font-medium";
        const desktopClasses = "px-3 py-2 text-sm";

        return (
            <button onClick={() => setView(view)} className={`${baseClasses} ${desktopClasses}`}>
                {children}
            </button>
        );
    }

    return (
        <nav className="bg-white/70 backdrop-blur-lg shadow-sm sticky top-0 z-50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <div className="flex-shrink-0">
                        <div className="flex items-center cursor-pointer" onClick={() => setView({type: 'HOME'})}>
                            <span className="font-bold text-xl text-indigo-600">Campus Connect</span>
                        </div>
                    </div>
                    
                    {/* Right side content */}
                    <div className="flex items-center">
                        {/* Desktop Menu Links */}
                        <div className="hidden sm:flex sm:items-center sm:space-x-4">
                            <NavLink view={{ type: 'SKILL_SHARING' }}>Skill Sharing</NavLink>
                            <NavLink view={{ type: 'NOTIFICATIONS' }}>Notifications</NavLink>
                            <NavLink view={{ type: 'CHAT_INBOX' }}>Inbox</NavLink>
                        </div>
                        
                        {/* Profile Dropdown */}
                        <div className="relative group sm:ml-4">
                            <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                <Avatar name={currentUser.name} className="h-10 w-10" />
                                <span className="hidden lg:block font-medium text-gray-700">{currentUser.name}</span>
                                <ChevronDownIcon className="hidden lg:block w-5 h-5 text-gray-500" />
                            </button>
                            {/* The outer div creates a hoverable area with pt-2 to bridge the gap to the menu.
                                It's invisible but catches the mouse, keeping the group in a hover state. */}
                            <div className="absolute right-0 w-56 pt-2 top-full origin-top-right opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                                <div className="bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                                    <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                                        <div className="px-4 py-3 border-b">
                                            <p className="text-sm font-medium text-gray-900 truncate">{currentUser.name}</p>
                                            <p className="text-sm text-gray-500 truncate">{currentUser.email}</p>
                                        </div>
                                        <a onClick={() => setView({ type: 'MY_SESSIONS' })} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                            <VideoCameraIcon className="w-5 h-5 mr-3 text-gray-500" />
                                            My Sessions
                                        </a>
                                        <a onClick={() => setView({ type: 'EDIT_PROFILE' })} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                            <PencilIcon className="w-5 h-5 mr-3 text-gray-500" />
                                            Edit Profile
                                        </a>
                                        <a onClick={handleLogout} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                            <LogoutIcon className="w-5 h-5 mr-3 text-gray-500" />
                                            Sign Out
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};


const App: React.FC = () => {
    const [view, setView] = useState<View>({ type: 'LOADING' });
    const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

    useEffect(() => {
        const testimonialsQuery = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'), limit(6));
        const testimonialsUnsub = onSnapshot(testimonialsQuery, (snapshot) => {
            const testimonialsData = snapshot.docs.map(doc => {
                const data = doc.data();
                const sanitizedData: { [key: string]: any } = {};
                 Object.keys(data).forEach(key => {
                    const value = data[key];
                    if (value && typeof value.toDate === 'function') {
                        sanitizedData[key] = {
                            seconds: value.seconds,
                            nanoseconds: value.nanoseconds,
                        };
                    } else {
                        sanitizedData[key] = value;
                    }
                });
                return { id: doc.id, ...sanitizedData } as Testimonial;
            });
            setTestimonials(testimonialsData);
        });
        
        return () => testimonialsUnsub();
    }, []);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    const userData = { uid: user.uid, ...userSnap.data() } as UserProfile;
                    setCurrentUser(userData);
                    if (!userData.lastCheckedNotifications) {
                        await updateDoc(userRef, { lastCheckedNotifications: serverTimestamp() });
                    }
                    setView({ type: 'HOME' });
                } else {
                    setView({ type: 'CREATE_PROFILE', email: user.email!, uid: user.uid });
                }
            } else {
                setCurrentUser(null);
                setView({ type: 'LANDING' });
            }
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (!currentUser) {
            setAllUsers([]);
            setSessions([]);
            return;
        }

        const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() } as UserProfile));
            setAllUsers(usersData);
        });

        const sessionsUnsub = onSnapshot(collection(db, 'sessions'), (snapshot) => {
            const sessionsData = snapshot.docs
                .map(doc => {
                    const data = doc.data();
                    
                    // Sanitize Firestore Timestamp objects into plain JS objects to prevent circular reference errors
                    const sanitizedData: { [key: string]: any } = {};
                    Object.keys(data).forEach(key => {
                        const value = data[key];
                        // Check if it's a Firestore Timestamp object
                        if (value && typeof value.toDate === 'function') { 
                            sanitizedData[key] = {
                                seconds: value.seconds,
                                nanoseconds: value.nanoseconds,
                            };
                        } else {
                            sanitizedData[key] = value;
                        }
                    });

                    return { id: doc.id, ...sanitizedData } as Session;
                })
                .filter(session => 
                    session.scheduledAt && typeof session.scheduledAt.seconds === 'number'
                );
            
            setSessions(sessionsData.sort((a, b) => {
                if (a.status === 'completed' && b.status !== 'completed') return 1;
                if (b.status === 'completed' && a.status !== 'completed') return -1;
                if (a.status === 'completed' && b.status === 'completed') {
                    return (b.completedAt?.seconds ?? 0) - (a.completedAt?.seconds ?? 0);
                }
                return b.scheduledAt.seconds - a.scheduledAt.seconds;
            }));
        });

        return () => {
            usersUnsub();
            sessionsUnsub();
        };
    }, [currentUser]);

    const handleSaveProfile = useCallback(async (profileData: Omit<UserProfile, 'uid'>, uid: string) => {
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, profileData, { merge: true });
        const updatedUser = { uid, ...profileData };
        setCurrentUser(updatedUser as UserProfile);
        setView({ type: 'HOME' });
    }, []);

    const handleAddSession = useCallback(async (sessionData: Omit<Session, 'id' | 'createdAt' | 'status' | 'completedAt'>) => {
        await addDoc(collection(db, 'sessions'), {
            ...sessionData,
            status: 'scheduled',
            createdAt: serverTimestamp(),
        });
        setView({ type: 'MY_SESSIONS' });
    }, []);
    
    const handleSaveTestimonial = useCallback(async (quote: string) => {
        if (!currentUser) return;
        await addDoc(collection(db, 'testimonials'), {
            quote,
            userId: currentUser.uid,
            userName: currentUser.name,
            userCollege: currentUser.college,
            createdAt: serverTimestamp(),
        });
    }, [currentUser]);

    const handleJoinOrLeaveSession = useCallback(async (session: Session, action: 'join' | 'leave') => {
        if (!currentUser) return;
        const sessionRef = doc(db, 'sessions', session.id);
        await updateDoc(sessionRef, {
            participantIds: action === 'join' ? arrayUnion(currentUser.uid) : arrayRemove(currentUser.uid),
        });
        if (action === 'join') {
            setView({ type: 'VIDEO_SESSION', session });
        }
    }, [currentUser]);
    
    const handleEndSession = useCallback(async (session: Session) => {
        const sessionRef = doc(db, 'sessions', session.id);
        await updateDoc(sessionRef, {
            status: 'completed',
            completedAt: serverTimestamp()
        });
    }, []);

    const handleLeaveVideoSession = async (session: Session) => {
        if (!currentUser) return;
        const sessionRef = doc(db, 'sessions', session.id);
         await updateDoc(sessionRef, {
            participantIds: arrayRemove(currentUser.uid),
        });
        setView({type: 'HOME'});
    }

    const renderView = () => {
        switch (view.type) {
            case 'LOADING':
                return (
                    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                );
            case 'LANDING':
                return <LandingPage testimonials={testimonials} setView={setView} />;
            case 'AUTH':
                return <Auth />;
            case 'CREATE_PROFILE':
                const newUserProfile: Omit<UserProfile, 'uid'> & {uid: string} = {
                    uid: view.uid, email: view.email, name: '', mobile: '', college: '', year: '', interests: '', skills: []
                };
                return <ProfileForm user={newUserProfile} onSave={handleSaveProfile} isUpdating={false} />;
            case 'EDIT_PROFILE':
                return <ProfileForm user={currentUser!} onSave={handleSaveProfile} isUpdating={true} onBack={() => setView({ type: 'HOME' })} onSaveTestimonial={handleSaveTestimonial} />;
            case 'HOME':
                return <HomePage currentUser={currentUser!} users={allUsers} setView={setView} />;
            case 'PROFILE_DETAIL':
                return <ProfileDetail user={view.user} currentUser={currentUser!} onBack={() => setView({ type: 'HOME' })} />;
            case 'CHAT_INBOX':
                return <ChatInbox currentUser={currentUser!} allUsers={allUsers} setView={setView} onBack={() => setView({ type: 'HOME' })} />;
            case 'CHAT':
                 return <ChatView chatId={view.chatId} currentUser={currentUser!} otherUser={view.otherUser} onBack={() => setView({ type: 'CHAT_INBOX' })} />;
            case 'NOTIFICATIONS':
                return <NotificationsPage currentUser={currentUser!} sessions={sessions} setView={setView} onBack={() => setView({ type: 'HOME' })} />;
            case 'CREATE_SESSION':
                return <CreateSessionPage currentUser={currentUser!} addSession={handleAddSession} onBack={() => setView({ type: 'MY_SESSIONS' })} />;
            case 'MY_SESSIONS':
                return <MySessionsPage currentUser={currentUser!} sessions={sessions} setView={setView} onBack={() => setView({ type: 'HOME' })} onJoin={handleJoinOrLeaveSession} onEndSession={handleEndSession} />;
            case 'SKILL_SHARING':
                return <SkillSharingPage currentUser={currentUser!} sessions={sessions} onJoinOrLeaveSession={handleJoinOrLeaveSession} setView={setView} />;
            case 'VIDEO_SESSION':
                return <VideoSessionPage session={view.session} currentUser={currentUser!} allUsers={allUsers} onLeaveSession={handleLeaveVideoSession} />;
            default:
                return <div>Unknown view</div>;
        }
    };
    
    const BottomNavBar: React.FC = () => (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-40 border-t">
            <div className="flex justify-around h-16 items-center">
                <button onClick={() => setView({ type: 'HOME' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/4 py-2">
                    <UsersGroupIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Discover</span>
                </button>
                <button onClick={() => setView({ type: 'SKILL_SHARING' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/4 py-2">
                    <VideoCameraIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Sessions</span>
                </button>
                <button onClick={() => setView({ type: 'NOTIFICATIONS' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/4 py-2">
                    <BellIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Notifications</span>
                </button>
                <button onClick={() => setView({ type: 'CHAT_INBOX' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/4 py-2">
                    <ChatBubbleIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Inbox</span>
                </button>
            </div>
        </nav>
    );
    
    return (
        <div className="bg-slate-50 min-h-screen pb-16 sm:pb-0">
            {currentUser && view.type !== 'LANDING' && view.type !== 'AUTH' && view.type !== 'CREATE_PROFILE' && (
                <Navbar currentUser={currentUser} setView={setView} />
            )}
            {renderView()}
             {currentUser && view.type !== 'LANDING' && view.type !== 'AUTH' && view.type !== 'CREATE_PROFILE' && (
                <BottomNavBar />
            )}
        </div>
    );
};

export default App;