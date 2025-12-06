import React, { useState, useRef } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Alert,
  LinearProgress,
  IconButton,
} from '@mui/material';
import {
  Mic,
  Stop,
  PlayArrow,
  Pause,
  Delete,
  CloudUpload,
} from '@mui/icons-material';

const SpeakingAssignment = ({ assignmentData, onFileChange }) => {
  const [recording, setRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  
  const mediaRecorderRef = useRef(null);
  const audioRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);

  const { assignment } = assignmentData;

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      chunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioURL(url);
        onFileChange('audio', blob, duration);
        
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setRecording(true);
      setDuration(0);

      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } catch (error) {
      alert('Không thể truy cập microphone: ' + error.message);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      clearInterval(timerRef.current);
    }
  };

  const handlePlayPause = () => {
    if (!audioRef.current) return;

    if (playing) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setPlaying(!playing);
  };

  const handleDelete = () => {
    if (window.confirm('Bạn có chắc muốn xóa bản ghi âm này?')) {
      setAudioBlob(null);
      setAudioURL(null);
      setDuration(0);
      onFileChange('audio', null, 0);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      const url = URL.createObjectURL(file);
      setAudioBlob(file);
      setAudioURL(url);
      
      const audio = new Audio(url);
      audio.onloadedmetadata = () => {
        const fileDuration = Math.floor(audio.duration);
        setDuration(fileDuration);
        onFileChange('audio', file, fileDuration);
      };
    } else {
      alert('Vui lòng chọn file audio');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Hướng dẫn bài tập */}
      <Card sx={{ p: 3, bgcolor: 'info.50' }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🎤 Bài tập nói
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1" sx={{ mb: 1, fontWeight: 500 }}>
            {assignment.Title}
          </Typography>
          {assignment.Description && (
            <Typography variant="body2" color="text.secondary">
              {assignment.Description}
            </Typography>
          )}
        </Box>

        <Alert severity="info" sx={{ mt: 2 }}>
          Vui lòng ghi âm bài nói của bạn theo yêu cầu và tải lên.
        </Alert>
      </Card>

      {/* Recording Section */}
      <Card sx={{ p: 3 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          🎙️ Ghi âm bài nói
        </Typography>

        {!audioBlob ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            {recording ? (
              <>
                <Box sx={{ 
                  width: 120, 
                  height: 120, 
                  borderRadius: '50%',
                  bgcolor: 'error.main',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s infinite',
                }}>
                  <Mic sx={{ fontSize: 60, color: 'white' }} />
                </Box>
                <Typography variant="h5" sx={{ fontWeight: 600, color: 'error.main' }}>
                  {formatTime(duration)}
                </Typography>
                <Button
                  variant="contained"
                  color="error"
                  size="large"
                  startIcon={<Stop />}
                  onClick={stopRecording}
                  sx={{ minWidth: 200 }}
                >
                  Dừng ghi âm
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  startIcon={<Mic />}
                  onClick={startRecording}
                  sx={{ minWidth: 200 }}
                >
                  Bắt đầu ghi âm
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
                  hoặc
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<CloudUpload />}
                >
                  Tải file audio lên
                  <input
                    type="file"
                    accept="audio/*"
                    hidden
                    onChange={handleFileUpload}
                  />
                </Button>
              </>
            )}
          </Box>
        ) : (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Đã ghi âm thành công! Thời lượng: {formatTime(duration)}
            </Alert>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2,
              p: 2,
              bgcolor: 'grey.100',
              borderRadius: 2,
            }}>
              <IconButton
                onClick={handlePlayPause}
                color="primary"
                sx={{ bgcolor: 'white' }}
              >
                {playing ? <Pause /> : <PlayArrow />}
              </IconButton>
              <Box sx={{ flex: 1 }}>
                <audio
                  ref={audioRef}
                  src={audioURL}
                  onEnded={() => setPlaying(false)}
                  style={{ display: 'none' }}
                />
                <LinearProgress 
                  variant="determinate" 
                  value={50} 
                  sx={{ height: 8, borderRadius: 1 }}
                />
              </Box>
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {formatTime(duration)}
              </Typography>
              <IconButton onClick={handleDelete} color="error">
                <Delete />
              </IconButton>
            </Box>
          </Box>
        )}
      </Card>
    </Box>
  );
};

export default SpeakingAssignment;