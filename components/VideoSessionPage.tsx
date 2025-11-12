import React, { useMemo } from 'react';
import { Session, UserProfile } from '../types';
import Avatar from './Avatar';
import { LogoutIcon } from './Icons';

interface VideoSessionPageProps {
    session: Session;
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onLeaveSession: (session: Session) => void;
}

export const VideoSessionPage: React.FC<VideoSessionPageProps> = ({ session, currentUser, allUsers, onLeaveSession }) => {
    const isHost = currentUser.uid === session.creatorId;

    const participants = useMemo(() => {
        const usersMap = new Map<string, UserProfile>();
        allUsers.forEach(user => usersMap.set(user.uid, user));
        
        const participantProfiles: UserProfile[] = [];
        const creator = usersMap.get(session.creatorId);
        if (creator) {
            participantProfiles.push(creator);
        }

        session.participantIds.forEach(id => {
            if (id !== session.creatorId) {
                const user = usersMap.get(id);
                if (user) {
                    participantProfiles.push(user);
                }
            }
        });
        
        return participantProfiles;
    }, [allUsers, session.participantIds, session.creatorId]);

    const meetingUrlWithConfig = useMemo(() => {
        // Generate a unique and consistent room name from the session ID
        const roomName = `CampusConnect-${session.id}`;
        const baseUrl = `https://meet.jit.si/${roomName}`;

        const userInfo = `userInfo.displayName="${encodeURIComponent(currentUser.name)}"`;
        
        // Define buttons available to all participants
        const commonToolbarButtons = [
            'microphone', 'camera', 'closedcaptions', 'desktop', 'embedmeeting', 'fullscreen',
            'fodeviceselection', 'profile', 'chat', 'settings', 'raisehand', 'videoquality', 
            'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts', 'tileview', 'videobackgroundblur',
            'help'
        ];
        
        // Define special buttons available only to the host
        const hostToolbarButtons = [
            'recording', 'livestreaming', 'etherpad', 'sharedvideo', 'mute-everyone', 'security'
        ];

        // Conditionally combine the button lists
        const toolbarButtons = isHost ? [...commonToolbarButtons, ...hostToolbarButtons] : commonToolbarButtons;
        
        // Remove the hangup button to encourage using the app's Leave button
        const finalToolbarButtons = toolbarButtons.filter(b => b !== 'hangup');

        const toolbarConfig = `config.toolbarButtons=${JSON.stringify(finalToolbarButtons)}`;
        const interfaceConfig = `interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`;

        return `${baseUrl}#${userInfo}&${toolbarConfig}&${interfaceConfig}`;
    }, [session.id, currentUser.name, isHost]);

    return (
        <div className="flex h-screen bg-gray-900 text-white">
            {/* Main Video Content */}
            <div className="flex-1 flex flex-col">
                <header className="bg-gray-800 p-4 flex justify-between items-center shadow-md">
                    <div>
                        <h1 className="text-xl font-bold">{session.topic}</h1>
                        <p className="text-sm text-gray-400">Hosted by {session.creator}</p>
                    </div>
                    <button
                        onClick={() => onLeaveSession(session)}
                        className="flex items-center bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300"
                    >
                        <LogoutIcon className="h-5 w-5 mr-2" />
                        Leave Session
                    </button>
                </header>

                <main className="flex-1 bg-black">
                    <iframe
                        src={meetingUrlWithConfig}
                        allow="camera; microphone; fullscreen; display-capture"
                        className="w-full h-full border-0"
                        title={`Video Session: ${session.topic}`}
                    ></iframe>
                </main>
            </div>

            {/* Participants Sidebar */}
            <aside className="w-72 bg-gray-800 flex flex-col p-4 border-l border-gray-700">
                <h2 className="text-lg font-semibold mb-4 border-b border-gray-600 pb-2">Participants ({participants.length})</h2>
                <div className="flex-1 overflow-y-auto space-y-3">
                    {participants.map(user => (
                        <div key={user.uid} className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-700">
                            <Avatar name={user.name} className="h-10 w-10 text-sm" />
                            <div className="flex items-center">
                                <span className="font-medium truncate">{user.name}</span>
                                {user.uid === session.creatorId && (
                                    <span className="ml-2 text-xs font-bold text-yellow-300 bg-yellow-800/50 px-2 py-0.5 rounded-full">Host</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </aside>
        </div>
    );
};
