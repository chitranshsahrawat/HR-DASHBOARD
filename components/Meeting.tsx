import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveSession, Modality, Blob as GenAI_Blob, LiveServerMessage } from '@google/genai';
import { getMeetingSummary } from '../services/geminiService';
import { MicOnIcon, MicOffIcon, VideoIcon, VideoOffIcon, PhoneDownIcon, RecordingIcon } from './icons';

function encode(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): GenAI_Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] < 0 ? data[i] * 32768 : data[i] * 32767;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


const Meeting: React.FC = () => {
    const [isMicOn, setIsMicOn] = useState(true);
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [isMeetingActive, setIsMeetingActive] = useState(false);
    const [isSummarizing, setIsSummarizing] = useState(false);
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [summary, setSummary] = useState('');
    const [activeTab, setActiveTab] = useState<'transcription' | 'summary'>('transcription');
    const [error, setError] = useState<string | null>(null);

    const localVideoRef = useRef<HTMLVideoElement>(null);
    const remoteVideoRef = useRef<HTMLVideoElement>(null);
    const mediaStreamRef = useRef<MediaStream | null>(null);
    const sessionPromiseRef = useRef<Promise<LiveSession> | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
    const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);

    const stopMediaTracks = () => {
        if (mediaStreamRef.current) {
            mediaStreamRef.current.getTracks().forEach(track => track.stop());
            mediaStreamRef.current = null;
        }
    };

    const cleanupAudioProcessing = useCallback(() => {
        scriptProcessorRef.current?.disconnect();
        scriptProcessorRef.current = null;
        mediaStreamSourceRef.current?.disconnect();
        mediaStreamSourceRef.current = null;
        if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
           audioContextRef.current.close();
        }
        audioContextRef.current = null;
    }, []);

    const stopSummarization = useCallback(async () => {
        if (!sessionPromiseRef.current) return;
        
        setIsSummarizing(false);
        cleanupAudioProcessing();

        const session = await sessionPromiseRef.current;
        session.close();
        sessionPromiseRef.current = null;

        if (transcription) {
            setIsLoadingSummary(true);
            setActiveTab('summary');
            const result = await getMeetingSummary(transcription);
            setSummary(result);
            setIsLoadingSummary(false);
        }
    }, [transcription, cleanupAudioProcessing]);


    const handleLeaveMeeting = useCallback(() => {
        if (isSummarizing) {
            stopSummarization();
        }
        stopMediaTracks();
        if (localVideoRef.current) localVideoRef.current.srcObject = null;
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
        setIsMeetingActive(false);
        setIsCameraOn(false);
        setTranscription('');
        setSummary('');
    }, [isSummarizing, stopSummarization]);


    const startMedia = async () => {
        try {
            stopMediaTracks();
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
            mediaStreamRef.current = stream;
            if (localVideoRef.current) localVideoRef.current.srcObject = stream;
            if (remoteVideoRef.current) remoteVideoRef.current.srcObject = stream;
            
            // Initial mic/camera state
            stream.getAudioTracks().forEach(track => track.enabled = isMicOn);
            stream.getVideoTracks().forEach(track => track.enabled = true); // Start with camera on
            setIsCameraOn(true);
            setError(null);
            return stream;
        } catch (err) {
            console.error('Error accessing media devices.', err);
            setError('Could not access camera or microphone. Please check permissions.');
            return null;
        }
    };

    const handleStartMeeting = async () => {
        setIsMeetingActive(true);
        await startMedia();
    };

    const handleToggleMic = () => {
        if (mediaStreamRef.current) {
            const enabled = !isMicOn;
            mediaStreamRef.current.getAudioTracks().forEach(track => track.enabled = enabled);
            setIsMicOn(enabled);
        }
    };

    const handleToggleCamera = () => {
        if (mediaStreamRef.current) {
            const enabled = !isCameraOn;
            mediaStreamRef.current.getVideoTracks().forEach(track => track.enabled = enabled);
            setIsCameraOn(enabled);
        }
    };

    const startSummarization = async () => {
        if (!mediaStreamRef.current) {
           setError("Start the meeting and allow microphone access first.");
           return;
        }
        setIsSummarizing(true);
        setTranscription('');
        setSummary('');

        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        // FIX: Add type assertion to handle vendor-prefixed 'webkitAudioContext'.
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        sessionPromiseRef.current = ai.live.connect({
            model: 'gemini-2.5-flash-native-audio-preview-09-2025',
            callbacks: {
                onopen: () => {
                    const source = audioContextRef.current!.createMediaStreamSource(mediaStreamRef.current!);
                    mediaStreamSourceRef.current = source;
                    const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
                    scriptProcessorRef.current = scriptProcessor;

                    scriptProcessor.onaudioprocess = (audioProcessingEvent) => {
                        const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                        const pcmBlob = createBlob(inputData);
                        sessionPromiseRef.current?.then((session) => {
                            session.sendRealtimeInput({ media: pcmBlob });
                        });
                    };
                    source.connect(scriptProcessor);
                    scriptProcessor.connect(audioContextRef.current!.destination);
                },
                onmessage: (message: LiveServerMessage) => {
                    if (message.serverContent?.inputTranscription) {
                        const text = message.serverContent.inputTranscription.text;
                        if(text) {
                           setTranscription(prev => prev ? `${prev} ${text}`.trim() : text);
                        }
                    }
                    if (message.serverContent?.turnComplete) {
                        setTranscription(prev => prev + '\n');
                    }
                },
                onerror: (e: ErrorEvent) => {
                    console.error('Live session error:', e);
                    setError('A transcription service error occurred.');
                    stopSummarization();
                },
                onclose: (e: CloseEvent) => {
                    console.debug('Live session closed');
                },
            },
            config: {
                inputAudioTranscription: {},
            },
        });
    };

    const handleToggleSummarize = () => {
        if (isSummarizing) {
            stopSummarization();
        } else {
            startSummarization();
        }
    };
    
    useEffect(() => {
        return () => {
            handleLeaveMeeting();
        };
    }, [handleLeaveMeeting]);

    if (!isMeetingActive) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center animate-fadeIn">
                 <h1 className="text-3xl font-bold text-text-primary mb-2">Virtual Meeting Room</h1>
                 <p className="text-text-secondary mb-8">Ready to start your meeting and get an AI-powered summary?</p>
                 <button onClick={handleStartMeeting} className="px-8 py-4 bg-highlight text-white font-bold rounded-lg shadow-lg hover:bg-teal-500 transition-transform transform hover:scale-105">
                     Start Meeting
                 </button>
             </div>
        );
    }
    
    return (
        <div className="flex flex-col h-full max-h-[calc(100vh-4rem)] animate-fadeIn">
            <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 relative bg-black rounded-lg overflow-hidden flex items-center justify-center">
                    <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" muted></video>
                    <video ref={localVideoRef} autoPlay playsInline className="absolute bottom-4 right-4 w-1/4 max-w-xs border-2 border-accent rounded-lg shadow-lg" muted></video>
                </div>
                <div className="bg-secondary rounded-lg flex flex-col">
                    <div className="flex p-2 border-b border-accent">
                        <button onClick={() => setActiveTab('transcription')} className={`flex-1 py-2 text-center font-semibold rounded-t-lg ${activeTab === 'transcription' ? 'bg-accent text-highlight' : 'text-text-secondary'}`}>Live Transcription</button>
                        <button onClick={() => setActiveTab('summary')} className={`flex-1 py-2 text-center font-semibold rounded-t-lg ${activeTab === 'summary' ? 'bg-accent text-highlight' : 'text-text-secondary'}`}>Meeting Summary</button>
                    </div>
                    <div className="flex-1 p-4 overflow-y-auto">
                        {activeTab === 'transcription' && (
                            <p className="text-sm text-text-primary whitespace-pre-wrap">{transcription || 'Transcription will appear here when you start recording...'}</p>
                        )}
                        {activeTab === 'summary' && (
                           isLoadingSummary ? (
                                <div className="flex items-center justify-center h-full">
                                    <div className="w-4 h-4 bg-highlight rounded-full animate-pulse"></div>
                                    <p className="ml-3 text-text-secondary">Generating summary...</p>
                                </div>
                            ) : (
                                <p className="text-sm text-text-primary whitespace-pre-wrap">{summary || 'Summary will be generated after the meeting ends.'}</p>
                            )
                        )}
                    </div>
                </div>
            </div>
            
            {error && <div className="mt-2 text-center text-red-400 bg-red-900/50 p-2 rounded-md">{error}</div>}

            <div className="mt-4 bg-secondary p-4 rounded-lg flex items-center justify-center gap-4">
                <button onClick={handleToggleMic} className={`p-3 rounded-full transition-colors ${isMicOn ? 'bg-accent hover:bg-gray-600' : 'bg-red-600 text-white'}`}>
                    {isMicOn ? <MicOnIcon /> : <MicOffIcon />}
                </button>
                <button onClick={handleToggleCamera} className={`p-3 rounded-full transition-colors ${isCameraOn ? 'bg-accent hover:bg-gray-600' : 'bg-red-600 text-white'}`}>
                    {isCameraOn ? <VideoIcon /> : <VideoOffIcon />}
                </button>
                <button onClick={handleToggleSummarize} className={`p-3 rounded-full transition-colors ${isSummarizing ? 'bg-highlight/50 text-red-400 animate-pulse' : 'bg-accent hover:bg-gray-600'}`}>
                   <RecordingIcon />
                </button>
                 <button onClick={handleLeaveMeeting} className="p-3 rounded-full bg-red-600 text-white hover:bg-red-700">
                    <PhoneDownIcon />
                </button>
            </div>
        </div>
    );
}

export default Meeting;