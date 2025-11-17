import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  arrayRemove,
  serverTimestamp,
  query,
  orderBy,
  limit,
  collectionGroup,
  where,
  writeBatch,
  getDocs
} from 'firebase/firestore';

import { UserProfile, View, Session, Testimonial, Community, CommunityPost, Comment, Notification } from './types';

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
import { DiscoverPeersPage } from './components/DiscoverPeersPage';
import { CommunityAuth } from './components/CommunityAuth';
import { CreateCommunityPage } from './components/CreateCommunityPage';
import { CommunityPage } from './components/CommunityPage';
import { CommunityAdminPanel } from './components/CommunityAdminPanel';
import { MyCommunitiesPage } from './components/MyCommunitiesPage';
import { CommunityPostDetail } from './components/CommunityPostDetail';
import { BellIcon, ChatBubbleIcon, LogoutIcon, PencilIcon, UsersGroupIcon, VideoCameraIcon, ChevronDownIcon, HomeIcon, AcademicCapIcon, BuildingOfficeIcon } from './components/Icons';
import Avatar from './components/Avatar';

const Navbar: React.FC<{ currentUser: UserProfile | null; setView: (view: View) => void; unreadNotificationsCount: number; }> = ({ currentUser, setView, unreadNotificationsCount }) => {
    const handleLogout = () => {
        signOut(auth);
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
                        <div className="flex items-center cursor-pointer" onClick={() => setView(currentUser ? {type: 'HOME'} : {type: 'LANDING'})}>
                            <span className="font-bold text-xl text-indigo-600">Campus Connect</span>
                        </div>
                    </div>
                    
                    {/* Right side content */}
                    {currentUser ? (
                        <div className="flex items-center">
                            {/* Desktop Menu Links */}
                            <div className="hidden sm:flex sm:items-center sm:space-x-4">
                                <NavLink view={{ type: 'SKILL_SHARING' }}>Sessions</NavLink>
                                <NavLink view={{ type: 'DISCOVER_PEERS' }}>Discover Peers</NavLink>
                                <NavLink view={{ type: 'COMMUNITY_AUTH' }}>Communities</NavLink>
                                <NavLink view={{ type: 'NOTIFICATIONS' }}>
                                    <div className="relative">
                                        Notifications
                                        {unreadNotificationsCount > 0 && (
                                            <span className="absolute -top-1.5 -right-3.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-medium text-white">
                                                {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                                            </span>
                                        )}
                                    </div>
                                </NavLink>
                                <NavLink view={{ type: 'CHAT_INBOX' }}>Inbox</NavLink>
                            </div>
                            
                            {/* Profile Dropdown */}
                            <div className="relative group sm:ml-4">
                                <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <Avatar name={currentUser.name} className="h-10 w-10" />
                                    <span className="hidden lg:block font-medium text-gray-700">{currentUser.name}</span>
                                    <ChevronDownIcon className="hidden lg:block w-5 h-5 text-gray-500" />
                                </button>
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
                                            <a onClick={() => setView({ type: 'MY_COMMUNITIES' })} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                                <BuildingOfficeIcon className="w-5 h-5 mr-3 text-gray-500" />
                                                My Communities
                                            </a>
                                            <a onClick={() => setView({ type: 'EDIT_PROFILE' })} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                                <PencilIcon className="w-5 h-5 mr-3 text-gray-500" />
                                                Edit Profile
                                            </a>
                                            <a onClick={() => setView({ type: 'CREATE_COMMUNITY' })} className="cursor-pointer w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center" role="menuitem">
                                                <BuildingOfficeIcon className="w-5 h-5 mr-3 text-gray-500" />
                                                Create Community
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
                    ) : (
                         <div className="space-x-2">
                            <button
                                onClick={() => setView({ type: 'AUTH' })}
                                className="px-4 py-2 text-sm font-medium text-indigo-600 rounded-md hover:bg-indigo-50"
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setView({ type: 'AUTH', isSigningUp: true })}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                            >
                                Sign Up
                            </button>
                        </div>
                    )}
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
    const [communities, setCommunities] = useState<Community[]>([]);
    const [allCommunityPosts, setAllCommunityPosts] = useState<CommunityPost[]>([]);
    const [notifications, setNotifications] = useState<Notification[]>([]);

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
        let userDocUnsubscribe: (() => void) | null = null;
    
        const authUnsubscribe = onAuthStateChanged(auth, (user) => {
          if (userDocUnsubscribe) {
            userDocUnsubscribe();
          }
    
          if (user) {
            const userRef = doc(db, 'users', user.uid);
            
            userDocUnsubscribe = onSnapshot(userRef, (userSnap) => {
              if (userSnap.exists()) {
                const data = userSnap.data();
                const sanitizedData: {[key: string]: any} = {};
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
    
                const userData = { uid: user.uid, ...sanitizedData } as UserProfile;
                setCurrentUser(userData);
    
                setView((currentView) => {
                    if (['LOADING', 'LANDING', 'AUTH', 'CREATE_PROFILE'].includes(currentView.type)) {
                        return { type: 'HOME' };
                    }
                    return currentView;
                });
                
              } else {
                setView({ type: 'CREATE_PROFILE', email: user.email!, uid: user.uid });
              }
            }, (error) => {
                console.error("Error listening to user document:", error);
                signOut(auth);
            });
    
          } else {
            setCurrentUser(null);
            setView({ type: 'LANDING' });
          }
        });
    
        return () => {
          authUnsubscribe();
          if (userDocUnsubscribe) {
            userDocUnsubscribe();
          }
        };
      }, []);

    useEffect(() => {
        // Public collections that don't depend on currentUser
        const communitiesUnsub = onSnapshot(query(collection(db, 'communities'), orderBy('createdAt', 'desc')), (snapshot) => {
            const communitiesData = snapshot.docs.map(doc => {
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
                return { id: doc.id, ...sanitizedData } as Community;
            });
            setCommunities(communitiesData);
        });

        const postsQuery = query(collectionGroup(db, 'posts'), limit(50));
        const postsUnsub = onSnapshot(postsQuery, (snapshot) => {
            const postsData = snapshot.docs.map(doc => {
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
                return { id: doc.id, ...sanitizedData } as CommunityPost;
            });
            setAllCommunityPosts(postsData);
        }, (error) => {
            console.error("Error fetching community posts:", error);
        });

        if (!currentUser) {
            setAllUsers([]);
            setSessions([]);
            setNotifications([]);
            return () => {
                communitiesUnsub();
                postsUnsub();
            };
        }

        // FIX: Removed `orderBy` from the Firestore query to prevent an error on environments
        // where the composite index has not been created. Sorting is now handled client-side.
        const notificationsQuery = query(collection(db, 'notifications'), where('userId', '==', currentUser.uid));
        const notificationsUnsub = onSnapshot(notificationsQuery, (snapshot) => {
            const notificationsData = snapshot.docs.map(doc => {
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
                return { id: doc.id, ...sanitizedData } as Notification;
            });
            // Sort notifications on the client to ensure chronological order.
            notificationsData.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds);
            setNotifications(notificationsData);
        });

        const usersUnsub = onSnapshot(collection(db, 'users'), (snapshot) => {
            const usersData = snapshot.docs.map(doc => {
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
                return { uid: doc.id, ...sanitizedData } as UserProfile;
            });
            setAllUsers(usersData);
        });

        const sessionsUnsub = onSnapshot(collection(db, 'sessions'), (snapshot) => {
            const sessionsData = snapshot.docs
                .map(doc => {
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
            communitiesUnsub();
            postsUnsub();
            notificationsUnsub();
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
        if (!currentUser) return;
        const newSessionRef = await addDoc(collection(db, 'sessions'), {
            ...sessionData,
            status: 'scheduled',
            createdAt: serverTimestamp(),
        });

        const targetUsers = allUsers.filter(user => {
            if (user.uid === currentUser.uid) return false;
            const collegeMatch = sessionData.targetColleges.includes('All') || sessionData.targetColleges.includes(user.college);
            const yearMatch = sessionData.targetYears.includes('All') || sessionData.targetYears.includes(user.year);
            return collegeMatch && yearMatch;
        });

        if (targetUsers.length > 0) {
            const batch = writeBatch(db);
            targetUsers.forEach(user => {
                const notificationRef = doc(collection(db, 'notifications'));
                batch.set(notificationRef, {
                    userId: user.uid,
                    type: 'NEW_SESSION',
                    sessionId: newSessionRef.id,
                    sessionTopic: sessionData.topic,
                    sessionCreatorName: sessionData.creator,
                    createdAt: serverTimestamp(),
                    isRead: false,
                });
            });
            await batch.commit();
        }

        setView({ type: 'MY_SESSIONS' });
    }, [currentUser, allUsers]);
    
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
    
    const handleCreateCommunity = useCallback(async (name: string, description: string, profilePictureUrl: string, college: string) => {
        if (!currentUser) return;
        const newCommunityData = {
            name,
            description,
            profilePictureUrl,
            college,
            ownerId: currentUser.uid,
            adminIds: [currentUser.uid],
            followerIds: [currentUser.uid],
            createdAt: serverTimestamp(),
        };
        const newCommunityRef = await addDoc(collection(db, 'communities'), newCommunityData);

        const userRef = doc(db, 'users', currentUser.uid);
        await updateDoc(userRef, {
            followingCommunities: arrayUnion(newCommunityRef.id)
        });

        const docSnap = await getDoc(newCommunityRef);
        if (docSnap.exists()) {
          const newCommunityData = docSnap.data();
          const sanitizedData: { [key: string]: any } = {};
          Object.keys(newCommunityData).forEach(key => {
            const value = newCommunityData[key];
             if (value && typeof value.toDate === 'function') {
                sanitizedData[key] = { seconds: value.seconds, nanoseconds: value.nanoseconds };
            } else {
                sanitizedData[key] = value;
            }
          });
          const newCommunity = { id: newCommunityRef.id, ...sanitizedData } as Community;
          setView({ type: 'COMMUNITY_PAGE', community: newCommunity });
        }
    }, [currentUser]);

    const handleUpdateCommunity = useCallback(async (communityId: string, updatedData: Partial<Omit<Community, 'id'>>) => {
        const communityRef = doc(db, 'communities', communityId);
        await updateDoc(communityRef, updatedData);
    }, []);
    
    const handleToggleFollowCommunity = useCallback(async (communityId: string) => {
        if (!currentUser) return;
        const communityRef = doc(db, 'communities', communityId);
        const userRef = doc(db, 'users', currentUser.uid);

        const isFollowing = currentUser.followingCommunities?.includes(communityId);

        if (isFollowing) {
            await updateDoc(communityRef, { followerIds: arrayRemove(currentUser.uid) });
            await updateDoc(userRef, { followingCommunities: arrayRemove(communityId) });
        } else {
            await updateDoc(communityRef, { followerIds: arrayUnion(currentUser.uid) });
            await updateDoc(userRef, { followingCommunities: arrayUnion(communityId) });
        }
    }, [currentUser]);

    const handleManageAdmin = useCallback(async (communityId: string, adminId: string, action: 'add' | 'remove') => {
        const communityRef = doc(db, 'communities', communityId);
        await updateDoc(communityRef, {
            adminIds: action === 'add' ? arrayUnion(adminId) : arrayRemove(adminId),
        });
    }, []);

    const handleCreateCommunityPost = useCallback(async (communityId: string, text: string, imageUrls: string[]) => {
        if (!currentUser) return;
        const postsRef = collection(db, 'communities', communityId, 'posts');
        const newPostRef = await addDoc(postsRef, {
            communityId,
            text,
            imageUrls,
            authorId: currentUser.uid,
            authorName: currentUser.name,
            authorAvatarName: currentUser.name,
            createdAt: serverTimestamp(),
        });
        
        const community = communities.find(c => c.id === communityId);
        if (community && community.followerIds) {
            const batch = writeBatch(db);
            community.followerIds.forEach(followerId => {
                if (followerId !== currentUser.uid) { // Don't notify the author
                    const notificationRef = doc(collection(db, 'notifications'));
                    batch.set(notificationRef, {
                        userId: followerId,
                        type: 'NEW_COMMUNITY_POST',
                        communityId: community.id,
                        communityName: community.name,
                        postId: newPostRef.id,
                        postAuthorName: currentUser.name,
                        createdAt: serverTimestamp(),
                        isRead: false,
                    });
                }
            });
            await batch.commit();
        }
    }, [currentUser, communities]);

    const handleUpdateCommunityPost = useCallback(async (communityId: string, postId: string, text: string, imageUrls: string[]) => {
        if (!currentUser) return;
        const postRef = doc(db, 'communities', communityId, 'posts', postId);
        await updateDoc(postRef, {
            text,
            imageUrls,
        });
    }, [currentUser]);

    const handleToggleLikePost = useCallback(async (communityId: string, postId: string) => {
        if (!currentUser) return;
        const postRef = doc(db, 'communities', communityId, 'posts', postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
            const postData = postSnap.data() as CommunityPost;
            const likes = postData.likes || [];
            if (likes.includes(currentUser.uid)) {
                await updateDoc(postRef, {
                    likes: arrayRemove(currentUser.uid)
                });
            } else {
                await updateDoc(postRef, {
                    likes: arrayUnion(currentUser.uid)
                });
            }
        }
    }, [currentUser]);

    const handleAddCommentToPost = useCallback(async (communityId: string, postId: string, text: string) => {
        if (!currentUser) return;
        const commentsRef = collection(db, 'communities', communityId, 'posts', postId, 'comments');
        await addDoc(commentsRef, {
            postId,
            communityId,
            text,
            authorId: currentUser.uid,
            authorName: currentUser.name,
            authorAvatarName: currentUser.name,
            createdAt: serverTimestamp(),
        });
    }, [currentUser]);

    const handleDeleteComment = useCallback(async (communityId: string, postId: string, commentId: string) => {
        if (!currentUser) return;

        const commentRef = doc(db, 'communities', communityId, 'posts', postId, 'comments', commentId);
        
        try {
            const commentSnap = await getDoc(commentRef);
            if (!commentSnap.exists()) {
                console.error("Comment to delete was not found.");
                alert("This comment may have already been deleted.");
                return;
            }

            const commentData = commentSnap.data() as Comment;
            const community = communities.find(c => c.id === communityId);

            const isCommentAuthor = commentData.authorId === currentUser.uid;
            const isCommunityAdmin = community ? community.adminIds.includes(currentUser.uid) : false;

            if (isCommentAuthor || isCommunityAdmin) {
                await deleteDoc(commentRef);
            } else {
                alert("You do not have permission to delete this comment.");
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
            alert("An error occurred while trying to delete the comment.");
        }
    }, [currentUser, communities]);

    const handleMarkNotificationsAsRead = useCallback(async () => {
        if (!currentUser || notifications.filter(n => !n.isRead).length === 0) return;

        const batch = writeBatch(db);
        notifications.forEach(notification => {
            if (!notification.isRead) {
                const notifRef = doc(db, 'notifications', notification.id);
                batch.update(notifRef, { isRead: true });
            }
        });
        await batch.commit();
    }, [currentUser, notifications]);
    
    const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);

    const handleToggleBlockUser = useCallback(async (targetUserId: string) => {
        if (!currentUser) return;
    
        const userRef = doc(db, 'users', currentUser.uid);
        const isBlocked = currentUser.blockedUsers?.includes(targetUserId);
    
        try {
            if (isBlocked) {
                await updateDoc(userRef, {
                    blockedUsers: arrayRemove(targetUserId)
                });
            } else {
                await updateDoc(userRef, {
                    blockedUsers: arrayUnion(targetUserId)
                });
            }
        } catch (error) {
            console.error("Failed to update block status:", error);
            alert("There was an error updating the block status. Please try again.");
        }
    }, [currentUser]);

    const filteredCommunityPosts = useMemo(() => {
        if (!currentUser) return allCommunityPosts;
        const myBlockedIds = currentUser.blockedUsers || [];
        return allCommunityPosts.filter(post => !myBlockedIds.includes(post.authorId));
    }, [allCommunityPosts, currentUser]);

    const filteredSessions = useMemo(() => {
        if (!currentUser) return sessions;
        const myBlockedIds = currentUser.blockedUsers || [];
        return sessions.filter(session => !myBlockedIds.includes(session.creatorId));
    }, [sessions, currentUser]);

    const discoverableUsers = useMemo(() => {
        if (!currentUser) return [];
        const myBlockedIds = currentUser.blockedUsers || [];
        // Filter out self, users I've blocked, and users who have blocked me
        return allUsers.filter(user => 
            user.uid !== currentUser.uid &&
            !myBlockedIds.includes(user.uid) && 
            !user.blockedUsers?.includes(currentUser.uid)
        );
    }, [allUsers, currentUser]);

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
                return <Auth isSigningUp={view.isSigningUp} />;
            case 'CREATE_PROFILE':
                const newUserProfile: Omit<UserProfile, 'uid'> & {uid: string} = {
                    uid: view.uid, email: view.email, name: '', mobile: '', college: '', year: '', interests: '', skills: []
                };
                return <ProfileForm user={newUserProfile} onSave={handleSaveProfile} isUpdating={false} />;
            case 'EDIT_PROFILE':
                return <ProfileForm user={currentUser!} onSave={handleSaveProfile} isUpdating={true} onBack={() => setView({ type: 'HOME' })} onSaveTestimonial={handleSaveTestimonial} />;
            case 'HOME':
                return <HomePage 
                    currentUser={currentUser!} 
                    users={discoverableUsers} 
                    sessions={filteredSessions} 
                    communities={communities}
                    allCommunityPosts={filteredCommunityPosts}
                    setView={setView} 
                />;
            case 'PROFILE_DETAIL':
                return <ProfileDetail user={view.user} currentUser={currentUser!} onBack={() => setView({ type: 'DISCOVER_PEERS' })} onToggleBlockUser={handleToggleBlockUser}/>;
            case 'CHAT_INBOX':
                return <ChatInbox currentUser={currentUser!} allUsers={allUsers} setView={setView} onBack={() => setView({ type: 'DISCOVER_PEERS' })} />;
            case 'CHAT':
                 return (
                    <div className="h-[calc(100vh-8rem)] sm:h-[calc(100vh-4rem)]">
                        <ChatView chatId={view.chatId} currentUser={currentUser!} otherUser={view.otherUser} onBack={() => setView({ type: 'CHAT_INBOX' })} />
                    </div>
                 );
            case 'NOTIFICATIONS':
                return <NotificationsPage 
                    notifications={notifications} 
                    setView={setView} 
                    onBack={() => setView({ type: 'HOME' })} 
                    markAsRead={handleMarkNotificationsAsRead}
                    communities={communities}
                    posts={allCommunityPosts}
                />;
            case 'CREATE_SESSION':
                return <CreateSessionPage currentUser={currentUser!} addSession={handleAddSession} onBack={() => setView({ type: 'MY_SESSIONS' })} />;
            case 'MY_SESSIONS':
                return <MySessionsPage currentUser={currentUser!} sessions={filteredSessions} setView={setView} onBack={() => setView({ type: 'HOME' })} onJoin={handleJoinOrLeaveSession} onEndSession={handleEndSession} />;
            case 'SKILL_SHARING':
                return <SkillSharingPage currentUser={currentUser!} sessions={filteredSessions} onJoinOrLeaveSession={handleJoinOrLeaveSession} setView={setView} />;
             case 'DISCOVER_PEERS':
                return <DiscoverPeersPage currentUser={currentUser!} users={allUsers} setView={setView} />;
            case 'VIDEO_SESSION': {
                const liveSession = sessions.find(s => s.id === view.session.id);
                if (!liveSession) {
                    return (
                        <div className="flex h-screen bg-gray-900 text-white flex-col items-center justify-center">
                             <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500 mb-4"></div>
                             <h1 className="text-xl font-bold">Loading Session...</h1>
                             <p className="text-sm text-gray-400">If this persists, the session may have ended.</p>
                        </div>
                    );
                }
                return <VideoSessionPage session={liveSession} currentUser={currentUser!} allUsers={allUsers} onLeaveSession={handleLeaveVideoSession} />;
            }
            case 'COMMUNITY_AUTH':
                return <CommunityAuth communities={communities} setView={setView} currentUser={currentUser} />;
            case 'MY_COMMUNITIES':
                return <MyCommunitiesPage currentUser={currentUser!} communities={communities} setView={setView} />;
            case 'CREATE_COMMUNITY':
                return <CreateCommunityPage onCreateCommunity={handleCreateCommunity} onBack={() => setView({ type: 'HOME' })} />;
            case 'COMMUNITY_PAGE':
                 return <CommunityPage 
                    community={view.community} 
                    currentUser={currentUser} 
                    allUsers={allUsers} 
                    setView={setView} 
                    onCreatePost={handleCreateCommunityPost}
                    onUpdatePost={handleUpdateCommunityPost}
                    onUpdateCommunity={handleUpdateCommunity}
                    onToggleFollow={handleToggleFollowCommunity}
                 />;
            case 'COMMUNITY_POST_DETAIL':
                return <CommunityPostDetail
                    post={view.post}
                    community={view.community}
                    setView={setView}
                    currentUser={currentUser}
                    onToggleLike={handleToggleLikePost}
                    onAddComment={handleAddCommentToPost}
                    onDeleteComment={handleDeleteComment}
                />;
            case 'COMMUNITY_ADMIN':
                return <CommunityAdminPanel community={view.community} currentUser={currentUser!} allUsers={allUsers} setView={setView} onManageAdmin={handleManageAdmin} />;
            default:
                return <div>Unknown view</div>;
        }
    };
    
    const BottomNavBar: React.FC<{unreadCount: number}> = ({ unreadCount }) => (
        <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-white shadow-[0_-2px_5px_rgba(0,0,0,0.1)] z-40 border-t">
            <div className="flex justify-around h-16 items-center">
                <button onClick={() => setView({ type: 'HOME' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/5 py-2">
                    <HomeIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Home</span>
                </button>
                <button onClick={() => setView({ type: 'SKILL_SHARING' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/5 py-2">
                    <AcademicCapIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Sessions</span>
                </button>
                 <button onClick={() => setView({ type: 'COMMUNITY_AUTH' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/5 py-2">
                    <BuildingOfficeIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Communities</span>
                </button>
                <button onClick={() => setView({ type: 'DISCOVER_PEERS' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/5 py-2">
                    <UsersGroupIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Peers</span>
                </button>
                <button onClick={() => setView({ type: 'NOTIFICATIONS' })} className="flex flex-col items-center text-gray-600 hover:text-indigo-600 w-1/5 py-2 relative">
                    <BellIcon className="w-6 h-6" />
                    <span className="text-xs mt-1">Alerts</span>
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-4 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                    )}
                </button>
            </div>
        </nav>
    );
    
    return (
        <div className="bg-slate-50 min-h-screen pb-16 sm:pb-0">
            <Navbar currentUser={currentUser} setView={setView} unreadNotificationsCount={unreadNotificationsCount} />
            {renderView()}
             {currentUser && (
                <BottomNavBar unreadCount={unreadNotificationsCount} />
            )}
        </div>
    );
};

export default App;