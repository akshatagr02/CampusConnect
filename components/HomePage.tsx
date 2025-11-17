import React, { useMemo } from 'react';
import { UserProfile, View, Session, Community, CommunityPost } from '../types';
import Avatar from './Avatar';
import { BellIcon, CalendarDaysIcon, UsersGroupIcon, BuildingOfficeIcon } from './Icons';

// Function to shuffle an array
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
};

const formatDate = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Helper function to extract text from Quill delta
const getTextFromDelta = (deltaString: string): string => {
    if (!deltaString) return '';
    try {
        const delta = JSON.parse(deltaString);
        if (Array.isArray(delta.ops)) {
            return delta.ops.map(op => (typeof op.insert === 'string' ? op.insert : ' ')).join('').trim();
        }
        return '';
    } catch (e) {
        // Fallback for plain text content
        return deltaString;
    }
};

const PostSummaryCard: React.FC<{
    post: CommunityPost;
    community: Community;
    setView: (view: View) => void;
}> = ({ post, community, setView }) => {
    const postSnippet = useMemo(() => {
        const text = getTextFromDelta(post.text);
        return text.length > 100 ? text.substring(0, 100) + '...' : text;
    }, [post.text]);

    return (
        <div 
            onClick={() => setView({ type: 'COMMUNITY_POST_DETAIL', post, community })}
            style={{"padding":"13px"}}className="p-3 border-b border-gray-100 p-5 last:border-b-0 last:pb-0 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
        >
            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-2">
                <Avatar name={community.name} className="h-5 w-5 text-[10px]" />
                <span className="font-semibold">{community.name}</span>
            </div>
            <div className="flex items-start space-x-3">
                <Avatar name={post.authorName} className="h-8 w-8 text-xs" />
                <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-800">{post.authorName}</p>
                    <p className="text-sm text-gray-600 mt-1">{postSnippet}</p>
                </div>
            </div>
        </div>
    );
};

export const HomePage: React.FC<{
  currentUser: UserProfile;
  users: UserProfile[];
  sessions: Session[];
  communities: Community[];
  allCommunityPosts: CommunityPost[];
  setView: (view: View) => void;
}> = ({ currentUser, users, sessions, communities, allCommunityPosts, setView }) => {

  const newSessions = useMemo(() => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return sessions.filter(session => {
        const isFuture = session.scheduledAt.seconds * 1000 > new Date().getTime();
        const notMySession = session.creatorId !== currentUser.uid;
        const isNew = session.createdAt.seconds * 1000 > sevenDaysAgo.getTime();
        if (!isFuture || !notMySession || !isNew) {
            return false;
        }
        const collegeMatch = session.targetColleges.includes('All') || session.targetColleges.includes(currentUser.college);
        const yearMatch = session.targetYears.includes('All') || session.targetYears.includes(currentUser.year);
        return collegeMatch && yearMatch;
    }).slice(0, 3);
  }, [sessions, currentUser]);

  const upcomingJoinedSessions = useMemo(() => {
      return sessions.filter(s => 
          s.status === 'scheduled' && 
          s.participantIds.includes(currentUser.uid) &&
          s.scheduledAt.seconds * 1000 > new Date().getTime()
      ).sort((a, b) => a.scheduledAt.seconds - b.scheduledAt.seconds)
      .slice(0, 3);
  }, [sessions, currentUser.uid]);

  const upcomingEvents = useMemo(() => {
    return sessions
      .filter(session => {
        const isFuture = session.scheduledAt.seconds * 1000 > new Date().getTime();
        const notMySession = session.creatorId !== currentUser.uid;
        const notJoined = !session.participantIds.includes(currentUser.uid);

        if (!isFuture || !notMySession || !notJoined) {
          return false;
        }

        const collegeMatch = session.targetColleges.includes('All') || session.targetColleges.includes(currentUser.college);
        const yearMatch = session.targetYears.includes('All') || session.targetYears.includes(currentUser.year);
        
        return collegeMatch && yearMatch;
      })
      .sort((a, b) => a.scheduledAt.seconds - b.scheduledAt.seconds)
      .slice(0, 3);
  }, [sessions, currentUser]);

  const randomUsers = useMemo(() => {
    const otherUsers = users.filter(user => user.uid !== currentUser.uid);
    return shuffleArray(otherUsers).slice(0, 4);
  }, [users, currentUser.uid]);
  
  const randomCommunities = useMemo(() => {
    return shuffleArray(communities).slice(0, 4);
  }, [communities]);

  const communitiesMap = useMemo(() => 
    new Map(communities.map(c => [c.id, c])), 
  [communities]);

  const communityFeed = useMemo(() => {
    if (allCommunityPosts.length === 0 || communitiesMap.size === 0) {
        return [];
    }

    const feedSize = 5;

    const validPostsFromOthers = allCommunityPosts
        .filter(post => post.authorId !== currentUser.uid && communitiesMap.has(post.communityId));

    const followedCommunityIds = new Set(currentUser.followingCommunities || []);
    let feed: { post: CommunityPost; community: Community }[] = [];
    if (followedCommunityIds.size > 0) {
        feed = validPostsFromOthers
            .filter(post => followedCommunityIds.has(post.communityId))
            .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
            .map(post => ({ post, community: communitiesMap.get(post.communityId)! }));
    }

    if (feed.length >= feedSize) {
        return feed.slice(0, feedSize);
    }

    const postIdsInFeed = new Set(feed.map(item => item.post.id));

    const keywords = currentUser.interests?.toLowerCase().split(/,?\s+/).filter(Boolean) || [];
    if (keywords.length > 0) {
        const interestPosts = validPostsFromOthers
            .filter(post => !postIdsInFeed.has(post.id) && !followedCommunityIds.has(post.communityId))
            .map(post => {
                const community = communitiesMap.get(post.communityId)!;
                let score = 0;
                const postText = getTextFromDelta(post.text).toLowerCase();
                const communityName = community.name.toLowerCase();
                const communityDesc = community.description.toLowerCase();

                for (const keyword of keywords) {
                    if (postText.includes(keyword)) score += 2;
                    if (communityName.includes(keyword)) score += 3;
                    if (communityDesc.includes(keyword)) score += 1;
                }
                return { post, community, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => {
                if (b.score !== a.score) return b.score - a.score;
                return b.post.createdAt.seconds - a.post.createdAt.seconds;
            });
        
        feed = [...feed, ...interestPosts.map(p => ({ post: p.post, community: p.community }))];
    }
    
    if (feed.length >= feedSize) {
        return feed.slice(0, feedSize);
    }
    
    const finalPostIdsInFeed = new Set(feed.map(item => item.post.id));
    const recentFallbackPosts = validPostsFromOthers
        .filter(post => !finalPostIdsInFeed.has(post.id))
        .sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
        .map(post => ({ post, community: communitiesMap.get(post.communityId)! }));

    feed = [...feed, ...recentFallbackPosts];

    return feed.slice(0, feedSize);

  }, [currentUser, allCommunityPosts, communitiesMap]);

  return (
    <div className="container mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
          <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {currentUser.name.split(' ')[0]}!</h1>
              <p className="text-gray-600">Here's what's happening on campus today.</p>
          </div>
      </div>
      
      <div className="space-y-8">
        
        {/* Sessions Section */}
        {(newSessions.length > 0 || upcomingJoinedSessions.length > 0) && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* New Sessions */}
                {newSessions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <BellIcon className="w-5 h-5 mr-2 text-indigo-500" />
                            New Sessions For You
                        </h3>
                        <ul className="space-y-3">
                            {newSessions.map(session => (
                                <li key={session.id} className="text-sm p-3 bg-indigo-50 rounded-lg">
                                    <p className="font-semibold text-indigo-800 truncate">{session.topic}</p>
                                    <p className="text-gray-600">by {session.creator}</p>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                        <CalendarDaysIcon className="w-4 h-4 mr-1.5"/>
                                        {formatDate(session.scheduledAt)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setView({ type: 'SKILL_SHARING' })} className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            View all sessions &rarr;
                        </button>
                    </div>
                )}
                
                {/* Your Upcoming Sessions */}
                {upcomingJoinedSessions.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <CalendarDaysIcon className="w-5 h-5 mr-2 text-green-500" />
                            Your Upcoming Sessions
                        </h3>
                        <ul className="space-y-3">
                            {upcomingJoinedSessions.map(session => (
                                <li key={session.id} onClick={() => setView({ type: 'VIDEO_SESSION', session })} className="text-sm p-3 bg-green-50 rounded-lg cursor-pointer hover:bg-green-100">
                                    <p className="font-semibold text-green-800 truncate">{session.topic}</p>
                                    <p className="text-gray-600">by {session.creator}</p>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center">
                                        <CalendarDaysIcon className="w-4 h-4 mr-1.5"/>
                                        {formatDate(session.scheduledAt)}
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setView({ type: 'MY_SESSIONS' })} className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            Manage my sessions &rarr;
                        </button>
                    </div>
                )}
            </div>
        )}

        {/* Community Feed */}
        <div className="bg-white rounded-xl shadow-md">
            <div className="p-4 border-b">
                <h2 className="text-lg font-bold text-gray-800">From Your Communities</h2>
            </div>
            {communityFeed.length > 0 ? (
                <div className="divide-y divide-gray-100">
                    {communityFeed.map(({ post, community }) => (
                        <PostSummaryCard key={post.id} post={post} community={community} setView={setView} />
                    ))}
                </div>
            ) : (
                <div className="p-6 text-center text-gray-500">
                    <p>Your community feed is empty.</p>
                    <p className="text-sm mt-1">Follow some communities or interact with posts to see updates here.</p>
                </div>
            )}
        </div>

        {/* Upcoming Events Section */}
        {upcomingEvents.length > 0 && (
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Upcoming Events to Join</h2>
                <div className="bg-white rounded-xl shadow-md p-4">
                    <ul className="space-y-3">
                        {upcomingEvents.map(session => (
                            <li 
                                key={session.id} 
                                onClick={() => setView({ type: 'SKILL_SHARING' })}
                                className="text-sm p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                            >
                                <p className="font-semibold text-gray-800 truncate">{session.topic}</p>
                                <p className="text-gray-600">by {session.creator}</p>
                                <div className="text-xs text-gray-500 mt-1 flex items-center">
                                    <CalendarDaysIcon className="w-4 h-4 mr-1.5"/>
                                    {formatDate(session.scheduledAt)}
                                </div>
                            </li>
                        ))}
                    </ul>
                    <button onClick={() => setView({ type: 'SKILL_SHARING' })} className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                        View all events &rarr;
                    </button>
                </div>
            </div>
        )}

        {/* Discovery Section */}
        <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Discover More</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Discover Peers */}
                {randomUsers.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <UsersGroupIcon className="w-5 h-5 mr-2 text-purple-500" />
                            Discover Peers
                        </h3>
                        <ul className="space-y-3">
                            {randomUsers.map(user => (
                                <li key={user.uid} onClick={() => setView({ type: 'PROFILE_DETAIL', user })} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Avatar name={user.name} className="h-10 w-10 text-sm" />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{user.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{user.college}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setView({ type: 'DISCOVER_PEERS' })} className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            See more peers &rarr;
                        </button>
                    </div>
                )}
                
                {/* Discover Communities */}
                {randomCommunities.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-4">
                        <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                            <BuildingOfficeIcon className="w-5 h-5 mr-2 text-blue-500" />
                            Discover Communities
                        </h3>
                        <ul className="space-y-3">
                            {randomCommunities.map(community => (
                                <li key={community.id} onClick={() => setView({ type: 'COMMUNITY_PAGE', community })} className="flex items-center space-x-3 p-2 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Avatar name={community.name} className="h-10 w-10 text-sm" />
                                    <div>
                                        <p className="font-semibold text-gray-800 text-sm">{community.name}</p>
                                        <p className="text-xs text-gray-500 truncate">{community.college}</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                        <button onClick={() => setView({ type: 'COMMUNITY_AUTH' })} className="mt-4 w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-800">
                            Explore communities &rarr;
                        </button>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};