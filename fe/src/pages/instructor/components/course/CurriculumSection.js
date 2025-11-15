import React, { useState } from "react";
import { createPortal } from "react-dom";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
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
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const UNIT_STATUS_OPTIONS = ["VISIBLE", "HIDDEN"];
const LESSON_TYPE_OPTIONS = ["video", "document", "audio"];
const LESSON_STATUS_OPTIONS = ["VISIBLE", "HIDDEN"];

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
  onLoadLessons,
  onCreateLesson,
  onUpdateLesson,
  onDeleteLesson,
  onReorderLessons,
}) {
  const [unitDialogOpen, setUnitDialogOpen] = useState(false);
  const [unitDialogMode, setUnitDialogMode] = useState("create");
  const [unitDialogInitial, setUnitDialogInitial] = useState(null);

  const [lessonDialogOpen, setLessonDialogOpen] = useState(false);
  const [lessonDialogMode, setLessonDialogMode] = useState("create");
  const [lessonDialogInitial, setLessonDialogInitial] = useState(null);
  const [lessonDialogUnitId, setLessonDialogUnitId] = useState(null);

  const [expandedUnits, setExpandedUnits] = useState({});

  const sortedUnits = Array.isArray(units)
    ? [...units].sort((a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0))
    : [];

  const nextUnitOrderIndex =
    sortedUnits.length > 0
      ? Math.max(...sortedUnits.map((u) => u.OrderIndex || 0)) + 1
      : 1;

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
      Title: values.Title && values.Title.trim(),
      Description: values.Description,
      Duration: values.Duration ? Number(values.Duration) : null,
      Status: values.Status,
      OrderIndex: values.OrderIndex,
    };

    if (!payload.Title || !payload.Title.trim()) {
      alert("Title Unit là bắt buộc");
      return;
    }

    try {
      if (unitDialogMode === "create") {
        await onCreateUnit(payload);
      } else if (unitDialogMode === "edit") {
        await onUpdateUnit(values.UnitID, {
          Title: payload.Title,
          Description: payload.Description,
          Duration: payload.Duration,
          Status: payload.Status,
        });
      }
      setUnitDialogOpen(false);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra khi lưu Unit";
      alert(message);
    }
  };

  const handleDeleteUnitClick = async (unit) => {
    if (
      !window.confirm(
        `Xóa Unit "${unit.Title}"? (sẽ chuyển sang trạng thái DELETED)`
      )
    )
      return;
    try {
      await onDeleteUnit(unit.UnitID);
    } catch (err) {
      console.error("Delete unit error:", err);
    }
  };

  const handleDragEnd = async (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (type === "UNITS") {
      if (source.index === destination.index) return;

      const newArr = Array.from(sortedUnits);
      const [moved] = newArr.splice(source.index, 1);
      newArr.splice(destination.index, 0, moved);

      const reindexed = newArr.map((u, idx) => ({
        ...u,
        OrderIndex: idx + 1,
      }));

      try {
        await onReorderUnits(reindexed);
      } catch (err) {
        console.error("Reorder units error:", err);
      }
      return;
    }

    if (type === "LESSONS") {
      const fromDroppable = source.droppableId;
      const toDroppable = destination.droppableId;

      if (fromDroppable !== toDroppable) return;

      const unitId = Number(fromDroppable.replace("lessons-", ""));
      if (!unitId) return;

      const current = (lessonsByUnit[unitId] || [])
        .slice()
        .sort((a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0));

      if (!current.length) return;
      if (source.index === destination.index) return;

      const newArr = Array.from(current);
      const [moved] = newArr.splice(source.index, 1);
      newArr.splice(destination.index, 0, moved);

      const reindexed = newArr.map((l, idx) => ({
        ...l,
        OrderIndex: idx + 1,
      }));

      try {
        await onReorderLessons(unitId, reindexed);
      } catch (err) {
        console.error("Reorder lessons error:", err);
      }
    }
  };

  const handleToggleUnit = (unitId) => {
    setExpandedUnits((prev) => ({
      ...prev,
      [unitId]: !prev[unitId],
    }));

    if (!expandedUnits[unitId] && !lessonsByUnit[unitId]) {
      onLoadLessons(unitId);
    }
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
    const list = lessonsByUnit[lessonDialogUnitId] || [];
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
        const payload = {
          ...basePayload,
          OrderIndex: maxOrder + 1,
        };
        await onCreateLesson(lessonDialogUnitId, payload);
      } else {
        const payload = {
          ...basePayload,
        };
        await onUpdateLesson(lessonDialogUnitId, values.LessonID, payload);
      }

      setLessonDialogOpen(false);
    } catch (err) {
      console.error("Lesson dialog submit error:", err);
    }
  };

  const handleDeleteLessonClick = async (unitId, lesson) => {
    if (!window.confirm(`Xóa Lesson "${lesson.Title}"?`)) return;
    try {
      await onDeleteLesson(unitId, lesson.LessonID);
    } catch (err) {
      console.error("Delete lesson error:", err);
    }
  };

  return (
    <Box>
      {/* Header */}
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
              Quản lý các chương và bài học của khóa học
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

      {/* Content */}
      {loadingUnits ? (
        <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
          <CircularProgress size={48} />
        </Box>
      ) : sortedUnits.length === 0 ? (
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
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Bắt đầu bằng cách thêm chương học đầu tiên cho khóa học của bạn
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
                {sortedUnits.map((unit, idx) => (
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
                                    "&:active": { cursor: "grabbing" },
                                    pt: 0.5,
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
                                      label={unit.Status}
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
                                      {
                                        (lessonsByUnit[unit.UnitID] || [])
                                          .length
                                      }{" "}
                                      bài học
                                    </Typography>
                                  </Stack>
                                </Box>

                                <Stack direction="row" spacing={1}>
                                  <Tooltip title="Chỉnh sửa chương">
                                    <IconButton
                                      size="small"
                                      onClick={() => handleOpenEditUnit(unit)}
                                      sx={{
                                        "&:hover": { bgcolor: "primary.light" },
                                      }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Xóa chương">
                                    <IconButton
                                      size="small"
                                      onClick={() =>
                                        handleDeleteUnitClick(unit)
                                      }
                                      sx={{
                                        "&:hover": { bgcolor: "error.light" },
                                      }}
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

                              {/* Lessons Section */}
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
                                      lessons={lessonsByUnit[unit.UnitID] || []}
                                      onEditLesson={handleOpenEditLesson}
                                      onDeleteLesson={handleDeleteLessonClick}
                                    />
                                  )}
                                </Box>
                              </Collapse>
                            </Stack>
                          </CardContent>
                        </Card>
                      );
                      if (snapshot.isDragging && portal) {
                        return createPortal(child, portal);
                      }

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
    </Box>
  );
}

/* Lessons List Component */
function LessonsList({ unitId, lessons, onEditLesson, onDeleteLesson }) {
  if (!lessons || lessons.length === 0) {
    return (
      <Paper
        variant="outlined"
        sx={{
          p: 3,
          textAlign: "center",
          bgcolor: "grey.50",
          borderRadius: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          Chưa có bài học nào. Nhấn "Thêm bài học" để bắt đầu.
        </Typography>
      </Paper>
    );
  }

  const sortedLessons = [...lessons].sort(
    (a, b) => (a.OrderIndex || 0) - (b.OrderIndex || 0)
  );

  const portal = getDndPortal();

  return (
    <Droppable droppableId={`lessons-${unitId}`} type="LESSONS">
      {(provided) => (
        <Box
          ref={provided.innerRef}
          {...provided.droppableProps}
          sx={{ width: "100%" }}
        >
          {sortedLessons.map((lesson, idx) => (
            <Draggable
              key={lesson.LessonID}
              draggableId={`lesson-${lesson.LessonID}`}
              index={idx}
            >
              {(dragProvided, snapshot) => {
                const draggableStyle = {
                  ...dragProvided.draggableProps.style,
                  marginBottom: 8, // khoảng cách giữa các bài
                };

                // JSX của 1 lesson (không portal)
                const child = (
                  <Box
                    ref={dragProvided.innerRef}
                    {...dragProvided.draggableProps}
                    style={draggableStyle}
                  >
                    <Box
                      sx={{
                        borderRadius: 1,
                        bgcolor: snapshot.isDragging ? "action.hover" : "white",
                        border: "1px solid",
                        borderColor: snapshot.isDragging
                          ? "primary.main"
                          : "divider",
                        boxShadow: snapshot.isDragging
                          ? "0 4px 12px rgba(0,0,0,0.15)"
                          : "0 1px 4px rgba(0,0,0,0.06)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        px: 2,
                        py: 1.5,
                        width: "100%",
                        boxSizing: "border-box",
                        gap: 2,
                      }}
                    >
                      {/* bên trái: handle + icon + text */}
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
                            display: "flex",
                            alignItems: "center",
                            cursor: "grab",
                            color: "text.secondary",
                            "&:active": { cursor: "grabbing" },
                          }}
                        >
                          <DragIndicatorIcon fontSize="small" />
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            color: "primary.main",
                          }}
                        >
                          {getLessonIcon(lesson.Type)}
                        </Box>

                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            minWidth: 0,
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                            sx={{ minWidth: 0 }}
                          >
                            <Typography variant="body2" fontWeight={500} noWrap>
                              Bài {lesson.OrderIndex || idx + 1}.
                            </Typography>
                            <Typography variant="body2" noWrap>
                              {lesson.Title}
                            </Typography>
                          </Stack>

                          <Stack
                            direction="row"
                            spacing={1.5}
                            alignItems="center"
                            sx={{ mt: 0.5, flexWrap: "wrap" }}
                          >
                            <Chip
                              label={lesson.Type}
                              size="small"
                              variant="outlined"
                            />
                            {lesson.Duration && (
                              <Typography variant="caption">
                                {lesson.Duration} phút
                              </Typography>
                            )}
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

                      {/* bên phải: nút edit / delete */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          flexShrink: 0,
                          gap: 1,
                        }}
                      >
                        <Tooltip title="Chỉnh sửa">
                          <IconButton
                            size="small"
                            onClick={() => onEditLesson(unitId, lesson)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                          <IconButton
                            size="small"
                            onClick={() => onDeleteLesson(unitId, lesson)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Box>
                  </Box>
                );

                // Khi đang kéo -> render bằng portal ra body
                if (snapshot.isDragging && portal) {
                  return createPortal(child, portal);
                }

                // Khi không kéo -> render bình thường
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

/* Unit Form Dialog */
function UnitFormDialog({ open, onClose, mode, initialValues, onSubmit }) {
  const [values, setValues] = useState({
    Title: "",
    Description: "",
    Duration: "",
    OrderIndex: null,
    Status: "VISIBLE",
    UnitID: null,
  });

  React.useEffect(() => {
    if (open && initialValues) {
      setValues(initialValues);
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = () => {
    onSubmit(values);
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {isEdit ? "Chỉnh sửa chương học" : "Thêm chương học mới"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Tên chương */}
          <Grid item xs={12}>
            <TextField
              label="Tên chương"
              placeholder="Ví dụ: Giới thiệu về React"
              fullWidth
              required
              value={values.Title}
              onChange={handleChange("Title")}
            />
          </Grid>

          {/* Mô tả */}
          <Grid item xs={12}>
            <TextField
              label="Mô tả"
              placeholder="Mô tả ngắn về nội dung chương học"
              fullWidth
              multiline
              minRows={3}
              value={values.Description}
              onChange={handleChange("Description")}
            />
          </Grid>

          {/* Thời lượng + Trạng thái */}
          <Grid item xs={12} md={6}>
            <TextField
              label="Thời lượng (giờ)"
              type="number"
              fullWidth
              value={values.Duration}
              onChange={handleChange("Duration")}
              InputProps={{ inputProps: { min: 0, step: 0.5 } }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              select
              label="Trạng thái"
              fullWidth
              value={values.Status}
              onChange={handleChange("Status")}
            >
              {UNIT_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st === "VISIBLE" ? "Hiển thị" : "Ẩn"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? "Cập nhật" : "Tạo chương"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

/* Lesson Form Dialog */
function LessonFormDialog({ open, onClose, mode, initialValues, onSubmit }) {
  const [values, setValues] = useState({
    LessonID: null,
    Title: "",
    Duration: "",
    Type: "video",
    Status: "VISIBLE",
    OrderIndex: 1,
    file: null,
    existingFileName: "",
    existingFileUrl: "",
  });

  React.useEffect(() => {
    if (open && initialValues) {
      setValues((prev) => ({
        ...prev,
        ...initialValues,
      }));
    }
  }, [open, initialValues]);

  const handleChange = (field) => (e) => {
    setValues((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setValues((prev) => ({
      ...prev,
      file,
      // chọn file mới thì vẫn hiển thị tên mới, nhưng có thể giữ lại info cũ nếu muốn
    }));
  };

  const handleSave = () => {
    // Không bắt buộc phải upload file mới
    // Nếu values.file = null => payload không chứa "file" => BE giữ file cũ
    onSubmit(values);
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography variant="h6" fontWeight={600}>
          {isEdit ? "Chỉnh sửa bài học" : "Thêm bài học mới"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers sx={{ pt: 2 }}>
        <Grid container spacing={3}>
          {/* Tên bài học */}
          <Grid item xs={12}>
            <TextField
              label="Tên bài học"
              placeholder="Ví dụ: Giới thiệu về Components"
              fullWidth
              required
              value={values.Title}
              onChange={handleChange("Title")}
            />
          </Grid>

          {/* Duration / Type / Status */}
          <Grid item xs={12} md={4}>
            <TextField
              label="Thời lượng (phút)"
              type="number"
              fullWidth
              value={values.Duration}
              onChange={handleChange("Duration")}
              InputProps={{ inputProps: { min: 0 } }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Loại bài học"
              fullWidth
              value={values.Type}
              onChange={handleChange("Type")}
            >
              {LESSON_TYPE_OPTIONS.map((t) => (
                <MenuItem key={t} value={t}>
                  {t === "video"
                    ? "Video"
                    : t === "document"
                    ? "Tài liệu"
                    : "Audio"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              label="Trạng thái"
              fullWidth
              value={values.Status}
              onChange={handleChange("Status")}
            >
              {LESSON_STATUS_OPTIONS.map((st) => (
                <MenuItem key={st} value={st}>
                  {st === "VISIBLE" ? "Hiển thị" : "Ẩn"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Upload file */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              File bài học
            </Typography>

            <Button
              component="label"
              variant="outlined"
              fullWidth
              sx={{
                py: 2,
                justifyContent: "flex-start",
                borderStyle: "dashed",
                borderWidth: 2,
                "&:hover": { borderStyle: "dashed" },
              }}
            >
              {values.file ? (
                // Đã chọn file mới
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon color="primary" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {values.file.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      File mới sẽ thay thế file hiện tại sau khi lưu.
                    </Typography>
                  </Box>
                </Stack>
              ) : values.existingFileName || values.existingFileUrl ? (
                // Đang dùng file cũ từ DB
                <Stack direction="row" spacing={2} alignItems="center">
                  <DescriptionIcon color="action" />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      {values.existingFileName ||
                        values.existingFileUrl.split("/").pop()}
                    </Typography>
                    {values.existingFileUrl && (
                      <Typography
                        variant="caption"
                        color="primary"
                        sx={{ textDecoration: "underline" }}
                        component="a"
                        href={values.existingFileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Xem file hiện tại
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                    >
                      Nếu không chọn file mới, hệ thống sẽ giữ nguyên file này.
                    </Typography>
                  </Box>
                </Stack>
              ) : (
                // Chưa có file
                <Stack direction="row" spacing={2} alignItems="center">
                  <AddIcon />
                  <Box>
                    <Typography variant="body2" fontWeight={500}>
                      Chọn file bài học (MP4, PDF, MP3)
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Dung lượng phù hợp với quy định hệ thống.
                    </Typography>
                  </Box>
                </Stack>
              )}
              <input type="file" hidden onChange={handleFileChange} />
            </Button>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Hủy
        </Button>
        <Button variant="contained" onClick={handleSave}>
          {isEdit ? "Cập nhật" : "Tạo bài học"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
