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
  Alert,
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

  useEffect(() => {
    (async () => {
      try {
        const result = await getInstructorCoursesApi();
        setCourses(result || []);
      } catch (err) {
        console.error(" Load courses error:", err);
      }
    })();
  }, []);

  useEffect(() => {
    if (!initialInstance || courses.length === 0) return;

    const inst = initialInstance;

    const typeFromServer =
      inst.Type || (inst.UnitId ? "Assignment" : "Exam");
    setInstanceType(typeFromServer);

    const foundCourse = courses.find((c) => c.label === inst.CourseName);
    if (foundCourse) {
      setCourseId(foundCourse.value);
    } else {
      console.warn(" Course not found for:", inst.CourseName);
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
    if (inst.ClassId != null) {
      const classIds = Array.isArray(inst.ClassId)
        ? inst.ClassId
        : [inst.ClassId];
      setSelectedClasses(classIds);
      setSelectedUnits([]);
    }

    if (inst.UnitId != null) {
      const unitIds = Array.isArray(inst.UnitId)
        ? inst.UnitId
        : [inst.UnitId];
      setSelectedUnits(unitIds);
      setSelectedClasses([]);
    }
  }, [initialInstance, courses]);

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      setLoading(true);
      try {
        if (instanceType === "Exam") {
          const cls = await getClassesByCourseApi(courseId);
          setClasses(cls || []);
        } else {
          const uts = await getUnitByCourseApi(courseId);
          setUnits(uts || []);
        }
      } catch (err) {
        console.error("Load class/unit error:", err);
      }
      setLoading(false);
    })();
  }, [courseId, instanceType]);

  const validateTimes = () => {
    const errors = { startTime: "", endTime: "" };
    const now = new Date();
    now.setSeconds(0, 0);

    if (instanceType === "Exam") {
      if (!startTime) errors.startTime = "Exam bắt buộc phải có thời gian bắt đầu";
      if (!endTime) errors.endTime = "Exam bắt buộc phải có thời gian kết thúc";
    }
    if (instanceType === "Assignment") {
      const hasStart = !!startTime;
      const hasEnd = !!endTime;
      if (hasStart && !hasEnd) {
        errors.endTime = "Vui lòng chọn thời gian kết thúc hoặc bỏ trống cả 2 để vô thời hạn";
      }
      if (!hasStart && hasEnd) {
        errors.startTime = "Vui lòng chọn thời gian bắt đầu hoặc bỏ trống cả 2 để vô thời hạn";
      }
    }

    if (startTime) {
      const selectedStartTime = new Date(startTime);
      if (selectedStartTime < now) {
        errors.startTime = "Thời gian bắt đầu không thể là thời điểm trong quá khứ";
      }
    }

    if (startTime && endTime && new Date(startTime) >= new Date(endTime)) {
      errors.endTime = "Thời gian kết thúc phải lớn hơn thời gian bắt đầu";
    }

    return { errors, isValid: !errors.startTime && !errors.endTime };
  };

  const handleSave = async () => {
    if (loading || isSubmitting) return;

    const { errors, isValid } = validateTimes();
    setTimeErrors(errors);
    if (!isValid) return;

    if (!courseId) {
      alert("Vui lòng chọn khóa học");
      return;
    }
    const classIds = instanceType === "Exam"
      ? (Array.isArray(selectedClasses) ? selectedClasses : [])
      : [];

    const unitIds = instanceType === "Assignment"
      ? (Array.isArray(selectedUnits) ? selectedUnits : [])
      : [];

    if (classIds.length === 0 && unitIds.length === 0) {
      alert("Vui lòng chọn Lớp (Exam) hoặc Unit (Assignment)");
      return;
    }

    const attemptValue = Math.max(1, Number(maxAttempts) || 1);

    try {
      setIsSubmitting(true);
      setLoading(true);
      if (isEditMode) {
        const instanceId = initialInstance?.InstanceId || initialInstance?.instanceId;
        const examId = initialInstance?.ExamId || initialInstance?.examId;

        if (!instanceId || !examId) {
          throw new Error("Missing instanceId or examId");
        }

        const payload = {
          instanceType,
          attempt: attemptValue,
          isRandomQuestion,
          isRandomAnswer,
        };
        if (startTime) payload.startTime = startTime;
        if (endTime) payload.endTime = endTime;
        if (instanceType === "Exam") {
          payload.classId = classIds; 
        } else {
          payload.unitId = unitIds; 
        }

        await updateExamInstanceApi(examId, instanceId, payload);
        alert("Cập nhật bài tập thành công!");
      }
   
      else {
        const payload = {
          instanceType,
          attempt: attemptValue,
          isRandomQuestion,
          isRandomAnswer,
        };
        if (startTime) payload.startTime = startTime;
        if (endTime) payload.endTime = endTime;
        if (instanceType === "Exam") {
          payload.classId = classIds; 
        } else {
          payload.unitId = unitIds; 
        }
        await createFullExamApi({
          exam: examData,
          sections,
          instance: payload,
        });
        alert("Tạo bài tập thành công!");
      }

      onDone?.();
    } catch (err) {
      alert(
        err?.response?.data?.message || err?.message || "Lỗi khi lưu dữ liệu!"
      );
    } finally {
      setIsSubmitting(false);
      setLoading(false);
    }
  };
  
  const isUnlimitedTime = instanceType === "Assignment" && !startTime && !endTime;
  
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
            setTimeErrors({ startTime: "", endTime: "" });
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
              label={instanceType === "Exam" ? "Ngày bắt đầu *" : "Start time (tùy chọn)"}
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (timeErrors.startTime) {
                  setTimeErrors({ ...timeErrors, startTime: "" });
                }
              }}
              inputProps={{
                min: new Date().toISOString().slice(0, 16)
              }}
              error={!!timeErrors.startTime}
              helperText={timeErrors.startTime}
            />
          </Grid>

          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label={instanceType === "Exam" ? "Ngày kết thúc *" : "Ngày kết thúc *"}
              InputLabelProps={{ shrink: true }}
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (timeErrors.endTime) {
                  setTimeErrors({ ...timeErrors, endTime: "" });
                }
              }}
              error={!!timeErrors.endTime}
              helperText={timeErrors.endTime}
            />
          </Grid>
          
          {instanceType === "Assignment" && (
            <Grid item xs={12}>
              <Alert severity="info">
                <strong>Assignment:</strong> Có thể bỏ trống cả 2 trường thời gian để tạo bài tập vô thời hạn
              </Alert>
            </Grid>
          )}
          
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