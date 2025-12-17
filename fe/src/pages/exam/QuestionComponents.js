import React, { useState, useRef, useEffect, memo } from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Alert,
  Card,
  CardContent,
} from '@mui/material';
import {
  Mic,
  Stop,
  Delete,
  CloudUpload,
} from '@mui/icons-material';
import { toast } from 'react-toastify';

const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const parseMatchingData = (correctAnswerString) => {
  try {
    const correctAnswer = JSON.parse(correctAnswerString);
    return {
      items: Object.keys(correctAnswer),
      options: shuffleArray(Object.values(correctAnswer)),
      correctAnswer,
    };
  } catch {
    return { items: [], options: [], correctAnswer: {} };
  }
};

export const MultipleChoiceQuestion = ({ question, value, onChange, disabled = false }) => {
  return (
    <RadioGroup
      value={value || ''}
      onChange={(e) => {
        onChange(e.target.value);
      }}
    >
      {question.options?.map((option, index) => {
        const optionLabel = String.fromCharCode(65 + index); 
        
        return (
          <FormControlLabel
            key={option.optionId}
            value={optionLabel}  
            control={<Radio disabled={disabled} />}
            label={
              <Box>
                <Typography component="span">
                  {option.content}
                </Typography>
              </Box>
            }
          />
        );
      })}
    </RadioGroup>
  );
};

export const TrueFalseQuestion = ({ value, onChange, disabled = false }) => (
  <RadioGroup value={value || ''} onChange={(e) => onChange(e.target.value)}>
    <FormControlLabel value="True" control={<Radio disabled={disabled} />} label="True" />
    <FormControlLabel value="False" control={<Radio disabled={disabled} />} label="False" />
  </RadioGroup>
);

export const FillInBlankQuestion = ({ question, value, onChange, disabled = false }) => {
  const blankCount = (question.content?.match(/_+/g) || []).length;

  const currentValue = (() => {
    if (!value) return blankCount > 1 ? Array(blankCount).fill('') : '';
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : value;
    } catch {
      return value;
    }
  })();

  const handleChange = (val, index = null) => {
    if (blankCount > 1 && index !== null) {
      const arr = Array.isArray(currentValue)
        ? [...currentValue]
        : Array(blankCount).fill('');
      arr[index] = val;
      onChange(JSON.stringify(arr));
    } else {
      onChange(val);
    }
  };

  if (blankCount > 1) {
    return (
      <Box>
        {Array.from({ length: blankCount }).map((_, i) => (
          <TextField
            key={i}
            fullWidth
            label={`Chỗ trống ${i + 1}`}
            value={currentValue[i] || ''}
            onChange={(e) => handleChange(e.target.value, i)}
            disabled={disabled}
            sx={{ mb: 2 }}
          />
        ))}
      </Box>
    );
  }

  return (
    <TextField
      fullWidth
      value={currentValue || ''}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
    />
  );
};

export const MatchingQuestion = ({ question, value, onChange, disabled = false }) => {
  const [data, setData] = useState({ items: [], options: [], correctAnswer: {} });

  useEffect(() => {
    if (question.correctAnswer) {
      setData(parseMatchingData(question.correctAnswer));
    }
  }, [question.correctAnswer]);

  const current = (() => {
    if (!value) return {};
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  })();

  const handleChange = (item, opt) => {
    onChange(JSON.stringify({ ...current, [item]: opt }));
  };

  return (
    <Box>
      {data.items.map((item) => (
        <FormControl fullWidth key={item} sx={{ mb: 2 }}>
          <InputLabel>{item}</InputLabel>
          <Select
            value={current[item] || ''}
            onChange={(e) => handleChange(item, e.target.value)}
            disabled={disabled}
          >
            <MenuItem value="">
              <em>-- Chọn đáp án --</em>
            </MenuItem>
            {data.options.map((opt, i) => (
              <MenuItem key={i} value={opt}>{opt}</MenuItem>
            ))}
          </Select>
        </FormControl>
      ))}
    </Box>
  );
};

export const EssayQuestion = ({ value, onChange, disabled = false }) => (
  <TextField
    fullWidth
    multiline
    minRows={6}
    value={value || ''}
    onChange={(e) => onChange(e.target.value)}
    disabled={disabled}
  />
);

export const SpeakingQuestion = memo(({ value, onChange, disabled = false, onUpload }) => {
  const [audioURL, setAudioURL] = useState(value || '');
  const [audioBlob, setAudioBlob] = useState(null);
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);

  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    if (value && value !== audioURL) {
      setAudioURL(value);
    }
  }, [value, audioURL]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        stream.getTracks().forEach(t => t.stop());
      };

      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
    } catch (error) {
      toast.error('Không thể truy cập microphone!', {
        position: "top-right",
        autoClose: 3000
      });
    }
  };

  const stop = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const upload = async () => {
    if (!audioBlob) return;
    
    setUploading(true);
    try {
      const url = await onUpload(audioBlob);
      onChange(url);
      setAudioURL(url);
      setAudioBlob(null);
      
      toast.success('Đã lưu ghi âm thành công', {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Lỗi khi lưu ghi âm. Vui lòng thử lại!', {
        position: "top-right",
        autoClose: 3000
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = () => {
    setAudioURL('');
    setAudioBlob(null);
    onChange('');
    toast.info('Đã xóa ghi âm', {
      position: "top-right",
      autoClose: 2000
    });
  };

  return (
    <Box>
      {!audioURL && (
        <Button
          variant="contained"
          color={recording ? 'secondary' : 'error'}
          startIcon={recording ? <Stop /> : <Mic />}
          onClick={recording ? stop : start}
          disabled={disabled}
        >
          {recording ? 'Dừng ghi' : 'Ghi âm'}
        </Button>
      )}

      {audioURL && (
        <Card>
          <CardContent>
            <audio 
              controls 
              src={audioURL} 
              style={{ width: '100%' }}
              key={audioURL}
            />
            {audioBlob && (
              <Button
                variant="contained"
                color="primary"
                startIcon={<CloudUpload />}
                onClick={upload}
                disabled={disabled || uploading}
                sx={{ mr: 1, mt: 2 }}
              >
                {uploading ? 'Đang lưu...' : 'Lưu'}
              </Button>
            )}
            <Button
              variant="outlined"
              startIcon={<Delete />}
              color="error"
              onClick={handleDelete}
              disabled={disabled || uploading}
              sx={{ mt: 2 }}
            >
              Xóa
            </Button>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}, (prevProps, nextProps) => {
  const shouldNotUpdate = (
    prevProps.value === nextProps.value &&
    prevProps.disabled === nextProps.disabled &&
    prevProps.onUpload === nextProps.onUpload
  );
  return shouldNotUpdate;
});

SpeakingQuestion.displayName = 'SpeakingQuestion';

export const QuestionRenderer = ({ question, value, onChange, disabled = false, onUpload }) => {
  switch (question.type?.toLowerCase()) {
    case 'multiple_choice':
      return <MultipleChoiceQuestion question={question} value={value} onChange={onChange} disabled={disabled} />;
    case 'true_false':
      return <TrueFalseQuestion value={value} onChange={onChange} disabled={disabled} />;
    case 'fill_in_blank':
      return <FillInBlankQuestion question={question} value={value} onChange={onChange} disabled={disabled} />;
    case 'matching':
      return <MatchingQuestion question={question} value={value} onChange={onChange} disabled={disabled} />;
    case 'essay':
      return <EssayQuestion value={value} onChange={onChange} disabled={disabled} />;
    case 'speaking':
      return <SpeakingQuestion value={value} onChange={onChange} disabled={disabled} onUpload={onUpload} />;
    default:
      return <Alert severity="warning">Loại câu hỏi không hỗ trợ</Alert>;
  }
};