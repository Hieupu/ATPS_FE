import React from "react";
import { List, ListItem, ListItemText, Box, IconButton } from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayCircleOutline as PlayIcon,
} from "@mui/icons-material";

export default function LessonList({
  unitId,
  lessons = [],
  onEditLesson, // (lesson, unitId) => void
  onDeleteLesson, // (unitId, lessonId) => void
}) {
  if (!lessons.length) {
    return (
      <Box sx={{ color: "#64748b", fontStyle: "italic" }}>
        Chưa có bài học nào
      </Box>
    );
  }

  return (
    <List sx={{ bgcolor: "#f8f9ff", borderRadius: 2, p: 1 }}>
      {lessons.map((lesson) => (
        <ListItem
          key={lesson.LessonID}
          sx={{ borderRadius: 1, mb: 1, bgcolor: "white" }}
          secondaryAction={
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onEditLesson(lesson, unitId)}
                sx={{ color: "#5b5bff" }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                edge="end"
                size="small"
                onClick={() => onDeleteLesson(unitId, lesson.LessonID)}
                sx={{ color: "#ef4444" }}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          }
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <PlayIcon sx={{ color: "#5b5bff", fontSize: 20 }} />
            <ListItemText
              primary={lesson.Title}
              secondary={`${lesson.Time} giờ - ${lesson.Type}`}
              primaryTypographyProps={{ fontWeight: 600, fontSize: "0.875rem" }}
              secondaryTypographyProps={{ fontSize: "0.75rem" }}
            />
          </Box>
        </ListItem>
      ))}
    </List>
  );
}
