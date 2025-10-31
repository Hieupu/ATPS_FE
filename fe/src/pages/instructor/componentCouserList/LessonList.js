// src/pages/instructor/components/LessonList.js
import React from "react";
import {
  Box,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Tooltip,
} from "@mui/material";
import { Edit, Delete, VideoLibrary, Description } from "@mui/icons-material";

export default function LessonList({
  lessons = [],
  unitId,
  onEditLesson,
  onDeleteLesson,
}) {
  if (!lessons || lessons.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          Chưa có bài học
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%" }}>
      <List sx={{ p: 0 }}>
        {lessons.map((lesson, index) => (
          <ListItem
            key={lesson.LessonID}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: "8px",
              mb: 1.5,
              transition: "all 0.2s ease-in-out",
              "&:hover": {
                backgroundColor: "#f4f4ff",
                borderColor: "#5b5bff",
                transform: "translateY(-1px)",
                boxShadow: "0 2px 8px rgba(91, 91, 255, 0.1)",
              },
              pl: 2,
              pr: 2,
            }}
          >
            <ListItemIcon sx={{ minWidth: 40 }}>
              {lesson.Type === "video" ? (
                <VideoLibrary sx={{ color: "#5b5bff", fontSize: 28 }} />
              ) : (
                <Description sx={{ color: "#757575", fontSize: 28 }} />
              )}
            </ListItemIcon>

            <ListItemText
              primary={
                <Typography
                  variant="body1"
                  sx={{
                    fontWeight: 500,
                    color: "#1a1a1a",
                    mb: 0.5,
                  }}
                >
                  {lesson.Title}
                </Typography>
              }
              secondary={
                <Typography variant="caption" color="text.secondary">
                  {lesson.Time} phút •{" "}
                  {lesson.Type === "video" ? "Video bài giảng" : "Tài liệu đọc"}
                </Typography>
              }
            />

            <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
              <Tooltip title="Chỉnh sửa bài học" arrow>
                <IconButton
                  size="small"
                  onClick={() => onEditLesson({ ...lesson, UnitID: unitId })}
                  sx={{
                    color: "#5b5bff",
                    "&:hover": {
                      backgroundColor: "rgba(91, 91, 255, 0.1)",
                    },
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
              </Tooltip>

              <Tooltip title="Xóa bài học" arrow>
                <IconButton
                  size="small"
                  onClick={() => onDeleteLesson(lesson.LessonID)}
                  sx={{
                    color: "#ef4444",
                    "&:hover": {
                      backgroundColor: "rgba(239, 68, 68, 0.1)",
                    },
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
              </Tooltip>
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
