import React, { useState } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  Chip,
  Grid,
  Card,
  Avatar,
} from '@mui/material';
import {
  ExpandMore,
  Class as ClassIcon,
  TrendingUp,
  Schedule,

} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ClassAccordion = ({ classItem, courseId, index , stats}) => {
  const [expanded, setExpanded] = useState(false);
  console.log("classItem" , classItem)
  console.log("stats" , stats)

// Dữ liệu cho biểu đồ tròn - Bài tập
const assignmentData = (() => {
  const completed = classItem.stats.completedAssignments || 0;
  const remaining = classItem.stats.remainingAssignments || 0;
  const total = classItem.stats.totalAssignments || 0;
  
  if (total === 0) {
    // Trường hợp: Chưa có bài tập nào
    return [{ name: 'Chưa có bài tập', value: 1, color: '#d1d5db' }];
  } else {
    return [
      { name: 'Hoàn thành', value: completed, color: '#10b981' },
      { name: 'Chưa làm', value: remaining, color: '#f59e0b' },
    ];
  }
})();

// Dữ liệu cho biểu đồ tròn - Kiểm tra
const examData = (() => {
  const completed = stats.completedExams || 0;
  const remaining = stats.remainingExams || 0;
  const total = stats.totalExams || 0;
  
  if (total === 0) {
    // Trường hợp: Chưa có bài kiểm tra nào
    return [{ name: 'Chưa có bài kiểm tra', value: 1, color: '#d1d5db' }];
  } else {
    return [
      { name: 'Đã làm', value: completed, color: '#3b82f6' },
      { name: 'Chưa làm', value: remaining, color: '#ef8a32ff' },
    ];
  }
})();

// Dữ liệu cho biểu đồ tròn - Điểm danh
const attendanceData = (() => {
  const attended = classItem.stats.attendedSessions || 0;
  const absent = classItem.stats.absentSessions || 0;
  const total = stats.totalSessions || 0;
  
  if (total === 0) {
    // Trường hợp: Chưa có buổi học nào
    return [{ name: 'Chưa có buổi học', value: 1, color: '#d1d5db' }];
  } else {
    return [
      { name: 'Có mặt', value: attended, color: '#10b981' },
      { name: 'Vắng mặt', value: absent, color: '#ef4444' },
    ];
  }
})();

const PieChartWithLegend = ({ data, title, innerRadius = 40, outerRadius = 60 }) => {
  const isZeroState = data.length === 1 && data[0].color === '#d1d5db';
  
  return (
    <Box sx={{ height: 200, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Typography variant="caption" sx={{ fontWeight: 600, mb: 1, color: 'text.secondary' }}>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={isZeroState ? 0 : 2}
            dataKey="value"
            label={({ name, value }) => {
              if (isZeroState) {
                return '0';
              }
              return value;
            }}
            labelLine={false}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color}
                stroke={isZeroState ? '#e5e7eb' : 'none'}
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Legend
            iconSize={8}
            layout="vertical"
            verticalAlign="bottom"
            align="center"
            formatter={(value) => (
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {value}
              </Typography>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </Box>
  );
};

  return (
    <Accordion
      elevation={0}
      sx={{
        mb: 2,
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        '&:before': { display: 'none' },
        overflow: 'hidden',
        transition: 'all 0.3s',
        '&:hover': {
          borderColor: 'primary.main',
        },
      }}
      expanded={expanded}
      onChange={() => setExpanded(!expanded)}
    >
      <AccordionSummary
        expandIcon={
          <ExpandMore
            sx={{
              color: 'primary.main',
              transition: 'transform 0.3s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0)',
            }}
          />
        }
        sx={{
          bgcolor: expanded ? '#f8fafc' : 'white',
          '&:hover': {
            bgcolor: '#f8fafc',
          },
          py: 1,
          px: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1, flexWrap: 'wrap' }}>
          <Avatar
            sx={{
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
            }}
          >
            <ClassIcon />
          </Avatar>
          
          <Box sx={{ flex: 1, minWidth: 200 }}>
            <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', mb: 0.5 }}>
              {classItem.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              <Chip
                label={classItem.status}
                size="small"
                color={classItem.status.toLowerCase() === 'enrolled' ? 'success' : 'default'}
                sx={{ fontWeight: 500 }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Schedule fontSize="small" sx={{ fontSize: 14 }} />
                {classItem.stats.totalSessions} buổi
              </Typography>
            </Box>
          </Box>
        </Box>
      </AccordionSummary>
      
      <AccordionDetails sx={{ p: 3, bgcolor: '#f8fafc' }}>
        {/* Phần biểu đồ thống kê */}
        <Card 
          elevation={0}
          sx={{ 
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'divider',
            p: 2,
            mb: 3
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
            <TrendingUp sx={{ color: 'primary.main' }} />
            Thống kê chi tiết
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <PieChartWithLegend
                data={assignmentData}
                title="Bài tập"
                innerRadius={30}
                outerRadius={50}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <PieChartWithLegend
                data={examData}
                title="Kiểm tra"
                innerRadius={30}
                outerRadius={50}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <PieChartWithLegend
                data={attendanceData}
                title="Điểm danh"
                innerRadius={30}
                outerRadius={50}
              />
            </Grid>
          </Grid>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
};

export default ClassAccordion;