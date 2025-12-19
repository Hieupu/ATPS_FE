import React from "react";
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
  Stack,
  Divider,
} from "@mui/material";
import {
  ExpandMore,
  PlayCircleOutline,
  MenuBookOutlined,
  AssignmentOutlined,
  AccessTimeOutlined,
} from "@mui/icons-material";
import LessonItem from "./LessonItem";
import AssignmentItem from "./AssignmentItem";

const UnitAccordion = ({
  unit,
  unitIndex,
  assignments = [],
  isEnrolled,
  onViewMaterial,
  onRefresh,
}) => {
  const unitAssignments = assignments.filter(
    (assignment) => assignment.UnitID === unit.UnitID
  );

  return (
    <Card
      elevation={0}
      sx={{
        border: "1px solid rgba(99,102,241,0.15)",
        borderRadius: 4,
        overflow: "hidden",
        transition: "all 0.3s ease",
        boxShadow: "0 10px 25px rgba(15,23,42,0.06)",
        "&:hover": {
          boxShadow: "0 15px 35px rgba(99,102,241,0.15)",
          transform: "translateY(-3px)",
          borderColor: "rgba(99,102,241,0.3)",
        },
      }}
    >
      <Accordion
        disableGutters
        defaultExpanded={unitIndex === 0}
        sx={{
          "&:before": { display: "none" },
          boxShadow: "none",
        }}
      >
        <AccordionSummary
          expandIcon={
            <ExpandMore
              sx={{
                bgcolor: "rgba(102,126,234,0.1)",
                borderRadius: "50%",
                p: 0.5,
              }}
            />
          }
          sx={{
            px: 3,
            py: 2.5,
            background: "linear-gradient(90deg, #f8f9fe 0%, #ffffff 100%)",
            "&:hover": {
              background: "linear-gradient(90deg, #eef0ff 0%, #f8f9fe 100%)",
            },
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
            onRefresh={onRefresh}
          />
        </AccordionDetails>
      </Accordion>
    </Card>
  );
};

const formatDuration = (minutes) => {
  const mins = parseInt(minutes, 10);
  if (isNaN(mins) || mins <= 0) return null;

  if (mins < 60) {
    return `${mins} giờ`;
  }

  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;

  if (remainingMins === 0) {
    return `${hours} giờ`;
  }

  return `${hours} giờ ${remainingMins} giờ`;
};

const UnitHeader = ({ unit, assignmentCount }) => {
  const videoCount =
    unit.Lessons?.filter((l) => l.Type === "video").length || 0;
  const docCount =
    unit.Lessons?.filter((l) => l.Type === "document").length || 0;
  const durationText = formatDuration(unit.Duration);

  // Kiểm tra xem có bất kỳ thông số nào (video/doc/time) hiển thị không
  const hasMeta =
    videoCount > 0 || docCount > 0 || assignmentCount > 0 || durationText;

  // Style cho text nhỏ
  const metaTextStyle = {
    fontSize: "0.8125rem",
    color: "#666",
    fontWeight: 500,
  };

  // Style cho icon
  const iconStyle = {
    fontSize: "1rem",
    color: "#666",
    mr: 0.5,
    mb: "2px", // Căn chỉnh nhẹ cho thẳng hàng với text
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
      {/* --- DÒNG 1: TIÊU ĐỀ --- */}
      <Typography
        variant="subtitle1"
        sx={{
          fontWeight: 700,
          color: "#1f1f1f",
          fontSize: "1rem",
          lineHeight: 1.4,
          mb: 0.5, // Khoảng cách nhỏ với dòng dưới
        }}
      >
        {unit.Title}
      </Typography>

      {/* --- DÒNG 2: THÔNG SỐ + MÔ TẢ (CÙNG HÀNG) --- */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          color: "#666",
          fontSize: "0.8125rem",
        }}
      >
        {/* Phần 1: Các thông số đếm (Video, Time...) */}
        <Stack direction="row" spacing={2} alignItems="center">
          {videoCount > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <PlayCircleOutline sx={iconStyle} />
              <Typography sx={metaTextStyle}>{videoCount} video</Typography>
            </Box>
          )}

          {docCount > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <MenuBookOutlined sx={iconStyle} />
              <Typography sx={metaTextStyle}>{docCount} tài liệu</Typography>
            </Box>
          )}

          {assignmentCount > 0 && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AssignmentOutlined sx={iconStyle} />
              <Typography sx={metaTextStyle}>
                {assignmentCount} bài tập
              </Typography>
            </Box>
          )}

          {durationText && (
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <AccessTimeOutlined sx={iconStyle} />
              <Typography sx={metaTextStyle}>{durationText}</Typography>
            </Box>
          )}
        </Stack>

        {/* Phần 2: Dấu gạch đứng ngăn cách (chỉ hiện nếu có cả thông số VÀ mô tả) */}
        {hasMeta && unit.Description && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ height: 16, my: "auto", borderColor: "#ccc" }}
          />
        )}

        {/* Phần 3: Mô tả (nằm ngay sau thông số) */}
        {unit.Description && (
          <Typography
            variant="body2"
            sx={{
              color: "#666",
              fontSize: "0.8125rem",
              // Giới hạn mô tả hiển thị trên 1 dòng, nếu dài quá thì ...
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: { xs: "100%", md: "400px" }, // Giới hạn chiều rộng mô tả
            }}
          >
            {unit.Description}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const UnitContent = ({
  unit,
  unitAssignments,
  isEnrolled,
  onViewMaterial,
  onRefresh,
}) => {
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
      {unit.Lessons?.map((lesson, lessonIndex) => (
        <LessonItem
          key={lesson.LessonID}
          lesson={lesson}
          isEnrolled={isEnrolled}
          onViewMaterial={onViewMaterial}
          index={lessonIndex}
        />
      ))}

      {unitAssignments.map((assignment, assignmentIndex) => (
        <AssignmentItem
          key={assignment.AssignmentID}
          assignment={assignment}
          isEnrolled={isEnrolled}
          index={assignmentIndex}
          onRefresh={onRefresh}
        />
      ))}
    </List>
  );
};

export default UnitAccordion;
