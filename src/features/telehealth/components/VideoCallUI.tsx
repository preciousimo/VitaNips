// src/features/telehealth/components/VideoCallUI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TwilioVideo, {
    Room, LocalTrack, RemoteParticipant, RemoteTrack, LocalVideoTrack,
    LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack, ConnectOptions,
    Participant as TwilioParticipant, TwilioError
} from 'twilio-video';
import { MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneXMarkIcon, UserIcon } from '@heroicons/react/24/solid';

interface ParticipantProps {
    participant: RemoteParticipant;
}

// --- Participant Component ---
const Participant: React.FC<ParticipantProps> = ({ participant }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    // Store tracks directly
    const [videoTrack, setVideoTrack] = useState<RemoteVideoTrack | null>(null);
    const [audioTrack, setAudioTrack] = useState<RemoteAudioTrack | null>(null);

    useEffect(() => {
        // Handle track subscription/unsubscription events
        const trackSubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video') {
                setVideoTrack(track as RemoteVideoTrack);
            } else if (track.kind === 'audio') {
                setAudioTrack(track as RemoteAudioTrack);
            }
        };

        const trackUnsubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video' && videoTrack === track) { // Check if it's the currently stored track
                setVideoTrack(null); // Setting to null will trigger cleanup effect below
            } else if (track.kind === 'audio' && audioTrack === track) {
                setAudioTrack(null); // Setting to null will trigger cleanup effect below
            }
        };

        // Handle existing tracks on initial mount
        participant.tracks.forEach(publication => {
            if (publication.track && publication.isSubscribed) {
                trackSubscribed(publication.track);
            }
        });

        participant.on('trackSubscribed', trackSubscribed);
        participant.on('trackUnsubscribed', trackUnsubscribed);

        return () => {
            participant.off('trackSubscribed', trackSubscribed);
            participant.off('trackUnsubscribed', trackUnsubscribed);
            // Clear tracks on participant disconnect (handled by parent removing this component)
            // or component unmount
            setVideoTrack(null);
            setAudioTrack(null);
        };
    }, [participant, videoTrack, audioTrack]); // Dependencies ensure cleanup if track references change

    // Effect to handle VIDEO attachment/detachment
    useEffect(() => {
        const track = videoTrack;
        const element = videoRef.current;
        if (track && element) {
            console.log(`Attaching video track ${track.sid} to element for ${participant.identity}`);
            track.attach(element);
            return () => {
                console.log(`Detaching video track ${track.sid} from element for ${participant.identity}`);
                track.detach(element);
            };
        }
        // If track becomes null but was previously attached, detach might implicitly happen
        // but explicitly clearing if element still exists can be safer if needed.
    }, [videoTrack, participant.identity]); // Depend only on the track itself

    // Effect to handle AUDIO attachment/detachment
    useEffect(() => {
        const track = audioTrack;
        const element = audioRef.current;
        if (track && element) {
            console.log(`Attaching audio track ${track.sid} to element for ${participant.identity}`);
            track.attach(element);
            return () => {
                console.log(`Detaching audio track ${track.sid} from element for ${participant.identity}`);
                track.detach(element);
            };
        }
    }, [audioTrack, participant.identity]);


    return (
        <div className="bg-gray-700 rounded p-1 relative w-full aspect-video overflow-hidden shadow-md">
            {/* Video element */}
            <video ref={videoRef} autoPlay={true} playsInline={true} className="w-full h-full object-cover" />
            {/* Audio element */}
            <audio ref={audioRef} autoPlay={true} />
            {/* Identity Tag */}
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                {participant.identity}
            </div>
            {/* Placeholder if no video track */}
            {!videoTrack && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <UserIcon className="h-1/3 w-1/3 text-gray-500" />
                </div>
            )}
        </div>
    );
};
// --- End Participant Component ---


interface VideoCallUIProps {
    token: string;
    roomName: string;
    onDisconnect: () => void;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({ token, roomName, onDisconnect }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    // **FIX:** Ref should point to the DIV container for the local video
    const localVideoContainerRef = useRef<HTMLDivElement>(null);

    // Cleanup function
    const cleanupAndDisconnect = useCallback(() => {
        if (room) {
            room.localParticipant.tracks.forEach(publication => {
                const track = publication.track;
                // **FIX:** Check if track exists and is a media track before stopping/detaching
                if (track) {
                    if (track.kind === 'audio' || track.kind === 'video') {
                        // stop() exists on LocalAudioTrack and LocalVideoTrack
                        track.stop();
                        // detach() also exists on media tracks
                        track.detach().forEach((element: HTMLElement) => element.remove());
                    }
                }
            });
            room.disconnect();
            setRoom(null);
            setParticipants([]);
        }
        onDisconnect();
    }, [room, onDisconnect]);

    // Effect to connect
    useEffect(() => {
        // Ensure cleanup function reference is stable if needed, though defined outside is fine
        const localCleanupAndDisconnect = cleanupAndDisconnect;

        setIsConnecting(true);
        setError(null);

        const connectOptions: ConnectOptions = {
            name: roomName,
            audio: true,
            video: { width: 640 }
        };

        let roomReference: Room | null = null; // Local reference for cleanup race condition

        TwilioVideo.connect(token, connectOptions).then(
            (connectedRoom) => {
                roomReference = connectedRoom; // Store reference
                console.log(`Successfully joined a Room: ${connectedRoom.name}`);
                setRoom(connectedRoom); // Update state
                setIsConnecting(false);

                // Attach local video track
                if (localVideoContainerRef.current) {
                    localVideoContainerRef.current.innerHTML = '';
                    connectedRoom.localParticipant.tracks.forEach(publication => {
                        if (publication.track?.kind === 'video') {
                            const videoElement = publication.track.attach();
                            videoElement.style.width = '100%';
                            videoElement.style.height = '100%';
                            videoElement.style.objectFit = 'cover';
                            videoElement.muted = true;
                            localVideoContainerRef.current?.appendChild(videoElement);
                        }
                    });
                }

                // --- Event Listeners ---

                // Handle existing participants before setting up listeners for new ones
                const initialParticipants = Array.from(connectedRoom.participants.values());
                setParticipants(initialParticipants);

                // **DEFINE THE LISTENER FUNCTIONS**
                const handleParticipantConnected = (participant: RemoteParticipant) => {
                    console.log(`Participant connected: ${participant.identity}`);
                    setParticipants(prevParticipants => {
                        if (!prevParticipants.some(p => p.sid === participant.sid)) {
                            return [...prevParticipants, participant];
                        }
                        return prevParticipants;
                    });
                };

                const handleParticipantDisconnected = (participant: RemoteParticipant) => {
                    console.log(`Participant disconnected: ${participant.identity}`);
                    setParticipants(prevParticipants =>
                        prevParticipants.filter(p => p.sid !== participant.sid)
                    );
                };

                // Use TwilioError type if available from import
                const handleRoomDisconnected = (room: Room, error?: TwilioError | Error) => {
                    console.warn('Disconnected from room:', room.name, error);
                    setError(error ? `Disconnected: ${error.message}` : 'Disconnected from call.');
                    // Call the main cleanup function passed via props or defined with useCallback
                    localCleanupAndDisconnect();
                };

                // **ATTACH THE LISTENERS (Replace Comments!)**
                connectedRoom.on('participantConnected', handleParticipantConnected);
                connectedRoom.on('participantDisconnected', handleParticipantDisconnected);
                connectedRoom.on('disconnected', handleRoomDisconnected);

                 // Store detach functions for cleanup
                 const detachListeners = () => {
                     connectedRoom.off('participantConnected', handleParticipantConnected);
                     connectedRoom.off('participantDisconnected', handleParticipantDisconnected);
                     connectedRoom.off('disconnected', handleRoomDisconnected);
                 };
                 // Assign to room reference for potential use in cleanup if state update is slow
                 (roomReference as any)._detachListeners = detachListeners;


            },
            (connectionError) => {
                console.error(`Failed to connect: ${connectionError.message}`);
                setError(`Failed to connect: ${connectionError.message}`);
                setIsConnecting(false);
                onDisconnect(); // Call disconnect callback on connection failure
            }
        );

        // Cleanup function for the useEffect hook
        return () => {
            console.log("Running useEffect cleanup for video connection");
             // Use the local reference 'roomReference' which is captured at connection time
             // This avoids issues if the 'room' state update hasn't completed yet when cleanup runs.
             const roomToDisconnect = roomReference;
             if (roomToDisconnect) {
                  // Detach listeners if stored
                  if (typeof (roomToDisconnect as any)._detachListeners === 'function') {
                     (roomToDisconnect as any)._detachListeners();
                 }
                 // Ensure disconnect runs using the captured reference
                 localCleanupAndDisconnect(); // Call the main cleanup/disconnect logic
             }
         };
    // Dependencies - ensure stable functions are used where possible
    }, [token, roomName, onDisconnect, cleanupAndDisconnect]);

    // --- Media Controls (No changes needed here, logic is sound) ---
    const toggleVideo = useCallback(() => { /* ... */ }, [room, isVideoEnabled]);
    const toggleAudio = useCallback(() => { /* ... */ }, [room, isAudioEnabled]);
    // --- End Media Controls ---


    // --- Render Logic (Mostly the same, update local video ref) ---
    if (isConnecting) { /* ... */ }
    if (error) { /* ... */ }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
                {/* Local Participant Video Container */}
                <div ref={localVideoContainerRef} className="bg-black rounded relative w-full aspect-video overflow-hidden shadow-md">
                    {/* Video track attached here by useEffect */}
                    <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                        You ({room?.localParticipant?.identity}) {!isAudioEnabled && '(Mic Muted)'} {!isVideoEnabled && '(Cam Off)'}
                    </div>
                </div>

                {/* Remote Participants */}
                {participants.map(participant => (
                    <Participant key={participant.sid} participant={participant} />
                ))}
                {participants.length === 0 && ( /* Placeholder */
                    <div className="bg-gray-800 rounded w-full aspect-video flex items-center justify-center text-muted flex-col shadow-md">
                        <UserIcon className='h-16 w-16 mb-2' />
                        <p>Waiting for others to join...</p>
                    </div>
                )}
            </div>

            {/* Controls (No changes needed) */}
            <div className="flex-shrink-0 flex justify-center items-center space-x-4 py-4 mt-4 bg-gray-800 rounded-lg">
                {/* ... buttons ... */}
                <button onClick={toggleAudio} title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
                    <MicrophoneIcon className={`h-6 w-6 ${isAudioEnabled ? 'text-white' : 'text-gray-300'}`} />
                </button>
                <button onClick={toggleVideo} title={isVideoEnabled ? "Stop Camera" : "Start Camera"} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
                    {isVideoEnabled ? <VideoCameraIcon className="h-6 w-6 text-white" /> : <VideoCameraSlashIcon className="h-6 w-6 text-gray-300" />}
                </button>
                <button onClick={cleanupAndDisconnect} title="End Call" className="p-3 rounded-full bg-red-600 hover:bg-red-700">
                    <PhoneXMarkIcon className="h-6 w-6 text-white" />
                </button>
            </div>
        </div>
    );
};

export default VideoCallUI;