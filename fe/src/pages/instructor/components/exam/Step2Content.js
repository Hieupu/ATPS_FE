import React, { useState } from "react";
import {
    Box,
    Button,
    Typography,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    IconButton,
    Chip,
    Stack,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    ExpandMore as ExpandMoreIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    DragIndicator as DragIcon,
    Headphones as HeadphonesIcon,
    MenuBook as ReadingIcon,
    Mic as SpeakingIcon,
    Create as WritingIcon,
    Visibility as VisibilityIcon,
    QuestionAnswer as QuestionAnswerIcon,
    KeyboardArrowDown,
    KeyboardArrowUp,
} from "@mui/icons-material";
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AddSectionDialog from "./AddSectionDialog";
import AddQuestionDialog from "./AddQuestionDialog";

const SECTION_ICONS = {
    Listening: <HeadphonesIcon sx={{ color: "#1976d2" }} />,
    Reading: <ReadingIcon sx={{ color: "#2e7d32" }} />,
    Speaking: <SpeakingIcon sx={{ color: "#d32f2f" }} />,
    Writing: <WritingIcon sx={{ color: "#ed6c02" }} />,
};

const SortableParentSection = ({
    parent,
    index,
    childSections,
    onAddChild,
    onEdit,
    onDelete,
    onAddQuestion,
    onDeleteQuestion,
    onEditQuestion,
    getQuestions,
    onDragEndChild,
    onPreviewQuestion,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: parent.id });
    const [isExpanded, setIsExpanded] = React.useState(true);
    const childSensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Paper
            ref={setNodeRef}
            style={style}
            elevation={isDragging ? 8 : 2}
            sx={{
                overflow: "hidden",
                borderRadius: 3,
                border: isDragging ? "2px solid #1976d2" : "1px solid #e0e0e0",
                mb: 3,
            }}
        >
            {/* Parent Header with Drag Handle */}
            <Box
                sx={{
                    bgcolor: "#f8f9fa",
                    p: 2,
                    borderBottom: "1px solid #e0e0e0",
                }}
            >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Stack direction="row" alignItems="center" spacing={2} sx={{ flex: 1 }}>
                        {/* Drag Handle */}
                        <Box
                            {...attributes}
                            {...listeners}
                            sx={{
                                cursor: "grab",
                                "&:active": { cursor: "grabbing" },
                                display: "flex",
                                alignItems: "center",
                                color: "#666",
                                "&:hover": { color: "#1976d2" },
                            }}
                        >
                            <DragIcon />
                        </Box>

                        {/* Clickable Header Area - Click anywhere to toggle */}
                        <Box
                            onClick={() => setIsExpanded(!isExpanded)}
                            sx={{
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                                flex: 1,
                                cursor: "pointer",
                                "&:hover": {
                                    bgcolor: "rgba(0, 0, 0, 0.02)",
                                },
                                borderRadius: 1,
                                p: 1,
                                ml: -1,
                            }}
                        >
                            <Box
                                sx={{
                                    width: 48,
                                    height: 48,
                                    bgcolor: "white",
                                    borderRadius: 2,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                                }}
                            >
                                {SECTION_ICONS[parent.type]}
                            </Box>
                            <Box>
                                <Typography variant="h6" fontWeight={600}>
                                    {parent.title || parent.type}
                                </Typography>
                                <Stack direction="row" spacing={1} mt={0.5}>
                                    <Chip label={parent.type} size="small" color="primary" variant="outlined" />
                                    <Chip label={`Phần ${index + 1}`} size="small" />
                                    <Chip label={`${childSections.length} phân mục`} size="small" color="success" />
                                </Stack>
                            </Box>
                        </Box>
                    </Stack>

                    <Stack direction="row" spacing={1} onClick={(e) => e.stopPropagation()}>
                        <Tooltip title="Thêm phân mục">
                            <Button
                                variant="outlined"
                                size="small"
                                startIcon={<AddIcon />}
                                onClick={() => onAddChild(parent.id, parent.type)}
                            >
                                Thêm phân mục
                            </Button>
                        </Tooltip>
                        <Tooltip title="Sửa">
                            <IconButton onClick={() => onEdit(parent)} color="primary" size="small">
                                <EditIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <IconButton onClick={() => onDelete(parent.id)} color="error" size="small">
                                <DeleteIcon />
                            </IconButton>
                        </Tooltip>

                        {/* Collapse/Expand Button - Always visible for consistency */}
                        <Tooltip title={isExpanded ? "Thu gọn" : "Mở rộng"}>
                            <IconButton
                                onClick={() => setIsExpanded(!isExpanded)}
                                size="small"
                                sx={{
                                    color: isExpanded ? "#1976d2" : "#666",
                                    "&:hover": { bgcolor: "rgba(25, 118, 210, 0.08)" },
                                }}
                            >
                                {isExpanded ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </Stack>
            </Box>

            {/* Child Sections - Sortable (Collapsible) */}
            {isExpanded && (
                <Box sx={{ p: 2 }}>
                    {childSections.length === 0 ? (
                        <Paper variant="outlined" sx={{ p: 3, textAlign: "center", bgcolor: "#fafafa" }}>
                            <Typography color="text.secondary" variant="body2">
                                Chưa có phần thi con. Nhấn "Thêm phần thi con" để bắt đầu.
                            </Typography>
                        </Paper>
                    ) : (
                        <DndContext
                            sensors={childSensors}
                            collisionDetection={closestCenter}
                            onDragEnd={(event) => onDragEndChild(event, parent.id)}
                        >
                            <SortableContext
                                items={childSections.map((c) => c.id)}
                                strategy={verticalListSortingStrategy}
                            >
                                <Stack spacing={2}>
                                    {childSections.map((child, childIndex) => (
                                        <SortableChildSection
                                            key={child.id}
                                            child={child}
                                            childIndex={childIndex}
                                            questions={getQuestions(child.id)}
                                            onEdit={onEdit}
                                            onDelete={onDelete}
                                            onAddQuestion={() => onAddQuestion(parent.id, child.id)}
                                            onDeleteQuestion={onDeleteQuestion}
                                            onEditQuestion={onEditQuestion}
                                            onPreviewQuestion={onPreviewQuestion}
                                        />
                                    ))}
                                </Stack>
                            </SortableContext>
                        </DndContext>
                    )}
                </Box>
            )}
        </Paper>
    );
};

// Sortable Child Section Component
const SortableChildSection = ({
    child,
    childIndex,
    questions,
    onEdit,
    onDelete,
    onAddQuestion,
    onDeleteQuestion,
    onEditQuestion,
    onPreviewQuestion,
}) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: child.id });
    const [expanded, setExpanded] = React.useState(childIndex === 0);

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <Box
            ref={setNodeRef}
            style={style}
            sx={{
                opacity: isDragging ? 0.5 : 1,
                transition,
            }}
        >
            <Accordion
                expanded={expanded}
                onChange={(e, isExpanded) => setExpanded(isExpanded)}
                sx={{
                    "&:before": { display: "none" },
                    boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.2)" : "0 1px 3px rgba(0,0,0,0.1)",
                    borderRadius: "8px !important",
                    border: isDragging ? "2px solid #1976d2" : "none",
                }}
            >
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{
                        bgcolor: "#f5f5f5",
                        "&:hover": { bgcolor: "#eeeeee" },
                        borderRadius: "8px",
                        "& .MuiAccordionSummary-content": {
                            my: 1.5,
                        },
                    }}
                >
                    <Stack direction="row" alignItems="center" spacing={2} width="100%">
                        <Box
                            {...attributes}
                            {...listeners}
                            sx={{
                                cursor: "grab",
                                "&:active": { cursor: "grabbing" },
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                width: 24,
                                height: 24,
                                color: "#999",
                                "&:hover": {
                                    color: "#1976d2",
                                    bgcolor: "rgba(25, 118, 210, 0.08)",
                                    borderRadius: 1,
                                },
                                transition: "all 0.2s",
                                touchAction: "none",
                                flexShrink: 0,
                            }}
                            onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                            }}
                            onMouseDown={(e) => {
                                e.stopPropagation();
                            }}
                            onTouchStart={(e) => {
                                e.stopPropagation();
                            }}
                        >
                            <DragIcon fontSize="small" />
                        </Box>

                        <Typography fontWeight={600}>
                            {child.title || `Phần ${childIndex + 1}`}
                        </Typography>
                        <Chip label={`${questions.length} câu hỏi`} size="small" color="info" />
                        <Box sx={{ flexGrow: 1 }} />
                        <Tooltip title="Sửa">
                            <IconButton
                                size="small"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(child);
                                }}
                            >
                                <EditIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Xóa">
                            <IconButton
                                size="small"
                                color="error"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(child.id);
                                }}
                            >
                                <DeleteIcon fontSize="small" />
                            </IconButton>
                        </Tooltip>
                    </Stack>
                </AccordionSummary>

                <AccordionDetails sx={{ bgcolor: "white", p: 3 }}>
                    <Box display="flex" justifyContent="flex-end">
                        <Button
                            variant="outlined"
                            startIcon={<AddIcon />}
                            onClick={onAddQuestion}
                            sx={{ mb: 2 }}
                        >
                            Thêm câu hỏi
                        </Button>
                    </Box>

                    {questions.length === 0 ? (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ textAlign: "center" }}
                        >
                            Chưa có câu hỏi nào. Nhấn "Thêm câu hỏi" để bắt đầu.
                        </Typography>
                    ) : (
                        <Stack spacing={2}>
                            {questions.map((question, qIndex) => (
                                <Paper
                                    key={qIndex}
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        transition: "all 0.2s",
                                        "&:hover": { boxShadow: 2, borderColor: "primary.main" },
                                    }}
                                >
                                    <Stack spacing={1}>
                                        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                                            <Box flex={1}>
                                                <Typography variant="body2" fontWeight={600} gutterBottom>
                                                    <strong>Q{qIndex + 1}:</strong>{" "}
                                                    {(question.Content || question.content)?.length > 60
                                                        ? (question.Content || question.content).substring(0, 60) + "..."
                                                        : (question.Content || question.content)}
                                                </Typography>
                                                <Stack direction="row" spacing={1} flexWrap="wrap" mt={1}>
                                                    <Chip label={question.Type || question.type || "Unknown"} size="small" color="primary" />
                                                    <Chip
                                                        label={question.Level || question.level || "Medium"}
                                                        size="small"
                                                        color={
                                                            (question.Level || question.level) === "Easy"
                                                                ? "success"
                                                                : (question.Level || question.level) === "Hard"
                                                                    ? "error"
                                                                    : "warning"
                                                        }
                                                    />
                                                    {(question.Topic || question.topic) && <Chip label={question.Topic || question.topic} size="small" variant="outlined" />}
                                                    <Chip label={`${question.Point || question.point || 1} điểm`} size="small" />
                                                </Stack>
                                            </Box>
                                            <Stack direction="row" spacing={0.5}>
                                                <Tooltip title="Xem">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => onPreviewQuestion(question)}
                                                    >
                                                        <VisibilityIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Xóa">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => onDeleteQuestion(child.id, qIndex)}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Stack>
                                        </Stack>
                                    </Stack>
                                </Paper>
                            ))}
                        </Stack>
                    )}
                </AccordionDetails>
            </Accordion>
        </Box>
    );
};

const Step2Content = ({ sections, setSections, onError }) => {
    const [openAddSection, setOpenAddSection] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [openAddQuestion, setOpenAddQuestion] = useState(false);
    const [currentParentId, setCurrentParentId] = useState(null);
    const [currentParentType, setCurrentParentType] = useState(null);
    const [currentChildId, setCurrentChildId] = useState(null);
    const [previewQuestion, setPreviewQuestion] = useState(null);
    const [openPreview, setOpenPreview] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const parentSections = sections
        .filter((s) => !s.parentSectionId)
        .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const getChildSections = (parentId) =>
        sections
            .filter((s) => s.parentSectionId === parentId)
            .sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    const getQuestions = (sectionId) => {
        const section = sections.find((s) => s.id === sectionId);
        return section?.questions || [];
    };
    const handleDragEnd = (event) => {
        const { active, over } = event;
        const isChildDrag = sections.some(
            s => s.id === active?.id && s.parentSectionId !== null
        );

        if (isChildDrag) {
            return;
        }

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = parentSections.findIndex((s) => s.id === active.id);
        const newIndex = parentSections.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reorderedParents = arrayMove(parentSections, oldIndex, newIndex);
        const parentsWithNewOrder = reorderedParents.map((parent, index) => ({
            ...parent,
            orderIndex: index
        }));
        const childSections = sections.filter((s) => s.parentSectionId);
        const newSections = [...parentsWithNewOrder, ...childSections];

        setSections(newSections);
    };

    const handleDragEndChild = (event, parentId) => {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const children = getChildSections(parentId);
        const oldIndex = children.findIndex((s) => s.id === active.id);
        const newIndex = children.findIndex((s) => s.id === over.id);

        if (oldIndex === -1 || newIndex === -1) {
            return;
        }

        const reorderedChildren = arrayMove(children, oldIndex, newIndex);
        const childrenWithNewOrder = reorderedChildren.map((child, index) => {
            let newTitle = child.title;
            if (newTitle && newTitle.includes(':')) {
                const parts = newTitle.split(':');
                const subtitle = parts.slice(1).join(':').trim();
                newTitle = `Phần ${index + 1}: ${subtitle}`;
            } else if (newTitle && newTitle.startsWith('Phần ')) {
                newTitle = `Phần ${index + 1}`;
            } else {
                newTitle = newTitle ? `Phần ${index + 1}: ${newTitle}` : `Phần ${index + 1}`;
            }

            return {
                ...child,
                orderIndex: index,
                title: newTitle
            };
        });

        const otherSections = sections.filter((s) =>
            !(s.parentSectionId === parentId)
        );
        const newSections = [...otherSections, ...childrenWithNewOrder];
        setSections(newSections);
    };

    const handleAddParentSection = () => {
        setEditingSection(null);
        setCurrentParentId(null);
        setCurrentParentType(null);
        setOpenAddSection(true);
    };

    const handleAddChildSection = (parentId, parentType) => {
        setEditingSection(null);
        setCurrentParentId(parentId);
        setCurrentParentType(parentType);
        setOpenAddSection(true);
    };

    const handleEditSection = (section) => {
        setEditingSection(section);
        setCurrentParentId(section.parentSectionId);
        const parent = sections.find(s => s.id === section.parentSectionId);
        setCurrentParentType(parent?.type || section.type);
        setOpenAddSection(true);
    };

    const handleDeleteSection = (sectionId) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa phần thi này?")) return;

        const deleteRecursive = (id) => {
            const children = sections.filter((s) => s.parentSectionId === id);
            children.forEach((child) => deleteRecursive(child.id));
            setSections((prev) => prev.filter((s) => s.id !== id));
        };

        deleteRecursive(sectionId);
    };

    const handleSaveSection = (sectionData) => {
        if (editingSection) {
            setSections((prev) =>
                prev.map((s) => (s.id === editingSection.id ? { ...s, ...sectionData } : s))
            );
        } else {
            let title = sectionData.title?.trim();
            if (!currentParentId) {
                title = sectionData.title?.trim() || sectionData.type;
            }
            if (currentParentId) {
                const siblingCount = getChildSections(currentParentId).length;
                const partNumber = `Phần ${siblingCount + 1}`;

                title = sectionData.title?.trim()
                    ? `${partNumber}: ${sectionData.title.trim()}`
                    : partNumber;
            }

            const newSection = {
                id: `section-${Date.now()}`,
                type: sectionData.type,
                title,
                parentSectionId: currentParentId,
                orderIndex: currentParentId
                    ? getChildSections(currentParentId).length
                    : parentSections.length,
                questions: [],
            };

            setSections((prev) => [...prev, newSection]);
        }
        setOpenAddSection(false);
    };

    const handleAddQuestion = (parentId, childId) => {
        setCurrentParentId(parentId);
        setCurrentChildId(childId);
        setOpenAddQuestion(true);
    };

    const handleSaveQuestions = (questions) => {
        setSections((prev) =>
            prev.map((s) => {
                if (s.id === currentChildId) {
                    return {
                        ...s,
                        questions: [...(s.questions || []), ...questions],
                    };
                }
                return s;
            })
        );
        setOpenAddQuestion(false);
    };

    const handleDeleteQuestion = (sectionId, questionIndex) => {
        if (!window.confirm("Bạn có chắc chắn muốn xóa câu hỏi này?")) return;

        setSections((prev) =>
            prev.map((s) => {
                if (s.id === sectionId) {
                    const newQuestions = [...s.questions];
                    newQuestions.splice(questionIndex, 1);
                    return { ...s, questions: newQuestions };
                }
                return s;
            })
        );
    };

    const handleEditQuestion = (sectionId, questionIndex) => {
        alert("Chức năng chỉnh sửa câu hỏi sẽ được cập nhật sau");
    };

    const handlePreviewQuestion = (question) => {
        setPreviewQuestion(question);
        setOpenPreview(true);
    };

    // Empty state
    if (parentSections.length === 0) {
        return (
            <Box>
                <Paper
                    sx={{
                        p: 8,
                        textAlign: "center",
                        border: "2px dashed #e0e0e0",
                        bgcolor: "#fafafa",
                        borderRadius: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 120,
                            height: 120,
                            margin: "0 auto 24px",
                            bgcolor: "#f5f5f5",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <QuestionAnswerIcon sx={{ fontSize: 60, color: "#9e9e9e" }} />
                    </Box>
                    <Typography variant="h6" gutterBottom sx={{ color: "#666", fontWeight: 600 }}>
                        Chưa có phần thi nào
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Nhấn nút "Thêm phần thi mới" để bắt đầu xây dựng bài thi
                    </Typography>
                    <Button
                        variant="contained"
                        size="large"
                        startIcon={<AddIcon />}
                        onClick={handleAddParentSection}
                        sx={{ px: 4, py: 1.5, fontSize: "1rem", fontWeight: 600 }}
                    >
                        Thêm phần thi mới
                    </Button>
                </Paper>

                <AddSectionDialog
                    open={openAddSection}
                    onClose={() => setOpenAddSection(false)}
                    onSave={handleSaveSection}
                    isChild={Boolean(currentParentId)}
                    parentType={currentParentType}
                    editData={editingSection}
                />

                <AddQuestionDialog
                    open={openAddQuestion}
                    onClose={() => setOpenAddQuestion(false)}
                    onSave={handleSaveQuestions}
                    parentSectionId={currentParentId}
                    childSectionId={currentChildId}
                />
            </Box>
        );
    }

    // Main content with drag & drop
    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h6" fontWeight={600}>
                    Cấu trúc bài thi
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddParentSection}
                >
                    Thêm phần thi mới
                </Button>
            </Stack>

            <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
            >
                <SortableContext
                    items={parentSections.map((p) => p.id)}
                    strategy={verticalListSortingStrategy}
                >
                    <Box>
                        {parentSections.map((parent, index) => (
                            <SortableParentSection
                                key={parent.id}
                                parent={parent}
                                index={index}
                                childSections={getChildSections(parent.id)}
                                onAddChild={handleAddChildSection}
                                onEdit={handleEditSection}
                                onDelete={handleDeleteSection}
                                onAddQuestion={handleAddQuestion}
                                onDeleteQuestion={handleDeleteQuestion}
                                onEditQuestion={handleEditQuestion}
                                onPreviewQuestion={handlePreviewQuestion}
                                getQuestions={getQuestions}
                                onDragEndChild={handleDragEndChild}
                            />
                        ))}
                    </Box>
                </SortableContext>
            </DndContext>

            <AddSectionDialog
                open={openAddSection}
                onClose={() => setOpenAddSection(false)}
                onSave={handleSaveSection}
                isChild={Boolean(currentParentId)}
                parentType={currentParentType}
                editData={editingSection}
            />

            <AddQuestionDialog
                open={openAddQuestion}
                onClose={() => setOpenAddQuestion(false)}
                onSave={handleSaveQuestions}
                parentSectionId={currentParentId}
                childSectionId={currentChildId}
            />

            {/* Preview Question Dialog */}
            <Dialog
                open={openPreview}
                onClose={() => setOpenPreview(false)}
                maxWidth="md"
                fullWidth
            >
                <DialogTitle>
                    <Typography variant="h6" fontWeight={600}>
                        Chi tiết câu hỏi
                    </Typography>
                </DialogTitle>
                <DialogContent dividers>
                    {previewQuestion && (
                        <Stack spacing={3}>
                            {/* Question Content */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Nội dung câu hỏi
                                </Typography>
                                <Typography variant="body1">
                                    {previewQuestion.Content || previewQuestion.content}
                                </Typography>
                            </Box>

                            <Divider />

                            {/* Question Info */}
                            <Box>
                                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                    Thông tin
                                </Typography>
                                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                                    <Chip
                                        label={`Loại: ${previewQuestion.Type || previewQuestion.type}`}
                                        size="small"
                                        color="primary"
                                    />
                                    <Chip
                                        label={`Độ khó: ${previewQuestion.Level || previewQuestion.level}`}
                                        size="small"
                                        color={
                                            (previewQuestion.Level || previewQuestion.level) === "Easy"
                                                ? "success"
                                                : (previewQuestion.Level || previewQuestion.level) === "Hard"
                                                    ? "error"
                                                    : "warning"
                                        }
                                    />
                                    {(previewQuestion.Topic || previewQuestion.topic) && (
                                        <Chip
                                            label={`Chủ đề: ${previewQuestion.Topic || previewQuestion.topic}`}
                                            size="small"
                                            variant="outlined"
                                        />
                                    )}
                                    <Chip
                                        label={`Điểm: ${previewQuestion.Point || previewQuestion.point || 1}`}
                                        size="small"
                                        variant="outlined"
                                    />
                                </Stack>
                            </Box>

                            {/* Options for Multiple Choice */}
                            {(previewQuestion.Type === "multiple_choice" || previewQuestion.type === "multiple_choice") && (
                                <>
                                    <Divider />
                                    <Box>
                                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                            Các lựa chọn
                                        </Typography>
                                        {(!previewQuestion.options || previewQuestion.options.length === 0) ? (
                                            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 1 }}>
                                                Không có lựa chọn nào
                                            </Typography>
                                        ) : (
                                            <Stack spacing={1} mt={1}>
                                                {previewQuestion.options.map((option, index) => (
                                                    <Paper
                                                        key={index}
                                                        variant="outlined"
                                                        sx={{
                                                            p: 1.5,
                                                            bgcolor: option.IsCorrect || option.isCorrect ? "#e8f5e9" : "transparent",
                                                            borderColor: option.IsCorrect || option.isCorrect ? "#4caf50" : "#e0e0e0",
                                                        }}
                                                    >
                                                        <Stack direction="row" alignItems="center" spacing={1}>
                                                            <Typography
                                                                sx={{
                                                                    minWidth: 24,
                                                                    height: 24,
                                                                    borderRadius: "50%",
                                                                    bgcolor: option.IsCorrect || option.isCorrect ? "#4caf50" : "#e0e0e0",
                                                                    color: "white",
                                                                    display: "flex",
                                                                    alignItems: "center",
                                                                    justifyContent: "center",
                                                                    fontSize: "0.75rem",
                                                                    fontWeight: 600,
                                                                }}
                                                            >
                                                                {String.fromCharCode(65 + index)}
                                                            </Typography>
                                                            <Typography variant="body2" flex={1}>
                                                                {option.Content || option.content}
                                                            </Typography>
                                                            {(option.IsCorrect || option.isCorrect) && (
                                                                <Chip label="Đúng" size="small" color="success" />
                                                            )}
                                                        </Stack>
                                                    </Paper>
                                                ))}
                                            </Stack>
                                        )}
                                    </Box>
                                </>
                            )}

                            {/* Correct Answer for other types */}
                            {(previewQuestion.CorrectAnswer || previewQuestion.correctAnswer) &&
                                (previewQuestion.Type !== "multiple_choice" && previewQuestion.type !== "multiple_choice") && (
                                    <>
                                        <Divider />
                                        <Box>
                                            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                                                Đáp án đúng
                                            </Typography>
                                            {/* Matching type - parse JSON and display as pairs */}
                                            {(previewQuestion.Type === "matching" || previewQuestion.type === "matching") ? (
                                                <Stack spacing={1}>
                                                    {(() => {
                                                        try {
                                                            const pairs = JSON.parse(previewQuestion.CorrectAnswer || previewQuestion.correctAnswer);
                                                            return Object.entries(pairs).map(([key, value], index) => (
                                                                <Paper key={index} variant="outlined" sx={{ p: 1.5, bgcolor: "#e8f5e9" }}>
                                                                    <Stack direction="row" alignItems="center" spacing={2}>
                                                                        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                                                                            {key}
                                                                        </Typography>
                                                                        <Typography variant="body2" color="text.secondary">
                                                                            →
                                                                        </Typography>
                                                                        <Typography variant="body2" sx={{ flex: 1 }}>
                                                                            {value}
                                                                        </Typography>
                                                                    </Stack>
                                                                </Paper>
                                                            ));
                                                        } catch (e) {
                                                            return (
                                                                <Typography variant="body2" color="error">
                                                                    Lỗi định dạng đáp án
                                                                </Typography>
                                                            );
                                                        }
                                                    })()}
                                                </Stack>
                                            ) : (
                                                /* Other types - display as simple text */
                                                <Paper variant="outlined" sx={{ p: 2, bgcolor: "#e8f5e9" }}>
                                                    <Typography variant="body2">
                                                        {previewQuestion.CorrectAnswer || previewQuestion.correctAnswer}
                                                    </Typography>
                                                </Paper>
                                            )}
                                        </Box>
                                    </>
                                )}
                        </Stack>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenPreview(false)} variant="contained">
                        Đóng
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default Step2Content;