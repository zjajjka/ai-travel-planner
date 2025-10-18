import React, { useState, useRef } from 'react';
import { MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript, disabled = false }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await sendAudioToServer(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('开始录音...');
    } catch (error) {
      console.error('录音失败:', error);
      toast.error('无法访问麦克风，请检查权限设置');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('录音结束，正在识别...');
    }
  };

  const sendAudioToServer = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('/api/ai/speech-to-text', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        const result = await response.json();
        const recognizedText = result.text;
        setTranscript(recognizedText);
        onTranscript(recognizedText);
        toast.success('语音识别成功！');
      } else {
        throw new Error('语音识别失败');
      }
    } catch (error) {
      console.error('语音识别错误:', error);
      toast.error('语音识别失败，请重试');
    }
  };

  const handleToggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <button
          onClick={handleToggleRecording}
          disabled={disabled}
          className={`voice-button flex items-center justify-center w-12 h-12 rounded-full text-white transition-all duration-300 ${
            isRecording 
              ? 'bg-red-500 hover:bg-red-600 recording' 
              : 'bg-indigo-600 hover:bg-indigo-700'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isRecording ? (
            <StopIcon className="h-6 w-6" />
          ) : (
            <MicrophoneIcon className="h-6 w-6" />
          )}
        </button>
        
        <div className="flex-1">
          <p className="text-sm text-gray-600">
            {isRecording ? '正在录音...' : '点击麦克风开始语音输入'}
          </p>
        </div>
      </div>

      {transcript && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">识别结果：</h4>
          <p className="text-sm text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
