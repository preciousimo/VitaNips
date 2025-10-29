// src/features/telehealth/components/VideoCallUI.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import TwilioVideo, {
    Room, RemoteParticipant, RemoteTrack,
    LocalVideoTrack, LocalAudioTrack, RemoteVideoTrack, RemoteAudioTrack, ConnectOptions,
    TwilioError
} from 'twilio-video';
import { MicrophoneIcon, VideoCameraIcon, VideoCameraSlashIcon, PhoneXMarkIcon, UserIcon } from '@heroicons/react/24/solid';

interface ParticipantProps {
    participant: RemoteParticipant;
}

const Participant: React.FC<ParticipantProps> = ({ participant }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [videoTrack, setVideoTrack] = useState<RemoteVideoTrack | null>(null);
    const [audioTrack, setAudioTrack] = useState<RemoteAudioTrack | null>(null);

    useEffect(() => {
        const trackSubscribed = (track: RemoteTrack) => {
             console.log(`Track subscribed for ${participant.identity}: ${track.kind} (${track.sid})`);
            if (track.kind === 'video') {
                setVideoTrack(track as RemoteVideoTrack);
            } else if (track.kind === 'audio') {
                setAudioTrack(track as RemoteAudioTrack);
            }
        };

        const trackUnsubscribed = (track: RemoteTrack) => {
             console.log(`Track unsubscribed for ${participant.identity}: ${track.kind} (${track.sid})`);
            if (track.kind === 'video' && videoTrack?.sid === track.sid) {
                setVideoTrack(null);
            } else if (track.kind === 'audio' && audioTrack?.sid === track.sid) {
                setAudioTrack(null);
            }
        };

        participant.tracks.forEach(publication => {
            if (publication.isSubscribed && publication.track) {
                trackSubscribed(publication.track);
            }
        });

        participant.on('trackSubscribed', trackSubscribed);
        participant.on('trackUnsubscribed', trackUnsubscribed);

        return () => {
            console.log(`Cleaning up listeners for participant ${participant.identity}`);
            participant.off('trackSubscribed', trackSubscribed);
            participant.off('trackUnsubscribed', trackUnsubscribed);
            setVideoTrack(null);
            setAudioTrack(null);
        };
    }, [participant, videoTrack?.sid, audioTrack?.sid]);

    useEffect(() => {
        const track = videoTrack;
        const element = videoRef.current;
        if (track && element) {
            console.log(`Attaching video track ${track.sid} to element for ${participant.identity}`);
            track.attach(element);
            return () => {
                console.log(`Detaching video track ${track.sid} from element for ${participant.identity}`);
                 if (track?.detach) {
                    track.detach(element);
                 } else {
                    while (element.firstChild) {
                         element.removeChild(element.firstChild);
                    }
                 }
            };
        } else if (element) {
             while (element.firstChild) {
                 element.removeChild(element.firstChild);
             }
        }
    }, [videoTrack, participant.identity]);

    useEffect(() => {
        const track = audioTrack;
        const element = audioRef.current;
        if (track && element) {
            console.log(`Attaching audio track ${track.sid} to element for ${participant.identity}`);
            track.attach(element);
            return () => {
                console.log(`Detaching audio track ${track.sid} from element for ${participant.identity}`);
                 if (track?.detach) {
                     track.detach(element);
                 }
            };
        }
    }, [audioTrack, participant.identity]);


    return (
        <div className="bg-gray-700 rounded p-1 relative w-full aspect-video overflow-hidden shadow-md">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            <audio ref={audioRef} autoPlay />
            <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                {participant.identity}
            </div>
            {!videoTrack && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                    <UserIcon className="h-1/3 w-1/3 text-gray-500" />
                </div>
            )}
        </div>
    );
};

interface VideoCallUIProps {
    token: string;
    roomName: string;
    onDisconnect: () => void;
}

const VideoCallUI: React.FC<VideoCallUIProps> = ({ token, roomName, onDisconnect }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [participants, setParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
    const [isConnecting, setIsConnecting] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);

    const localVideoContainerRef = useRef<HTMLDivElement>(null);

    const cleanupAndDisconnect = useCallback(() => {
        setRoom(currentRoom => {
            if (currentRoom) {
                console.log(`Initiating cleanup and disconnect from room: ${currentRoom.name}`);
    
                currentRoom.localParticipant.tracks.forEach(publication => {
                    const track = publication.track;
                    if (track && 'kind' in track && (track.kind === 'video' || track.kind === 'audio')) {
                        const mediaTrack = track as LocalAudioTrack | LocalVideoTrack;
                        const mt = mediaTrack as { stop?: () => void };
                        if (typeof mt.stop === 'function') {
                            mt.stop();
                            console.log(`Stopped local track: ${mediaTrack.kind} ${mediaTrack.name || ''}`);
                        }
                        if (typeof mediaTrack.detach === 'function') {
                            const elements = mediaTrack.detach();
                            elements.forEach((element: Element) => {
                                element.remove();
                                console.log(`Detached and removed element for local track: ${mediaTrack.kind}`);
                            });
                        }
                    }
                });
    
                currentRoom.disconnect();
                console.log(`Disconnected from room: ${currentRoom.name}`);
            } else {
                console.log("cleanupAndDisconnect called but no current room.");
            }
            return null;
        });
        setParticipants(new Map());
        onDisconnect();
    }, [onDisconnect]);

    useEffect(() => {
        if (!token || !roomName) {
             setError("Missing connection details (token or room name).");
             setIsConnecting(false);
             return;
        }

        setIsConnecting(true);
        setError(null);
        let connectedRoomInstance: Room | null = null;

        const connectOptions: ConnectOptions = { name: roomName, audio: true, video: { width: 640 } };

        const handleParticipantConnected = (participant: RemoteParticipant) => {
            console.log(`Participant connected: ${participant.identity} (SID: ${participant.sid})`);
            setParticipants(prevParticipants => new Map(prevParticipants).set(participant.sid, participant));
        };

        const handleParticipantDisconnected = (participant: RemoteParticipant) => {
            console.log(`Participant disconnected: ${participant.identity} (SID: ${participant.sid})`);
            setParticipants(prevParticipants => {
                const newParticipants = new Map(prevParticipants);
                newParticipants.delete(participant.sid);
                return newParticipants;
            });
        };

        const handleRoomDisconnected = (room: Room, error?: TwilioError | Error) => {
            console.warn(`Disconnected from room: ${room.name}`, error || '(No specific error)');
             if (error) {
                 let friendlyMessage = `Disconnected: ${error.message}`;
                 if ('code' in error) {
                     switch(error.code) {
                         case 53118: friendlyMessage = "Could not access camera/microphone. Please check browser permissions."; break;
                         case 20104: friendlyMessage = "Your connection token has expired or is invalid. Please try rejoining."; break;
                         case 53000: case 53001: case 53002: friendlyMessage = "Connection lost. Please check your network and try again."; break;
                         case 53405: friendlyMessage = "Could not establish media connection. Check network/firewall."; break;
                     }
                 }
                 setError(friendlyMessage);
             } else {
                 setError('Disconnected from call.');
             }
             cleanupAndDisconnect();
        };

        TwilioVideo.connect(token, connectOptions).then(
            (roomInstance) => {
                connectedRoomInstance = roomInstance;
                console.log(`Successfully joined Room: ${connectedRoomInstance.name} (SID: ${connectedRoomInstance.sid})`);
                setRoom(connectedRoomInstance);
                setIsConnecting(false);

                if (localVideoContainerRef.current) {
                    localVideoContainerRef.current.innerHTML = '';
                    roomInstance.localParticipant.videoTracks.forEach(publication => {
                        if (publication.track) {
                            const videoElement = publication.track.attach();
                            videoElement.style.width = '100%';
                            videoElement.style.height = '100%';
                            videoElement.style.objectFit = 'cover';
                            videoElement.muted = true;
                            localVideoContainerRef.current?.appendChild(videoElement);
                        }
                    });
                }

                roomInstance.on('participantConnected', handleParticipantConnected);
                roomInstance.on('participantDisconnected', handleParticipantDisconnected);
                roomInstance.on('disconnected', handleRoomDisconnected);

                roomInstance.participants.forEach(handleParticipantConnected);

            },
            (connectionError: TwilioError | Error) => {
                 console.error(`Failed to connect to room ${roomName}:`, connectionError);
                 let friendlyMessage = `Failed to connect: ${connectionError.message}`;
                 if ('code' in connectionError) {
                     switch(connectionError.code) {
                         case 53118: friendlyMessage = "Connection failed: Could not access camera/microphone. Please check browser permissions."; break;
                         case 20101: case 20104: friendlyMessage = "Connection failed: Invalid or expired access token."; break;
                     }
                 }
                 setError(friendlyMessage);
                 setIsConnecting(false);
                 onDisconnect();
             }
         );

        return () => {
            console.log("Running VideoCallUI connection useEffect cleanup");
            const roomToClean = connectedRoomInstance;
            if (roomToClean) {
                console.log(`Cleaning up listeners and disconnecting from room: ${roomToClean.name}`);
                roomToClean.off('participantConnected', handleParticipantConnected);
                roomToClean.off('participantDisconnected', handleParticipantDisconnected);
                roomToClean.off('disconnected', handleRoomDisconnected);

                cleanupAndDisconnect();
            } else {
                console.log("Cleanup called but no room instance was available from this effect run.");
                onDisconnect();
            }
        };
    }, [token, roomName, cleanupAndDisconnect, onDisconnect]); 


     const toggleVideo = useCallback(() => {
         if (!room) return;
         const videoTrack = Array.from(room.localParticipant.videoTracks.values())[0]?.track;
         if (videoTrack && typeof videoTrack.isEnabled === 'boolean' && typeof videoTrack.enable === 'function' && typeof videoTrack.disable === 'function') {
             if (videoTrack.isEnabled) {
                 videoTrack.disable();
                 setIsVideoEnabled(false);
             } else {
                 videoTrack.enable();
                 setIsVideoEnabled(true);
             }
         } else {
             console.warn("Could not find local video track to toggle.");
         }
     }, [room]);

     const toggleAudio = useCallback(() => {
         if (!room) return;
         const audioTrack = Array.from(room.localParticipant.audioTracks.values())[0]?.track;
          if (audioTrack && typeof audioTrack.isEnabled === 'boolean' && typeof audioTrack.enable === 'function' && typeof audioTrack.disable === 'function') {
             if (audioTrack.isEnabled) {
                 audioTrack.disable();
                 setIsAudioEnabled(false);
             } else {
                 audioTrack.enable();
                 setIsAudioEnabled(true);
             }
         } else {
              console.warn("Could not find local audio track to toggle.");
         }
     }, [room]);

    if (isConnecting) {
         return <div className="flex justify-center items-center h-screen"><p>Connecting to video call...</p></div>;
    }

    if (error) {
         return (
             <div className="flex flex-col justify-center items-center h-screen bg-gray-900 text-white p-4">
                 <p className="text-red-400 text-center mb-4">Error: {error}</p>
                 <button onClick={cleanupAndDisconnect} className="btn-primary bg-red-600 hover:bg-red-700">
                     Close Call
                 </button>
            </div>
         );
    }

    const remoteParticipantsArray = Array.from(participants.values());

    return (
        <div className="flex flex-col h-screen bg-gray-900 text-white p-4">
             <div className={`flex-grow grid gap-2 items-center justify-center ${remoteParticipantsArray.length === 0 ? 'grid-cols-1' : (remoteParticipantsArray.length === 1 ? 'grid-cols-2' : 'grid-cols-2 grid-rows-2')} `}>
                 <div ref={localVideoContainerRef} className="bg-black rounded relative w-full aspect-video overflow-hidden shadow-md">
                     <div className="absolute bottom-1 left-1 bg-black bg-opacity-50 text-white text-xs px-1 py-0.5 rounded">
                         You ({room?.localParticipant?.identity}) {!isAudioEnabled && '(Mic Muted)'} {!isVideoEnabled && '(Cam Off)'}
                     </div>
                      {!isVideoEnabled && (
                         <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75">
                             <VideoCameraSlashIcon className="h-1/4 w-1/4 text-gray-500" />
                         </div>
                     )}
                 </div>

                 {remoteParticipantsArray.map(participant => (
                     <Participant key={participant.sid} participant={participant} />
                 ))}

                 {remoteParticipantsArray.length === 0 && !isConnecting && (
                     <div className="bg-gray-800 rounded w-full aspect-video flex items-center justify-center text-muted flex-col shadow-md">
                         <UserIcon className='h-16 w-16 mb-2' />
                         <p>Waiting for others to join...</p>
                     </div>
                 )}
            </div>

             <div className="flex-shrink-0 flex justify-center items-center space-x-4 py-4 mt-4 bg-gray-800 rounded-lg shadow-md">
                 <button onClick={toggleAudio} title={isAudioEnabled ? "Mute Mic" : "Unmute Mic"} className={`p-3 rounded-full transition-colors ${isAudioEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
                     <MicrophoneIcon className={`h-6 w-6 ${isAudioEnabled ? 'text-white' : 'text-gray-300'}`} />
                 </button>
                 <button onClick={toggleVideo} title={isVideoEnabled ? "Stop Camera" : "Start Camera"} className={`p-3 rounded-full transition-colors ${isVideoEnabled ? 'bg-gray-600 hover:bg-gray-500' : 'bg-red-600 hover:bg-red-500'}`}>
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