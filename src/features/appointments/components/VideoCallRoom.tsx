// src/features/appointments/components/VideoCallRoom.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect, Room, LocalVideoTrack, LocalAudioTrack, RemoteParticipant, RemoteTrack, RemoteAudioTrack, RemoteVideoTrack } from 'twilio-video';
import {
    VideoCameraIcon,
    VideoCameraSlashIcon,
    MicrophoneIcon,
    PhoneXMarkIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
} from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';
import { generateVideoToken, endVideoSession } from '../../../api/video';

interface VideoCallRoomProps {
    appointmentId: number;
    onCallEnd: () => void;
}

const VideoCallRoom: React.FC<VideoCallRoomProps> = ({ appointmentId, onCallEnd }) => {
    const [room, setRoom] = useState<Room | null>(null);
    const [isConnecting, setIsConnecting] = useState(true);
    const [isVideoEnabled, setIsVideoEnabled] = useState(true);
    const [isAudioEnabled, setIsAudioEnabled] = useState(true);
    const [isSpeakerEnabled, setIsSpeakerEnabled] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [participantCount, setParticipantCount] = useState(0);
    const [callDuration, setCallDuration] = useState(0);
    
    const localVideoRef = useRef<HTMLDivElement>(null);
    const remoteVideoRef = useRef<HTMLDivElement>(null);
    const roomRef = useRef<Room | null>(null);
    const callStartTimeRef = useRef<number>(Date.now());

    // Format duration as MM:SS
    const formatDuration = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Update call duration every second
    useEffect(() => {
        const interval = setInterval(() => {
            setCallDuration(Math.floor((Date.now() - callStartTimeRef.current) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    // Handle remote participant
    const handleParticipant = useCallback((participant: RemoteParticipant) => {
        console.log(`Participant "${participant.identity}" connected`);
        
        participant.tracks.forEach(publication => {
            if (publication.track) {
                attachTrack(publication.track);
            }
        });

        participant.on('trackSubscribed', track => {
            console.log(`Subscribed to ${track.kind} track from ${participant.identity}`);
            attachTrack(track);
        });

        participant.on('trackUnsubscribed', track => {
            console.log(`Unsubscribed from ${track.kind} track`);
            detachTrack(track);
        });
    }, []);

    const attachTrack = (track: RemoteTrack) => {
        if (track.kind === 'video' && remoteVideoRef.current) {
            const existingElement = remoteVideoRef.current.querySelector('video');
            if (existingElement) {
                existingElement.remove();
            }
            const element = (track as RemoteVideoTrack).attach();
            element.className = 'w-full h-full object-cover rounded-lg';
            remoteVideoRef.current.appendChild(element);
        } else if (track.kind === 'audio') {
            (track as RemoteAudioTrack).attach();
        }
    };

    const detachTrack = (track: RemoteTrack) => {
        const elements = (track as RemoteVideoTrack | RemoteAudioTrack).detach();
        elements.forEach((element: HTMLElement) => {
            element.remove();
        });
    };

    // Initialize video call
    useEffect(() => {
        let mounted = true;

        const initializeCall = async () => {
            try {
                setIsConnecting(true);
                setError(null);

                // Get video token from backend
                const tokenData = await generateVideoToken(appointmentId);
                console.log('Token received:', { room: tokenData.room_name, identity: tokenData.identity });

                if (!mounted) return;

                // Request camera and microphone permissions
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: true
                });

                if (!mounted) {
                    stream.getTracks().forEach(track => track.stop());
                    return;
                }

                // Connect to Twilio Video Room
                const connectedRoom = await connect(tokenData.token, {
                    name: tokenData.room_name,
                    audio: true,
                    video: { width: 640, height: 480 }
                });

                if (!mounted) {
                    connectedRoom.disconnect();
                    return;
                }

                console.log(`Successfully connected to room: ${connectedRoom.name}`);
                setRoom(connectedRoom);
                roomRef.current = connectedRoom;
                callStartTimeRef.current = Date.now();

                // Attach local video track
                if (localVideoRef.current) {
                    connectedRoom.localParticipant.videoTracks.forEach(publication => {
                        const track = publication.track as LocalVideoTrack;
                        const element = track.attach();
                        element.className = 'w-full h-full object-cover rounded-lg mirror';
                        localVideoRef.current?.appendChild(element);
                    });
                }

                // Handle existing participants
                connectedRoom.participants.forEach(handleParticipant);
                setParticipantCount(connectedRoom.participants.size);

                // Listen for new participants
                connectedRoom.on('participantConnected', participant => {
                    console.log(`Participant connected: ${participant.identity}`);
                    handleParticipant(participant);
                    setParticipantCount(connectedRoom.participants.size);
                    toast.success(`${participant.identity} joined the call`);
                });

                connectedRoom.on('participantDisconnected', participant => {
                    console.log(`Participant disconnected: ${participant.identity}`);
                    setParticipantCount(connectedRoom.participants.size);
                    toast(`${participant.identity} left the call`, { icon: '👋' });
                });

                setIsConnecting(false);

            } catch (err) {
                console.error('Error initializing video call:', err);
                if (mounted) {
                    const message = err instanceof Error ? err.message : 'Failed to start video call';
                    setError(message);
                    setIsConnecting(false);
                    toast.error(message);
                }
            }
        };

        initializeCall();

        return () => {
            mounted = false;
            if (roomRef.current) {
                roomRef.current.disconnect();
                roomRef.current = null;
            }
        };
    }, [appointmentId, handleParticipant]);

    // Toggle video
    const toggleVideo = useCallback(() => {
        if (room) {
            room.localParticipant.videoTracks.forEach(publication => {
                const track = publication.track as LocalVideoTrack;
                if (isVideoEnabled) {
                    track.disable();
                } else {
                    track.enable();
                }
            });
            setIsVideoEnabled(!isVideoEnabled);
        }
    }, [room, isVideoEnabled]);

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (room) {
            room.localParticipant.audioTracks.forEach(publication => {
                const track = publication.track as LocalAudioTrack;
                if (isAudioEnabled) {
                    track.disable();
                } else {
                    track.enable();
                }
            });
            setIsAudioEnabled(!isAudioEnabled);
        }
    }, [room, isAudioEnabled]);

    // Toggle speaker (mute remote audio)
    const toggleSpeaker = useCallback(() => {
        if (room) {
            room.participants.forEach(participant => {
                participant.audioTracks.forEach(publication => {
                    if (publication.track) {
                        const audioElement = publication.track.attach();
                        if (audioElement instanceof HTMLMediaElement) {
                            audioElement.muted = !isSpeakerEnabled;
                        }
                    }
                });
            });
            setIsSpeakerEnabled(!isSpeakerEnabled);
        }
    }, [room, isSpeakerEnabled]);

    // End call
    const handleEndCall = useCallback(async () => {
        try {
            if (room) {
                room.disconnect();
                setRoom(null);
            }
            
            // Notify backend
            await endVideoSession(appointmentId);
            toast.success('Call ended successfully');
            onCallEnd();
        } catch (err) {
            console.error('Error ending call:', err);
            toast.error('Failed to end call properly');
            onCallEnd();
        }
    }, [room, appointmentId, onCallEnd]);

    if (isConnecting) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mb-4"></div>
                <p className="text-lg">Connecting to video call...</p>
                <p className="text-sm text-gray-400 mt-2">Please allow camera and microphone access</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
                <div className="bg-red-900/50 border border-red-700 rounded-lg p-6 max-w-md">
                    <h2 className="text-xl font-bold mb-2">Connection Error</h2>
                    <p className="text-gray-300 mb-4">{error}</p>
                    <button
                        onClick={onCallEnd}
                        className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        Exit
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen bg-gray-900">
            {/* Video Grid */}
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4">
                {/* Remote Video (Larger) */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden">
                    <div ref={remoteVideoRef} className="w-full h-full">
                        {participantCount === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-white">
                                <div className="text-center">
                                    <VideoCameraSlashIcon className="h-16 w-16 mx-auto mb-2 text-gray-600" />
                                    <p className="text-lg">Waiting for other participant...</p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {participantCount} {participantCount === 1 ? 'participant' : 'participants'}
                    </div>
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-mono">
                        {formatDuration(callDuration)}
                    </div>
                </div>

                {/* Local Video (Picture-in-Picture) */}
                <div className="relative bg-gray-800 rounded-lg overflow-hidden lg:row-span-1">
                    <div ref={localVideoRef} className="w-full h-full">
                        {!isVideoEnabled && (
                            <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                                <VideoCameraSlashIcon className="h-16 w-16 text-gray-500" />
                            </div>
                        )}
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        You
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="bg-gray-800 border-t border-gray-700 p-6">
                <div className="flex justify-center items-center space-x-4">
                    {/* Toggle Video */}
                    <button
                        onClick={toggleVideo}
                        className={`p-4 rounded-full transition-colors ${
                            isVideoEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
                    >
                        {isVideoEnabled ? (
                            <VideoCameraIcon className="h-6 w-6" />
                        ) : (
                            <VideoCameraSlashIcon className="h-6 w-6" />
                        )}
                    </button>

                    {/* Toggle Audio */}
                    <button
                        onClick={toggleAudio}
                        className={`p-4 rounded-full transition-colors ${
                            isAudioEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isAudioEnabled ? 'Mute microphone' : 'Unmute microphone'}
                    >
                        <MicrophoneIcon className="h-6 w-6" />
                    </button>

                    {/* Toggle Speaker */}
                    <button
                        onClick={toggleSpeaker}
                        className={`p-4 rounded-full transition-colors ${
                            isSpeakerEnabled
                                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                                : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={isSpeakerEnabled ? 'Mute speaker' : 'Unmute speaker'}
                    >
                        {isSpeakerEnabled ? (
                            <SpeakerWaveIcon className="h-6 w-6" />
                        ) : (
                            <SpeakerXMarkIcon className="h-6 w-6" />
                        )}
                    </button>

                    {/* End Call */}
                    <button
                        onClick={handleEndCall}
                        className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
                        title="End call"
                    >
                        <PhoneXMarkIcon className="h-6 w-6" />
                    </button>
                </div>
            </div>

            {/* Add CSS for mirror effect */}
            <style>{`
                .mirror {
                    transform: scaleX(-1);
                }
            `}</style>
        </div>
    );
};

export default VideoCallRoom;
