import React from "react";
import { Card, CardContent, Grid, Typography, Box, Chip, Button } from "@mui/material";
import { School, AccessTime, Person, VideoCall } from "@mui/icons-material";

const ScheduleCard = ({ 
  schedule, 
  generateZoomLink, 
  canJoinZoom, 
  showPastStyle = false 
}) => {
  console.log("schedule", schedule)
  const canJoin = canJoinZoom(schedule);

  const handleJoinZoom = () => {
    // Lưu schedule data vào sessionStorage TRƯỚC KHI mở tab mới
    sessionStorage.setItem('zoomScheduleData', JSON.stringify({
      schedule: schedule,
      timestamp: new Date().getTime()
    }));

    // Đợi một chút để đảm bảo sessionStorage được lưu
    setTimeout(() => {
      // Mở ZoomMeeting trong tab mới
      window.open('/zoom', '_blank');
    }, 100);
  };

  return (
    <Card
      sx={{
        mb: 2,
        borderLeft: 4,
        borderColor: showPastStyle ? "grey.400" : "primary.main",
        bgcolor: showPastStyle ? "#f5f5f5" : "background.paper",
      }}
    >
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={showPastStyle ? 12 : 8}>
            <Typography
              variant="h6"
              sx={{ 
                fontWeight: 600, 
                mb: 1,
                color: showPastStyle ? "text.secondary" : "text.primary"
              }}
            >
              {schedule.SessionTitle}
            </Typography>
            
            {schedule.Description && (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {schedule.Description}
              </Typography>
            )}
            
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                flexWrap: "wrap",
                mt: 2,
              }}
            >
              <Chip
                icon={<School />}
                label={
                  schedule.CourseTitle && schedule.CourseTitle.length > 30
                    ? schedule.CourseTitle.substring(0, 30) + "..."
                    : schedule.CourseTitle
                }
                size="small"
                color={showPastStyle ? "default" : "primary"}
                variant="outlined"
              />
              <Chip
                icon={<AccessTime />}
                label={schedule.timeRange || "Chưa có giờ"}
                size="small"
                variant={showPastStyle ? "outlined" : "filled"}
              />
              <Chip
                icon={<Person />}
                label={schedule.InstructorName}
                size="small"
                variant={showPastStyle ? "outlined" : "filled"}
              />
              {canJoin && !showPastStyle && (
                <Chip
                  icon={<VideoCall />}
                  label="Có Zoom"
                  size="small"
                  color="success"
                  variant="outlined"
                />
              )}
            </Box>
          </Grid>
          
          {!showPastStyle && (
            <Grid
              item
              xs={12}
              md={4}
              sx={{ textAlign: { xs: "left", md: "right" } }}
            >
              {canJoin && (
                <Button
                  variant="contained"
                  startIcon={<VideoCall />}
                  onClick={handleJoinZoom}
                  sx={{
                    mb: 1,
                    width: { xs: "100%", md: "auto" },
                    backgroundColor: "#2D8CFF",
                    '&:hover': {
                      backgroundColor: '#1E6FD9',
                    }
                  }}
                >
                  Tham gia Zoom
                </Button>
              )}
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
};

export default ScheduleCard;