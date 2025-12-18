import React, { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { formatDateForDisplay, weekdayLabelMap } from "./ClassWizard.constants";
import ClassSessionScheduleModal from "./ClassSessionScheduleModal";
import {
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Box,
  Button,
  Chip,
  Divider,
} from "@mui/material";
import EventIcon from "@mui/icons-material/Event";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ReplayIcon from "@mui/icons-material/Replay";
/**
 * Step 3 Edit: Chỉ đổi lịch các buổi bị ảnh hưởng khi lùi ngày bắt đầu
 * - Chỉ hiển thị các buổi cần đổi (Date < OpendatePlan mới)
 * - Không cho phép thêm/xóa buổi
 * - Không cho Next nếu còn buổi chưa đổi
 */
const ClassWizardStep3Edit = ({
  formData,
  setFormData,
  errors,
  timeslots,
  originalSessions,
  requiredSessions,
  onValidationChange, // Callback để báo cho ClassWizard biết còn buổi cần đổi không
}) => {
  const timeslotMap = useMemo(() => {
    const map = {};
    (timeslots || []).forEach((slot) => {
      const key = slot.TimeslotID || slot.id;
      if (key != null) {
        map[key] = slot;
      }
    });
    return map;
  }, [timeslots]);

  // DEBUG: Log dữ liệu đầu vào
  useEffect(() => {
    console.log("[Step3Edit] ========== DEBUG DATA ==========");
    console.log("[Step3Edit] originalSessions:", originalSessions);
    console.log(
      "[Step3Edit] originalSessions length:",
      originalSessions?.length || 0
    );
    console.log("[Step3Edit] formData.sessions:", formData.sessions);
    console.log(
      "[Step3Edit] formData.sessions length:",
      formData.sessions?.length || 0
    );
    console.log("[Step3Edit] formData.schedule:", formData.schedule);
    console.log("[Step3Edit] OpendatePlan:", formData.schedule?.OpendatePlan);
    console.log("[Step3Edit] ==================================");
  }, [originalSessions, formData.sessions, formData.schedule]);

  // Khởi tạo sessions từ originalSessions và đảm bảo có flag isOriginal
  useEffect(() => {
    if (!Array.isArray(originalSessions) || originalSessions.length === 0) {
      return;
    }

    const currentSessions = Array.isArray(formData.sessions)
      ? formData.sessions
      : [];

    // Tạo map của originalSessions để check nhanh
    const originalSessionsMap = new Map();
    originalSessions.forEach((s) => {
      const key = s.SessionID || s.id;
      if (key != null) {
        originalSessionsMap.set(key, s);
      }
    });

    // Kiểm tra xem có session nào thiếu isOriginal không
    let needsUpdate = false;
    const updatedSessions = currentSessions.map((s) => {
      const key = s.SessionID || s.id;
      // Nếu session có SessionID và nằm trong originalSessions nhưng thiếu isOriginal
      if (
        key != null &&
        originalSessionsMap.has(key) &&
        s.isOriginal !== true &&
        !s.isNew
      ) {
        needsUpdate = true;
        return { ...s, isOriginal: true };
      }
      return s;
    });

    // Nếu formData.sessions rỗng, khởi tạo từ originalSessions
    if (currentSessions.length === 0) {
      console.log("[Step3Edit] Khởi tạo sessions từ originalSessions");
      const mappedSessions = originalSessions.map((s) => ({
        ...s,
        isOriginal: true,
      }));
      console.log("[Step3Edit] Mapped sessions:", mappedSessions);
      setFormData((prev) => ({
        ...prev,
        sessions: mappedSessions,
      }));
    } else if (needsUpdate) {
      // Cập nhật lại các session thiếu isOriginal
      console.log("[Step3Edit] Cập nhật isOriginal cho các sessions");
      console.log("[Step3Edit] Updated sessions:", updatedSessions);
      setFormData((prev) => ({
        ...prev,
        sessions: updatedSessions,
      }));
    }
  }, [formData.sessions, originalSessions, setFormData]);

  // Các buổi cần đổi lịch do lùi ngày bắt đầu (Date < OpendatePlan mới)
  const newStartDate = formData.schedule?.OpendatePlan;

  const needsReschedule = useMemo(() => {
    console.log("[Step3Edit] needsReschedule - newStartDate:", newStartDate);
    if (!newStartDate) {
      console.log("[Step3Edit] Không có newStartDate, return false function");
      return () => false;
    }
    const startDate = dayjs(newStartDate);
    console.log(
      "[Step3Edit] startDate parsed:",
      startDate.format("YYYY-MM-DD")
    );
    return (session) => {
      if (!session.Date) {
        console.log("[Step3Edit] Session không có Date:", session);
        return false;
      }
      const sessionDate = dayjs(session.Date);
      const isBefore = sessionDate.isBefore(startDate, "day");

      // Coi session là original nếu:
      // 1. Có flag isOriginal === true, HOẶC
      // 2. Có SessionID (từ DB) và không phải là session mới (isNew !== true)
      const isOriginalSession =
        session.isOriginal === true ||
        ((session.SessionID || session.id) != null && session.isNew !== true);

      const result = isOriginalSession && !session.isDisabled && isBefore;
      console.log("[Step3Edit] Check session:", {
        SessionID: session.SessionID || session.id,
        Date: session.Date,
        sessionDate: sessionDate.format("YYYY-MM-DD"),
        startDate: startDate.format("YYYY-MM-DD"),
        isOriginal: session.isOriginal,
        isOriginalSession,
        isNew: session.isNew,
        isDisabled: session.isDisabled,
        isBefore,
        needsReschedule: result,
      });
      return result;
    };
  }, [newStartDate]);

  // Lọc các buổi cần đổi
  const sessionsNeedingChange = useMemo(() => {
    const sessions = Array.isArray(formData.sessions) ? formData.sessions : [];
    console.log("[Step3Edit] Filtering sessions, total:", sessions.length);
    const filtered = sessions.filter(needsReschedule);
    console.log("[Step3Edit] sessionsNeedingChange:", filtered);
    console.log("[Step3Edit] sessionsNeedingChange count:", filtered.length);
    return filtered;
  }, [formData.sessions, needsReschedule]);

  // Báo cho ClassWizard biết còn buổi cần đổi không
  useEffect(() => {
    if (onValidationChange) {
      onValidationChange(sessionsNeedingChange.length > 0);
    }
  }, [sessionsNeedingChange.length, onValidationChange]);

  const renderTimeslotLabel = (session) => {
    const ts = timeslotMap[session.TimeslotID || session.timeslotId];
    if (!ts) {
      return `Ca: ${session.TimeslotID || session.timeslotId || "N/A"}`;
    }
    const start = (ts.StartTime || ts.startTime || "").substring(0, 5);
    const end = (ts.EndTime || ts.endTime || "").substring(0, 5);
    return `Ca: ${start} - ${end}`;
  };

  const renderDayLabel = (date) => {
    if (!date) return "N/A";
    const d = dayjs(date);
    if (!d.isValid()) return "N/A";
    const iso = d.format("YYYY-MM-DD");
    const weekday = weekdayLabelMap[d.day()] || "";
    const display = formatDateForDisplay(iso);
    return `${display} (${weekday})`;
  };

  const [modalState, setModalState] = useState({
    open: false,
    session: null,
    baseDate: null,
  });

  const handleOpenReschedule = (session) => {
    if (!session || session.isDisabled) return;
    setModalState({
      open: true,
      session: session,
      baseDate: session.Date,
    });
  };

  const handleModalClose = () => {
    setModalState((prev) => ({ ...prev, open: false, session: null }));
  };

  const handleModalConfirm = ({ Date, TimeslotID }) => {
    setFormData((prev) => {
      const current = Array.isArray(prev.sessions) ? [...prev.sessions] : [];

      if (!modalState.session) return prev;

      // Đổi lịch: disable buổi gốc, thêm buổi mới
      const originalSession = modalState.session;

      const updated = current.map((s) => {
        if (
          (s.SessionID && s.SessionID === originalSession.SessionID) ||
          (s.id && s.id === originalSession.id) ||
          s === originalSession
        ) {
          return {
            ...s,
            isDisabled: true,
            isOriginal: s.isOriginal || true,
          };
        }
        return s;
      });

      // Thêm buổi mới vào danh sách
      // Lưu originalSessionID để backend biết cần xóa buổi nào
      const originalSessionID = originalSession.SessionID || originalSession.id;
      updated.push({
        ...originalSession,
        SessionID: undefined,
        id: undefined,
        Date,
        TimeslotID,
        isNew: true,
        isRescheduled: true,
        isDisabled: false,
        originalSessionID: originalSessionID, // Lưu SessionID của buổi cũ để backend xóa
      });

      // Logging để debug
      console.log(`[handleModalConfirm] Đổi lịch buổi học:`, {
        originalSessionID: originalSessionID,
        originalDate: originalSession.Date,
        originalTimeslotID: originalSession.TimeslotID,
        newDate: Date,
        newTimeslotID: TimeslotID,
      });

      return { ...prev, sessions: updated };
    });

    handleModalClose();
  };

  return (
    <div className="class-wizard-step3-edit">
      <div className="mb-4">
        <h3 className="mb-2">Chỉnh sửa lịch học</h3>
      </div>

      {errors?.preview && (
        <div className="alert alert-danger mb-3" role="alert">
          {errors.preview}
        </div>
      )}

      {sessionsNeedingChange.length > 0 && (
        <div className="alert alert-warning mb-3" role="alert">
          <strong>
            Có {sessionsNeedingChange.length} buổi học cần đổi lịch.
          </strong>
          <br />
          Vui lòng đổi lịch tất cả các buổi này trước khi tiếp tục.
        </div>
      )}

      {sessionsNeedingChange.length === 0 ? (
        <div className="card border-success">
          <div className="card-body text-center py-5">
            <div className="mb-3">
              <i
                className="bi bi-check-circle-fill text-success"
                style={{ fontSize: "3rem" }}
              ></i>
            </div>
            <h5 className="text-success mb-2">
              Không có buổi nào cần đổi lịch
            </h5>
            <p className="text-muted mb-0">
              Tất cả các buổi học đều hợp lệ với ngày bắt đầu mới.
            </p>
          </div>
        </div>
      ) : (
        <Card elevation={3}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Các buổi học cần đổi lịch
            </Typography>

            <Box
              sx={{
                maxHeight: 360,
                overflowY: "auto",
              }}
            >
              <List disablePadding>
                {sessionsNeedingChange.map((session, index) => (
                  <Box key={session.SessionID || session.id || `need-${index}`}>
                    <ListItem
                      alignItems="flex-start"
                      secondaryAction={
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<ReplayIcon />}
                          onClick={() => handleOpenReschedule(session)}
                        >
                          Đổi lịch
                        </Button>
                      }
                    >
                      <ListItemIcon sx={{ mt: 0.5 }}>
                        <EventIcon color="error" />
                      </ListItemIcon>

                      <ListItemText
                        primary={
                          <Box display="flex" alignItems="center" gap={1}>
                            <Typography fontWeight={600}>
                              {renderDayLabel(session.Date)}
                            </Typography>
                            <Chip
                              label="Cần đổi"
                              size="small"
                              color="error"
                              variant="outlined"
                            />
                          </Box>
                        }
                        secondary={
                          <Box display="flex" alignItems="center" mt={0.5}>
                            <AccessTimeIcon
                              sx={{ fontSize: 16, mr: 0.5 }}
                              color="action"
                            />
                            <Typography variant="body2" color="text.secondary">
                              {renderTimeslotLabel(session)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                    {index < sessionsNeedingChange.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Modal đổi lịch buổi học */}
      <ClassSessionScheduleModal
        open={modalState.open}
        onClose={handleModalClose}
        onConfirm={handleModalConfirm}
        instructorId={formData.InstructorID}
        classId={
          formData.ClassID ||
          formData.ClassIDEdit ||
          (originalSessions && originalSessions.length > 0
            ? originalSessions[0].ClassID || originalSessions[0].classID
            : null) ||
          null
        }
        baseDate={modalState.baseDate}
        timeslots={timeslots}
        existingSessions={formData.sessions}
        sessionToReschedule={modalState.session}
        opendatePlan={formData.schedule?.OpendatePlan}
      />
    </div>
  );
};

export default ClassWizardStep3Edit;
