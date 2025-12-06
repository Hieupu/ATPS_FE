import React, { useCallback } from "react";
import {
  Card,
  Box,
  Typography,
  Avatar,
  Chip,
  IconButton,
  Divider,
  Collapse,
  useTheme,
} from "@mui/material";
import { ExpandLess, ExpandMore } from "@mui/icons-material";
import CompactClassRow from "./CompactClassRow";

const CompactCourseCard = ({
  course,
  expandedCourseId,
  onToggleExpand,
  onCourseClick,
  onInstructorClick,
  onRegisterClick,
  formatDate,
  getScheduleInfo,
  getClassStatus,
  getLevelInfo,
}) => {
  const theme = useTheme();
  const isExpanded = expandedCourseId === course.CourseID;
  const level = getLevelInfo(course.CourseLevel);

  return (
    <Card
      sx={{
        mb: 2,
        border: `1px solid ${isExpanded ? theme.palette.primary.main : theme.palette.divider}`,
        borderRadius: 1,
        overflow: "hidden",
        transition: "all 0.2s ease",
        boxShadow: isExpanded ? theme.shadows[1] : 'none',
      }}
    >
      {/* Compact Header */}
      <Box
        sx={{
          p: 1.5,
          cursor: "pointer",
          backgroundColor: isExpanded ? theme.palette.primary.light + "10" : "transparent",
          transition: "all 0.2s ease",
          "&:hover": {
            backgroundColor: theme.palette.action.hover,
          },
        }}
        onClick={() => onToggleExpand(course.CourseID)}
      >
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, minWidth: 0, flex: 1 }}>
            <Avatar
              src={course.CourseImage}
              alt={course.CourseTitle}
              sx={{ 
                width: 48, 
                height: 48, 
                borderRadius: 1,
                border: `1px solid ${theme.palette.divider}`,
              }}
              variant="rounded"
            />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography
  variant="subtitle1"
  fontWeight="bold"
  sx={{ 
    mb: 0.5,
    cursor: "pointer", 
    "&:hover": { color: theme.palette.primary.main },
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap', // Thay thế cho -webkit-box
    display: 'inline-block', // hoặc 'inline-flex'
    maxWidth: '100%', // Đảm bảo không vượt quá container
    fontSize: '0.95rem'
  }}
  onClick={(e) => onCourseClick(course.CourseID, e)}
>
  {course.CourseTitle}
</Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: 'wrap' }}>
                <Chip
                  label={level.label}
                  color={level.color}
                  size="small"
                  sx={{ 
                    fontWeight: "bold",
                    fontSize: '0.7rem',
                    height: 20
                  }}
                />
                <Typography variant="caption" color="text.secondary">
                  {course.Numofsession} buổi • {course.CourseDuration}h
                </Typography>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
              {course.classes.length} lớp
            </Typography>
            <IconButton size="small" sx={{ p: 0.5 }}>
              {isExpanded ? 
                <ExpandLess sx={{ fontSize: 18, color: theme.palette.primary.main }} /> : 
                <ExpandMore sx={{ fontSize: 18, color: theme.palette.text.secondary }} />
              }
            </IconButton>
          </Box>
        </Box>
      </Box>

      {/* Compact Classes List */}
      <Collapse in={isExpanded} timeout="auto">
        <Divider />
        <Box sx={{ p: 1.5 }}>
          {/* Table Headers - Visible only when expanded */}
          {isExpanded && course.classes.length > 0 && (
            <Box sx={{ 
              display: { xs: 'none', sm: 'grid' },
              gridTemplateColumns: '1fr 2fr 1fr',
              alignItems: "center",
              p: 1.5,
              mb: 1,
              backgroundColor: theme.palette.grey[50],
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 1,
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', ml: -15 }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  LỚP HỌC / GIẢNG VIÊN
                </Typography>
              </Box>

              <Box sx={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                alignItems: "center",
                gap: 2,
                px: 2
              }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    KHAI GIẢNG
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    BUỔI
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="caption" fontWeight="bold" color="text.secondary">
                    GIỜ
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ 
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                mr: -20
              }}>
                <Typography variant="caption" fontWeight="bold" color="text.secondary">
                  TRẠNG THÁI
                </Typography>
                <Box sx={{ minWidth: 80 }} />
              </Box>
            </Box>
          )}

          {course.classes.map((classItem) => (
            <CompactClassRow 
              key={classItem.ClassID} 
              classItem={classItem}
              onInstructorClick={onInstructorClick}
              onRegisterClick={onRegisterClick}
              formatDate={formatDate}
              getScheduleInfo={getScheduleInfo}
              getClassStatus={getClassStatus}
            />
          ))}

          {course.classes.length === 0 && (
            <Box sx={{ p: 2, textAlign: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Hiện chưa có lớp học nào
              </Typography>
            </Box>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};

export default CompactCourseCard;