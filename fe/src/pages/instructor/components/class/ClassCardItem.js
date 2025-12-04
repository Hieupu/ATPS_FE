import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Box,
  Chip,
  LinearProgress,
  IconButton,
} from "@mui/material";
import {
  MoreVert,
  People,
  Schedule,
  CalendarToday,
  CheckCircle,
  Flag,
} from "@mui/icons-material";

export default function ClassCardItem({ cls, onMenuOpen }) {
  const scheduleLines = cls.scheduleSummary
    ? cls.scheduleSummary
        .split("|")
        .map((line) => line.trim())
        .filter(Boolean)
    : [];

  const completedSessions = parseInt(cls.finishedSessions) || 0;
  const totalSessions = parseInt(cls.totalSessions) || 0;
  const currentStudents = parseInt(cls.currentStudents) || 0;
  const maxStudents = parseInt(cls.maxStudents) || 0;
  const progress = cls.progressPercent || 0;

  const hasSessionToday = !!cls.hasSessionToday;

  const levelColors = {
    BEGINNER: { bg: "#dbeafe", text: "#1e40af", label: "Cơ bản" },
    INTERMEDIATE: { bg: "#fef3c7", text: "#92400e", label: "Trung cấp" },
    ADVANCED: { bg: "#fee2e2", text: "#991b1b", label: "Nâng cao" },
  };
  const levelColor = levelColors[cls.courseLevel] || {
    bg: "#f3f4f6",
    text: "#374151",
    label: cls.courseLevel || "Khác",
  };

  const formatShortDate = (dateStr) => {
    if (!dateStr) return "---";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "---";

    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  let nextSessionText = "Chưa có lịch";
  if (cls.nextSessionDate) {
    const date = new Date(cls.nextSessionDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);

    if (targetDate.getTime() === today.getTime()) {
      nextSessionText = "Hôm nay";
    } else if (targetDate.getTime() === tomorrow.getTime()) {
      nextSessionText = "Ngày mai";
    } else {
      nextSessionText = formatShortDate(cls.nextSessionDate);
    }
  }

  const endDateText = formatShortDate(cls.endDate);

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2.5,
        overflow: "hidden",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        position: "relative",
        border: "1px solid #f1f5f9",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.12)",
          borderColor: "#e2e8f0",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="140"
          image={cls.courseImage}
          alt={cls.courseTitle}
          sx={{ objectFit: "cover", bgcolor: "#f8fafc" }}
        />
        {hasSessionToday && (
          <Chip
            label="HÔM NAY"
            size="small"
            sx={{
              position: "absolute",
              top: 10,
              left: 10,
              bgcolor: "#dc2626",
              color: "white",
              fontWeight: 800,
              fontSize: "10px",
              height: 24,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        )}
        <Chip
          label={
            ["APPROVED", "ACTIVE"].includes(cls.classStatus)
              ? "Đang diễn ra"
              : ["PENDING", "WAITING", "ONGOING"].includes(cls.classStatus)
              ? "Sắp khai giảng"
              : cls.classStatus === "CLOSE"
              ? "Đã kết thúc"
              : cls.classStatus === "CANCEL"
              ? "Đã hủy"
              : cls.classStatus
          }
          size="small"
          sx={{
            position: "absolute",
            top: 10,
            right: 50,
            bgcolor: ["APPROVED", "ACTIVE"].includes(cls.classStatus)
              ? "#10b981" // Xanh lá
              : ["PENDING", "WAITING", "ONGOING"].includes(cls.classStatus)
              ? "#f59e0b" // Cam
              : cls.classStatus === "CLOSE"
              ? "#6366f1" // Tím
              : cls.classStatus === "CANCEL"
              ? "#ef4444" // Đỏ
              : "#94a3b8", // Mặc định
            color: "white",
            fontWeight: 700,
            fontSize: "10px",
            height: 24,
            "& .MuiChip-label": { px: 1.5 },
          }}
        />
        {cls.courseLevel && (
          <Chip
            label={levelColor.label}
            size="small"
            sx={{
              position: "absolute",
              bottom: 10,
              right: 10,
              bgcolor: levelColor.bg,
              color: levelColor.text,
              fontWeight: 700,
              fontSize: "10px",
              height: 24,
              "& .MuiChip-label": { px: 1.5 },
            }}
          />
        )}
        <IconButton
          size="small"
          onClick={(e) => onMenuOpen(e, cls)}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            bgcolor: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(4px)",
            width: 32,
            height: 32,
            "&:hover": { bgcolor: "white" },
          }}
        >
          <MoreVert sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, pt: 2 }}>
        <Typography
          variant="h6"
          fontWeight={700}
          sx={{
            fontSize: "16px",
            mb: 0.5,
            lineHeight: 1.3,
            minHeight: "42px",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {cls.className}
        </Typography>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            fontSize: "13px",
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 1,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {cls.courseTitle}
        </Typography>

        <Box
          sx={{
            bgcolor: "#f8fafc",
            borderRadius: 1.5,
            p: 1.5,
            mb: 2,
            border: "1px solid #e2e8f0",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 1 }}>
            <Schedule sx={{ fontSize: 16, color: "#6366f1" }} />
            <Typography
              variant="caption"
              fontWeight={700}
              color="#475569"
              sx={{ fontSize: "11px" }}
            >
              LỊCH HỌC
            </Typography>
          </Box>

          {cls.scheduleSummary &&
          cls.scheduleSummary !== "Chưa có lịch cố định" ? (
            scheduleLines.length > 0 ? (
              scheduleLines.map((line, index) => (
                <Typography
                  key={index}
                  variant="body2"
                  sx={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#1e293b",
                    lineHeight: 1.6,
                  }}
                >
                  {line}
                </Typography>
              ))
            ) : (
              <Typography
                variant="body2"
                sx={{
                  fontSize: "13px",
                  fontWeight: 600,
                  color: "#1e293b",
                  lineHeight: 1.6,
                }}
              >
                {cls.scheduleSummary}
              </Typography>
            )
          ) : (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: "13px", fontStyle: "italic" }}
            >
              Chưa có lịch cố định
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr",
            gap: 1,
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarToday
                sx={{
                  fontSize: 14,
                  color:
                    nextSessionText === "Hôm nay"
                      ? "#dc2626"
                      : nextSessionText === "Ngày mai"
                      ? "#f59e0b"
                      : "#64748b",
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "10px", whiteSpace: "nowrap" }}
              >
                Buổi tới
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={nextSessionText === "Hôm nay" ? 800 : 700}
              sx={{
                fontSize: "12px",
                color:
                  nextSessionText === "Hôm nay"
                    ? "#dc2626"
                    : nextSessionText === "Ngày mai"
                    ? "#f59e0b"
                    : "#1e293b",
              }}
            >
              {nextSessionText}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <People
                sx={{
                  fontSize: 14,
                  color:
                    currentStudents >= maxStudents * 0.9
                      ? "#dc2626"
                      : "#10b981",
                }}
              />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "10px", whiteSpace: "nowrap" }}
              >
                Sĩ số
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{
                fontSize: "12px",
                color:
                  currentStudents >= maxStudents * 0.9 ? "#dc2626" : "#1e293b",
              }}
            >
              {currentStudents}/{maxStudents}
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 0.5,
              alignItems: "flex-end",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Flag sx={{ fontSize: 14, color: "#64748b" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "10px", whiteSpace: "nowrap" }}
              >
                Kết thúc
              </Typography>
            </Box>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ fontSize: "12px", color: "#1e293b" }}
            >
              {endDateText}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mt: "auto" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 0.75,
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CheckCircle sx={{ fontSize: 14, color: "#6366f1" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "11px" }}
              >
                Tiến độ
              </Typography>
            </Box>
            <Typography
              variant="caption"
              fontWeight={700}
              sx={{ fontSize: "12px" }}
            >
              {completedSessions}/{totalSessions} buổi
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: "#e2e8f0",
              "& .MuiLinearProgress-bar": {
                bgcolor:
                  progress === 100
                    ? "#10b981"
                    : hasSessionToday
                    ? "#dc2626"
                    : "#6366f1",
                borderRadius: 4,
              },
            }}
          />
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              fontSize: "10px",
              mt: 0.5,
              display: "block",
              textAlign: "right",
            }}
          >
            {progress}% hoàn thành
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
