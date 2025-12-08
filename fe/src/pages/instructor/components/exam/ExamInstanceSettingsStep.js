// --- phần import giữ nguyên ---
import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Checkbox,
  FormControlLabel,
  Typography,
  Button,
  Paper,
  Autocomplete,
  CircularProgress,
} from "@mui/material";

import {
  getInstructorCoursesApi,
  getUnitByCourseApi,
  getClassesByCourseApi,
  createFullExamApi,
  updateExamInstanceApi,
} from "../../../../apiServices/instructorExamService";

const ExamInstanceSettingsStep = ({
  examData,
  sections,
  onDone,
  initialInstance,
}) => {
  const isEditMode = !!initialInstance;

  const [instanceType, setInstanceType] = useState("Exam");
  const [courses, setCourses] = useState([]);
  const [courseId, setCourseId] = useState("");

  const [units, setUnits] = useState([]);
  const [classes, setClasses] = useState([]);

  const [selectedUnits, setSelectedUnits] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);

  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");

  const [isRandomQuestion, setIsRandomQuestion] = useState(false);
  const [isRandomAnswer, setIsRandomAnswer] = useState(false);
  const [maxAttempts, setMaxAttempts] = useState(1);

  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timeErrors, setTimeErrors] = useState({
    startTime: "",
    endTime: "",
  });

  /* ======================
      LOAD COURSES
  ====================== */
  useEffect(() => {
    (async () => {
      try {
        const result = await getInstructorCoursesApi();
        console.log("✅ Loaded courses:", result);
        setCourses(result || []);
      } catch (err) {
        console.error("❌ Load courses error:", err);
      }
    })();
  }, []);

  /* ======================
      PREFILL WHEN EDIT - ĐẢM BẢO LUÔN LÀ MẢNG
  ====================== */
  useEffect(() => {
    if (!initialInstance || courses.length === 0) return;

    console.log("📋 Prefilling with initialInstance:", initialInstance);

    const inst = initialInstance;

    const typeFromServer =
      inst.Type || (inst.UnitId ? "Assignment" : "Exam");
    setInstanceType(typeFromServer);

    const foundCourse = courses.find((c) => c.label === inst.CourseName);
    if (foundCourse) {
      console.log("✅ Found course:", foundCourse);
      setCourseId(foundCourse.value);
    } else {
      console.warn("⚠️ Course not found for:", inst.CourseName);
    }

    if (inst.StartTime) {
      setStartTime(inst.StartTime.replace(" ", "T").slice(0, 16));
    }
    if (inst.EndTime) {
      setEndTime(inst.EndTime.replace(" ", "T").slice(0, 16));
    }

    setIsRandomQuestion(!!inst.isRandomQuestion);
    setIsRandomAnswer(!!inst.isRandomAnswer);
    setMaxAttempts(inst.Attempt || 1);

    // ✅ ĐẢM BẢO LUÔN LÀ MẢNG
    if (inst.ClassId != null) {
      const classIds = Array.isArray(inst.ClassId) 
        ? inst.ClassId 
        : [inst.ClassId];
      
      console.log("✅ Setting selectedClasses:", classIds, "Type:", typeof classIds);
      setSelectedClasses(classIds);
      setSelectedUnits([]);
    }
    
    if (inst.UnitId != null) {
      const unitIds = Array.isArray(inst.UnitId) 
        ? inst.UnitId 
        : [inst.UnitId];
      
      console.log("✅ Setting selectedUnits:", unitIds, "Type:", typeof unitIds);
      setSelectedUnits(unitIds);
      setSelectedClasses([]);
    }
  }, [initialInstance, courses]);

  /* ======================
      LOAD CLASS / UNIT
  ====================== */
  useEffect(() => {
    if (!courseId) return;

    (async () => {
      setLoading(true);
      try {
        if (instanceType === "Exam") {
          const cls = await getClassesByCourseApi(courseId);
          console.log("✅ Loaded classes:", cls);
          setClasses(cls || []);
        } else {
          const uts = await getUnitByCourseApi(courseId);
          console.log("✅ Loaded units:", uts);
          setUnits(uts || []);
        }
      } catch (err) {
        console.error("❌ Load class/unit error:", err);
      }
      setLoading(false);
    })();
  }, [courseId, instanceType]);

  /* ======================
      VALIDATE TIME
  ====================== */
  const validateTimes = () => {
    const errors = { startTime: "", endTime: "" };

    if (!startTime) errors.startTime = "Start time bắt buộc";
    if (!endTime) errors.endTime = "End time bắt buộc";

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      errors.endTime = "End time phải lớn hơn Start time";
    }

    return { errors, isValid: !errors.startTime && !errors.endTime };
  };

  /* ======================
      SUBMIT - ✅ FIX ĐẢM BẢO MẢNG
  ====================== */
  const handleSave = async () => {
    if (loading || isSubmitting) return;

    const { errors, isValid } = validateTimes();
    setTimeErrors(errors);
    if (!isValid) return;

    if (!courseId) {
      alert("Vui lòng chọn khóa học");
      return;
    }

    // ✅ ĐẢM BẢO LUÔN LÀ MẢNG - KIỂM TRA KỸ
    const classIds = instanceType === "Exam" 
      ? (Array.isArray(selectedClasses) ? selectedClasses : [])
      : [];
      
    const unitIds = instanceType === "Assignment" 
      ? (Array.isArray(selectedUnits) ? selectedUnits : [])
      : [];

    console.log("📋 Before validation:");
    console.log("  - instanceType:", instanceType);
    console.log("  - selectedClasses:", selectedClasses, "isArray:", Array.isArray(selectedClasses));
    console.log("  - selectedUnits:", selectedUnits, "isArray:", Array.isArray(selectedUnits));
    console.log("  - classIds:", classIds, "length:", classIds.length);
    console.log("  - unitIds:", unitIds, "length:", unitIds.length);

    if (classIds.length === 0 && unitIds.length === 0) {
      alert("Vui lòng chọn Lớp (Exam) hoặc Unit (Assignment)");
      return;
    }

    const attemptValue = Math.max(1, Number(maxAttempts) || 1);

    try {
      setIsSubmitting(true);
      setLoading(true);

      // ==================== EDIT MODE ====================
      if (isEditMode) {
        const instanceId = initialInstance?.InstanceId || initialInstance?.instanceId;
        const examId = initialInstance?.ExamId || initialInstance?.examId;

        if (!instanceId || !examId) {
          throw new Error("Missing instanceId or examId");
        }

        const payload = {
          instanceType,
          startTime,
          endTime,
          attempt: attemptValue,
          isRandomQuestion,
          isRandomAnswer,
        };

        // ✅ GÁN ĐÚNG KIỂU MẢNG
        if (instanceType === "Exam") {
          payload.classId = classIds; // ← Luôn là mảng
        } else {
          payload.unitId = unitIds; // ← Luôn là mảng
        }

        console.log("🚀 EDIT PAYLOAD:", JSON.stringify(payload, null, 2));
        console.log("  - examId:", examId);
        console.log("  - instanceId:", instanceId);

        await updateExamInstanceApi(examId, instanceId, payload);
        alert("Cập nhật bài tập thành công!");
      }
      // ==================== CREATE MODE ====================
      else {
        const payload = {
          instanceType,
          startTime,
          endTime,
          attempt: attemptValue,
          isRandomQuestion,
          isRandomAnswer,
        };

        // ✅ GÁN ĐÚNG KIỂU MẢNG
        if (instanceType === "Exam") {
          payload.classId = classIds; // ← Luôn là mảng
        } else {
          payload.unitId = unitIds; // ← Luôn là mảng
        }

        console.log("🚀 CREATE PAYLOAD:", JSON.stringify({
          exam: examData,
          sections: sections,
          instance: payload,
        }, null, 2));

        await createFullExamApi({
          exam: examData,
          sections,
          instance: payload,
        });
        alert("Tạo bài tập thành công!");
      }

      onDone?.();
    } catch (err) {
      console.error("❌ Submit error:", err);
      console.error("  - Response:", err?.response?.data);
      console.error("  - Message:", err?.message);
      
      alert(
        err?.response?.data?.message || err?.message || "Lỗi khi lưu dữ liệu!"
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };

  /* ======================
      UI
  ====================== */
  return (
    <Box>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Gắn bài & Cài đặt
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <TextField
          select
          fullWidth
          label="Loại bài"
          value={instanceType}
          onChange={(e) => {
            setInstanceType(e.target.value);
            setSelectedUnits([]);
            setSelectedClasses([]);
          }}
          sx={{ mb: 3 }}
        >
          <MenuItem value="Assignment">Assignment</MenuItem>
          <MenuItem value="Exam">Exam</MenuItem>
        </TextField>

        <TextField
          select
          fullWidth
          label="Khóa học"
          value={courseId}
          onChange={(e) => setCourseId(e.target.value)}
          sx={{ mb: 3 }}
        >
          {courses.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        {instanceType === "Assignment" && !loading && (
          <Autocomplete
            multiple
            options={units}
            getOptionLabel={(u) => u.UnitName}
            value={units.filter((u) => selectedUnits.includes(u.UnitID))}
            onChange={(e, val) => {
              const newUnitIds = val.map((u) => u.UnitID);
              console.log("✅ Selected units changed:", newUnitIds);
              setSelectedUnits(newUnitIds);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Chọn Units" />
            )}
          />
        )}

        {instanceType === "Exam" && !loading && (
          <Autocomplete
            multiple
            options={classes}
            getOptionLabel={(c) => c.ClassName}
            value={classes.filter((c) => selectedClasses.includes(c.ClassID))}
            onChange={(e, val) => {
              const newClassIds = val.map((c) => c.ClassID);
              console.log("✅ Selected classes changed:", newClassIds);
              setSelectedClasses(newClassIds);
            }}
            renderInput={(params) => (
              <TextField {...params} label="Chọn Lớp" />
            )}
          />
        )}

        {loading && (
          <Box textAlign="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Start time"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              error={!!timeErrors.startTime}
              helperText={timeErrors.startTime}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="End time"
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              error={!!timeErrors.endTime}
              helperText={timeErrors.endTime}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRandomQuestion}
                  onChange={(e) =>
                    setIsRandomQuestion(e.target.checked)
                  }
                />
              }
              label="Xáo trộn câu hỏi"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isRandomAnswer}
                  onChange={(e) =>
                    setIsRandomAnswer(e.target.checked)
                  }
                />
              }
              label="Xáo trộn đáp án"
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="number"
              label="Số lần làm bài"
              value={maxAttempts}
              onChange={(e) => setMaxAttempts(e.target.value)}
              inputProps={{ min: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box mt={3} textAlign="right">
        <Button
          variant="contained"
          size="large"
          onClick={handleSave}
          disabled={loading || isSubmitting}
        >
          {loading || isSubmitting ? "Đang xử lý..." : "Hoàn tất"}
        </Button>
      </Box>
    </Box>
  );
};

export default ExamInstanceSettingsStep;