import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    Stepper,
    Step,
    StepLabel,
    Typography,
    TextField,
    Grid,
    Switch,
    FormControlLabel,
    Alert,
    Autocomplete,
    Chip,
    createFilterOptions,
    Paper,
    Container
} from "@mui/material";
import {
    getClassesByCourseApi,
    updateExamApi,
} from "../../../../apiServices/instructorExamService";
import Step2Content from "./Step2Content";

const filter = createFilterOptions();
const steps = ["Thông tin bài thi", "Phần thi & Câu hỏi", "Tổng quan"];

const ExamWizard = ({ open, onClose, onSave, courses, mode = "create", initialData = null, examId, onError }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [sections, setSections] = useState([]);
    const [examData, setExamData] = useState({
        title: "",
        description: "",
        courseId: "",
        classIds: [],
        startTime: "",
        endTime: "",
        status: "Pending",
        duration: 60,
        passingScore: 50,
        maxAttempts: 1,
        isRandomQuestion: false,
        isRandomAnswer: false
    });

    const [classes, setClasses] = useState([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const [classError, setClassError] = useState("");
    const [errors, setErrors] = useState({});
    const isInitialLoadRef = useRef(true);
    const getOriginalCourseId = (value) => {
        if (!value) return null;
        const valueStr = String(value);
        const course = courses.find(c => c.value === value || c.value === valueStr);
        if (course?.originalId) {
            return course.originalId;
        }
        if (valueStr.includes('-idx')) {
            const extractedId = valueStr.split('-idx')[0];
            return extractedId;
        }
        if (valueStr.startsWith('temp-')) {
            return valueStr;
        }
        return value;
    };

    useEffect(() => {
        if (open) {
            if (initialData && mode === "edit") {
                isInitialLoadRef.current = true;
                const matchedCourse = safeCourses.find(
                    (c) => c.originalId === initialData.CourseID
                );

                setExamData({
                    title: initialData.Title || initialData.title || "",
                    description: initialData.Description || initialData.description || "",
                    courseId: matchedCourse ? matchedCourse.value : "",
                    classIds: (() => {
                        if (Array.isArray(initialData.ClassIDs)) return initialData.ClassIDs;
                        if (Array.isArray(initialData.classIds)) return initialData.classIds;
                        if (Array.isArray(initialData.Classes)) {
                            return initialData.Classes.map(c => c.ClassID || c.id || c._id);
                        }
                        if (Array.isArray(initialData.classes)) {
                            return initialData.classes.map(c => c.ClassID || c.classId || c.id);
                        }
                        if (initialData.ClassID) return [initialData.ClassID];
                        if (initialData.classId) return [initialData.classId];
                        return [];
                    })(),
                    startTime: initialData.StartTime || initialData.startTime || "",
                    endTime: initialData.EndTime || initialData.endTime || "",
                    status: initialData.Status || initialData.status || "Pending",
                    duration: initialData.Duration || initialData.duration || 60,
                    passingScore: initialData.PassingScore || initialData.passingScore || 50,
                    maxAttempts: initialData.MaxAttempts || initialData.maxAttempts || 1,
                    isRandomQuestion: initialData.IsRandomQuestion || initialData.isRandomQuestion || false,
                    isRandomAnswer: initialData.IsRandomAnswer || initialData.isRandomAnswer || false
                });
                if (initialData.sections || initialData.Sections) {
                    const sectionsData = initialData.sections || initialData.Sections || [];
                    const mappedSections = sectionsData.map(section => {
                        const childSectionsArray = section.ChildSections || section.childSections || [];
                        return {
                            id: section.SectionId || section.id || section.SectionID,
                            title:
                                section.Title ||
                                section.Type,
                            type: section.Type || section.type,
                            orderIndex: section.OrderIndex ?? section.orderIndex ?? 0,
                            parentSectionId: section.ParentSectionId ?? section.parentSectionId ?? null,
                            childSections: childSectionsArray.map(child => {
                                const childQuestions = child.Questions || child.questions || child.directQuestions || [];
                                return {
                                    id: child.SectionId || child.id || child.SectionID,
                                    title: child.Title || child.title || child.Name || child.Type,
                                    type: child.Type || child.type,
                                    orderIndex: child.OrderIndex ?? child.orderIndex ?? 0,
                                    parentSectionId: child.ParentSectionId ?? child.parentSectionId ?? section.SectionId,
                                    questions: childQuestions
                                };
                            }),
                            questions: section.Questions || section.questions || section.directQuestions || []
                        };
                    });
                    const flattenedSections = [];
                    mappedSections.forEach(parent => {
                        const { childSections, ...parentWithoutChildren } = parent;
                        flattenedSections.push(parentWithoutChildren);
                        if (childSections && childSections.length > 0) {
                            childSections.forEach(child => {
                                flattenedSections.push(child);
                            });
                        }
                    });
                    setSections(flattenedSections);
                } else {
                    setSections([]);
                }
            } else {
                setExamData({
                    title: "",
                    description: "",
                    courseId: "",
                    classIds: [],
                    startTime: "",
                    endTime: "",
                    status: "Pending",
                    duration: 60,
                    passingScore: 50,
                    maxAttempts: 1,
                    isRandomQuestion: false,
                    isRandomAnswer: false
                });
                setClasses([]);
                setClassError("");
                setErrors({});
                setActiveStep(0);
                setSections([]);
            }
        }
    }, [open, initialData, mode]);

    useEffect(() => {
        if (examData.courseId) {
            const originalCourseId = getOriginalCourseId(examData.courseId);
            loadClasses(originalCourseId);
            if (mode === "create" || !isInitialLoadRef.current) {
                setExamData(prev => ({ ...prev, classIds: [] }));
            }
            if (isInitialLoadRef.current) {
                isInitialLoadRef.current = false;
            }
        } else {
            setClasses([]);
            setClassError("");
        }
    }, [examData.courseId]);

    const loadClasses = async (courseId) => {
        setLoadingClasses(true);
        setClassError("");
        try {
            const response = await getClassesByCourseApi(courseId);
            let classList = [];
            if (Array.isArray(response)) classList = response;
            else if (response?.data) classList = response.data;
            else if (response?.classes) classList = response.classes;
            if (classList.length > 0) {
            }

            setClasses(classList);
            if (classList.length === 0) {
                setClassError("Khóa học này chưa có lớp học nào");
            }
        } catch (error) {
            setClassError("Không thể tải lớp học. Vui lòng thử lại.");
            setClasses([]);
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleExamDataChange = (field, value) => {
        setExamData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!examData.title?.trim()) newErrors.title = "Tiêu đề là bắt buộc";
        if (!examData.description?.trim()) newErrors.description = "Mô tả là bắt buộc";
        if (!examData.courseId) newErrors.courseId = "Vui lòng chọn khóa học";
        if (!examData.classIds || examData.classIds.length === 0)
            newErrors.classIds = "Vui lòng chọn ít nhất một lớp học";
        if (!examData.startTime) newErrors.startTime = "Thời gian bắt đầu là bắt buộc";
        if (!examData.endTime) newErrors.endTime = "Thời gian kết thúc là bắt buộc";
        if (examData.startTime && examData.endTime) {
            if (new Date(examData.endTime) <= new Date(examData.startTime)) {
                newErrors.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
            }
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const parentSections = sections.filter(s => !s.parentSectionId);
        if (parentSections.length === 0) {
            alert("Vui lòng thêm ít nhất một phần thi");
            return false;
        }

        for (const parent of parentSections) {
            const children = sections.filter(s => s.parentSectionId === parent.id);
            if (children.length === 0) {
                alert(`Phần thi "${parent.title}" phải có ít nhất một phần thi con`);
                return false;
            }

            for (const child of children) {
                if (!child.questions || child.questions.length === 0) {
                    alert(`"${child.title}" phải có ít nhất một câu hỏi`);
                    return false;
                }
            }
        }

        return true;
    };

    const safeCourses = React.useMemo(() => {
        if (!Array.isArray(courses)) return [];
        const seen = new Set();
        return courses
            .map((course, index) => {
                let value = course.value;
                if (!value) {
                    const id = course.CourseID || course.id || course._id;
                    value = id || `fallback-course-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`;
                }
                return {
                    label: course.label || course.CourseName || course.Title || course.name || `Khóa học ${index + 1}`,
                    value,
                    originalId: course.originalId,
                };
            })
            .filter(item => {
                if (seen.has(item.value)) return false;
                seen.add(item.value);
                return true;
            });
    }, [courses]);

    const handleNext = () => {
        if (activeStep === 0) {
            if (!validateStep1()) return;
        }
        if (activeStep === 1) {
            if (!validateStep2()) return;
        }
        setActiveStep((prev) => prev + 1);
    };

    const handleBack = () => {
        setActiveStep((prev) => prev - 1);
    };

    const convertToHierarchical = (flatSections) => {
        const parentSections = flatSections.filter(s => !s.parentSectionId);

        return parentSections.map(parent => {
            const childSections = flatSections.filter(s => s.parentSectionId === parent.id);

            return {
                type: parent.type,
                title: parent.title,
                orderIndex: parent.orderIndex,
                childSections: childSections.map(child => ({
                    type: child.type,
                    title: child.title,
                    orderIndex: child.orderIndex,
                    questions: (child.questions || []).map(q => q.QuestionID || q.id).filter(Boolean)
                }))
            };
        });
    };

    const handleFinish = async () => {
        setLoading(true);

        try {
            let originalCourseId = getOriginalCourseId(examData.courseId);

            if (!originalCourseId && initialData?.CourseID) {
                console.warn("⚠ originalCourseId null → fallback initialData.CourseID:", initialData.CourseID);
                originalCourseId = initialData.CourseID;
            }

            if (!originalCourseId) {
                throw new Error("Không thể xác định CourseID. Vui lòng chọn lại khóa học.");
            }

            if (mode === "edit") {

                if (!examId) throw new Error("Không tìm thấy ID bài thi để cập nhật");
                const hierarchicalSections = convertToHierarchical(sections);

                const examPayload = {
                    courseId: originalCourseId,
                    title: examData.title,
                    description: examData.description,
                    startTime: examData.startTime,
                    endTime: examData.endTime,
                    status: examData.status || "Pending",
                    isRandomQuestion: examData.isRandomQuestion ? 1 : 0,
                    isRandomAnswer: examData.isRandomAnswer ? 1 : 0,
                    classIds: examData.classIds || [],
                    sections: hierarchicalSections
                };
                await updateExamApi(examId, examPayload);
                onSave({ examId });
                return;
            }

            const hierarchicalSections = convertToHierarchical(sections);
            const examPayload = {
                courseId: originalCourseId,
                title: examData.title,
                description: examData.description,
                startTime: examData.startTime,
                endTime: examData.endTime,
                status: examData.status || "Pending",
                isRandomQuestion: examData.isRandomQuestion ? 1 : 0,
                isRandomAnswer: examData.isRandomAnswer ? 1 : 0,
                sections: hierarchicalSections,
                classIds: examData.classIds || []
            };
            onSave(examPayload);

        } catch (error) {
            const errorMessage =
                error?.message || error?.response?.data?.message || "Lưu thất bại";
            onError?.(errorMessage);
        } finally {
            setLoading(false);
        }
    };


    const renderStepContent = () => {
        if (activeStep === 0) {
            return (
                <Box>
                    <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, mb: 4 }}>
                        Thông tin cơ bản
                    </Typography>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Tiêu đề bài thi *"
                                value={examData.title}
                                onChange={(e) => handleExamDataChange("title", e.target.value)}
                                error={Boolean(errors.title)}
                                helperText={errors.title}
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Mô tả *"
                                value={examData.description}
                                onChange={(e) => handleExamDataChange("description", e.target.value)}
                                error={Boolean(errors.description)}
                                helperText={errors.description}
                            />
                        </Grid>

                        <Grid item xs={12} >
                            <Autocomplete
                                options={safeCourses}
                                getOptionLabel={(option) => option.label || ""}
                                value={(() => {
                                    const courseId = examData.courseId;
                                    if (!courseId) return null;
                                    let found = safeCourses.find(c => c.value === courseId);
                                    if (found) return found;
                                    found = safeCourses.find(c => c.originalId === courseId);
                                    if (found) return found;
                                    found = safeCourses.find(c => {
                                        const extractedId = c.value?.split('-idx')[0];
                                        return extractedId === courseId;
                                    });
                                    if (found) return found;
                                    return null;
                                })()}
                                onChange={(e, newValue) => {
                                    handleExamDataChange("courseId", newValue ? newValue.value : "");
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Khóa học *"
                                        error={Boolean(errors.courseId)}
                                        helperText={errors.courseId}
                                    />
                                )}
                                isOptionEqualToValue={(option, value) => option.value === value.value}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Autocomplete
                                multiple
                                options={classes}
                                getOptionLabel={(option) => {
                                    const name = option.Name || option.ClassName || option.name || option.title;
                                    if (name && name.trim()) return name;

                                    const id = option.ClassID || option.id || option._id;
                                    if (id) return `Lớp ${id}`;

                                    const index = classes.indexOf(option);
                                    return `Lớp ${index + 1}`;
                                }}
                                value={(() => {
                                    const matched = classes.filter(c => {
                                        const classId = c.ClassID || c.id || c._id;
                                        const isMatch = examData.classIds.includes(classId);
                                        return isMatch;
                                    });
                                    return matched;
                                })()}
                                onChange={(e, newValue) => {
                                    const ids = newValue.map(c => c.ClassID || c.id || c._id);
                                    handleExamDataChange("classIds", ids);
                                }}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => {
                                        const name = option.Name || option.ClassName || option.name || option.title || `Lớp ${option.ClassID || option.id || index + 1}`;
                                        const { key, ...chipProps } = getTagProps({ index });
                                        return (
                                            <Chip
                                                key={key}
                                                label={name}
                                                {...chipProps}
                                                sx={{
                                                    backgroundColor: '#e3f2fd',
                                                    color: '#1976d2',
                                                    fontWeight: 500,
                                                    border: '1px solid #bbdefb',
                                                    '& .MuiChip-deleteIcon': {
                                                        color: '#1976d2',
                                                        '&:hover': {
                                                            color: '#1565c0',
                                                        },
                                                    },
                                                }}
                                            />
                                        );
                                    })
                                }
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Lớp học *"
                                        placeholder={examData.classIds.length === 0 ? "Chọn một hoặc nhiều lớp học" : ""}
                                        error={Boolean(errors.classIds)}
                                        helperText={errors.classIds || classError}
                                    />
                                )}
                                disabled={!examData.courseId || loadingClasses}
                                loading={loadingClasses}
                                isOptionEqualToValue={(option, value) =>
                                    (option.ClassID || option.id || option._id) === (value.ClassID || value.id || value._id)
                                }
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Thời gian bắt đầu *"
                                value={examData.startTime}
                                onChange={(e) => handleExamDataChange("startTime", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.startTime)}
                                helperText={errors.startTime}
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <TextField
                                fullWidth
                                type="datetime-local"
                                label="Thời gian kết thúc *"
                                value={examData.endTime}
                                onChange={(e) => handleExamDataChange("endTime", e.target.value)}
                                InputLabelProps={{ shrink: true }}
                                error={Boolean(errors.endTime)}
                                helperText={errors.endTime}
                            />
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={examData.isRandomQuestion}
                                        onChange={(e) => handleExamDataChange("isRandomQuestion", e.target.checked)}
                                    />
                                }
                                label="Xáo trộn câu hỏi"
                            />
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={examData.isRandomAnswer}
                                        onChange={(e) => handleExamDataChange("isRandomAnswer", e.target.checked)}
                                    />
                                }
                                label="Xáo trộn đáp án"
                            />
                        </Grid>
                    </Grid>
                </Box>
            );
        }

        // STEP 2: Phần thi & Câu hỏi
        if (activeStep === 1) {
            return (
                <Step2Content
                    sections={sections}
                    setSections={setSections}
                    onError={(error) => console.error(error)}
                />
            );
        }

        // STEP 3: Tổng quan
        return (
            <Box>
                <Grid container spacing={3}>
                    {/* BÊN TRÁI - THÔNG TIN BÀI THI */}
                    <Grid item xs={12} md={5}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                            {/* Thông tin bài thi */}
                            <Box>
                                <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                                    Thông tin bài thi
                                </Typography>
                                <Paper variant="outlined" sx={{ p: 2.5 }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                        <Box>
                                            <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                                                Tiêu đề
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                                {examData.title}
                                            </Typography>
                                        </Box>

                                        {examData.description && (
                                            <>
                                                <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
                                                <Box>
                                                    <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                                                        Mô tả
                                                    </Typography>
                                                    <Typography variant="body2" color="text.primary">
                                                        {examData.description}
                                                    </Typography>
                                                </Box>
                                            </>
                                        )}

                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

                                        <Box>
                                            <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                                                Khóa học
                                            </Typography>
                                            <Typography variant="body2" color="text.primary">
                                                {safeCourses.find(c => c.value === examData.courseId)?.label || "Chưa chọn"}
                                            </Typography>
                                        </Box>

                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />
                                        <Box>
                                            <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                                                Lớp học
                                            </Typography>
                                            <Box sx={{ mt: 1 }}>
                                                {classes && classes.length > 0 ? (
                                                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                                        {classes
                                                            .filter(cls => {
                                                                const classId = cls.ClassID || cls.id || cls._id;
                                                                return examData.classIds.includes(classId);
                                                            })
                                                            .map((cls, index) => {
                                                                const classId = cls.ClassID || cls.id || cls._id;
                                                                const className = cls.Name || cls.ClassName || cls.name || `Lớp ${classId}`;
                                                                return (
                                                                    <Box 
                                                                        key={classId}
                                                                        sx={{ 
                                                                            display: 'flex', 
                                                                            alignItems: 'center',
                                                                            gap: 1
                                                                        }}
                                                                    >
                                                                        <Box
                                                                            sx={{
                                                                                width: 6,
                                                                                height: 6,
                                                                                borderRadius: '50%',
                                                                                bgcolor: 'primary.main',
                                                                                flexShrink: 0
                                                                            }}
                                                                        />
                                                                        <Typography 
                                                                            variant="body2" 
                                                                            color="text.primary"
                                                                        >
                                                                            {className}
                                                                        </Typography>
                                                                    </Box>
                                                                );
                                                            })}
                                                    </Box>
                                                ) : (
                                                    <Typography variant="body2" color="text.primary">
                                                        {examData.classIds.length} lớp đã chọn
                                                    </Typography>
                                                )}
                                            </Box>
                                        </Box>

                                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }} />

                                        <Box>
                                            <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.5 }}>
                                                Thời gian mở bài thi
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Typography variant="body2" color="text.primary">
                                                    {examData.startTime && new Date(examData.startTime).toLocaleString('vi-VN')}
                                                </Typography>
                                                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
                                                    →
                                                </Typography>
                                                <Typography variant="body2" color="text.primary">
                                                    {examData.endTime && new Date(examData.endTime).toLocaleString('vi-VN')}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>
                                </Paper>
                            </Box>
                        </Box>
                    </Grid>

                    {/* BÊN PHẢI - CẤU TRÚC BÀI THI */}
                    <Grid item xs={12} md={7}>
                        <Box>
                            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ mb: 2 }}>
                                Cấu trúc bài thi
                            </Typography>
                            {sections.filter(s => !s.parentSectionId).length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    {sections.filter(s => !s.parentSectionId).map((parent, idx) => {
                                        const children = sections.filter(s => s.parentSectionId === parent.id);
                                        const totalQuestions = children.reduce((sum, child) =>
                                            sum + (child.questions?.length || 0), 0
                                        );

                                        return (
                                            <Paper
                                                key={parent.id}
                                                variant="outlined"
                                                sx={{
                                                    p: 2.5,
                                                    '&:hover': {
                                                        boxShadow: 2,
                                                        borderColor: 'primary.main'
                                                    },
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <Box>
                                                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                                                        <Box display="flex" gap={1.5} alignItems="center" flex={1}>
                                                            <Box
                                                                sx={{
                                                                    width: 36,
                                                                    height: 36,
                                                                    borderRadius: '8px',
                                                                    bgcolor: 'primary.main',
                                                                    color: 'white',
                                                                    display: 'flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    fontWeight: 700,
                                                                    fontSize: '1.1rem'
                                                                }}
                                                            >
                                                                {idx + 1}
                                                            </Box>
                                                            <Typography variant="h6" fontWeight={600} sx={{ flex: 1 }}>
                                                                {parent.type && parent.title ? `${parent.type}: ${parent.title}` : (parent.title || parent.type)}
                                                            </Typography>
                                                        </Box>
                                                        <Chip
                                                            label={`${totalQuestions} câu hỏi`}
                                                            color="primary"
                                                            size="small"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </Box>

                                                    {children.length > 0 && (
                                                        <Box ml={6}>
                                                            <Typography
                                                                variant="caption"
                                                                color="text.secondary"
                                                                fontWeight={500}
                                                                sx={{ display: 'block', mb: 1 }}
                                                            >
                                                                Phần thi con:
                                                            </Typography>
                                                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                                                {children.map((child, childIdx) => (
                                                                    <Box
                                                                        key={child.id}
                                                                        sx={{
                                                                            display: 'flex',
                                                                            alignItems: 'center',
                                                                            gap: 1,
                                                                            p: 1.5,
                                                                            bgcolor: 'grey.50',
                                                                            borderRadius: 1,
                                                                            border: '1px solid',
                                                                            borderColor: 'grey.200'
                                                                        }}
                                                                    >

                                                                        <Typography variant="body2" fontWeight={500} flex={1}>
                                                                            {child.title || child.type}
                                                                        </Typography>
                                                                        <Chip
                                                                            label={`${child.questions?.length || 0} câu`}
                                                                            size="small"
                                                                            sx={{
                                                                                height: 22,
                                                                                fontSize: '0.7rem',
                                                                                fontWeight: 600,
                                                                                bgcolor: 'white'
                                                                            }}
                                                                        />
                                                                    </Box>
                                                                ))}
                                                            </Box>
                                                        </Box>
                                                    )}
                                                </Box>
                                            </Paper>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 4,
                                        textAlign: 'center',
                                        bgcolor: 'grey.50'
                                    }}
                                >
                                    <Typography variant="body1" color="text.secondary">
                                        Chưa có phần thi nào
                                    </Typography>
                                </Paper>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Box>
        );
    };

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
            <Container maxWidth={false} disableGutters sx={{ px: { xs: 2, sm: 3, md: 4, lg: 6 }, py: 4 }}>
                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 6 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper elevation={6} sx={{ p: { xs: 3, sm: 4, md: 6 }, borderRadius: 3 }}>
                    {renderStepContent()}
                </Paper>

                <Box sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: { xs: "stretch", sm: "center" },
                    flexDirection: { xs: "column-reverse", sm: "row" },
                    gap: 2,
                    mt: 6,
                    pt: 4,
                    borderTop: "1px solid",
                    borderColor: "divider"
                }}>
                    <Button onClick={onClose} size="large" variant="outlined" sx={{ width: { xs: "100%", sm: "auto" } }}>
                        Hủy
                    </Button>
                    <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" }, width: { xs: "100%", sm: "auto" } }}>
                        {activeStep > 0 && (
                            <Button onClick={handleBack} size="large" sx={{ width: { xs: "100%", sm: "auto" } }}>
                                Quay lại
                            </Button>
                        )}
                        {activeStep === steps.length - 1 ? (
                            <Button variant="contained" size="large" onClick={handleFinish} disabled={loading} fullWidth={{ xs: true, sm: false }}>
                                {loading ? "Đang lưu..." : "Hoàn thành"}
                            </Button>
                        ) : (
                            <Button variant="contained" size="large" onClick={handleNext} sx={{ width: { xs: "100%", sm: "auto" } }}>
                                Tiếp theo
                            </Button>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default ExamWizard;