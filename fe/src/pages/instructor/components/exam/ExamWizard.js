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
    Paper,
    Container
} from "@mui/material";

import {
    createExamApi,
    updateExamApi,
    getExamByIdApi,
} from "../../../../apiServices/instructorExamService";

import Step2Content from "./Step2Content";
import ExamInstanceSettingsStep from "./ExamInstanceSettingsStep";

const steps = ["Thông tin bài thi", "Phần thi & Câu hỏi", "Gắn bài & Cài đặt"];

const ExamWizard = ({
    open,
    onClose,
    onSave,
    mode = "create",
    initialData = null,
    examId: editId,
    onError
}) => {

    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [sections, setSections] = useState([]);
    const [examId, setExamId] = useState(null);

    const [examData, setExamData] = useState({
        title: "",
        description: "",
    });

    const [errors, setErrors] = useState({});
    const isInitialLoadRef = useRef(true);

    useEffect(() => {
        if (!open) return;

        if (mode === "edit" && editId) {
            loadExam(editId);
        } else {
            resetWizard();
        }
    }, [open, mode, editId]);

    const resetWizard = () => {
        setSections([]);
        setExamId(null);
        setExamData({
            title: "",
            description: "",
        });
        setErrors({});
        setActiveStep(0);
    };

    const loadExam = async (id) => {
        try {
            const data = await getExamByIdApi(id);

            setExamId(id);

            setExamData({
                title: data.Title || "",
                description: data.Description || "",
            });

            const mapped = [];
            (data.sections || []).forEach(parent => {
                const children = parent.childSections || parent.ChildSections || [];

                mapped.push({
                    id: parent.SectionId,
                    title: parent.Title || parent.Type,
                    type: parent.Type,
                    orderIndex: parent.OrderIndex,
                    parentSectionId: null,
                    questions: parent.Questions || []
                });

                children.forEach(child => {
                    mapped.push({
                        id: child.SectionId,
                        title: child.Title || child.Type,
                        type: child.Type,
                        orderIndex: child.OrderIndex,
                        parentSectionId: parent.SectionId,
                        fileURL: child.FileURL || null,
                        questions: child.Questions || [],
                    });
                });
            });

            setSections(mapped);
        } catch (err) {
            console.error("Load exam failed:", err);
        }
    };

    const validateStep1 = () => {
        const newErrors = {};
        if (!examData.title.trim()) newErrors.title = "Tiêu đề bắt buộc";
        if (!examData.description.trim()) newErrors.description = "Mô tả bắt buộc";
        setErrors(newErrors);

        return Object.keys(newErrors).length === 0;
    };

    const validateStep2 = () => {
        const parents = sections.filter(s => !s.parentSectionId);

        if (!parents.length) {
            alert("Vui lòng thêm ít nhất một phần thi");
            return false;
        }

        for (const p of parents) {
            const children = sections.filter(s => s.parentSectionId === p.id);
            if (!children.length) {
                alert(`Phần thi "${p.title}" phải có ít nhất 1 phần thi con`);
                return false;
            }
            for (const c of children) {
                if (!c.questions?.length) {
                    alert(`"${c.title}" phải có ít nhất 1 câu hỏi`);
                    return false;
                }
            }
        }
        return true;
    };

    const convertToHierarchical = (flat) => {
        const parents = flat.filter(s => !s.parentSectionId);

        return parents.map(parent => {
            const children = flat.filter(s => s.parentSectionId === parent.id);

            return {
                type: parent.type,
                title: parent.title,
                orderIndex: parent.orderIndex,
                childSections: children.map(child => ({
                    type: child.type,
                    title: child.title,
                    orderIndex: child.orderIndex,
                    fileURL: child.fileURL || null,
                    questions: child.questions.map(q => q.QuestionID || q.id)
                }))
            };
        });
    };

    const handleNext = async () => {
        if (activeStep === 0) {
            if (!validateStep1()) return;
            setActiveStep(1);
            return;
        }

        if (activeStep === 1) {
            if (!validateStep2()) return;

            setLoading(true);
            try {
                const hierarchical = convertToHierarchical(sections);
                let finalExamId = examId;

                if (mode === "create") {
                    const payload = {
                        title: examData.title,
                        description: examData.description,
                        sections: hierarchical,
                    };

                    const res = await createExamApi(payload);
                    finalExamId = res.examId;
                    setExamId(finalExamId);
                } else {
                    await updateExamApi(finalExamId, {
                        title: examData.title,
                        description: examData.description,
                        sections: hierarchical,
                    });
                }

                setActiveStep(2);
            } catch (err) {
                console.error(err);
                alert("Không thể lưu đề thi. Vui lòng thử lại.");
            }
            setLoading(false);
            return;
        }
    };

    const handleBack = () => {
        if (activeStep === 0) return;
        setActiveStep(activeStep - 1);
    };

    // STEP 3 Content
    const renderStepContent = () => {
        if (activeStep === 0) {
            return (
                <Box>
                    <Typography variant="h5" fontWeight={600} mb={3}>
                        Thông tin bài thi
                    </Typography>

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <TextField
                                label="Tiêu đề *"
                                fullWidth
                                value={examData.title}
                                onChange={(e) =>
                                    setExamData({ ...examData, title: e.target.value })
                                }
                                error={!!errors.title}
                                helperText={errors.title}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                label="Mô tả *"
                                fullWidth
                                multiline
                                rows={3}
                                value={examData.description}
                                onChange={(e) =>
                                    setExamData({ ...examData, description: e.target.value })
                                }
                                error={!!errors.description}
                                helperText={errors.description}
                            />
                        </Grid>
                    </Grid>
                </Box>
            );
        }

        if (activeStep === 1) {
            return (
                <Step2Content
                    sections={sections}
                    setSections={setSections}
                    onError={(e) => console.error(e)}
                />
            );
        }

        if (activeStep === 2) {
            return (
                <ExamInstanceSettingsStep
                    examId={examId}
                    onDone={() => {
                        alert("Tạo bài thi thành công!");
                        onClose();  // ⬅⬅⬅ Sửa lại đây
                    }}
                />
            );
        }

    };

    return (
        <Box sx={{ bgcolor: "#f8fafc", minHeight: "100vh" }}>
            <Container maxWidth="lg">
                <Stepper activeStep={activeStep} sx={{ mb: 5 }}>
                    {steps.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                    ))}
                </Stepper>

                <Paper sx={{ p: 4, borderRadius: 3 }} elevation={3}>
                    {renderStepContent()}
                </Paper>

                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        mt: 4,
                        pt: 3,
                        borderTop: "1px solid #e5e7eb"
                    }}
                >
                    <Button variant="outlined" onClick={onClose}>
                        Hủy
                    </Button>

                    <Box>
                        {activeStep > 0 && (
                            <Button sx={{ mr: 2 }} onClick={handleBack}>
                                Quay lại
                            </Button>
                        )}

                        {activeStep < 2 && (
                            <Button
                                variant="contained"
                                onClick={handleNext}
                                disabled={loading}
                            >
                                {activeStep === 1 ? "Lưu & Tiếp tục" : "Tiếp theo"}
                            </Button>
                        )}
                    </Box>
                </Box>
            </Container>
        </Box>
    );
};

export default ExamWizard;
