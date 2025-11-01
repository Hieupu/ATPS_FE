import React from "react";
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  Chip,
  Button,
  Divider,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  AccessTime as TimeIcon,
  LibraryBooks as UnitIcon,
  MenuBook as LessonIcon,
  Group as GroupIcon,
  Class as ClassIcon,
  Event as EventIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  Send as SendIcon,
  Delete as DeleteIcon,
  InfoOutlined as InfoIcon,
} from "@mui/icons-material";

export default function CourseCard({
  course,
  stats = {},
  getStatusColor,
  getStatusLabel,
  onViewDetails,
  onEdit,
  onSubmit,
  onDelete,
  onPreview,
}) {
  const {
    unitsCount = 0,
    lessonsCount = 0,
    classesCount = 0,
    enrolledCount = 0,
    nextSessionDate = null,
  } = stats;

  const TITLE_LINES = 2;
  const TITLE_LH = 1.2;
  const DESC_LINES = 3;
  const DESC_LH = 1.4;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
        transition: "all .25s",
        "&:hover": {
          boxShadow: "0 8px 24px rgba(91, 91, 255, 0.15)",
          transform: "translateY(-4px)",
        },
      }}
    >
      <CardContent
        sx={{
          flexGrow: 1,
          p: 3,
          display: "grid",
          gridTemplateRows: "auto auto auto 1fr",
          rowGap: 1.25,
          minHeight: 0,
        }}
      >
        {/* status + price */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Chip
            label={getStatusLabel(course.Status)}
            color={getStatusColor(course.Status)}
            size="small"
            sx={{ fontWeight: 600 }}
          />
          <Typography variant="h6" sx={{ color: "#5b5bff", fontWeight: 700 }}>
            {Number(course.Fee || 0).toLocaleString("vi-VN")}₫
          </Typography>
        </Box>

        {/* title (clamp 2 dòng, click để mở chi tiết) */}
        <Tooltip title={course.Title || ""} arrow>
          <Typography
            variant="h6"
            tabIndex={0}
            role="button"
            onClick={onViewDetails}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") onViewDetails?.();
            }}
            sx={{
              cursor: "pointer",
              fontWeight: 700,
              color: "#1e293b",
              display: "-webkit-box",
              WebkitLineClamp: TITLE_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: TITLE_LH,
              minHeight: `${TITLE_LINES * TITLE_LH}em`,
              "&:hover": { textDecoration: "underline" },
            }}
          >
            {course.Title}
          </Typography>
        </Tooltip>

        {/* description (clamp 3 dòng) */}
        <Tooltip title={course.Description || ""} arrow>
          <Typography
            variant="body2"
            sx={{
              color: "#64748b",
              display: "-webkit-box",
              WebkitLineClamp: DESC_LINES,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              lineHeight: DESC_LH,
              minHeight: `${DESC_LINES * DESC_LH}em`,
            }}
          >
            {course.Description}
          </Typography>
        </Tooltip>

        {/* Meta */}
        <Stack
          spacing={1}
          sx={{ fontSize: 13, color: "#475569", minHeight: 0 }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <TimeIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <span>{course.Duration} giờ</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            <UnitIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <span>{unitsCount} Units</span>
            <LessonIcon sx={{ fontSize: 18, color: "#64748b", ml: 2 }} />
            <span>{lessonsCount} Lessons</span>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.2,
              flexWrap: "wrap",
            }}
          >
            <ClassIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <span>{classesCount} Classes</span>
            <GroupIcon sx={{ fontSize: 18, color: "#64748b", ml: 2 }} />
            <span>{enrolledCount} Enrolled</span>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <EventIcon sx={{ fontSize: 18, color: "#64748b" }} />
            <span>
              {nextSessionDate
                ? new Date(nextSessionDate).toLocaleDateString("vi-VN")
                : "Chưa có lịch"}
            </span>
          </Box>
        </Stack>
      </CardContent>

      <Divider />

      <CardActions
        sx={{
          p: 1,
          minHeight: 48,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "nowrap",
        }}
      >
        {/* bên trái: Chi tiết, Xem trước, Sửa, (Gửi duyệt) */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            flex: "1 1 auto",
            minWidth: 0,
          }}
        >
          {/* Chi tiết (CRUD dialog) */}
          <Tooltip title="Chi tiết">
            <Button
              onClick={onViewDetails}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 40,
                width: 40,
                height: 36,
                borderRadius: 2,
                borderColor: "#3b82f633",
                "&:hover": {
                  borderColor: "#3b82f6",
                  backgroundColor: "#3b82f60d",
                },
              }}
            >
              <InfoIcon fontSize="small" sx={{ color: "#3b82f6" }} />
            </Button>
          </Tooltip>

          {/* Xem trước (CourseReview) */}
          <Tooltip title="Xem trước">
            <Button
              onClick={onPreview}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 40,
                width: 40,
                height: 36,
                borderRadius: 2,
                borderColor: "#6366f133",
                "&:hover": {
                  borderColor: "#6366f1",
                  backgroundColor: "#6366f10d",
                },
              }}
            >
              <VisibilityIcon fontSize="small" sx={{ color: "#6366f1" }} />
            </Button>
          </Tooltip>

          {/* Sửa khóa học */}
          <Tooltip title="Sửa">
            <Button
              onClick={onEdit}
              size="small"
              variant="outlined"
              sx={{
                minWidth: 40,
                width: 40,
                height: 36,
                borderRadius: 2,
                borderColor: "#64748b33",
                "&:hover": {
                  borderColor: "#64748b",
                  backgroundColor: "#64748b0d",
                },
              }}
            >
              <EditIcon fontSize="small" sx={{ color: "#64748b" }} />
            </Button>
          </Tooltip>

          {/* Gửi duyệt */}
          {String(course.Status).toLowerCase() === "draft" && (
            <Tooltip title="Gửi duyệt">
              <Button
                onClick={onSubmit}
                size="small"
                variant="outlined"
                sx={{
                  minWidth: 40,
                  width: 40,
                  height: 36,
                  borderRadius: 2,
                  borderColor: "#10b98133",
                  "&:hover": {
                    borderColor: "#10b981",
                    backgroundColor: "#10b9810d",
                  },
                }}
              >
                <SendIcon fontSize="small" sx={{ color: "#10b981" }} />
              </Button>
            </Tooltip>
          )}
        </Box>

        {/* bên phải: Xóa */}
        <Tooltip title="Xóa">
          <Button
            onClick={onDelete}
            size="small"
            variant="outlined"
            sx={{
              minWidth: 40,
              width: 40,
              height: 36,
              borderRadius: 2,
              borderColor: "#ef444433",
              "&:hover": {
                borderColor: "#ef4444",
                backgroundColor: "#ef44440d",
              },
            }}
          >
            <DeleteIcon fontSize="small" sx={{ color: "#ef4444" }} />
          </Button>
        </Tooltip>
      </CardActions>
    </Card>
  );
}
