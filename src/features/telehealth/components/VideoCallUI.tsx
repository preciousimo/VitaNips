// src/features/telehealth/components/VideoCallUI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TwilioVideo, { Room, LocalTrack, RemoteParticipant, RemoteTrack, LocalVideoTrack, LocalAudioTrack, ConnectOptions } from 'twilio-video';
import { MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneXMarkIcon, UserIcon } from '@heroicons/react/24/solid'; // Example icons
// import LoadingSpinner from '../../../components/common/LoadingSpinner';

interface ParticipantProps {
    participant: RemoteParticipant;
}

// Simple component to render a remote participant's tracks
const Participant: React.FC<ParticipantProps> = ({ participant }) => {
    const [videoTracks, setVideoTracks] = useState<RemoteTrack[]>([]);
    const [audioTracks, setAudioTracks] = useState<RemoteTrack[]>([]);

    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Helper to attach tracks to DOM elements
    const trackpubsToTracks = (trackMap: Map<string, any>): RemoteTrack[] =>
        Array.from(trackMap.values())
            .map((publication: any) => publication.track)
            .filter((track): track is RemoteTrack => track !== null);


    useEffect(() => {
        // Handle existing tracks
        setVideoTracks(trackpubsToTracks(participant.videoTracks));
        setAudioTracks(trackpubsToTracks(participant.audioTracks));

        // Handle new tracks published by the participant
        const trackSubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video') {
                setVideoTracks(prev => [...prev, track]);
            } else if (track.kind === 'audio') {
                setAudioTracks(prev => [...prev, track]);
            }
        };

        // Handle tracks unpublished by the participant
        const trackUnsubscribed = (track: RemoteTrack) => {
            if (track.kind === 'video') {
                setVideoTracks(prev => prev.filter(t => t !== track));
            } else if (track.kind === 'audio') {
                setAudioTracks(prev => prev.filter(t => t !== track));
            }
        };

        participant.on('trackSubscribed', trackSubscribed);
        participant.on('trackUnsubscribed', trackUnsubscribed);

        return () => {
            participant.off('trackSubscribed', trackSubscribed);
            participant.off('trackUnsubscribed', trackUnsubscribed);
        };
    }, [participant]);

     // Attach video track to video element
     useEffect(() => {
        const videoTrack = videoTracks[0];
        if (videoTrack && videoRef.current) {
            videoTrack.attach(videoRef.current);
            return () => {
                videoTrack.detach();
            };
        }
    }, [videoTracks]);

    // Attach audio track to audio element
    useEffect(() => {
        const audioTrack = audioTracks[0];
        if (audioTrack && audioRef.current) {
            audioTrack.attach(audioRef.current);
            return () => {
                audioTrack.detach();
            };
        }
    }, [audioTracks]);


    return (
        <div className="bg-gray-700 rounded p-1 relative w-full aspect-video overflow-hidden shadow-md">
             <video ref={videoRef} autoPlay={true} className="w-full h-full object-cover" />
             <audio ref={audioRef} autoPlay={true} /> {/* Muted often by default */}
             <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                 {participant.identity} {/* Display participant identity */}
             </div>
        </div>
    );
};


interface VideoCallUIProps {
    token: string;
    roomName: string;
    onDisconnect: () => void; // Callback when call ends/disconnects
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({ token, roomName, onDisconnect }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [participants, setParticipants] = useState<RemoteParticipant[]>([]);
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const localVideoRef = useRef<HTMLVideoElement>(null);

     // Cleanup function to detach tracks and disconnect
    const cleanupAndDisconnect = useCallback(() => {
         if (room) {
            // Detach local tracks before disconnecting
             room.localParticipant.tracks.forEach(publication => {
                const track = publication.track;
                if (track) {
                    track.stop();
                    track.detach().forEach(element => element.remove());
                }
            });
            room.disconnect();
            setRoom(null);
        }
        onDisconnect(); // Notify parent component
     }, [room, onDisconnect]);


    // Effect to connect to Twilio room
    useEffect(() => {
        setIsConnecting(true);
        setError(null);

        const connectOptions: ConnectOptions = {
            name: roomName,
            audio: true, // Request audio track
            video: { width: 640 } // Request video track with constraints
        };

        TwilioVideo.connect(token, connectOptions).then(
            (connectedRoom) => {
                console.log(`Successfully joined a Room: ${connectedRoom.name}`);
                setRoom(connectedRoom);
                setIsConnecting(false);

                // Display local participant's video
                 if (localVideoRef.current) {
                     connectedRoom.localParticipant.tracks.forEach(publication => {
                         if (publication.track && publication.kind === 'video') {
                             const videoElement = publication.track.attach();
                             videoElement.style.width = '100%'; // Ensure video fills container
                             videoElement.style.height = '100%';
                             videoElement.style.objectFit = 'cover';
                             localVideoRef.current.appendChild(videoElement);
                         }
                     });
                 }


                // Handle existing participants
                const initialParticipants = Array.from(connectedRoom.participants.values());
                setParticipants(initialParticipants);

                // Handle new participants joining
                connectedRoom.on('participantConnected', (participant) => {
                    console.log(`Participant connected: ${participant.identity}`);
                    setParticipants(prev => [...prev, participant]);
                });

                // Handle participants leaving
                connectedRoom.on('participantDisconnected', (participant) => {
                    console.log(`Participant disconnected: ${participant.identity}`);
                    setParticipants(prev => prev.filter(p => p !== participant));
                });

                // Handle disconnect events (e.g., kicked, room ended)
                 connectedRoom.on('disconnected', (room, error) => {
                     console.warn('Disconnected from room:', room.name, error);
                     setError(error ? `Disconnected: ${error.message}` : 'Disconnected from call.');
                     cleanupAndDisconnect();
                 });

            },
            (connectionError) => {
                console.error(`Failed to connect: ${connectionError.message}`);
                setError(`Failed to connect: ${connectionError.message}`);
                setIsConnecting(false);
                 onDisconnect(); // Connection failed
            }
        );

        // Cleanup on component unmount
        return () => {
             if (room) {
                 console.log("Disconnecting from room on unmount");
                 cleanupAndDisconnect();
             }
         };
    }, [token, roomName, cleanupAndDisconnect, onDisconnect]); // Added dependencies


     // --- Media Controls ---
     const toggleVideo = useCallback(() => {
        if (!room) return;
        room.localParticipant.videoTracks.forEach(pub => {
             if (isVideoEnabled) {
                 pub.track.disable();
             } else {
                 pub.track.enable();
             }
         });
         setIsVideoEnabled(!isVideoEnabled);
     }, [room, isVideoEnabled]);

     const toggleAudio = useCallback(() => {
        if (!room) return;
         room.localParticipant.audioTracks.forEach(pub => {
             if (isAudioEnabled) {
                 pub.track.disable();
             } else {
                 pub.track.enable();
             }
         });
         setIsAudioEnabled(!isAudioEnabled);
     }, [room, isAudioEnabled]);
     // --- End Media Controls ---


    if (isConnecting) {
        return <div className="p-4 text-center"><p>Connecting to video call...</p>{/* <LoadingSpinner/> */}</div>;
    }

    if (error) {
         return <div className="p-4 text-center text-red-600"><p>Error: {error}</p><button onClick={onDisconnect} className='btn-primary mt-4'>Close</button></div>;
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-4 items-center justify-center">
                 {/* Local Participant Video */}
                 <div ref={localVideoRef} className="bg-black rounded relative w-full aspect-video overflow-hidden shadow-md">
                      {/* Video track attached here by useEffect */}
                      <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 rounded">
                           You ({room?.localParticipant?.identity}) {!isAudioEnabled && '(Mic Muted)'} {!isVideoEnabled && '(Cam Off)'}
                       </div>
                 </div>

                 {/* Remote Participants */}
                 {participants.map(participant => (
                     <Participant key={participant.sid} participant={participant} />
                 ))}
                  {/* Placeholder if no remote participants */}
                 {participants.length === 0 && (
                     <div className="bg-gray-800 rounded w-full aspect-video flex items-center justify-center text-muted flex-col shadow-md">
                          <UserIcon className='h-16 w-16 mb-2'/>
                          <p>Waiting for others to join...</p>
                     </div>
                 )}
            </div>

            {/* Controls */}
            <div className="flex-shrink-0 flex justify-center items-center space-x-4 py-4 mt-4 bg-gray-800 rounded-lg">
                 <button onClick={toggleAudio} title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"} className={`p-3 rounded-full ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
                     <MicrophoneIcon className={`h-6 w-6 ${isAudioEnabled ? 'text-white' : 'text-gray-300'}`}/>
                 </button>
                  <button onClick={toggleVideo} title={isVideoEnabled ? "Stop Camera" : "Start Camera"} className={`p-3 rounded-full ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
                     {isVideoEnabled ? <VideoCameraIcon className="h-6 w-6 text-white"/> : <VideoCameraSlashIcon className="h-6 w-6 text-gray-300"/>}
                 </button>
                 {/* TODO: Add Screen Share button if needed */}
                 <button onClick={cleanupAndDisconnect} title="End Call" className="p-3 rounded-full bg-red-600 hover:bg-red-700">
                      <PhoneXMarkIcon className="h-6 w-6 text-white"/>
                 </button>
            </div>
        </div>
    );
};

export default VideoCallUI;