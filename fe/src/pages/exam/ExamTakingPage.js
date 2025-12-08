// pages/exam/ExamTakingPage.js
import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Fullscreen,
  Menu as MenuIcon,
  Description,
  Timer as TimerIcon,
  Headset as HeadsetIcon,
  MenuBook as MenuBookIcon,
  Create as CreateIcon,
  RecordVoiceOver as RecordVoiceOverIcon,
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import { debounce } from 'lodash';
import {
  getExamStructureApi,
  saveAnswerApi,
  submitExamApi,
} from '../../apiServices/learnerExamService';
import './ExamTaking.css';

const ExamTakingPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [currentPartIndex, setCurrentPartIndex] = useState(0);
  const [showPassage, setShowPassage] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [passageWidth, setPassageWidth] = useState(50); // Percentage
  const [isResizing, setIsResizing] = useState(false);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // Track active parent section
  
  // Refs for scrolling to questions
  const questionRefs = React.useRef({});

  useEffect(() => {
    loadExam();
  }, [examId]);

  const loadExam = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading exam:', examId);
      const data = await getExamStructureApi(examId);
      console.log('Exam data loaded:', data);
      
      setExamData(data);
      setAnswers(data.savedAnswers || {});
      setTimeRemaining(data.exam.timeRemaining || 3600);
    } catch (err) {
      console.error('Error loading exam:', err);
      setError(err.message || 'Không thể tải bài thi');
    } finally {
      setLoading(false);
    }
  };

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) return;
    const timer = setInterval(() => {
      setTimeRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [timeRemaining]);

  // Auto-save
  const saveAnswer = useMemo(
    () =>
      debounce(async (examquestionId, answer) => {
        try {
          console.log('Auto-saving:', examquestionId, answer);
          await saveAnswerApi(examId, examquestionId, answer);
          console.log('Auto-save success');
        } catch (err) {
          console.error('Auto-save failed:', err);
        }
      }, 2000),
    [examId]
  );

  const handleAnswerChange = (examquestionId, answer) => {
    setAnswers((prev) => ({ ...prev, [examquestionId]: answer }));
    saveAnswer(examquestionId, answer);
  };

  const scrollToQuestion = (questionIndex) => {
    const questionId = currentPart?.questions?.[questionIndex]?.ExamquestionId;
    if (questionId && questionRefs.current[questionId]) {
      questionRefs.current[questionId].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
      setCurrentQuestionIndex(questionIndex);
    }
  };

  const handleQuestionClick = (partIdx, questionIdx) => {
    if (partIdx !== currentPartIndex) {
      setCurrentPartIndex(partIdx);
      // Wait for render then scroll
      setTimeout(() => {
        scrollToQuestion(questionIdx);
      }, 100);
    } else {
      scrollToQuestion(questionIdx);
    }
  };

  // Resize handlers
  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const containerWidth = window.innerWidth;
      const newWidth = (e.clientX / containerWidth) * 100;
      
      // Limit between 30% and 70%
      if (newWidth >= 30 && newWidth <= 70) {
        setPassageWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const handleSubmit = async () => {
    if (!window.confirm('Are you sure you want to submit?')) return;
    try {
      const result = await submitExamApi(examId);
      alert(`Submitted successfully!`);
      navigate(`/exam/${examId}/result`);
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading) {
    return <div className="exam-loading">Loading exam data...</div>;
  }

  if (error) {
    return (
      <div className="exam-loading">
        <div style={{ color: 'red' }}>Error: {error}</div>
        <button onClick={() => navigate('/exams')}>Back to exams</button>
      </div>
    );
  }

  if (!examData || !examData.structure) {
    return <div className="exam-loading">No exam data available</div>;
  }

  // Get all parent sections (Listening, Reading, Writing, Speaking)
  const parentSections = examData.structure || [];
  const activeSection = parentSections[activeSectionIndex];
  
  // Get parts (childSections) of active section only
  const activeParts = activeSection?.childSections || [];
  const currentPart = activeParts[currentPartIndex];
  
  const minutes = Math.floor(timeRemaining / 60);

  // Group parts by parent section for navigation
  const partsBySection = examData.structure.map((section, sectionIdx) => ({
    sectionTitle: section.Type || section.Title,
    parts: section.childSections || []
  }));

  // Calculate global part index
  const getGlobalPartIndex = (sectionIdx, partIdx) => {
    let globalIdx = 0;
    for (let i = 0; i < sectionIdx; i++) {
      globalIdx += examData.structure[i].childSections?.length || 0;
    }
    return globalIdx + partIdx;
  };

  // Get current section index
  let currentSectionIndex = 0;
  let partsCount = 0;
  for (let i = 0; i < examData.structure.length; i++) {
    const sectionPartsCount = examData.structure[i].childSections?.length || 0;
    if (currentPartIndex < partsCount + sectionPartsCount) {
      currentSectionIndex = i;
      break;
    }
    partsCount += sectionPartsCount;
  }

  return (
    <div className="exam-container">
      {/* Top Bar */}
      <div className="exam-topbar"> 
        <div className="topbar-center">
          <TimerIcon className="timer-icon" />
          <span className="timer-text">
            <span className="timer-number">{minutes}</span>
            <span className="timer-unit">minutes remaining</span>
          </span>
        </div>

        <div className="topbar-right">
          <IconButton className="icon-btn">
            <Description />
          </IconButton>
          <IconButton className="icon-btn">
            <Fullscreen />
          </IconButton>
          <IconButton className="icon-btn">
            <MenuIcon />
          </IconButton>
          <button className="review-btn">
            <Description style={{ fontSize: 18, marginRight: 4 }} />
            Review
          </button>
          <button className="submit-btn" onClick={handleSubmit}>
            Submit
            <ChevronRight style={{ fontSize: 18 }} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`exam-main ${isResizing ? 'resizing' : ''}`}>
        {/* Left Panel - Passage */}
        {showPassage && (
          <div 
            className="passage-panel"
            style={{ width: `${passageWidth}%` }}
          >
            <div className="passage-header">
              {currentPart?.Title || 'Reading Passage'}
            </div>
            <div className="passage-content">
              <h2 className="passage-title">
                {currentPart?.Title}
              </h2>
              
              <div className="passage-text">
                {currentPart?.description ? (
                  <div dangerouslySetInnerHTML={{ __html: currentPart.description }} />
                ) : (
                  <p>No passage text available for this section.</p>
                )}
              </div>
            </div>
            
            {/* Resize Handle */}
            <div 
              className="resize-handle"
              onMouseDown={handleMouseDown}
            >
              <div className="resize-handle-line"></div>
              <button 
                className="passage-toggle"
                onClick={() => setShowPassage(!showPassage)}
              >
                <ChevronLeft />
              </button>
            </div>
          </div>
        )}

        {/* Show toggle when hidden */}
        {!showPassage && (
          <button 
            className="passage-toggle-show"
            onClick={() => setShowPassage(!showPassage)}
          >
            <ChevronRight />
          </button>
        )}

        {/* Right Panel - Questions */}
        <div className="questions-panel" style={{ 
          flex: showPassage ? 'auto' : 1,
          userSelect: isResizing ? 'none' : 'auto'
        }}>
          {/* Section Tabs in Questions Panel */}
          <div className="questions-section-tabs">
            {parentSections.map((section, idx) => {
              // Get icon component
              const getSectionIcon = () => {
                switch(section.Type) {
                  case 'Listening': return <HeadsetIcon />;
                  case 'Reading': return <MenuBookIcon />;
                  case 'Writing': return <CreateIcon />;
                  case 'Speaking': return <RecordVoiceOverIcon />;
                  default: return <Description />;
                }
              };
              
              // Count total questions and answered in this section
              const allPartsInSection = section.childSections || [];
              const totalQuestionsInSection = allPartsInSection.reduce((sum, part) => 
                sum + (part.questions?.length || 0), 0
              );
              const answeredInSection = allPartsInSection.reduce((sum, part) => {
                return sum + (part.questions?.filter(q => answers[q.ExamquestionId])?.length || 0);
              }, 0);
              
              return (
                <button
                  key={idx}
                  className={`section-tab-btn ${idx === activeSectionIndex ? 'active' : ''}`}
                  onClick={() => {
                    setActiveSectionIndex(idx);
                    setCurrentPartIndex(0);
                    setCurrentQuestionIndex(0);
                  }}
                >
                  <span className="section-tab-icon">{getSectionIcon()}</span>
                  <span className="section-tab-label">{section.Type}</span>
                  <span className="section-tab-count">{answeredInSection}/{totalQuestionsInSection}</span>
                </button>
              );
            })}
          </div>

          {/* Part Title */}
          <div className="questions-part-title">
            <h3>{currentPart?.Title || 'Part 1'}</h3>
          </div>

        

          {/* Questions Container */}
          <div className="questions-container">
            {/* Section instruction if available */}
            {currentPart?.instruction && (
              <div className="questions-instruction">
                <em dangerouslySetInnerHTML={{ __html: currentPart.instruction }} />
              </div>
            )}

            {/* Question List */}
            <div className="questions-list">
              {currentPart?.questions?.map((question, idx) => (
                <div 
                  key={question.ExamquestionId}
                  ref={(el) => questionRefs.current[question.ExamquestionId] = el}
                >
                  <QuestionItem
                    number={idx + 1}
                    question={question}
                    value={answers[question.ExamquestionId]}
                    onChange={(answer) => handleAnswerChange(question.ExamquestionId, answer)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Navigation */}
          <div className="bottom-nav">
            {/* Part Tabs - Only show parts from active section */}
            <div className="part-tabs">
              {activeParts.map((part, partIdx) => {
                const isCurrentPart = partIdx === currentPartIndex;
                const questionsInPart = part.questions || [];
                const answeredCount = questionsInPart.filter(q => answers[q.ExamquestionId]).length;
                const totalCount = questionsInPart.length;
                
                return (
                  <div key={partIdx} className={`part-tab-group ${isCurrentPart ? 'expanded' : 'collapsed'}`}>
                    {isCurrentPart ? (
                      // Current part - Show all question numbers
                      <>
                        <span className="part-label">Part {partIdx + 1}</span>
                        {questionsInPart.map((question, qIdx) => {
                          const isAnswered = !!answers[question.ExamquestionId];
                          const isCurrent = qIdx === currentQuestionIndex;
                          
                          return (
                            <button
                              key={qIdx}
                              className={`part-tab ${isCurrent ? 'active' : ''} ${isAnswered ? 'answered' : ''}`}
                              onClick={() => handleQuestionClick(partIdx, qIdx)}
                              title={`Question ${qIdx + 1}`}
                            >
                              {qIdx + 1}
                            </button>
                          );
                        })}
                      </>
                    ) : (
                      // Other parts - Show summary only
                      <button 
                        className="part-summary"
                        onClick={() => {
                          setCurrentPartIndex(partIdx);
                          setCurrentQuestionIndex(0);
                        }}
                      >
                        <span className="part-summary-label">Part {partIdx + 1} :</span>
                        <span className="part-summary-count">{answeredCount} of {totalCount} questions</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Arrows */}
            <div className="nav-arrows">
              <IconButton 
                className="nav-arrow"
                onClick={() => {
                  if (currentPartIndex > 0) {
                    setCurrentPartIndex(currentPartIndex - 1);
                    setCurrentQuestionIndex(0);
                  } else if (activeSectionIndex > 0) {
                    // Go to previous section's last part
                    setActiveSectionIndex(activeSectionIndex - 1);
                    const prevSection = parentSections[activeSectionIndex - 1];
                    setCurrentPartIndex((prevSection.childSections?.length || 1) - 1);
                    setCurrentQuestionIndex(0);
                  }
                }}
                disabled={activeSectionIndex === 0 && currentPartIndex === 0}
              >
                <ChevronLeft />
              </IconButton>
              <IconButton 
                className="nav-arrow"
                onClick={() => {
                  if (currentPartIndex < activeParts.length - 1) {
                    setCurrentPartIndex(currentPartIndex + 1);
                    setCurrentQuestionIndex(0);
                  } else if (activeSectionIndex < parentSections.length - 1) {
                    // Go to next section's first part
                    setActiveSectionIndex(activeSectionIndex + 1);
                    setCurrentPartIndex(0);
                    setCurrentQuestionIndex(0);
                  }
                }}
                disabled={
                  activeSectionIndex === parentSections.length - 1 && 
                  currentPartIndex === activeParts.length - 1
                }
              >
                <ChevronRight />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Question Item Component - Render based on question type
const QuestionItem = ({ number, question, value, onChange }) => {
  console.log('Rendering question:', question);

  // Multiple Choice - Radio Buttons Style
  if (question.Type === 'multiple_choice' && question.options && question.options.length > 0) {
    return (
      <div className="question-item-radio">
        <div className="question-header-inline">
          <span className="question-number">{number}.</span>
          <span className="question-text">{question.Content}</span>
        </div>
        
        <RadioGroup
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="question-options"
        >
          {question.options.map(opt => (
            <FormControlLabel
              key={opt.OptionID}
              value={opt.OptionText}
              control={<Radio />}
              label={opt.OptionText}
              className="option-label"
            />
          ))}
        </RadioGroup>
      </div>
    );
  }

  // True/False
  if (question.Type === 'true_false') {
    return (
      <div className="question-item-radio">
        <div className="question-header-inline">
          <span className="question-number">{number}.</span>
          <span className="question-text">{question.Content}</span>
        </div>
        
        <RadioGroup
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          className="question-options"
        >
          <FormControlLabel value="True" control={<Radio />} label="True" className="option-label" />
          <FormControlLabel value="False" control={<Radio />} label="False" className="option-label" />
        </RadioGroup>
      </div>
    );
  }

  // Fill in blank or short answer
  if (question.Type === 'fill_in_blank' || question.Type === 'short_answer') {
    return (
      <div className="question-item-inline">
        <span className="question-number">{number}.</span>
        
        <span className="question-text-inline">
          {question.Content}
        </span>
        
        <TextField
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Type answer"
          className="question-input-inline"
          variant="outlined"
          size="small"
        />
      </div>
    );
  }

  // Essay
  if (question.Type === 'essay') {
    return (
      <div className="question-item-essay">
        <div className="question-header">
          <span className="question-number">{number}.</span>
          <span className="question-text">{question.Content}</span>
        </div>
        
        <TextField
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Write your answer here..."
          multiline
          rows={10}
          fullWidth
          variant="outlined"
          className="question-textarea"
        />
      </div>
    );
  }

  // Default fallback
  return (
    <div className="question-item">
      <span className="question-number">{number}.</span>
      <TextField
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Type answer"
        className="question-input"
        variant="outlined"
        size="small"
      />
      <span className="question-text">
        {question.Content}
      </span>
    </div>
  );
};

export default ExamTakingPage;