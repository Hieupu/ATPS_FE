import React from 'react';
import {
  Card,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  List,
  Alert,
} from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import LessonItem from './LessonItem';
import AssignmentItem from './AssignmentItem';

const UnitAccordion = ({ 
  unit, 
  unitIndex, 
  assignments = [], 
  isEnrolled, 
  onViewMaterial, 
  onSubmitAssignment 
}) => {
  const unitAssignments = assignments.filter(assignment => assignment.UnitID === unit.UnitID);

  return (
    <Card 
      elevation={0}
      sx={{
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.3s',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
          transform: 'translateY(-2px)',
        }
      }}
    >
      <Accordion 
        disableGutters
        defaultExpanded={unitIndex === 0}
        sx={{
          '&:before': { display: 'none' },
          boxShadow: 'none',
        }}
      >
        <AccordionSummary 
          expandIcon={<ExpandMore />}
          sx={{ 
            px: 3, 
            py: 2,
            background: 'linear-gradient(90deg, #f8f9fa 0%, #ffffff 100%)',
            '&:hover': {
              bgcolor: 'action.hover',
            }
          }}
        >
          <UnitHeader 
            unit={unit}
            unitIndex={unitIndex}
            assignmentCount={unitAssignments.length}
          />
        </AccordionSummary>
        <AccordionDetails sx={{ p: 0 }}>
          <UnitContent 
            unit={unit}
            unitAssignments={unitAssignments}
            isEnrolled={isEnrolled}
            onViewMaterial={onViewMaterial}
            onSubmitAssignment={onSubmitAssignment}
          />
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

const UnitHeader = ({ unit, unitIndex, assignmentCount }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
    <Box sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      width: 48, 
      height: 48, 
      borderRadius: 2, 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      fontWeight: 700,
      fontSize: '1.125rem',
      flexShrink: 0,
    }}>
      {unitIndex + 1}
    </Box>
    <Box sx={{ flex: 1 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
        {unit.Title}
      </Typography>
      {unit.Description && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          {unit.Description}
        </Typography>
      )}
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip 
          label={`${unit.Lessons?.length || 0} bài học`} 
          size="small" 
          sx={{ 
            bgcolor: 'primary.light',
            color: 'primary.dark',
            fontWeight: 600,
          }}
        />
        {assignmentCount > 0 && (
          <Chip 
            label={`${assignmentCount} bài tập`} 
            size="small" 
            sx={{ 
              bgcolor: 'secondary.light',
              color: 'secondary.dark',
              fontWeight: 600,
            }}
          />
        )}
        {unit.Duration && (
          <Chip 
            label={unit.Duration} 
            size="small" 
            sx={{ 
              bgcolor: 'success.light',
              color: 'success.dark',
              fontWeight: 600,
            }}
          />
        )}
      </Box>
    </Box>
  </Box>
);

const UnitContent = ({ unit, unitAssignments, isEnrolled, onViewMaterial, onSubmitAssignment }) => {
  const hasContent = unit.Lessons?.length > 0 || unitAssignments.length > 0;

  if (!hasContent) {
    return (
      <Alert severity="info" sx={{ m: 2, borderRadius: 2 }}>
        Chưa có nội dung trong chương này.
      </Alert>
    );
  }

  return (
    <List disablePadding>
      {/* Hiển thị lessons */}
      {unit.Lessons?.map((lesson, lessonIndex) => (
        <LessonItem
          key={lesson.LessonID}
          lesson={lesson}
          isEnrolled={isEnrolled}
          onViewMaterial={onViewMaterial}
          index={lessonIndex}
        />
      ))}
      
      {/* Hiển thị assignments */}
      {unitAssignments.map((assignment, assignmentIndex) => (
        <AssignmentItem
          key={assignment.AssignmentID}
          assignment={assignment}
          isEnrolled={isEnrolled}
          onSubmitAssignment={onSubmitAssignment}
          index={assignmentIndex}
        />
      ))}
    </List>
  );
};

export default UnitAccordion;