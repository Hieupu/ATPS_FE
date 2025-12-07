import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  IconButton,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Chip,
  Divider,
  Tooltip,
  Paper,
  Grid,
  Collapse,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import AudiotrackIcon from "@mui/icons-material/Audiotrack";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import QuizIcon from "@mui/icons-material/Quiz";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const UNIT_STATUS_OPTIONS = ["VISIBLE", "HIDDEN"];
const LESSON_TYPE_OPTIONS = ["video", "document", "audio"];
const LESSON_STATUS_OPTIONS = ["VISIBLE", "HIDDEN"];

// --- Helpers ---
const getAssignmentIcon = (type) => {
  switch (type?.toLowerCase()) {
    case "quiz":
      return <QuizIcon color="primary" />;
    case "audio":
      return <AudiotrackIcon color="warning" />;
    case "document":
      return <DescriptionIcon color="success" />;
    default:
      return <AssignmentIcon color="action" />;
  }
};

const getTypeLabel = (type) => {
  switch (type?.toLowerCase()) {
    case "quiz":
      return "Quiz";
    case "audio":
      return "Bài tập nói";
    case "document":
      return "Bài tập tài liệu";
    default:
      return type || "Bài tập";
  }
};

const getLessonIcon = (type) => {
  switch (type) {
    case "video":
      return <PlayCircleOutlineIcon />;
    case "document":
      return <DescriptionIcon />;
    case "audio":
      return <AudiotrackIcon />;
    default:
      return <DescriptionIcon />;
  }
};

const getDndPortal = () => {
  if (typeof document === "undefined") return null;
  let portal = document.getElementById("dnd-portal");
  if (!portal) {
    portal = document.createElement("div");
    portal.id = "dnd-portal";
    document.body.appendChild(portal);
  }
  return portal;
};

export default function CurriculumSection({
  units,
  loadingUnits,
  lessonsByUnit,
  loadingLessons,
  onCreateUnit,
  onUpdateUnit,
  onDeleteUnit,
  onReorderUnits,
  assignmentsByUnit = {},
  loadingAssignments = {},
  onLoadAssignments,
  onLoadLessons,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
}) {
  // --- Local State for Optimistic UI (Hiển thị mượt mà tức thì) ---
  const [localUnits, setLocalUnits] = useState([]);
  const [localLessons, setLocalLessons] = useState({});

  // --- Refs for Debouncing (Delay gửi API) ---
  const unitDebounceTimer = useRef(null);
  // Lưu timer riêng cho từng UnitID để tránh xung đột khi sửa nhiều chương cùng lúc
  const lessonDebounceTimers = useRef({});

  // --- Dialog States ---
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitDialogMode, setUnitDialogMode] = useState("create");
  const [unitDialogInitial, setUnitDialogInitial] = useState(null);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonDialogMode, setLessonDialogMode] = useState("create");
  const [lessonDialogInitial, setLessonDialogInitial] = useState(null);
  const [lessonDialogUnitId, setLessonDialogUnitId] = useState(null);

  const [assignmentDetailOpen, setAssignmentDetailOpen] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [expandedUnits, setExpandedUnits] = useState({});

  // --- Sync Props to Local State ---
  // Khi dữ liệu từ server tải về, cập nhật vào local state để hiển thị
  useEffect(() => {
    if (Array.isArray(units)) {
      const sorted = [...units].sort(
        (a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0)
      );
      setLocalUnits(sorted);
    }
  }, [units]);

  useEffect(() => {
    if (lessonsByUnit) {
      const syncedLessons = {};
      Object.keys(lessonsByUnit).forEach((unitId) => {
        const sorted = [...(lessonsByUnit[unitId] || [])].sort(
          (a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0)
        );
        syncedLessons[unitId] = sorted;
      });
      setLocalLessons(syncedLessons);
    }
  }, [lessonsByUnit]);

  // --- Cleanup Timers on Unmount ---
  // Xóa hết các timer đang chạy ngầm nếu người dùng thoát trang
  useEffect(() => {
    return () => {
      if (unitDebounceTimer.current) clearTimeout(unitDebounceTimer.current);
      Object.values(lessonDebounceTimers.current).forEach(clearTimeout);
    };
  }, []);

  const nextUnitOrderIndex =
    localUnits.length > 0
      ? Math.max(...localUnits.map((u) => u.OrderIndex || 0)) + 1
      : 1;

  // --- HÀM XỬ LÝ KÉO THẢ (ĐÃ SỬA LỖI LESSON TIMER) ---
  const handleDragEnd = (result) => {
    const { source, destination, type } = result;

    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    // === 1. XỬ LÝ KÉO THẢ UNIT (Đã chạy ổn) ===
    if (type === "UNITS") {
      const newArr = Array.from(localUnits);
      const [moved] = newArr.splice(source.index, 1);
      newArr.splice(destination.index, 0, moved);

      const reindexed = newArr.map((u, idx) => ({
        ...u,
        OrderIndex: idx + 1,
      }));

      setLocalUnits(reindexed);

      // Debounce Unit: Hủy timer cũ, tạo timer mới
      if (unitDebounceTimer.current) clearTimeout(unitDebounceTimer.current);

      unitDebounceTimer.current = setTimeout(async () => {
        try {
          console.log("Auto-save: Updating Unit Orders...");
          await onReorderUnits(reindexed);
        } catch (err) {
          console.error("Reorder units error:", err);
        }
        unitDebounceTimer.current = null;
      }, 5000);
      return;
    }

    // === 2. XỬ LÝ KÉO THẢ LESSON (FIX LỖI TẠI ĐÂY) ===
    if (type === "LESSONS") {
      const fromDroppable = source.droppableId;
      const toDroppable = destination.droppableId;

      if (fromDroppable !== toDroppable) return;

      // Lấy Unit ID dạng String để an toàn (tránh lỗi NaN nếu ID là UUID)
      const rawUnitId = fromDroppable.replace("lessons-", "");

      // Nếu ID của bạn chắc chắn là số, bạn có thể dùng Number(rawUnitId)
      // Nhưng để an toàn nhất, ta giữ nguyên hoặc ép kiểu tùy dữ liệu đầu vào của lessonsByUnit
      // Ở đây mình dùng logic kiểm tra: nếu keys trong localLessons là số thì ép, không thì giữ string.
      const unitId = !isNaN(rawUnitId) ? Number(rawUnitId) : rawUnitId;

      if (!unitId) {
        console.error(
          "Lỗi: Không tìm thấy Unit ID hợp lệ từ droppableId:",
          fromDroppable
        );
        return;
      }

      // Logic sắp xếp mảng nội bộ
      const currentLessons = localLessons[unitId] || [];
      const newArr = Array.from(currentLessons);
      const [moved] = newArr.splice(source.index, 1);
      newArr.splice(destination.index, 0, moved);

      const reindexed = newArr.map((l, idx) => ({
        ...l,
        OrderIndex: idx + 1,
      }));

      // Cập nhật UI ngay lập tức
      setLocalLessons((prev) => ({
        ...prev,
        [unitId]: reindexed,
      }));

      // --- DEBUG LOG ---
      console.log(`Đã kéo thả Lesson tại Unit ${unitId}. Đang set timer 5s...`);

      
      const timerKey = String(unitId);

      if (lessonDebounceTimers.current[timerKey]) {
        console.log(`Hủy timer cũ của Unit ${unitId}`);
        clearTimeout(lessonDebounceTimers.current[timerKey]);
      }

      lessonDebounceTimers.current[timerKey] = setTimeout(async () => {
        try {
          console.log(
            `Auto-save: Đang gửi API cập nhật Lesson cho Unit ${unitId}...`
          );
          

          await onReorderLessons(unitId, reindexed);

         
        } catch (err) {
          console.error(`Lỗi cập nhật Lesson Unit ${unitId}:`, err);
        } finally {
          // Xóa timer sau khi chạy xong
          delete lessonDebounceTimers.current[timerKey];
        }
      }, 5000);
    }
  };

  // --- Các hàm xử lý Dialog ---
  const handleOpenCreateUnit = () => {
    setUnitDialogMode("create");
    setUnitDialogInitial({
      Title: "",
      Description: "",
      Duration: "",
      OrderIndex: nextUnitOrderIndex,
      Status: "VISIBLE",
    });
    setUnitDialogOpen(true);
  };

  const handleOpenEditUnit = (unit) => {
    setUnitDialogMode("edit");
    setUnitDialogInitial({
      Title: unit.Title || "",
      Description: unit.Description || "",
      Duration: unit.Duration || "",
      OrderIndex: unit.OrderIndex,
      Status: unit.Status || "VISIBLE",
      UnitID: unit.UnitID,
    });
    setUnitDialogOpen(true);
  };

  const handleSubmitUnitDialog = async (values) => {
    const payload = {
      Title: values.Title?.trim(),
      Description: values.Description,
      Duration: values.Duration ? Number(values.Duration) : null,
      Status: values.Status,
      OrderIndex: values.OrderIndex,
    };

    if (!payload.Title) {
      alert("Title Unit là bắt buộc");
      return;
    }

    try {
      if (unitDialogMode === "create") await onCreateUnit(payload);
      else await onUpdateUnit(values.UnitID, { ...payload });
      setUnitDialogOpen(false);
    } catch (err) {
      alert(err?.message || "Lỗi lưu Unit");
    }
  };

  const handleDeleteUnitClick = async (unit) => {
    if (!window.confirm(`Xóa Unit "${unit.Title}"?`)) return;
    try {
      await onDeleteUnit(unit.UnitID);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleUnit = (unitId) => {
    setExpandedUnits((prev) => ({ ...prev, [unitId]: !prev[unitId] }));
    if (!expandedUnits[unitId] && !lessonsByUnit[unitId]) onLoadLessons(unitId);
    if (!assignmentsByUnit[unitId] && onLoadAssignments)
      onLoadAssignments(unitId);
  };

  const handleOpenCreateLesson = (unitId) => {
    setLessonDialogMode("create");
    setLessonDialogUnitId(unitId);
    setLessonDialogInitial({
      LessonID: null,
      Title: "",
      Duration: "",
      Type: "video",
      Status: "VISIBLE",
      file: null,
    });
    setLessonDialogOpen(true);
  };

  const handleOpenEditLesson = (unitId, lesson) => {
    setLessonDialogMode("edit");
    setLessonDialogUnitId(unitId);
    setLessonDialogInitial({
      LessonID: lesson.LessonID,
      Title: lesson.Title || "",
      Duration: lesson.Duration || "",
      Type: lesson.Type || "video",
      Status: lesson.Status || "VISIBLE",
      OrderIndex: lesson.OrderIndex || 1,
      file: null,
      existingFileName: lesson.FileURL ? lesson.FileURL.split("/").pop() : "",
      existingFileUrl: lesson.FileURL || "",
    });
    setLessonDialogOpen(true);
  };

  const handleSubmitLessonDialog = async (values) => {
    const list = localLessons[lessonDialogUnitId] || [];
    const maxOrder =
      list.length > 0 ? Math.max(...list.map((l) => l.OrderIndex || 0)) : 0;
    const basePayload = {
      Title: values.Title,
      Duration: values.Duration ? Number(values.Duration) : null,
      Type: values.Type,
      Status: values.Status,
      file: values.file || undefined,
    };

    try {
      if (lessonDialogMode === "create") {
        await onCreateLesson(lessonDialogUnitId, {
          ...basePayload,
          OrderIndex: maxOrder + 1,
        });
      } else {
        await onUpdateLesson(lessonDialogUnitId, values.LessonID, basePayload);
      }
      setLessonDialogOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLessonClick = async (unitId, lesson) => {
    if (!window.confirm(`Xóa Lesson "${lesson.Title}"?`)) return;
    try {
      await onDeleteLesson(unitId, lesson.LessonID);
    } catch (err) {
      console.error(err);
    }
  };

  // --- Render ---
  return (
    <Box>
      <Paper
        elevation={0}
        sx={{
          p: 3,
          mb: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 2,
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Chương trình giảng dạy
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9 }}>
              Quản lý các chương và bài học
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateUnit}
            sx={{
              bgcolor: "white",
              color: "#667eea",
              "&:hover": { bgcolor: "rgba(255,255,255,0.9)" },
              px: 3,
              py: 1.5,
              fontWeight: 600,
            }}
          >
            Thêm chương mới
          </Button>
        </Stack>
      </Paper>

      {loadingUnits ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={48} />
        </Box>
      ) : localUnits.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 2,
            border: "2px dashed",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            Chưa có chương học nào
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateUnit}
          >
            Thêm chương đầu tiên
          </Button>
        </Paper>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="units" type="UNITS">
            {(provided) => (
              <Box ref={provided.innerRef} {...provided.droppableProps}>
                {localUnits.map((unit, idx) => (
                  <Draggable
                    key={unit.UnitID}
                    draggableId={String(unit.UnitID)}
                    index={idx}
                  >
                    {(dragProvided, snapshot) => {
                      const portal = getDndPortal();
                      const child = (
                        <Card
                          ref={dragProvided.innerRef}
                          {...dragProvided.draggableProps}
                          style={dragProvided.draggableProps.style}
                          sx={{
                            mb: 2,
                            borderRadius: 2,
                            overflow: "visible",
                            boxShadow: snapshot.isDragging
                              ? "0 8px 24px rgba(0,0,0,0.15)"
                              : "0 2px 8px rgba(0,0,0,0.08)",
                            border: "1px solid",
                            borderColor: snapshot.isDragging
                              ? "primary.main"
                              : "divider",
                            transition: "all 0.2s",
                          }}
                        >
                          <CardContent sx={{ pb: 1 }}>
                            <Stack spacing={2}>
                              {/* Unit Header */}
                              <Stack
                                direction="row"
                                alignItems="flex-start"
                                spacing={2}
                              >
                                <Box
                                  {...dragProvided.dragHandleProps}
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    cursor: "grab",
                                    color: "text.secondary",
                                    pt: 0.5,
                                    "&:active": { cursor: "grabbing" },
                                  }}
                                >
                                  <DragIndicatorIcon />
                                </Box>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1.5}
                                    sx={{ mb: 1 }}
                                  >
                                    <Chip
                                      label={`Chương ${
                                        unit.OrderIndex || idx + 1
                                      }`}
                                      size="small"
                                      color="primary"
                                      sx={{ fontWeight: 600 }}
                                    />
                                    <Typography
                                      variant="h6"
                                      fontWeight={600}
                                      sx={{ flexGrow: 1 }}
                                    >
                                      {unit.Title}
                                    </Typography>
                                    <Chip
                                      icon={
                                        unit.Status === "VISIBLE" ? (
                                          <VisibilityIcon />
                                        ) : (
                                          <VisibilityOffIcon />
                                        )
                                      }
                                      label={
                                        unit.Status === "VISIBLE"
                                          ? "Hiển thị"
                                          : "Ẩn"
                                      }
                                      size="small"
                                      color={
                                        unit.Status === "VISIBLE"
                                          ? "success"
                                          : "default"
                                      }
                                      variant="outlined"
                                    />
                                  </Stack>
                                  {unit.Description && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                      sx={{ mb: 1 }}
                                    >
                                      {unit.Description}
                                    </Typography>
                                  )}
                                  <Stack
                                    direction="row"
                                    spacing={2}
                                    alignItems="center"
                                  >
                                    {unit.Duration && (
                                      <Stack
                                        direction="row"
                                        spacing={0.5}
                                        alignItems="center"
                                      >
                                        <AccessTimeIcon
                                          fontSize="small"
                                          sx={{ color: "text.secondary" }}
                                        />
                                        <Typography
                                          variant="caption"
                                          color="text.secondary"
                                        >
                                          {unit.Duration} giờ
                                        </Typography>
                                      </Stack>
                                    )}
                                    <Typography
                                      variant="caption"
                                      color="text.secondary"
                                    >
                                      {(localLessons[unit.UnitID] || []).length}{" "}
                                      bài học
                                    </Typography>
                                  </Stack>
                                </Box>
                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Chỉnh sửa">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEditUnit(unit)}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteUnitClick(unit)
                                      }
                                    >
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <IconButton
                                    size="small"
                                    onClick={() =>
                                      handleToggleUnit(unit.UnitID)
                                    }
                                  >
                                    {expandedUnits[unit.UnitID] ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </IconButton>
                                </Stack>
                              </Stack>

                              <Collapse in={expandedUnits[unit.UnitID]}>
                                <Divider sx={{ my: 1 }} />
                                <Box sx={{ pl: 5 }}>
                                  <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ mb: 2, mt: 1 }}
                                  >
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      color="text.secondary"
                                    >
                                      Danh sách bài học
                                    </Typography>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      startIcon={<AddIcon />}
                                      onClick={() =>
                                        handleOpenCreateLesson(unit.UnitID)
                                      }
                                    >
                                      Thêm bài học
                                    </Button>
                                  </Stack>

                                  {loadingLessons[unit.UnitID] ? (
                                    <Box
                                      sx={{
                                        py: 3,
                                        display: "flex",
                                        justifyContent: "center",
                                      }}
                                    >
                                      <CircularProgress size={24} />
                                    </Box>
                                  ) : (
                                    <LessonsList
                                      unitId={unit.UnitID}
                                      lessons={localLessons[unit.UnitID] || []}
                                      onEditLesson={handleOpenEditLesson}
                                      onDeleteLesson={handleDeleteLessonClick}
                                    />
                                  )}

                                  <Box sx={{ mt: 4 }}>
                                    <Typography
                                      variant="subtitle2"
                                      fontWeight={600}
                                      color="text.secondary"
                                      sx={{ mb: 2 }}
                                    >
                                      Bài tập của chương
                                    </Typography>
                                    {loadingAssignments[unit.UnitID] ? (
                                      <Box
                                        sx={{
                                          py: 2,
                                          display: "flex",
                                          justifyContent: "center",
                                        }}
                                      >
                                        <CircularProgress size={24} />
                                      </Box>
                                    ) : !assignmentsByUnit[unit.UnitID] ||
                                      assignmentsByUnit[unit.UnitID].length ===
                                        0 ? (
                                      <Paper
                                        variant="outlined"
                                        sx={{
                                          p: 3,
                                          textAlign: "center",
                                          bgcolor: "grey.50",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          color="text.secondary"
                                        >
                                          Chưa có bài tập nào.
                                        </Typography>
                                      </Paper>
                                    ) : (
                                      <AssignmentsList
                                        assignments={
                                          assignmentsByUnit[unit.UnitID]
                                        }
                                        onViewDetail={(assign) => {
                                          setSelectedAssignment(assign);
                                          setAssignmentDetailOpen(true);
                                        }}
                                      />
                                    )}
                                  </Box>
                                </Box>
                              </Collapse>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                      if (snapshot.isDragging && portal)
                        return createPortal(child, portal);
                      return child;
                    }}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {/* Dialogs */}
      <UnitFormDialog
        open={unitDialogOpen}
        mode={unitDialogMode}
        initialValues={unitDialogInitial}
        onClose={() => setUnitDialogOpen(false)}
        onSubmit={handleSubmitUnitDialog}
      />
      <LessonFormDialog
        open={lessonDialogOpen}
        mode={lessonDialogMode}
        initialValues={lessonDialogInitial}
        onClose={() => setLessonDialogOpen(false)}
        onSubmit={handleSubmitLessonDialog}
      />

      {/* Assignment Detail Dialog */}
      <Dialog
        open={assignmentDetailOpen}
        onClose={() => setAssignmentDetailOpen(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
      >
        {selectedAssignment && (
          <>
            <DialogTitle
              sx={{ bgcolor: "primary.main", color: "white", py: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                {getAssignmentIcon(selectedAssignment.Type)}
                <Typography variant="h6" fontWeight={700}>
                  {selectedAssignment.Title || "Chi tiết bài tập"}
                </Typography>
              </Stack>
            </DialogTitle>
            <DialogContent dividers sx={{ py: 4 }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Mô tả
                  </Typography>
                  <Typography variant="body1">
                    {selectedAssignment.Description}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Hạn nộp
                  </Typography>
                  <Typography>
                    {selectedAssignment.Deadline
                      ? new Date(selectedAssignment.Deadline).toLocaleString(
                          "vi-VN"
                        )
                      : "Không giới hạn"}
                  </Typography>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2.5, bgcolor: "grey.50" }}>
              <Button
                onClick={() => setAssignmentDetailOpen(false)}
                variant="contained"
              >
                Đóng
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// --- Sub Components ---

function LessonsList({ unitId, lessons, onEditLesson, onDeleteLesson }) {
  if (!lessons || lessons.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{ p: 3, textAlign: "center", bgcolor: "grey.50" }}
      >
        <Typography variant="body2" color="text.secondary">
          Chưa có bài học nào. Nhấn "Thêm bài học" để bắt đầu.
        </Typography>
      </Paper>
    );
  }
  const portal = getDndPortal();
  return (
    <Droppable droppableId={`lessons-${unitId}`} type="LESSONS">
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{ width: "100%" }}
        >
          {lessons.map((lesson, idx) => (
            <Draggable
              key={lesson.LessonID}
              draggableId={`lesson-${lesson.LessonID}`}
              index={idx}
            >
              {(dragProvided, snapshot) => {
                const child = (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    style={{
                      ...dragProvided.draggableProps.style,
                      marginBottom: 8,
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 1,
                        bgcolor: snapshot.isDragging ? "action.hover" : "white",
                        border: "1px solid",
                        borderColor: snapshot.isDragging
                          ? "primary.main"
                          : "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1.5,
                        gap: 2,
                        boxShadow: snapshot.isDragging
                          ? "0 4px 12px rgba(0,0,0,0.15)"
                          : "none",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexGrow: 1,
                          minWidth: 0,
                          gap: 2,
                        }}
                      >
                        <Box
                          {...dragProvided.dragHandleProps}
                          sx={{
                            cursor: "grab",
                            color: "text.secondary",
                            "&:active": { cursor: "grabbing" },
                          }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </Box>
                        <Box sx={{ color: "primary.main" }}>
                          {getLessonIcon(lesson.Type)}
                        </Box>
                        <Box sx={{ minWidth: 0 }}>
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Typography variant="body2" fontWeight={500} noWrap>
                              Bài {lesson.OrderIndex || idx + 1}.
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {lesson.Title}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                            <Chip
                              label={lesson.Type}
                              size="small"
                              variant="outlined"
                            />
                            <Chip
                              label={lesson.Status}
                              size="small"
                              color={
                                lesson.Status === "VISIBLE"
                                  ? "success"
                                  : "default"
                              }
                              variant="outlined"
                            />
                          </Stack>
                        </Box>
                      </Box>
                      <Box sx={{ display: "flex", gap: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => onEditLesson(unitId, lesson)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => onDeleteLesson(unitId, lesson)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Box>
                );
                if (snapshot.isDragging && portal)
                  return createPortal(child, portal);
                return child;
              }}
            </Draggable>
          ))}
          {provided.placeholder}
        </Box>
      )}
    </Droppable>
  );
}

function AssignmentsList({ assignments, onViewDetail }) {
  if (!assignments || assignments.length === 0) return null;
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {assignments.map((assign) => (
        <Box
          key={assign.AssignmentID}
          sx={{
            borderRadius: 1,
            bgcolor: "background.paper",
            border: "1px solid",
            borderColor: "divider",
            p: 2,
            display: "flex",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{ flexGrow: 1, display: "flex", alignItems: "center", gap: 2 }}
          >
            {getAssignmentIcon(assign.Type)}
            <Box>
              <Typography variant="body2" fontWeight={500}>
                {assign.Title}
              </Typography>
              <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
                <Chip
                  label={getTypeLabel(assign.Type)}
                  size="small"
                  color="primary"
                  variant="outlined"
                />
                <Chip
                  label={
                    assign.Status === "published" ? "Đã phát hành" : "Nháp"
                  }
                  size="small"
                  color={assign.Status === "published" ? "success" : "default"}
                  variant="outlined"
                />
              </Stack>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => onViewDetail?.(assign)}>
            <VisibilityIcon fontSize="small" />
          </IconButton>
        </Box>
      ))}
    </Box>
  );
}

// UnitFormDialog và LessonFormDialog code giữ nguyên như cũ...
function UnitFormDialog({ open, onClose, mode, initialValues, onSubmit }) {
  const [values, setValues] = useState(initialValues || {});
  useEffect(() => {
    if (open && initialValues) setValues(initialValues);
  }, [open, initialValues]);
  const handleChange = (field) => (e) =>
    setValues({ ...values, [field]: e.target.value });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "Sửa chương" : "Thêm chương"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên chương"
              value={values.Title || ""}
              onChange={handleChange("Title")}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Mô tả"
              multiline
              rows={3}
              value={values.Description || ""}
              onChange={handleChange("Description")}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Thời lượng (giờ)"
              value={values.Duration || ""}
              onChange={handleChange("Duration")}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={values.Status || "VISIBLE"}
              onChange={handleChange("Status")}
            >
              {UNIT_STATUS_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(values)}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}

function LessonFormDialog({ open, onClose, mode, initialValues, onSubmit }) {
  const [values, setValues] = useState(initialValues || {});
  useEffect(() => {
    if (open && initialValues) setValues(initialValues);
  }, [open, initialValues]);
  const handleChange = (field) => (e) =>
    setValues({ ...values, [field]: e.target.value });
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {mode === "edit" ? "Sửa bài học" : "Thêm bài học"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2} sx={{ mt: 0.5 }}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Tên bài học"
              value={values.Title || ""}
              onChange={handleChange("Title")}
              required
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              fullWidth
              type="number"
              label="Thời lượng (phút)"
              value={values.Duration || ""}
              onChange={handleChange("Duration")}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField
              select
              fullWidth
              label="Loại"
              value={values.Type || "video"}
              onChange={handleChange("Type")}
            >
              {LESSON_TYPE_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={4}>
            <TextField
              select
              fullWidth
              label="Trạng thái"
              value={values.Status || "VISIBLE"}
              onChange={handleChange("Status")}
            >
              {LESSON_STATUS_OPTIONS.map((o) => (
                <MenuItem key={o} value={o}>
                  {o}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{ borderStyle: "dashed", py: 2 }}
            >
              {values.file
                ? values.file.name
                : values.existingFileName || "Chọn file bài học"}
              <input
                type="file"
                hidden
                onChange={(e) =>
                  setValues({ ...values, file: e.target.files[0] })
                }
              />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Hủy</Button>
        <Button variant="contained" onClick={() => onSubmit(values)}>
          Lưu
        </Button>
      </DialogActions>
    </Dialog>
  );
}
