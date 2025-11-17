import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../firebase';
import { doc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { Community, CommunityPost, View, UserProfile, Comment } from '../types';
import Avatar from './Avatar';
import { BuildingOfficeIcon, HeartIcon, EllipsisVerticalIcon, TrashIcon } from './Icons';

declare var Quill: any;

const formatDate = (timestamp: { seconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString([], { dateStyle: 'full', timeStyle: 'short' });
};

const formatCommentTimestamp = (timestamp: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return '';
    const date = new Date(timestamp.seconds * 1000);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return 'Just now';
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`;
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`;
    return `${Math.floor(diffSeconds / 86400)}d ago`;
};


interface CommunityPostDetailProps {
    post: CommunityPost;
    community: Community;
    setView: (view: View) => void;
    currentUser: UserProfile | null;
    onToggleLike: (communityId: string, postId: string) => void;
    onAddComment: (communityId: string, postId: string, text: string) => void;
    onDeleteComment: (communityId: string, postId: string, commentId: string) => void;
}

export const CommunityPostDetail: React.FC<CommunityPostDetailProps> = ({ post: initialPost, community, setView, currentUser, onToggleLike, onAddComment, onDeleteComment }) => {
    const [post, setPost] = useState<CommunityPost>(initialPost);
    const quillContentRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [comments, setComments] = useState<Comment[]>([]);
    const [loadingComments, setLoadingComments] = useState(true);
    const [newComment, setNewComment] = useState('');

    const isCommunityAdmin = currentUser ? community.adminIds.includes(currentUser.uid) : false;

    useEffect(() => {
        const postRef = doc(db, 'communities', community.id, 'posts', initialPost.id);
        const unsubscribe = onSnapshot(postRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
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
                setPost({ id: docSnap.id, ...sanitizedData } as CommunityPost);
            } else {
                // Post was deleted, navigate away
                alert("This post has been deleted.");
                setView({ type: 'COMMUNITY_PAGE', community });
            }
        });

        return () => unsubscribe();
    }, [community.id, initialPost.id, community, setView]);

    const hasLiked = useMemo(() => {
        if (!currentUser || !post.likes) return false;
        return post.likes.includes(currentUser.uid);
    }, [currentUser, post.likes]);

    const isDragging = useRef(false);
    const startX = useRef(0);
    const scrollLeftStart = useRef(0);

    useEffect(() => {
        if (quillContentRef.current && quillContentRef.current.innerHTML === '') {
            const quill = new Quill(quillContentRef.current, {
                readOnly: true,
                theme: 'snow',
                modules: { toolbar: false }
            });
            try {
                const delta = JSON.parse(post.text);
                quill.setContents(delta);
            } catch (e) {
                quill.setText(post.text);
            }
        }
    }, [post.text]);

    useEffect(() => {
        const commentsRef = collection(db, 'communities', community.id, 'posts', post.id, 'comments');
        const q = query(commentsRef, orderBy('createdAt', 'asc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            let commentsData = snapshot.docs.map(doc => {
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
                return { id: doc.id, ...sanitizedData } as Comment
            });

            if (currentUser?.blockedUsers) {
                commentsData = commentsData.filter(comment => !currentUser.blockedUsers!.includes(comment.authorId));
            }

            setComments(commentsData);
            setLoadingComments(false);
        });

        return () => unsubscribe();
    }, [community.id, post.id, currentUser]);
    
    const handleCommentSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (newComment.trim() && currentUser) {
            onAddComment(community.id, post.id, newComment.trim());
            setNewComment('');
        }
    };
    
    const handleDeleteComment = (commentId: string) => {
        if (window.confirm("Are you sure you want to delete this comment?")) {
            onDeleteComment(community.id, post.id, commentId);
        }
    };

    const goToImage = (index: number) => {
        if (carouselRef.current) {
            const imageWidth = carouselRef.current.offsetWidth;
            carouselRef.current.scrollTo({ left: index * imageWidth, behavior: 'smooth' });
        }
    };

    const handleScroll = () => {
        if (carouselRef.current) {
            const imageWidth = carouselRef.current.offsetWidth;
            const newIndex = Math.round(carouselRef.current.scrollLeft / imageWidth);
            setCurrentImageIndex(newIndex);
        }
    };

    const handleDragStart = (pageX: number) => {
        if (!carouselRef.current) return;
        isDragging.current = true;
        startX.current = pageX - carouselRef.current.offsetLeft;
        scrollLeftStart.current = carouselRef.current.scrollLeft;
        carouselRef.current.style.scrollSnapType = 'none';
        carouselRef.current.style.scrollBehavior = 'auto';
    };
    
    const handleDragEnd = () => {
        if (!isDragging.current || !carouselRef.current) return;
        isDragging.current = false;
        carouselRef.current.style.scrollSnapType = 'x mandatory';
        const imageWidth = carouselRef.current.offsetWidth;
        const newIndex = Math.round(carouselRef.current.scrollLeft / imageWidth);
        goToImage(newIndex);
    };

    const handleDragMove = (pageX: number) => {
        if (!isDragging.current || !carouselRef.current) return;
        const x = pageX - carouselRef.current.offsetLeft;
        const walk = (x - startX.current);
        carouselRef.current.scrollLeft = scrollLeftStart.current - walk;
    };

    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-4xl">
                <button 
                    onClick={() => setView({ type: 'COMMUNITY_PAGE', community })} 
                    className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to {community.name}
                </button>

                <article className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    <div 
                        className="p-4 border-b bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                        onClick={() => setView({ type: 'COMMUNITY_PAGE', community })}
                    >
                        <div className="flex items-center space-x-3">
                            <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center">
                                {community.profilePictureUrl ? (
                                    <img src={community.profilePictureUrl} alt={`${community.name} profile`} className="h-full w-full object-cover rounded-md" />
                                ) : (
                                    <BuildingOfficeIcon className="h-6 w-6 text-gray-500" />
                                )}
                            </div>
                            <div>
                                <p className="font-bold text-gray-800">{community.name}</p>
                                <p className="text-xs text-gray-500">Community Post</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="p-6 md:p-8">
                        <div className="flex items-start justify-between mb-6">
                            <div className="flex items-center">
                                <Avatar name={post.authorAvatarName} className="h-14 w-14 text-xl" />
                                <div className="ml-4">
                                    <p className="font-bold text-gray-900 text-lg">{post.authorName}</p>
                                    <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div ref={quillContentRef} style={{"border":"2px solid white"}} className="read-only-quill prose max-w-none text-gray-800"></div>

                        {post.imageUrls && post.imageUrls.length > 0 && (
                            <div className="mt-8">
                                {post.imageUrls.length === 1 ? (
                                    <a href={post.imageUrls[0]} target="_blank" rel="noopener noreferrer">
                                        <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                                            <img src={post.imageUrls[0]} alt={`Post image 1`} className="w-full h-full object-cover" />
                                        </div>
                                    </a>
                                ) : (
                                    <div className="relative">
                                        <div
                                            ref={carouselRef}
                                            onScroll={handleScroll}
                                            onMouseDown={(e) => handleDragStart(e.pageX)}
                                            onMouseLeave={handleDragEnd}
                                            onMouseUp={handleDragEnd}
                                            onMouseMove={(e) => handleDragMove(e.pageX)}
                                            onTouchStart={(e) => handleDragStart(e.touches[0].pageX)}
                                            onTouchEnd={handleDragEnd}
                                            onTouchMove={(e) => handleDragMove(e.touches[0].pageX)}
                                            className="flex overflow-x-auto scroll-snap-x-mandatory scrollbar-hide cursor-grab active:cursor-grabbing rounded-lg"
                                        >
                                            {post.imageUrls.map((url, index) => (
                                                <div key={index} className="flex-shrink-0 w-full aspect-video scroll-snap-center bg-gray-200">
                                                    <img src={url} alt={`Post image ${index + 1}`} className="w-full h-full object-contain" draggable="false" />
                                                </div>
                                            ))}
                                        </div>
                                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                            {post.imageUrls.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={(e) => { e.stopPropagation(); goToImage(index); }}
                                                    className={`w-2.5 h-2.5 rounded-full transition-colors focus:outline-none ${currentImageIndex === index ? 'bg-white ring-1 ring-black/20' : 'bg-white/50 hover:bg-white/75'}`}
                                                    aria-label={`Go to image ${index + 1}`}
                                                ></button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="p-6 md:p-8 border-t">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => onToggleLike(community.id, post.id)}
                                disabled={!currentUser}
                                className="flex items-center space-x-2 text-gray-600 hover:text-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label={hasLiked ? 'Unlike post' : 'Like post'}
                            >
                                <HeartIcon className={`w-6 h-6 ${hasLiked ? 'text-red-500 fill-current' : ''}`} />
                                <span className="font-semibold">{hasLiked ? 'Liked' : 'Like'}</span>
                            </button>
                            <span className="text-sm text-gray-500">{post.likes?.length || 0} likes</span>
                        </div>
                        <div className="mt-6">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">Comments ({comments.length})</h3>
                            {currentUser && (
                                <form onSubmit={handleCommentSubmit} className="flex items-start space-x-3 mb-6">
                                    <Avatar name={currentUser.name} className="h-10 w-10 flex-shrink-0" />
                                    <div className="flex-1">
                                        <textarea
                                            value={newComment}
                                            onChange={(e) => setNewComment(e.target.value)}
                                            placeholder="Add a comment..."
                                            rows={2}
                                            className="w-full p-2 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                                        ></textarea>
                                        <button
                                            type="submit"
                                            disabled={!newComment.trim()}
                                            className="mt-2 px-4 py-2 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 disabled:bg-indigo-400"
                                        >
                                            Post Comment
                                        </button>
                                    </div>
                                </form>
                            )}
                            <div className="space-y-4">
                                {loadingComments ? (
                                    <p className="text-gray-500">Loading comments...</p>
                                ) : comments.length > 0 ? (
                                    comments.map(comment => {
                                        const canDeleteComment = currentUser && (currentUser.uid === comment.authorId || isCommunityAdmin);
                                        return (
                                            <div key={comment.id} className="flex items-start space-x-3 group">
                                                <Avatar name={comment.authorAvatarName} className="h-10 w-10 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <div className="bg-gray-100 p-3 rounded-lg flex justify-between items-start">
                                                        <div>
                                                            <p className="font-semibold text-sm text-gray-800">{comment.authorName}</p>
                                                            <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                                                        </div>
                                                        {canDeleteComment && (
                                                            <button 
                                                                onClick={() => handleDeleteComment(comment.id)} 
                                                                className="ml-2 p-1 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                                                aria-label="Delete comment"
                                                            >
                                                                <TrashIcon className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 ml-2">{formatCommentTimestamp(comment.createdAt)}</p>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-gray-500 py-4">Be the first to comment.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </div>
        </div>
    );
};