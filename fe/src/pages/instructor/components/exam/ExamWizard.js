import React, { useState, useEffect } from "react";
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

import Step2Content from "./Step2Content";
import ExamInstanceSettingsStep from "./ExamInstanceSettingsStep";

const steps = ["Thông tin bài tập", "Cấu trúc & Câu hỏi", "Cài đặt"];

const ExamWizard = ({ open, onClose, exam }) => {
    const [activeStep, setActiveStep] = useState(0);
    const [loading, setLoading] = useState(false);

    const [examId, setExamId] = useState(null);
    const [sections, setSections] = useState([]);

    const [examData, setExamData] = useState({
        title: "",
        description: "",
    });

    const [instanceData, setInstanceData] = useState(null);

    const [errors, setErrors] = useState({});

    /* ==========================================================
       LOAD DATA KHI EDIT
    ========================================================== */
  /* ==========================================================
   LOAD DATA KHI EDIT
========================================================== */
useEffect(() => {
  if (!exam) return;

  console.log("LOAD exam vào Wizard:", exam);

  // Fill Step 1
  setExamData({
    title: exam.Title || "",
    description: exam.Description || "",
  });

  setExamId(exam.ExamID);

  // Fill Step 2 - Convert sections
  if (Array.isArray(exam.sections)) {
    const flat = [];

    exam.sections.forEach((parent) => {
      const parentId = `p-${parent.SectionID}`;

      flat.push({
        id: parentId,
        type: parent.Type,
        title: parent.Title,
        parentSectionId: null,
        orderIndex: parent.OrderIndex,
      });

      (parent.childSections || []).forEach((child) => {
        const childId = `c-${child.SectionID}`;
        flat.push({
          id: childId,
          type: child.Type,
          title: child.Title,
          parentSectionId: parentId,
          orderIndex: child.OrderIndex,
          questions: child.questions || [],
          fileURL: child.FileURL || null,
        });
      });
    });

    setSections(flat);
  }

  // Fill Step 3 - Instance - CHUẨN HÓA MẢNG
  if (exam.instances && exam.instances.length > 0) {
    const rawInstance = exam.instances[0];

    const normalizedInstance = {
      ...rawInstance,
      InstanceId: rawInstance.InstanceId || rawInstance.instanceId,
      ExamId: rawInstance.ExamId || rawInstance.examId,
      Type: rawInstance.Type || (rawInstance.UnitId ? "Assignment" : "Exam"),
      CourseName: rawInstance.CourseName || rawInstance.courseName,

      // CHUẨN HÓA MẢNG
      ClassId: rawInstance.ClassId != null 
        ? (Array.isArray(rawInstance.ClassId) ? rawInstance.ClassId : [rawInstance.ClassId])
        : null,
      UnitId: rawInstance.UnitId != null 
        ? (Array.isArray(rawInstance.UnitId) ? rawInstance.UnitId : [rawInstance.UnitId])
        : null,
    };

    console.log("Normalized Instance:", normalizedInstance);
    setInstanceData(normalizedInstance);
  }

  setActiveStep(0);
}, [exam]);

    /* ==========================================================
       RESET KHI TẠO BÀI MỚI
    ========================================================== */
    useEffect(() => {
        if (!open || exam) return;
        resetWizard();
    }, [open]);

    const resetWizard = () => {
        setSections([]);
        setExamData({ title: "", description: "" });
        setInstanceData(null);
        setErrors({});
        setActiveStep(0);
    };

    /* ==========================================================
       VALIDATE
    ========================================================== */
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
            alert("Vui lòng thêm ít nhất một phần bài tập");
            return false;
        }

        for (const p of parents) {
            const children = sections.filter(s => s.parentSectionId === p.id);

            if (!children.length) {
                alert(`Phần bài tập "${p.title}" phải có ít nhất 1 phần bài tập nhỏ`);
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

    /* ==========================================================
       CHUYỂN SECTIONS → PAYLOAD GỬI BE
    ========================================================== */
    const convertToHierarchical = (flat) => {
        const parents = flat.filter(s => !s.parentSectionId);

        return parents.map(parent => {
            const children = flat.filter(s => s.parentSectionId === parent.id);

            return {
                type: parent.type,
                title: parent.title || "",
                orderIndex: parent.orderIndex ?? 0,

                childSections: children.map(child => {
                    const validQuestionIds = (child.questions || [])
                        .map(q => q.QuestionID)
                        .filter(id => Number.isInteger(id) && id > 0);

                    const newQuestions = (child.questions || [])
                        .filter(q => q.QuestionID === null)
                        .map(q => ({
                            content: q.content || "",
                            type: q.type || "multiple_choice",
                            level: q.level || "Medium",
                            point: Number(q.point) || 1,
                            topic: q.topic || null,
                            options: q.options || [],
                            correctAnswer: q.correctAnswer || "",
                            matchingPairs: q.matchingPairs || []
                        }));

                    const childPayload = {
                        type: child.type,
                        title: child.title || "",
                        orderIndex: child.orderIndex ?? 0,
                    };

                    if (child.fileURL) childPayload.fileURL = child.fileURL;
                    if (validQuestionIds.length) childPayload.questions = validQuestionIds;
                    if (newQuestions.length) childPayload.newQuestions = newQuestions;

                    return childPayload;
                })
            };
        });
    };

    /* ==========================================================
       HANDLE NEXT
    ========================================================== */
    const handleNext = () => {
        if (activeStep === 0) {
            if (!validateStep1()) return;
            setActiveStep(1);
            return;
        }

        if (activeStep === 1) {
            if (!validateStep2()) return;

            window.examTempSections = convertToHierarchical(sections);
            setActiveStep(2);
            return;
        }
    };

    const handleBack = () => {
        if (activeStep > 0) setActiveStep(activeStep - 1);
    };

    /* ==========================================================
       HIỂN THỊ CÁC STEP
    ========================================================== */
    const renderStepContent = () => {
        if (activeStep === 0) {
            return (
                <Box>
                    <Typography variant="h5" fontWeight={600} mb={3}>
                        Thông tin bài tập
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
                    examId={examId}
                />
            );
        }

        if (activeStep === 2) {
            return (
                <ExamInstanceSettingsStep
                    examData={examData}
                    sections={window.examTempSections}
                    examId={examId}
                    initialInstance={instanceData}   
                    onDone={() => {
                        onClose();
                    }}
                />
            );
        }
    };

    /* ==========================================================
       MAIN UI
    ========================================================== */
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
                        borderTop: "1px solid #e5e7eb",
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
