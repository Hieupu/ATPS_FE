import React from "react";
import {
  Box,
  Typography,
  Avatar,
  Chip,
  Button,
  useTheme,
} from "@mui/material";

const CompactClassRow = ({
  classItem,
  onInstructorClick,
  onRegisterClick,
  formatDate,
  getScheduleInfo,
  getClassStatus,
}) => {
  const theme = useTheme();
  const status = getClassStatus(classItem);
  const schedule = getScheduleInfo(classItem.weeklySchedule);
  const isFull = status.label === "ĐÃ ĐẦY";

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        p: 1.5,
        mb: 1,
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 1,
        backgroundColor: theme.palette.background.paper,
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundColor: theme.palette.action.hover,
          boxShadow: theme.shadows[1],
        },
      }}
    >
      {/* Teacher & Class */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flex: 1, minWidth: 0 }}>
        <Avatar
          src={classItem.ProfilePicture}
          alt={classItem.InstructorName}
          sx={{
            width: 40,
            height: 40,
            cursor: "pointer",
            border: `1px solid ${theme.palette.divider}`,
          }}
          onClick={(e) => onInstructorClick(classItem.InstructorID, e)}
        />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight="medium" noWrap>
            {classItem.ClassName}  
          </Typography>
          <Typography variant="caption" color="text.secondary" noWrap>
            {classItem.InstructorName}
          </Typography>
        </Box>
      </Box>

      {/* Schedule */}
      <Box sx={{ 
        display: { xs: 'none', sm: 'flex' }, 
        alignItems: "center", 
        flex: 2,
        minWidth: 0,
        px: 2,
        gap: 3
      }}>
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          minWidth: 0, 
          flex: 1,
          maxWidth: '200px'
        }}>
          <Typography 
            variant="body2" 
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              ml: 4.5
            }}
            title={formatDate(classItem.Opendate || classItem.OpendatePlan)}
          >
            {formatDate(classItem.Opendate || classItem.OpendatePlan)}
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          minWidth: 0, 
          flex: 1,
          maxWidth: '150px',
        }}>
          <Typography 
            variant="body2"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              ml: 1.5
            }}
            title={schedule.days}
          >
            {schedule.days} 
          </Typography>
        </Box>
        
        <Box sx={{ 
          display: "flex", 
          alignItems: "center", 
          minWidth: 0, 
          flex: 1,
          maxWidth: '120px'
        }}>
          <Typography 
            variant="body2"
            sx={{ 
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              minWidth: 0,
              ml: 3
            }}
            title={schedule.time}
          >
            {schedule.time}
          </Typography>
        </Box>
      </Box>

      {/* Status & Action */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        gap: 1.5,
        minWidth: 0,
        justifyContent: 'flex-end',
        flex: { xs: 0, sm: 1 }
      }}>
        <Chip
          label={status.label}
          color={status.color}
          size="small"
          sx={{ 
            fontWeight: "bold", 
            fontSize: "0.7rem",
            height: 24,
            minWidth: 70
          }}
        />
        <Button
          variant={isFull ? "outlined" : "contained"}
          color={isFull ? "error" : "primary"}
          size="small"
          disabled={isFull}
          sx={{ 
            fontWeight: "bold",
            fontSize: "0.75rem",
            px: 1.5,
            py: 0.5,
            minWidth: 80,
            textTransform: 'none'
          }}
          onClick={(e) => onRegisterClick(classItem.CourseID, e)}
        >
          {isFull ? "Đã đầy" : "Đăng ký"}
        </Button>
      </Box>
    </Box>
  );
};

export default CompactClassRow;