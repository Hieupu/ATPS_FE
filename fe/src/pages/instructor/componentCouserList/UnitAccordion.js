import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Typography,
  IconButton,
  Button,
  Card,
  Divider,
} from "@mui/material";
import { ExpandMore, Add, Edit, Delete } from "@mui/icons-material";
import LessonList from "./LessonList";

export default function UnitAccordion({
  units = [],
  lessons = {},
  onOpenModal,
  onEditUnit,
  onDeleteUnit,
  onEditLesson,
  onDeleteLesson,
}) {
  // Giữ nguyên state logic
  const [expandedUnits, setExpandedUnits] = useState([]);

  return (
    <Box sx={{ mb: 3 }}>
      {/* === HEADER: Tiêu đề và nút thêm Unit === */}
      <Card
        sx={{
          borderRadius: 4,
          boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          mb: 3,
          p: 3,
          backgroundColor: "#fff",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#5b5bff",
              fontWeight: "bold",
            }}
          >
            📚 Các Unit
          </Typography>
          <Button
            variant="contained"
            size="medium"
            startIcon={<Add />}
            onClick={() => onOpenModal("createUnit")}
            sx={{
              backgroundColor: "#5b5bff",
              fontWeight: 600,
              textTransform: "none",
              borderRadius: 2,
              px: 3,
              boxShadow: "0 2px 8px rgba(91,91,255,0.25)",
              transition: "all 0.2s",
              "&:hover": {
                backgroundColor: "#4a4acc",
                transform: "translateY(-1px)",
                boxShadow: "0 4px 12px rgba(91,91,255,0.35)",
              },
            }}
          >
            Thêm Unit
          </Button>
        </Box>
      </Card>

      {/* === DANH SÁCH UNITS (Accordion) === */}
      {units.length > 0 ? (
        units.map((unit) => (
          <Accordion
            key={unit.UnitID}
            expanded={expandedUnits.includes(unit.UnitID)}
            onChange={() => {
              if (expandedUnits.includes(unit.UnitID)) {
                setExpandedUnits(
                  expandedUnits.filter((id) => id !== unit.UnitID)
                );
              } else {
                setExpandedUnits([...expandedUnits, unit.UnitID]);
              }
            }}
            sx={{
              mb: 2,
              borderRadius: 3,
              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
              overflow: "hidden",
              "&:before": { display: "none" },
              transition: "all 0.2s",
              "&:hover": {
                boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
              },
            }}
          >
            {/* === AccordionSummary: Tiêu đề Unit với nút Edit/Delete === */}
            <AccordionSummary
              expandIcon={
                <ExpandMore
                  sx={{
                    color: "#5b5bff",
                    fontSize: 28,
                  }}
                />
              }
              sx={{
                backgroundColor: "#f8f9ff",
                minHeight: 64,
                transition: "background-color 0.2s",
                "&:hover": {
                  backgroundColor: "#f0f2ff",
                },
                "& .MuiAccordionSummary-content": {
                  my: 2,
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  width: "100%",
                  pr: 2,
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    fontSize: "1.05rem",
                    color: "#1e293b",
                  }}
                >
                  {unit.Title}
                </Typography>

                {/* Nút Edit & Delete */}
                <Box sx={{ display: "flex", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditUnit(unit);
                    }}
                    sx={{
                      color: "#5b5bff",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#e8e8ff",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteUnit(unit.UnitID);
                    }}
                    sx={{
                      color: "#ef4444",
                      transition: "all 0.2s",
                      "&:hover": {
                        backgroundColor: "#fee",
                        transform: "scale(1.1)",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </AccordionSummary>

            {/* === AccordionDetails: Mô tả Unit và danh sách Lessons === */}
            <AccordionDetails
              sx={{
                p: 3,
                backgroundColor: "#fafbff",
              }}
            >
              {/* Mô tả Unit */}
              {unit.Description && (
                <>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#64748b",
                      mb: 2,
                      lineHeight: 1.6,
                      fontStyle: "italic",
                    }}
                  >
                    {unit.Description}
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                </>
              )}

              {/* Nút thêm Lesson */}
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={() =>
                  onOpenModal("createLesson", {
                    UnitID: unit.UnitID,
                    Type: "video",
                  })
                }
                sx={{
                  mb: 2,
                  color: "#5b5bff",
                  borderColor: "#5b5bff",
                  textTransform: "none",
                  fontWeight: 500,
                  borderRadius: 2,
                  transition: "all 0.2s",
                  "&:hover": {
                    backgroundColor: "#f0f2ff",
                    borderColor: "#4a4acc",
                    transform: "translateX(2px)",
                  },
                }}
              >
                Thêm Bài học
              </Button>

              {/* Danh sách Lessons */}
              <LessonList
                lessons={lessons[unit.UnitID] || []}
                unitId={unit.UnitID}
                onEditLesson={(lesson) => onEditLesson(lesson, unit.UnitID)}
                onDeleteLesson={(lessonId) =>
                  onDeleteLesson(unit.UnitID, lessonId)
                }
              />
            </AccordionDetails>
          </Accordion>
        ))
      ) : (
        // Trường hợp chưa có Unit nào
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            p: 4,
            textAlign: "center",
            backgroundColor: "#fafbff",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            Chưa có Unit nào. Hãy bấm "Thêm Unit" để tạo Unit đầu tiên!
          </Typography>
        </Card>
      )}
    </Box>
  );
}
