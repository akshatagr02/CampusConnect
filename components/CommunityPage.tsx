import React, { useState, useEffect, useRef, useMemo } from 'react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, Timestamp } from 'firebase/firestore';
import { Community, CommunityPost, UserProfile, View } from '../types';
import Avatar from './Avatar';
import { BuildingOfficeIcon, PencilIcon, UsersGroupIcon, PlusIcon, XCircleIcon, EllipsisVerticalIcon, Cog6ToothIcon } from './Icons';
import { EditCommunityForm } from './EditCommunityForm';

declare var Quill: any;

interface PostCardProps {
    post: CommunityPost;
    author: UserProfile | undefined;
    currentUser: UserProfile | null;
    isCommunityAdmin: boolean;
    onEdit: (post: CommunityPost) => void;
    onViewDetail: () => void;
    onViewAuthor: (author: UserProfile) => void;
}

const PostCard: React.FC<PostCardProps> = ({ post, author, currentUser, isCommunityAdmin, onEdit, onViewDetail, onViewAuthor }) => {
    const formatDate = (timestamp: { seconds: number }) => {
        if (!timestamp) return '';
        const date = new Date(timestamp.seconds * 1000);
        return date.toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });
    };
    
    const quillContentRef = useRef<HTMLDivElement>(null);
    const carouselRef = useRef<HTMLDivElement>(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    const canModify = currentUser && (currentUser.uid === post.authorId || isCommunityAdmin);

    const handleAuthorClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (author) {
            onViewAuthor(author);
        }
    };

    // Click outside handler for the menu
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    // Refs for drag/swipe logic
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
                // Try to parse as a Quill Delta object
                const delta = JSON.parse(post.text);
                quill.setContents(delta);
            } catch (e) {
                // Fallback for old plain text posts
                quill.setText(post.text);
            }
        }
    }, [post.text]);
    
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
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-md cursor-pointer hover:shadow-lg transition-shadow" onClick={onViewDetail}>
            <div className="flex items-start justify-between mb-4">
                 <div className="flex items-center group" onClick={handleAuthorClick}>
                    <Avatar name={post.authorAvatarName} className="h-12 w-12" />
                    <div className="ml-4">
                        <p className="font-bold text-gray-900 text-md group-hover:underline">{post.authorName}</p>
                        <p className="text-sm text-gray-500">{formatDate(post.createdAt)}</p>
                    </div>
                </div>
                 {canModify && (
                    <div className="relative" ref={menuRef} onClick={e => e.stopPropagation()}>
                        <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 rounded-full text-gray-500 hover:bg-gray-100">
                            <EllipsisVerticalIcon className="w-6 h-6" />
                        </button>
                        {isMenuOpen && (
                            <div className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-10">
                                <div className="py-1">
                                    <button onClick={() => { onEdit(post); setIsMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                                        <PencilIcon className="w-4 h-4 mr-3" /> Edit
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div ref={quillContentRef} style={{"border":"2px solid white"}} className="read-only-quill prose max-w-none text-gray-800 mb-4 line-clamp-4"></div>

            {post.imageUrls && post.imageUrls.length > 0 && (
                <div onClick={e => e.stopPropagation()}>
                    {post.imageUrls.length === 1 ? (
                        <a href={post.imageUrls[0]} target="_blank" rel="noopener noreferrer">
                            <div className="w-full aspect-video bg-gray-100 rounded-lg overflow-hidden border">
                                <img
                                    src={post.imageUrls[0]}
                                    alt={`Post image 1`}
                                    className="h-full object-contain m-auto"
                                    style={{"width":"fit-content"}}
                                />
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
                                        <img
                                            src={url}
                                            alt={`Post image ${index + 1}`}
                                            className="w-full h-full object-contain"
                                            draggable="false"
                                        />
                                    </div>
                                ))}
                            </div>

                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                {post.imageUrls.map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            goToImage(index);
                                        }}
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
    );
};

interface CreatePostFormProps {
    communityId: string;
    onClose: () => void;
    onCreatePost: (communityId: string, text: string, imageUrls: string[]) => void;
    postToEdit?: CommunityPost | null;
    onUpdatePost: (communityId: string, postId: string, text: string, imageUrls: string[]) => void;
};

const CreatePostForm: React.FC<CreatePostFormProps> = ({ communityId, onClose, onCreatePost, postToEdit, onUpdatePost }) => {
    const [text, setText] = useState('');
    const [imageUrls, setImageUrls] = useState<string[]>(['']);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const quillRef = React.useRef<HTMLDivElement>(null);
    const quillInstance = React.useRef<any>(null);

    const isEditing = !!postToEdit;

    useEffect(() => {
        if (quillRef.current && !quillInstance.current) {
            const editor = new Quill(quillRef.current, {
                theme: 'snow',
                modules: {
                    toolbar: [
                        [{ 'header': [1, 2, false] }],
                        ['bold', 'italic', 'underline', 'strike'],
                        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                        ['link', 'blockquote'],
                        ['clean']
                    ],
                },
                placeholder: "What's on your mind?",
            });

            editor.on('text-change', () => {
                setText(JSON.stringify(editor.getContents()));
            });
            quillInstance.current = editor;
        }

        if (isEditing && quillInstance.current) {
            try {
                const delta = JSON.parse(postToEdit.text);
                quillInstance.current.setContents(delta);
            } catch (e) {
                quillInstance.current.setText(postToEdit.text);
            }
            // Ensure there's at least one input field
            setImageUrls(postToEdit.imageUrls && postToEdit.imageUrls.length > 0 ? postToEdit.imageUrls : ['']);
        }

    }, [isEditing, postToEdit]);

    const handleImageUrlChange = (index: number, value: string) => {
        const newUrls = [...imageUrls];
        newUrls[index] = value;
        setImageUrls(newUrls);
    };

    const addImageUrlInput = () => {
        if (imageUrls.length < 4) {
            setImageUrls([...imageUrls, '']);
        }
    };

    const removeImageUrlInput = (index: number) => {
        const newUrls = imageUrls.filter((_, i) => i !== index);
        // If all inputs are removed, add a single empty one back
        if (newUrls.length === 0) {
            setImageUrls(['']);
        } else {
            setImageUrls(newUrls);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const quill = quillInstance.current;
        if (!quill || quill.getLength() <= 1) {
            alert("Please provide some content for your post.");
            return;
        }
        if (isSubmitting) return;

        setIsSubmitting(true);
        
        try {
            const finalImageUrls = imageUrls.filter(url => url.trim() !== '');
            if (isEditing) {
                await onUpdatePost(communityId, postToEdit.id, text, finalImageUrls);
            } else {
                await onCreatePost(communityId, text, finalImageUrls);
            }
            onClose();
        } catch (error) {
            console.error("Failed to submit post:", error);
            alert("Failed to submit post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };


    return (
        <div className="p-5">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="bg-white text-gray-900 border border-gray-300 rounded-md">
                    <div ref={quillRef} style={{ minHeight: '150px' }} />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Image URLs (Optional, up to 4)</label>
                    <div className="space-y-2">
                        {imageUrls.map((url, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="url"
                                    value={url}
                                    onChange={(e) => handleImageUrlChange(index, e.target.value)}
                                    placeholder="https://example.com/image.png"
                                    className="flex-grow w-full p-2 border border-gray-300 rounded-md bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImageUrlInput(index)}
                                    className="p-2 text-red-500 hover:bg-red-100 rounded-full"
                                    aria-label="Remove image link"
                                >
                                    <XCircleIcon className="w-6 h-6" />
                                </button>
                            </div>
                        ))}
                    </div>
                    {imageUrls.length < 4 && (
                        <button
                            type="button"
                            onClick={addImageUrlInput}
                            className="mt-2 flex items-center px-3 py-2 border border-dashed border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Add image link
                        </button>
                    )}
                </div>
                
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2 px-4 bg-indigo-600 text-white font-semibold rounded-md hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-wait relative overflow-hidden transition-colors"
                >
                    <span className="relative z-10">
                        {isSubmitting ? (isEditing ? 'Saving...' : 'Posting...') : (isEditing ? 'Save Changes' : 'Post')}
                    </span>
                </button>
            </form>
        </div>
    );
};


interface CommunityPageProps {
  community: Community;
  currentUser: UserProfile | null;
  allUsers: UserProfile[];
  setView: (view: View) => void;
  onCreatePost: (communityId: string, text: string, imageUrls: string[]) => void;
  onUpdatePost: (communityId: string, postId: string, text: string, imageUrls: string[]) => void;
  onUpdateCommunity: (communityId: string, updatedData: Partial<Omit<Community, 'id'>>) => void;
  onToggleFollow: (communityId: string) => void;
}

export const CommunityPage: React.FC<CommunityPageProps> = ({ community, currentUser, allUsers, setView, onCreatePost, onUpdatePost, onUpdateCommunity, onToggleFollow }) => {
    const [posts, setPosts] = useState<CommunityPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
    const [isEditCommunityModalOpen, setIsEditCommunityModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);

    const isAdmin = currentUser ? community.adminIds.includes(currentUser.uid) : false;
    
    // State for optimistic UI updates on follow/unfollow
    const [optimisticIsFollowing, setOptimisticIsFollowing] = useState(
        currentUser?.followingCommunities?.includes(community.id) ?? false
    );
    const [optimisticFollowerCount, setOptimisticFollowerCount] = useState(
        community.followerIds?.length || 0
    );

    const usersMap = useMemo(() => new Map(allUsers.map(user => [user.uid, user])), [allUsers]);

    // Sync state with props when community changes
    useEffect(() => {
        const isActuallyFollowing = currentUser?.followingCommunities?.includes(community.id) ?? false;
        const actualFollowerCount = community.followerIds?.length || 0;
        setOptimisticIsFollowing(isActuallyFollowing);
        setOptimisticFollowerCount(actualFollowerCount);
    }, [community.id, currentUser?.followingCommunities, community.followerIds]);


    useEffect(() => {
        const postsRef = collection(db, 'communities', community.id, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
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
                return { id: doc.id, ...sanitizedData } as CommunityPost
            });
            setPosts(postsData);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [community.id]);

    const handleOpenCreateModal = () => {
        setEditingPost(null);
        setIsCreatePostModalOpen(true);
    };

    const handleOpenEditModal = (post: CommunityPost) => {
        setEditingPost(post);
        setIsCreatePostModalOpen(true);
    };

    const handleClosePostModal = () => {
        setIsCreatePostModalOpen(false);
        setEditingPost(null);
    };
    
    const handleFollowClick = () => {
        if (!currentUser) return;

        // Optimistically update the UI
        const currentlyFollowing = optimisticIsFollowing;
        setOptimisticIsFollowing(!currentlyFollowing);
        setOptimisticFollowerCount(current => !currentlyFollowing ? current + 1 : current - 1);
        
        // Call the actual update function
        onToggleFollow(community.id);
    };


    return (
        <div className="bg-slate-100 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 lg:px-20 xl:px-32">
                 <button onClick={() => setView({type: 'COMMUNITY_AUTH'})} className="mb-6 text-indigo-600 hover:text-indigo-800 font-medium flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Back to Communities
                </button>
                
                <header className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                        <div className="flex-shrink-0 h-24 w-24 bg-gray-200 rounded-lg flex items-center justify-center">
                            {community.profilePictureUrl ? (
                                <img src={community.profilePictureUrl} alt={`${community.name} profile`} className="h-full w-full object-cover rounded-lg" />
                            ) : (
                                <BuildingOfficeIcon className="h-12 w-12 text-gray-500" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-800">{community.name}</h1>
                                    <p className="text-md font-semibold text-indigo-600 mt-1">{community.college}</p>
                                </div>
                                {currentUser && (
                                    <button
                                        onClick={handleFollowClick}
                                        className={`px-6 py-2 rounded-full font-semibold text-sm transition-colors flex-shrink-0 ${
                                            optimisticIsFollowing
                                                ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                        }`}
                                    >
                                        {optimisticIsFollowing ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>
                            <div className="mt-4 flex items-center text-gray-600">
                                <UsersGroupIcon className="w-5 h-5 mr-2" />
                                <span className="font-semibold">{optimisticFollowerCount}</span>
                                <span className="ml-1">Follower{optimisticFollowerCount !== 1 ? 's' : ''}</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="md:flex md:gap-8 items-start">
                    {/* Main Content */}
                    <main className="md:w-2/3 space-y-6">
                         {isAdmin && currentUser && (
                            <div className="bg-white p-4 rounded-xl shadow-md flex items-center space-x-3">
                                <Avatar name={currentUser.name} className="h-12 w-12"/>
                                <button
                                    onClick={handleOpenCreateModal}
                                    className="flex-grow text-left bg-gray-100 hover:bg-gray-200 text-gray-500 font-medium py-3 px-4 rounded-full transition-colors"
                                >
                                    Start a post...
                                </button>
                            </div>
                        )}

                        {loading ? (
                            <p className="text-center text-gray-500 py-10">Loading posts...</p>
                        ) : posts.length > 0 ? (
                            posts.map(post => {
                                const author = usersMap.get(post.authorId);
                                return (
                                    <PostCard 
                                        key={post.id} 
                                        post={post}
                                        author={author}
                                        currentUser={currentUser}
                                        isCommunityAdmin={isAdmin}
                                        onEdit={handleOpenEditModal}
                                        onViewDetail={() => setView({ type: 'COMMUNITY_POST_DETAIL', post, community })}
                                        onViewAuthor={(user) => setView({ type: 'PROFILE_DETAIL', user })}
                                    />
                                );
                            })
                        ) : (
                            <div className="text-center py-16 bg-white rounded-2xl shadow-md">
                                <PencilIcon className="mx-auto h-12 w-12 text-gray-400" />
                                <h3 className="mt-4 text-xl font-semibold text-gray-700">No Posts Yet</h3>
                                <p className="text-gray-500 mt-2">
                                    {isAdmin ? "Create the first post to get the conversation started!" : "Check back later for new posts."}
                                </p>
                            </div>
                        )}
                    </main>

                    {/* Sidebar */}
                    <aside className="md:w-1/3 mt-8 md:mt-0">
                        <div className="md:sticky md:top-24 space-y-6">
                           <div className="bg-white p-6 rounded-xl shadow-md">
                               <h3 className="font-bold text-lg text-gray-800 mb-3">About this community</h3>
                               <p className="text-gray-600 text-sm leading-relaxed">{community.description}</p>
                           </div>
                           {isAdmin && (
                                <div className="bg-white p-6 rounded-xl shadow-md">
                                    <h3 className="font-bold text-lg text-gray-800 mb-4">Admin Tools</h3>
                                    <div className="space-y-3">
                                        <button 
                                            onClick={() => setIsEditCommunityModalOpen(true)}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-200 text-gray-800 text-sm font-semibold rounded-md hover:bg-gray-300 transition-colors">
                                            <PencilIcon className="w-5 h-5 mr-2" />
                                            Edit Community
                                        </button>
                                        <button 
                                            onClick={() => setView({ type: 'COMMUNITY_ADMIN', community })}
                                            className="w-full flex items-center justify-center px-4 py-2 bg-gray-700 text-white text-sm font-semibold rounded-md hover:bg-gray-800 transition-colors">
                                            <Cog6ToothIcon className="w-5 h-5 mr-2" />
                                            Manage Admins
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>

            {isCreatePostModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
                        <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">{editingPost ? 'Edit Post' : 'Create Post'}</h2>
                            <button
                                onClick={handleClosePostModal}
                                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                            >
                                <XCircleIcon className="w-8 h-8"/>
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                           <CreatePostForm 
                                communityId={community.id} 
                                onClose={handleClosePostModal}
                                onCreatePost={onCreatePost}
                                postToEdit={editingPost}
                                onUpdatePost={onUpdatePost}
                            />
                        </div>
                    </div>
                </div>
            )}

            {isEditCommunityModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl relative animate-slide-up flex flex-col max-h-[90vh]">
                         <div className="flex items-center justify-between p-4 border-b flex-shrink-0">
                            <h2 className="text-xl font-bold text-gray-800">Edit Community</h2>
                            <button
                                onClick={() => setIsEditCommunityModalOpen(false)}
                                className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800"
                            >
                                <XCircleIcon className="w-8 h-8"/>
                            </button>
                        </div>
                        <div className="overflow-y-auto">
                            <EditCommunityForm
                                community={community}
                                onUpdateCommunity={onUpdateCommunity}
                                onClose={() => setIsEditCommunityModalOpen(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};