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
  createExamInstanceApi
} from "../../../../apiServices/instructorExamService";

const ExamInstanceSettingsStep = ({ examId, onDone }) => {
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
  const [maxAttemptsError, setMaxAttemptsError] = useState("");

  const [loading, setLoading] = useState(false);

  const [timeErrors, setTimeErrors] = useState({
    startTime: "",
    endTime: "",
  });

  // ========================= LOAD COURSES =========================
  useEffect(() => {
    loadCourses();
  }, []);

  const loadCourses = async () => {
    try {
      const result = await getInstructorCoursesApi();
      setCourses(result || []);
    } catch (err) {
      console.error("Load courses error:", err);
    }
  };

  // ========================= VALIDATE MAX ATTEMPTS =========================
  const handleChangeMaxAttempts = (value) => {
    if (value === "-" || value === "+") return;

    if (value === "") {
      setMaxAttempts("");
      setMaxAttemptsError("Vui lòng nhập số lần làm bài");
      return;
    }

    let num = Number(value);
    if (isNaN(num)) return;

    if (num < 1) num = 1;
    if (num > 20) num = 20;

    setMaxAttempts(num);

    if (num < 1) setMaxAttemptsError("Số lần làm bài phải ≥ 1");
    else if (num > 20) setMaxAttemptsError("Không được quá 20 lần");
    else setMaxAttemptsError("");
  };

  const preventNegativeKey = (e) => {
    if (e.key === "-" || e.key === "+") e.preventDefault();
  };

  // ========================= VALIDATE DATE TIME =========================
  const validateTimes = (type, startVal, endVal) => {
    const now = new Date();
    let errors = { startTime: "", endTime: "" };

    if (type === "Exam") {
      if (!startVal) errors.startTime = "Exam bắt buộc phải có Start time";
      if (!endVal) errors.endTime = "Exam bắt buộc phải có End time";

      if (startVal) {
        const s = new Date(startVal);
        if (s < now) errors.startTime = "Start time không được nhỏ hơn thời điểm hiện tại";
      }

      if (startVal && endVal) {
        const s = new Date(startVal);
        const e = new Date(endVal);
        if (s >= e) errors.endTime = "End time phải lớn hơn Start time";
      }
    }

    return { errors, isValid: !errors.startTime && !errors.endTime };
  };

  const handleChangeStartTime = (value) => {
    setStartTime(value);
    const { errors } = validateTimes(instanceType, value, endTime);
    setTimeErrors(errors);
  };

  const handleChangeEndTime = (value) => {
    setEndTime(value);
    const { errors } = validateTimes(instanceType, startTime, value);
    setTimeErrors(errors);
  };

  // ========================= LOAD UNITS / CLASSES =========================
  const handleSelectCourse = async (value) => {
    setCourseId(value);
    setUnits([]);
    setClasses([]);
    setSelectedUnits([]);
    setSelectedClasses([]);
    setTimeErrors({ startTime: "", endTime: "" });

    if (!value) return;

    setLoading(true);

    try {
      if (instanceType === "Assignment") {
        const unitList = await getUnitByCourseApi(value);
        setUnits(unitList);
      } else {
        const classList = await getClassesByCourseApi(value);
        setClasses(classList);
      }
    } catch (err) {
      console.error("Load error:", err);
    }

    setLoading(false);
  };

  // ========================= SAVE INSTANCE =========================
  const handleSave = async () => {
    if (!courseId) return alert("Vui lòng chọn khóa học");

    if (instanceType === "Assignment" && selectedUnits.length === 0)
      return alert("Vui lòng chọn ít nhất 1 unit");

    if (instanceType === "Exam" && selectedClasses.length === 0)
      return alert("Vui lòng chọn ít nhất 1 lớp");

    const { errors, isValid } = validateTimes(instanceType, startTime, endTime);
    setTimeErrors(errors);

    if (!isValid || maxAttemptsError) return;

    // 🔥🔥🔥 FIX QUAN TRỌNG: PAYLOAD đúng format mà BE yêu cầu
    const payload = {
      startTime: startTime || null,
      endTime: endTime || null,

      unitId: instanceType === "Assignment" ? selectedUnits : null,
      classId: instanceType === "Exam" ? selectedClasses : null,

      isRandomQuestion,
      isRandomAnswer,

      attempt: Number(maxAttempts)
    };

    console.log("📌 PAYLOAD GỬI LÊN BE:", payload);

    try {
      await createExamInstanceApi(examId, payload);
      alert("Gắn bài thành công!");
      onDone?.();
    } catch (err) {
      console.error("Create exam instance error:", err);
      alert("Có lỗi khi gắn bài!");
    }
  };

  // ========================= RENDER UI =========================
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
            setCourseId("");
            setUnits([]);
            setClasses([]);
            setSelectedUnits([]);
            setSelectedClasses([]);
            setStartTime("");
            setEndTime("");
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
          onChange={(e) => handleSelectCourse(e.target.value)}
          sx={{ mb: 3 }}
        >
          {courses.map((c) => (
            <MenuItem key={c.value} value={c.value}>
              {c.label}
            </MenuItem>
          ))}
        </TextField>

        {instanceType === "Assignment" && courseId && !loading && (
          <Autocomplete
            multiple
            options={units}
            getOptionLabel={(u) => u.UnitName || ""}
            value={units.filter((u) => selectedUnits.includes(u.UnitID))}
            onChange={(e, val) => setSelectedUnits(val.map((u) => u.UnitID))}
            renderInput={(params) => <TextField {...params} label="Chọn Units" />}
          />
        )}

        {instanceType === "Exam" && courseId && !loading && (
          <Autocomplete
            multiple
            options={classes}
            getOptionLabel={(c) => c.ClassName}
            value={classes.filter((c) => selectedClasses.includes(c.ClassID))}
            onChange={(e, val) =>
              setSelectedClasses(val.map((c) => c.ClassID))
            }
            renderInput={(params) => <TextField {...params} label="Chọn lớp" />}
          />
        )}

        {loading && (
          <Box textAlign="center" mt={2}>
            <CircularProgress size={24} />
          </Box>
        )}
      </Paper>

      {/* SETTINGS */}
      <Paper sx={{ p: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              type="datetime-local"
              label="Start time"
              InputLabelProps={{ shrink: true }}
              value={startTime}
              onChange={(e) => handleChangeStartTime(e.target.value)}
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
              onChange={(e) => handleChangeEndTime(e.target.value)}
              error={!!timeErrors.endTime}
              helperText={timeErrors.endTime}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isRandomQuestion}
                  onChange={(e) => setIsRandomQuestion(e.target.checked)}
                />
              }
              label="Xáo trộn câu hỏi"
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={isRandomAnswer}
                  onChange={(e) => setIsRandomAnswer(e.target.checked)}
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
              onChange={(e) => handleChangeMaxAttempts(e.target.value)}
              onKeyDown={preventNegativeKey}
              error={!!maxAttemptsError}
              helperText={maxAttemptsError}
              inputProps={{ min: 1, max: 20, step: 1 }}
            />
          </Grid>
        </Grid>
      </Paper>

      <Box mt={3} textAlign="right">
        <Button variant="contained" size="large" onClick={handleSave}>
          Hoàn tất
        </Button>
      </Box>
    </Box>
  );
};

export default ExamInstanceSettingsStep;
