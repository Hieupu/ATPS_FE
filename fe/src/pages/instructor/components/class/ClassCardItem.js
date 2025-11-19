import React from "react";
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  Stack,
  Tooltip,
  IconButton,
  Button,
} from "@mui/material";
import {
  MoreVert,
  People,
  CheckCircle,
  PlayCircle,
  Schedule,
  HourglassEmpty,
  VideoCall,
  EditCalendar,
} from "@mui/icons-material";

export default function ClassCardItem({ cls, getStatusConfig, onMenuOpen }) {
  const status = getStatusConfig(cls.status);

  const renderStatusIcon = () => {
    if (cls.status === "ongoing")
      return <PlayCircle sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />;
    if (cls.status === "upcoming")
      return (
        <HourglassEmpty sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />
      );
    if (cls.status === "completed")
      return (
        <CheckCircle sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />
      );
    return <Schedule sx={{ fontSize: 56, color: "white", opacity: 0.9 }} />;
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
        },
      }}
    >
      {/* Thumbnail */}
      <Box
        sx={{
          height: 120,
          background: `linear-gradient(135deg, ${cls.thumbnail} 0%, ${cls.thumbnail}dd 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          borderRadius: "12px 12px 0 0",
        }}
      >
        {renderStatusIcon()}
        <IconButton
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            backgroundColor: "rgba(255,255,255,0.9)",
            "&:hover": { backgroundColor: "white" },
          }}
          size="small"
          onClick={(e) => onMenuOpen(e, cls)}
        >
          <MoreVert />
        </IconButton>
      </Box>

      <CardContent sx={{ pt: 2 }}>
        {/* Status & Class name/code */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Chip
            label={status.label}
            size="small"
            sx={{
              backgroundColor: status.bg,
              color: status.color,
              fontWeight: 600,
              height: 26,
              fontSize: "11px",
            }}
          />
          <Typography
            variant="caption"
            sx={{ fontWeight: 600, color: "#64748b" }}
          >
            {cls.className}
          </Typography>
        </Box>

        {/* Course title */}
        <Typography
          variant="h6"
          sx={{ fontWeight: 700, mb: 0.5, fontSize: "15px" }}
        >
          {cls.courseName}
        </Typography>

        {/* Instructor */}
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          Instructor: {cls.instructorName}
        </Typography>

        {/* Enrollment + fee/sessions */}
        <Stack direction="row" spacing={2} sx={{ mb: 1.5 }}>
          <Tooltip title="Enrolled Students">
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <People sx={{ fontSize: 16, color: "#64748b" }} />
              <Typography variant="caption" color="text.secondary">
                {cls.students}/{cls.totalStudents} students
              </Typography>
            </Box>
          </Tooltip>
        </Stack>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          Fee: {cls.fee} VND
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block", mb: 1 }}
        >
          Sessions: {cls.numOfSession}
        </Typography>

        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ display: "block" }}
        >
          Plan: {cls.startDatePlan} → {cls.endDatePlan}
        </Typography>

        {/* Bottom actions */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 1.5,
            mt: 1,
            borderTop: "1px solid #f1f5f9",
          }}
        >
          <Box>
            <Typography variant="caption" color="text.secondary">
              Zoom ID
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, fontSize: "13px" }}
            >
              {cls.zoomId || "-"}
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {cls.status === "ongoing" && (
              <>
                <Tooltip title="Take Attendance">
                  <IconButton size="small" color="primary">
                    <EditCalendar />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Join Online Class">
                  <IconButton size="small" color="success">
                    <VideoCall />
                  </IconButton>
                </Tooltip>
              </>
            )}
            <Button
              variant="outlined"
              size="small"
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                fontSize: "12px",
                borderColor: cls.thumbnail,
                color: cls.thumbnail,
                "&:hover": {
                  borderColor: cls.thumbnail,
                  backgroundColor: `${cls.thumbnail}15`,
                },
              }}
            >
              View Details
            </Button>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
}
