import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Person,
  Email,
  Phone,
  CalendarToday,
  SwapHoriz,
} from "@mui/icons-material";
import "./StudentSelector.css";
import ChangeClassDialog from "../refund/ChangeClassDialog";
import learnerService from "../../../../apiServices/learnerService";
import classService from "../../../../apiServices/classService";

const StudentSelector = ({
  classData,
  allLearners,
  onClose,
  onUpdate,
  onChangeClass,
  userRole, // "admin" hoặc "staff" - để ẩn nút đổi lớp cho staff
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [changeClassDialogOpen, setChangeClassDialogOpen] = useState(false);
  const [selectedTargetClass, setSelectedTargetClass] = useState(null);

  // States for learner detail
  const [learnerDetail, setLearnerDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // States for change class dialog
  const [classOptions, setClassOptions] = useState([]);
  const [classScheduleSummaries, setClassScheduleSummaries] = useState({});
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [errorClasses, setErrorClasses] = useState("");
  const [learnerSchedule, setLearnerSchedule] = useState([]);

  // Lấy danh sách ID học viên đã enroll
  // enrolledStudents có thể là mảng IDs hoặc mảng enrollment objects
  const enrolledStudentIds = useMemo(() => {
    const enrolled = classData.enrolledStudents || [];
    if (!Array.isArray(enrolled)) {
      return [];
    }

    // Nếu là mảng objects (enrollments), lấy LearnerID từ mỗi object
    if (
      enrolled.length > 0 &&
      typeof enrolled[0] === "object" &&
      enrolled[0] !== null
    ) {
      const ids = enrolled
        .map((enrollment) => {
          const id = enrollment.LearnerID || enrollment.Learner?.LearnerID;
          return id;
        })
        .filter((id) => id !== undefined && id !== null);
      return ids;
    }

    // Nếu là mảng IDs, trả về trực tiếp
    const ids = enrolled.filter((id) => id !== undefined && id !== null);
    return ids;
  }, [classData.enrolledStudents, allLearners]);

  // Lấy danh sách học viên đã enroll (chỉ hiển thị những người đã enroll)
  const enrolledLearners = useMemo(() => {
    if (!Array.isArray(allLearners)) {
      return [];
    }

    const filtered = allLearners.filter((learner) => {
      if (!learner) return false;
      const learnerId = learner.LearnerID;
      // So sánh với nhiều cách để tránh type mismatch
      const isEnrolled = enrolledStudentIds.some(
        (id) =>
          id === learnerId ||
          id === parseInt(learnerId) ||
          parseInt(id) === learnerId ||
          String(id) === String(learnerId) ||
          Number(id) === Number(learnerId)
      );
      return isEnrolled;
    });

    return filtered;
  }, [allLearners, enrolledStudentIds]);

  // Lọc theo search term
  const filteredEnrolledLearners = enrolledLearners.filter((learner) => {
    if (!learner) return false;
    const fullName = learner.FullName || learner.fullName || "";
    const email = learner.Email || learner.email || "";
    const phone = learner.Phone || learner.phone || "";
    const searchLower = searchTerm.toLowerCase();

    return (
      fullName.toLowerCase().includes(searchLower) ||
      email.toLowerCase().includes(searchLower) ||
      phone.includes(searchTerm)
    );
  });

  const handleMenuOpen = (event, learner) => {
    setAnchorEl(event.currentTarget);
    setSelectedLearner(learner);
  };

  const handleMenuClose = (keepSelected = false) => {
    setAnchorEl(null);
    if (!keepSelected) {
      setSelectedLearner(null);
    }
  };

  const handleViewDetail = async () => {
    if (!selectedLearner) return;

    const learnerId = selectedLearner.LearnerID || selectedLearner.id;
    if (!learnerId) {
      return;
    }

    setLoadingDetail(true);
    setShowDetailDialog(true);
    handleMenuClose(true); // giữ selectedLearner để dialog dùng

    try {
      const detail = await learnerService.getLearnerById(learnerId);
      setLearnerDetail(detail);
    } catch (error) {
      console.error("[StudentSelector] Error fetching learner detail:", error);
      // Fallback to selectedLearner if API fails
      setLearnerDetail(selectedLearner);
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleOpenChangeClassDialog = async () => {
    if (!selectedLearner || !classData) return;

    setChangeClassDialogOpen(true);
    setSelectedTargetClass(null);
    setLoadingClasses(true);
    setErrorClasses("");
    // Đóng menu nhưng giữ selectedLearner để dùng trong confirm
    handleMenuClose(true);

    try {
      // Get learner schedule to check conflicts
      const learnerId = selectedLearner.LearnerID || selectedLearner.id;
      const schedule = await learnerService.getLearnerSchedule(learnerId);
      const normalizedSchedule = Array.isArray(schedule) ? schedule : [];
      setLearnerSchedule(normalizedSchedule);

      // Get all classes with same CourseID and InstructorID, excluding current class
      const currentClassId = classData.ClassID || classData.id;
      const courseId = classData.CourseID || classData.courseId;
      const instructorId = classData.InstructorID || classData.instructorId;

      if (!courseId || !instructorId) {
        throw new Error("Không tìm thấy thông tin khóa học hoặc giảng viên");
      }

      // Get all classes
      const allClasses = await classService.getAllClasses();

      // Filter: same CourseID and InstructorID, status ACTIVE, exclude current class
      const relatedClasses = allClasses.filter((cls) => {
        const clsId = cls.ClassID || cls.id;
        const clsCourseId = cls.CourseID || cls.courseId;
        const clsInstructorId = cls.InstructorID || cls.instructorId;
        const clsStatus = cls.Status || cls.status;

        return (
          clsId !== currentClassId &&
          clsCourseId === courseId &&
          clsInstructorId === instructorId &&
          clsStatus === "ACTIVE"
        );
      });

      // Load schedule summaries + conflict check
      const summaries = {};
      const nonConflictClasses = [];

      const hasConflict = (classSessions) => {
        if (!Array.isArray(classSessions) || classSessions.length === 0) {
          return false;
        }
        return classSessions.some((session) => {
          const sessionDate = session.Date;
          if (!sessionDate) return false;

          // Normalize start/end
          const toMinutes = (t) => {
            if (!t) return null;
            const [h, m] = String(t)
              .split(":")
              .map((x) => parseInt(x, 10));
            if (Number.isNaN(h) || Number.isNaN(m)) return null;
            return h * 60 + m;
          };
          const sStart = toMinutes(session.StartTime);
          const sEnd = toMinutes(session.EndTime);
          const sSlot = session.TimeslotID || session.timeslotId;

          return normalizedSchedule.some((item) => {
            if (!item.Date) return false;
            if (
              String(item.Date).slice(0, 10) !==
              String(sessionDate).slice(0, 10)
            ) {
              return false;
            }

            const iStart = toMinutes(item.StartTime);
            const iEnd = toMinutes(item.EndTime);
            const iSlot = item.TimeslotID || item.timeslotId;

            // If timeslot match and date match => conflict
            if (sSlot && iSlot && String(sSlot) === String(iSlot)) {
              return true;
            }

            // If both have time range -> check overlap
            if (
              sStart !== null &&
              sEnd !== null &&
              iStart !== null &&
              iEnd !== null
            ) {
              return sStart < iEnd && iStart < sEnd;
            }

            return false;
          });
        });
      };

      await Promise.all(
        relatedClasses.map(async (cls) => {
          const classId = cls.ClassID || cls.id;
          if (!classId) return;
          try {
            const sessions = await classService.getClassSessionsForFrontend(
              classId
            );
            if (Array.isArray(sessions) && sessions.length > 0) {
              const summary = buildClassScheduleSummary(sessions);
              summaries[classId] = summary;
              if (!hasConflict(sessions)) {
                nonConflictClasses.push(cls);
              }
            } else {
              // No sessions -> treat as non-conflict
              nonConflictClasses.push(cls);
            }
          } catch (err) {
            console.error(
              "[StudentSelector] Error loading sessions for class:",
              err
            );
          }
        })
      );

      setClassScheduleSummaries(summaries);
      setClassOptions(nonConflictClasses);

      if (nonConflictClasses.length === 0) {
        setErrorClasses("Không có lớp nào phù hợp (trùng lịch với học viên).");
      }
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Không thể tải danh sách lớp";
      setErrorClasses(errorMessage);
      setClassOptions([]);
    } finally {
      setLoadingClasses(false);
    }
  };

  // Build schedule summary string from sessions (e.g., "T2: 19:00-21:00 | T5: 19:00-21:00")
  const buildClassScheduleSummary = (sessions) => {
    if (!Array.isArray(sessions) || sessions.length === 0) return "";

    const dayMap = {
      0: "CN",
      1: "T2",
      2: "T3",
      3: "T4",
      4: "T5",
      5: "T6",
      6: "T7",
    };

    const byDay = {};

    sessions.forEach((s) => {
      if (!s.Date) return;
      const date = new Date(s.Date);
      if (Number.isNaN(date.getTime())) return;
      const dayKey = dayMap[date.getDay()] || "";
      if (!dayKey) return;

      const start =
        (s.StartTime && String(s.StartTime).slice(0, 5)) || undefined;
      const end = (s.EndTime && String(s.EndTime).slice(0, 5)) || undefined;
      const range =
        start && end ? `${start}-${end}` : start || end || "Không rõ giờ";

      if (!byDay[dayKey]) {
        byDay[dayKey] = new Set();
      }
      byDay[dayKey].add(range);
    });

    const parts = Object.keys(byDay)
      .sort()
      .map((day) => {
        const times = Array.from(byDay[day]).join(", ");
        return `${day}: ${times}`;
      });

    return parts.join(" | ");
  };

  const getClassScheduleSummary = (cls) => {
    if (!cls) return "";
    const classId = cls.ClassID || cls.id;
    if (!classId) return "";
    return classScheduleSummaries[classId] || "";
  };

  const handleConfirmChangeClass = () => {
    if (!selectedLearner || !selectedTargetClass) {
      setChangeClassDialogOpen(false);
      setSelectedTargetClass(null);
      return;
    }

    const learnerId = selectedLearner.LearnerID || selectedLearner.id;
    const targetClassId =
      selectedTargetClass.ClassID ||
      selectedTargetClass.id ||
      selectedTargetClass.value;

    if (typeof onChangeClass === "function") {
      onChangeClass(
        {
          learnerId,
          learner: selectedLearner,
        },
        targetClassId,
        selectedTargetClass
      );
    }

    setChangeClassDialogOpen(false);
    setSelectedTargetClass(null);
  };

  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setSelectedLearner(null);
    setLearnerDetail(null);
  };

  return (
    <div className="student-selector-overlay">
      <div className="student-selector-container">
        <div className="selector-header">
          <div>
            <h2>Quản lý học viên</h2>
            <p className="class-name">
              {classData.Name || classData.title || ""}
            </p>
          </div>
          <button className="close-btn" onClick={onClose} title="Đóng">
            ×
          </button>
        </div>

        <div className="selector-body">
          <div className="student-stats">
            <div className="stat-item">
              <span className="stat-value">{enrolledLearners.length}</span>
              <span className="stat-label">Đã ghi danh</span>
            </div>
            <div className="stat-divider">/</div>
            <div className="stat-item">
              <span className="stat-value">
                {classData.Maxstudent || classData.maxStudents || 0}
              </span>
              <span className="stat-label">Sĩ số tối đa</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {(classData.Maxstudent || classData.maxStudents || 0) -
                  enrolledLearners.length}
              </span>
              <span className="stat-label">Còn lại</span>
            </div>
          </div>

          <div className="search-section">
            <input
              type="text"
              className="search-input"
              placeholder="Tìm kiếm học viên (tên, email, số điện thoại)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="students-sections">
            {/* Chỉ hiển thị học viên đã ghi danh */}
            <div className="students-section">
              <h3 className="section-title">
                Đã ghi danh ({filteredEnrolledLearners.length})
              </h3>
              {filteredEnrolledLearners.length > 0 ? (
                <div className="students-list">
                  {filteredEnrolledLearners.map((learner) => {
                    const learnerId = learner.LearnerID || learner.id;
                    const fullName = learner.FullName || learner.fullName || "";
                    const email = learner.Email || learner.email || "";
                    const phone = learner.Phone || learner.phone || "";

                    return (
                      <div key={learnerId} className="student-card enrolled">
                        <div className="student-info">
                          <div className="student-avatar">
                            {fullName.charAt(0) || "?"}
                          </div>
                          <div className="student-details">
                            <div className="student-name">{fullName}</div>
                            <div className="student-contact">{email}</div>
                            <div className="student-contact">{phone}</div>
                          </div>
                        </div>
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, learner)}
                          sx={{ padding: "4px" }}
                        >
                          <MoreVert />
                        </IconButton>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="empty-section">
                  <p>Chưa có học viên nào ghi danh</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="selector-footer">
          <button className="btn btn-secondary" onClick={onClose}>
            Đóng
          </button>
        </div>

        {/* Menu Actions */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewDetail}>
            <Visibility sx={{ fontSize: 18, mr: 1.5 }} /> Xem chi tiết
          </MenuItem>
          {/* Chỉ admin mới có quyền đổi lớp, staff chỉ xem */}
          {onChangeClass && userRole !== "staff" && (
            <MenuItem onClick={handleOpenChangeClassDialog}>
              <SwapHoriz sx={{ fontSize: 18, mr: 1.5 }} /> Đổi lớp
            </MenuItem>
          )}
        </Menu>

        {/* Detail Dialog */}
        <Dialog
          open={showDetailDialog}
          onClose={handleCloseDetailDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            Chi tiết học viên
            <IconButton
              onClick={handleCloseDetailDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              ×
            </IconButton>
          </DialogTitle>
          <DialogContent>
            {loadingDetail ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
                <CircularProgress />
              </Box>
            ) : learnerDetail || selectedLearner ? (
              <Box sx={{ pt: 2 }}>
                <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: "50%",
                      backgroundColor: "#667eea",
                      color: "white",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "24px",
                      fontWeight: 600,
                      mr: 2,
                    }}
                  >
                    {
                      (learnerDetail?.FullName ||
                        learnerDetail?.fullName ||
                        selectedLearner?.FullName ||
                        selectedLearner?.fullName ||
                        "?")[0]
                    }
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {learnerDetail?.FullName ||
                        learnerDetail?.fullName ||
                        selectedLearner?.FullName ||
                        selectedLearner?.fullName ||
                        ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID:{" "}
                      {learnerDetail?.LearnerID ||
                        learnerDetail?.id ||
                        selectedLearner?.LearnerID ||
                        selectedLearner?.id ||
                        ""}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email sx={{ color: "#64748b" }} />
                    <Typography variant="body1">
                      <strong>Email:</strong>{" "}
                      {learnerDetail?.Email ||
                        learnerDetail?.email ||
                        selectedLearner?.Email ||
                        selectedLearner?.email ||
                        ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone sx={{ color: "#64748b" }} />
                    <Typography variant="body1">
                      <strong>Số điện thoại:</strong>{" "}
                      {learnerDetail?.Phone ||
                        learnerDetail?.phone ||
                        selectedLearner?.Phone ||
                        selectedLearner?.phone ||
                        ""}
                    </Typography>
                  </Box>
                  {(learnerDetail?.DateOfBirth ||
                    selectedLearner?.DateOfBirth) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Ngày sinh:</strong>{" "}
                        {learnerDetail?.DateOfBirth ||
                          learnerDetail?.dateOfBirth ||
                          selectedLearner?.DateOfBirth ||
                          selectedLearner?.dateOfBirth ||
                          ""}
                      </Typography>
                    </Box>
                  )}
                  {(learnerDetail?.Address || selectedLearner?.Address) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Địa chỉ:</strong>{" "}
                        {learnerDetail?.Address ||
                          learnerDetail?.address ||
                          selectedLearner?.Address ||
                          selectedLearner?.address ||
                          ""}
                      </Typography>
                    </Box>
                  )}
                  {(learnerDetail?.Job || selectedLearner?.Job) && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Nghề nghiệp:</strong>{" "}
                        {learnerDetail?.Job ||
                          learnerDetail?.job ||
                          selectedLearner?.Job ||
                          selectedLearner?.job ||
                          ""}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" color="text.secondary">
                Không tìm thấy thông tin học viên
              </Typography>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>

        {/* Change Class Dialog */}
        <ChangeClassDialog
          open={changeClassDialogOpen}
          onClose={() => {
            if (!loadingClasses) {
              setChangeClassDialogOpen(false);
              setSelectedTargetClass(null);
              setClassOptions([]);
              setClassScheduleSummaries({});
              setErrorClasses("");
            }
          }}
          loading={loadingClasses}
          error={errorClasses}
          options={classOptions}
          selectedClass={selectedTargetClass}
          onSelectClass={setSelectedTargetClass}
          onConfirm={handleConfirmChangeClass}
          title="Chọn lớp để chuyển học viên"
          getScheduleSummary={getClassScheduleSummary}
        />
      </div>
    </div>
  );
};

export default StudentSelector;
