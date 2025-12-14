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
  CalendarToday,
  EventAvailable,
} from '@mui/icons-material';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from 'recharts';

const ClassAccordion = ({ classItem, courseId, index, stats }) => {
  const [expanded, setExpanded] = useState(false);
  
  // Format date to display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Dữ liệu cho biểu đồ tròn - Bài tập
  const assignmentData = (() => {
    const completed = classItem.stats.completedAssignments || 0;
    const remaining = classItem.stats.remainingAssignments || 0;
    const total = classItem.stats.totalAssignments || 0;
    
    if (total === 0) {
      return [{ 
        name: 'Chưa có bài tập', 
        value: 1, 
        color: '#d1d5db',
        count: 0
      }];
    } else {
      return [
        { 
          name: 'Hoàn thành', 
          value: completed, 
          color: '#10b981',
          count: completed
        },
        { 
          name: 'Chưa làm', 
          value: remaining, 
          color: '#f59e0b',
          count: remaining
        },
      ];
    }
  })();

  // Dữ liệu cho biểu đồ tròn - Kiểm tra
  const examData = (() => {
    const completed = stats.completedExams || 0;
    const remaining = stats.remainingExams || 0;
    const total = stats.totalExams || 0;
    
    if (total === 0) {
      return [{ 
        name: 'Chưa có bài kiểm tra', 
        value: 1, 
        color: '#d1d5db',
        count: 0
      }];
    } else {
      return [
        { 
          name: 'Đã làm', 
          value: completed, 
          color: '#3b82f6',
          count: completed
        },
        { 
          name: 'Chưa làm', 
          value: remaining, 
          color: '#ef8a32ff',
          count: remaining
        },
      ];
    }
  })();

  // Dữ liệu cho biểu đồ tròn - Điểm danh
  const attendanceData = (() => {
    const attended = classItem.stats.attendedSessions || 0;
    const absent = classItem.stats.absentSessions || 0;
    const total = classItem.stats.totalSessions || 0;
    const notYet = total - attended - absent;
    
    if (total === 0) {
      return [{ 
        name: 'Chưa có buổi học', 
        value: 1, 
        color: '#d1d5db',
        count: 0
      }];
    } else {
      return [
        { 
          name: 'Có mặt', 
          value: attended, 
          color: '#10b981',
          count: attended
        },
        { 
          name: 'Vắng mặt', 
          value: absent, 
          color: '#ef4444',
          count: absent
        },
        { 
          name: 'Chưa điểm danh', 
          value: notYet, 
          color: '#6b7280',
          count: notYet
        },
      ];
    }
  })();

  const PieChartWithLegend = ({ data, title, innerRadius = 40, outerRadius = 60 }) => {
    const isZeroState = data.length === 1 && data[0].color === '#d1d5db';
    const total = isZeroState ? 0 : data.reduce((sum, item) => sum + item.count, 0);
    
    // Custom render function for pie chart labels
    const renderCustomizedLabel = ({ 
      cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value, count 
    }) => {
      if (isZeroState) return null;
      
      const RADIAN = Math.PI / 180;
      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
      const x = cx + radius * Math.cos(-midAngle * RADIAN);
      const y = cy + radius * Math.sin(-midAngle * RADIAN);
      
      // Only show label if the segment is large enough
      if (percent < 0.1) return null;
      
      return (
        <text
          x={x}
          y={y}
          fill="white"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize={12}
          fontWeight="bold"
        >
          {count}
        </text>
      );
    };
    
    // Custom legend formatter
    const customLegendFormatter = (value, entry) => {
      const item = data.find(d => d.name === value);
      const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
      
      return (
        <Typography variant="caption" sx={{ fontSize: '0.75rem', fontWeight: 500 }}>
          {value} {!isZeroState && `(${item.count} - ${percentage}%)`}
        </Typography>
      );
    };

    return (
      <Box sx={{ height: 230, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: 'text.primary' }}>
          {title}
        </Typography>
        
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius={outerRadius}
              paddingAngle={isZeroState ? 0 : 1}
              dataKey="value"
              label={renderCustomizedLabel}
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
              iconSize={10}
              layout="vertical"
              verticalAlign="bottom"
              align="center"
              formatter={customLegendFormatter}
              wrapperStyle={{ paddingTop: '10px' }}
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
              {/* Thêm ngày bắt đầu */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <CalendarToday fontSize="small" sx={{ fontSize: 14, color: 'primary.main' }} />
                Bắt đầu: {formatDate(classItem.dates.classStart)}
              </Typography>
              {/* Thêm ngày kết thúc */}
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <EventAvailable fontSize="small" sx={{ fontSize: 14, color: 'error.main' }} />
                Kết thúc: {formatDate(classItem.dates.classEnd)}
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
                innerRadius={35}
                outerRadius={55}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <PieChartWithLegend
                data={examData}
                title="Kiểm tra"
                innerRadius={35}
                outerRadius={55}
              />
            </Grid>
            
            <Grid item xs={12} md={4}>
              <PieChartWithLegend
                data={attendanceData}
                title="Điểm danh"
                innerRadius={35}
                outerRadius={55}
              />
            </Grid>
          </Grid>
        </Card>
      </AccordionDetails>
    </Accordion>
  );
};

export default ClassAccordion;