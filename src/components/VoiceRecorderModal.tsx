import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  Square,
  Play,
  RotateCcw,
  Sparkles,
  Volume2,
  X,
  Radio,
  CheckCircle2,
  Clock,
  Zap,
} from 'lucide-react';
import { transformRawToImpactStatement } from '../services/gemini';
import { dbStore } from '../services/db';
import { QuarterlyGoal } from '../types';

interface VoiceRecorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userGoals: QuarterlyGoal[];
  onAchievementCreated: () => void;
}

export const VoiceRecorderModal: React.FC<VoiceRecorderModalProps> = ({
  isOpen,
  onClose,
  userId,
  userGoals,
  onAchievementCreated,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [engine, setEngine] = useState<'whisper' | 'deepgram' | 'gemini'>('whisper');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Clean up on unmount or close
  useEffect(() => {
    if (!isOpen) {
      stopRecordingCleanup();
      setRecordingDuration(0);
      setAudioUrl(null);
      setTranscript('');
      setErrorMsg(null);
    }
  }, [isOpen]);

  const stopRecordingCleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (speechRecognitionRef.current) {
      try {
        speechRecognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    setIsRecording(false);
  };

  // Real-time canvas visualizer
  const startVisualizer = (stream: MediaStream) => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const barWidth = (canvas.width / bufferLength) * 1.8;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * (canvas.height * 0.85);
          // Darker slate/stone colors
          ctx.fillStyle = isRecording ? '#e11d48' : '#78716c';
          ctx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth - 2, Math.max(3, barHeight));
          x += barWidth;
        }
      };

      draw();
    } catch (e) {
      console.warn('Audio visualization not supported:', e);
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    setTranscript('');
    setAudioUrl(null);

    // Initialize in-browser Speech Recognition for instant transcription
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: any) => {
          let currentTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(prev => (prev ? prev + ' ' : '') + currentTranscript);
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition warning:', event.error);
        };

        recognition.start();
        speechRecognitionRef.current = recognition;
      } catch (err) {
        console.warn('Could not start live speech recognition:', err);
      }
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      startVisualizer(stream);

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration(d => d + 1);
      }, 1000);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setErrorMsg('Microphone access was denied or not supported in this frame. You can choose a pre-recorded engineering sample below.');
    }
  };

  const stopRecording = () => {
    stopRecordingCleanup();
  };

  const loadSampleVoice = (sampleText: string) => {
    stopRecordingCleanup();
    setTranscript(sampleText);
    setErrorMsg(null);
  };

  const handleProcessTranscript = async () => {
    if (!transcript.trim()) return;
    setIsProcessing(true);

    try {
      const result = await transformRawToImpactStatement(
        transcript,
        userGoals,
        'voice',
        `Voice memo (${new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})`
      );

      // Save into DB as DRAFT (Private in Employee workspace until approved)
      dbStore.addAchievement({
        userId,
        source: 'voice',
        sourceReference: `Voice memo · ${recordingDuration > 0 ? recordingDuration + 's' : 'Captured'}`,
        rawInput: transcript,
        title: result.title,
        businessImpactStatement: result.businessImpactStatement,
        technicalCraftSummary: result.technicalCraftSummary,
        quantifiedMetrics: result.quantifiedMetrics,
        linkedGoalId: result.suggestedGoalId,
        goalMatchConfidence: result.goalMatchConfidence,
        goalMatchReasoning: result.goalMatchReasoning,
        status: 'draft', // Strictly private in Employee workspace!
        triviaFilteredOut: result.triviaFilteredOut,
        tags: result.tags,
      });

      onAchievementCreated();
      onClose();
    } catch (err: any) {
      console.error('Processing error:', err);
      setErrorMsg('Failed to process voice transcript. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900">
                In-Browser Voice Update Intake
              </h3>
              <p className="text-xs text-stone-700">
                Capture ad-hoc engineering progress · AI strips trivia &amp; creates XYZ impact
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Engine selector */}
            <div className="flex items-center bg-stone-100 rounded-md p-0.5 text-[11px] font-medium text-stone-600">
              <button
                onClick={() => setEngine('whisper')}
                className={`px-2 py-0.5 rounded ${engine === 'whisper' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''}`}
              >
                Whisper
              </button>
              <button
                onClick={() => setEngine('deepgram')}
                className={`px-2 py-0.5 rounded ${engine === 'deepgram' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''}`}
              >
                Nova-2
              </button>
              <button
                onClick={() => setEngine('gemini')}
                className={`px-2 py-0.5 rounded ${engine === 'gemini' ? 'bg-white text-stone-900 shadow-xs font-semibold' : ''}`}
              >
                Gemini
              </button>
            </div>
            <button
              onClick={onClose}
              className="text-stone-400 hover:text-stone-600 p-1 rounded-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recording Canvas & Controls */}
        <div className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
              {errorMsg}
            </div>
          )}

          {/* Visualizer Box */}
          <div className="relative bg-stone-950 rounded-xl p-4 flex flex-col items-center justify-center min-h-[140px] overflow-hidden">
            <canvas
              ref={canvasRef}
              width={500}
              height={80}
              className="w-full h-20"
            />

            {/* Timer & Live Indicator */}
            <div className="absolute top-3 left-4 flex items-center gap-2">
              {isRecording ? (
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-mono">
                    {Math.floor(recordingDuration / 60)}:
                    {(recordingDuration % 60).toString().padStart(2, '0')}
                  </span>
                  <span className="text-[10px] text-rose-300 uppercase tracking-widest ml-1 font-mono">
                    REC
                  </span>
                </div>
              ) : (
                <span className="text-xs text-stone-400 font-mono">
                  {audioUrl ? 'Recording ready' : 'Ready to capture'}
                </span>
              )}
            </div>

            <div className="absolute top-3 right-4 text-[10px] text-stone-400 font-mono">
              Engine: {engine.toUpperCase()}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                Start Voice Recording
              </button>
            ) : (
              <button
                onClick={stopRecording}
                className="flex items-center gap-2 px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-lg shadow-sm transition-colors cursor-pointer"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
                Stop Recording
              </button>
            )}

            {audioUrl && !isRecording && (
              <div className="flex items-center gap-2">
                <audio src={audioUrl} controls className="h-8 max-w-[200px]" />
                <button
                  onClick={() => {
                    setAudioUrl(null);
                    setTranscript('');
                  }}
                  className="p-2 text-stone-500 hover:text-stone-700 hover:bg-stone-100 rounded-lg"
                  title="Discard"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Quick Voice Memo Presets */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-700 mb-2 font-medium">
              <span>Quick Voice Memo Presets (One-click simulation)</span>
              <span className="text-[11px] text-stone-700">Click to load</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  loadSampleVoice(
                    'Hey team, quick update on the database layer. We finished indexing the transaction tables and set up multi-tier Redis caching with 30s TTL. Just benchmarked it under 25k requests per second and p99 dropped from 150ms down to 88ms with zero timeouts. Pretty stoked on this one.'
                  )
                }
                className="p-2.5 text-left border border-stone-200 hover:border-stone-400 rounded-lg text-xs hover:bg-stone-50 transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-stone-900 group-hover:text-stone-950 flex items-center justify-between">
                  <span>Checkout Latency</span>
                  <Zap className="w-3 h-3 text-amber-500" />
                </div>
                <p className="text-[11px] text-stone-700 line-clamp-2 mt-1">
                  Indexed Postgres tables &amp; Redis read-through cache (p99 &lt; 88ms).
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadSampleVoice(
                    'Just tracked down that nasty memory leak in the WebSocket gateway service. Turns out abruptly disconnected clients were holding circular references in the event listener queue. Replaced it with a weak map and cleaned up connection listeners on socket close. Memory footprint dropped by 84% from 2.4 gigabytes down to 380 megabytes.'
                  )
                }
                className="p-2.5 text-left border border-stone-200 hover:border-stone-400 rounded-lg text-xs hover:bg-stone-50 transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-stone-900 group-hover:text-stone-950 flex items-center justify-between">
                  <span>Memory Leak Fix</span>
                  <Zap className="w-3 h-3 text-indigo-500" />
                </div>
                <p className="text-[11px] text-stone-700 line-clamp-2 mt-1">
                  Fixed circular listener leak in WebSocket gateway (-84% memory).
                </p>
              </button>

              <button
                type="button"
                onClick={() =>
                  loadSampleVoice(
                    'Hey Sarah, update on the zero downtime migration objective. We built a pre-flight lock inspection runner into our CI pipeline that sets a 250 millisecond lock timeout on alter table statements and aborts if exclusive table locks are requested. Already verified against 6 microservices without any downtime.'
                  )
                }
                className="p-2.5 text-left border border-stone-200 hover:border-stone-400 rounded-lg text-xs hover:bg-stone-50 transition-colors group cursor-pointer"
              >
                <div className="font-semibold text-stone-900 group-hover:text-stone-950 flex items-center justify-between">
                  <span>Migration Safety</span>
                  <Zap className="w-3 h-3 text-emerald-500" />
                </div>
                <p className="text-[11px] text-stone-700 line-clamp-2 mt-1">
                  Automated migration lock runner with 250ms timeout guardrails.
                </p>
              </button>
            </div>
          </div>

          {/* Transcript Preview & Edit */}
          <div>
            <div className="flex items-center justify-between text-xs text-stone-700 mb-1.5 font-medium">
              <span>Captured Raw Transcript</span>
              {transcript && (
                <span className="text-[11px] text-stone-700">
                  {transcript.split(/\s+/).filter(Boolean).length} words
                </span>
              )}
            </div>
            <textarea
              rows={4}
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              placeholder="Speak into your microphone or pick a preset above... Raw transcript will stream here in real-time."
              className="w-full text-xs font-mono p-3 border border-stone-200 rounded-lg bg-stone-50/50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900/10 transition-colors resize-none"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between">
          <div className="text-[11px] text-stone-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>Will be saved to Employee Private Workspace as draft</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:text-stone-900 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={handleProcessTranscript}
              disabled={!transcript.trim() || isProcessing}
              className="flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 animate-spin" />
                  <span>Distilling Business Impact...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Distill to Impact Statement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
