import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Send, X } from 'lucide-react';
import { cn } from '../libs/utils';
import SpeechToTextService from '../services/speechToText';

const VoiceRecorder = ({ onSendAudio, onCancel, className }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const speechServiceRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    speechServiceRef.current = new SpeechToTextService();
    speechServiceRef.current.setOnResult((text, isFinal) => {
      setTranscript(text);
    });

    speechServiceRef.current.setOnError((error) => {
      console.error('Speech recognition error:', error);
    });

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (speechServiceRef.current) {
        speechServiceRef.current.stopListening();
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setRecordingTime(0);
      
      if (SpeechToTextService.isSupported()) {
        speechServiceRef.current.startListening();
      }
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (speechServiceRef.current) {
        speechServiceRef.current.stopListening();
      }

      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

const handleSend = async () => {
    if (!audioBlob) return;

    setIsProcessing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
    
      const audioUrl = URL.createObjectURL(audioBlob);
      await onSendAudio(audioUrl, transcript);
      
      setTranscript('');
      setAudioBlob(null);
      setRecordingTime(0);
      
    } catch (error) {
      console.error('Error sending audio:', error);
    } finally {
      setIsProcessing(false);
    }
  };

const handleCancel = () => {
    if (isRecording) {
      stopRecording();
    }
    
    setTranscript('');
    setAudioBlob(null);
    setRecordingTime(0);
    
    if (onCancel) {
      onCancel();
    }
  };

const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={cn("bg-white border border-secondary-200 rounded-lg p-4 shadow-lg", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-secondary-900">Voice Message</h3>
        <button
          onClick={handleCancel}
          className="p-1 rounded-lg text-secondary-600 hover:bg-secondary-100 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            disabled={isProcessing}
            className={cn(
              "p-4 rounded-full transition-all duration-200",
              isRecording
                ? "bg-error-600 text-white hover:bg-error-700"
                : "bg-primary-600 text-white hover:bg-primary-700",
              isProcessing && "opacity-50 cursor-not-allowed"
            )}
          >
            {isRecording ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6" />
            )}
          </button>

          {recordingTime > 0 && (
            <div className="text-lg font-mono text-secondary-700">
              {formatTime(recordingTime)}
            </div>
          )}
        </div>

        {isRecording && (
          <div className="flex items-center justify-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
            <div className="w-2 h-2 bg-error-600 rounded-full animate-pulse"></div>
            <span className="text-sm text-error-700 font-medium">Recording...</span>
          </div>
        )}

        {transcript && (
          <div className="p-3 bg-secondary-50 border border-secondary-200 rounded-lg">
            <p className="text-sm text-secondary-600 mb-1">Transcript:</p>
            <p className="text-secondary-900">{transcript}</p>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-sm text-primary-600 mb-2">Audio recorded successfully!</p>
            <audio 
              controls 
              src={URL.createObjectURL(audioBlob)}
              className="w-full"
            />
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="flex items-center justify-end space-x-2">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-secondary-600 hover:bg-secondary-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isProcessing}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors",
                isProcessing && "opacity-50 cursor-not-allowed"
              )}
            >
              <Send className="w-4 h-4" />
              <span>{isProcessing ? 'Sending...' : 'Send'}</span>
            </button>
          </div>
        )}

        {!SpeechToTextService.isSupported() && (
          <div className="p-3 bg-warning-50 border border-warning-200 rounded-lg">
            <p className="text-sm text-warning-700">
              Speech-to-text is not supported in your browser. Audio will be recorded without transcription.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceRecorder;
