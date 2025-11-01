import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  IconButton,
  Button,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
} from "@mui/icons-material";
import LessonList from "./LessonList";

export default function UnitAccordion({
  units = [],
  lessonsByUnit = {}, // map { [UnitID]: Lesson[] }
  onAddUnit, // () => void
  onEditUnit, // (unit) => void
  onDeleteUnit, // (unitId) => void
  onAddLesson, // (unitId) => void
  onEditLesson, // (lesson, unitId) => void
  onDeleteLesson, // (unitId, lessonId) => void
}) {
  return (
    <Box sx={{ mb: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Các Unit
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddUnit}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            bgcolor: "#5b5bff",
            color: "white",
            "&:hover": { bgcolor: "#4a4acc" },
          }}
        >
          Thêm Unit
        </Button>
      </Box>

      {!units || units.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "#f8f9ff",
            borderRadius: 2,
            color: "#64748b",
          }}
        >
          Chưa có unit nào
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {units.map((unit) => (
            <Accordion
              key={unit.UnitID}
              sx={{
                borderRadius: 2,
                "&:before": { display: "none" },
                boxShadow: "0 2px 8px rgba(91, 91, 255, 0.08)",
              }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontWeight: 600, color: "#1e293b" }}>
                      {unit.Title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: "#64748b", mt: 0.5 }}
                    >
                      {unit.Description}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditUnit(unit);
                      }}
                      sx={{ color: "#5b5bff" }}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteUnit(unit.UnitID);
                      }}
                      sx={{ color: "#ef4444" }}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </Box>
              </AccordionSummary>

              <AccordionDetails>
                <Box sx={{ pl: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600, color: "#1e293b" }}
                    >
                      Bài học
                    </Typography>
                    <Button
                      size="small"
                      startIcon={<AddIcon />}
                      onClick={() => onAddLesson(unit.UnitID)}
                      sx={{
                        textTransform: "none",
                        fontSize: "0.75rem",
                        color: "#5b5bff",
                      }}
                    >
                      Thêm bài học
                    </Button>
                  </Box>

                  <LessonList
                    unitId={unit.UnitID}
                    lessons={lessonsByUnit[unit.UnitID] || []}
                    onEditLesson={onEditLesson}
                    onDeleteLesson={onDeleteLesson}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}
    </Box>
  );
}
