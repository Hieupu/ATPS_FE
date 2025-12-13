import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ClassWizard from "../components/class-management/ClassWizard";
import ErrorModal from "../components/class-management/ErrorModal";
import SessionConflictModal from "../components/class-management/SessionConflictModal";
import SessionSuggestionModal from "../components/class-management/SessionSuggestionModal";
import classService from "../../../apiServices/classService";
import dayjs from "dayjs";
import { getDayFromDate } from "../../../utils/validate";

const CreateClassPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams(); // Lấy classId từ URL nếu đang edit
  const [classData, setClassData] = useState(null); // Class data khi edit
  const isReadonly = location.state?.readonly || false; // Kiểm tra mode readonly
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [error, setError] = useState("");
  const [errorModal, setErrorModal] = useState({
    open: false,
    title: "",
    message: "",
    errors: {},
    redirectPath: null,
    redirectState: null,
  });
  const [conflictModal, setConflictModal] = useState({
    open: false,
    conflicts: [],
    createdCount: 0,
    totalCount: 0,
  });
  const [suggestionModal, setSuggestionModal] = useState({
    open: false,
    suggestions: [],
    classId: null,
  });
  const [suggestionFetching, setSuggestionFetching] = useState(false);
  const [suggestionApplying, setSuggestionApplying] = useState(false);
  const submissionRef = useRef(null);
  const conflictContextRef = useRef(null);

  const getTimeslotMeta = (timeslotId) =>
    timeslots.find((t) => (t.TimeslotID || t.id) === timeslotId);

  const extractConflicts = (result) => {
    if (!result) return [];
    if (Array.isArray(result.data?.conflicts)) {
      return result.data.conflicts;
    }
    if (Array.isArray(result.conflicts)) {
      return result.conflicts;
    }
    return [];
  };

  const extractSummary = (result) =>
    result?.data?.summary || result?.summary || {};

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      setError("");
      try {
        const [instructorList, courseList, timeslotResponse] =
          await Promise.all([
            classService.getAllInstructors(),
            classService.getAllCourses(),
            classService.getAllTimeslots({ limit: 500 }),
          ]);
        if (!isMounted) return;
        setInstructors(instructorList || []);
        setCourses(courseList || []);
        const timeslotsArray = Array.isArray(timeslotResponse?.data)
          ? timeslotResponse.data
          : [];
        setTimeslots(timeslotsArray);

        // Nếu đang edit, load class data + sessions của lớp
        if (classId) {
          try {
            const classDetail = await classService.getClassById(classId);
            let sessions = [];
            try {
              sessions = await classService.getClassSessionsForFrontend(
                classId
              );
            } catch (sessionError) {
              console.warn(
                "[CreateClassPage] Không thể load sessions cho class:",
                classId,
                sessionError
              );
              sessions = [];
            }

            if (!isMounted) return;

            const enrichedClassDetail = {
              ...(classDetail || {}),
              sessions: Array.isArray(sessions) ? sessions : [],
            };

            setClassData(enrichedClassDetail);
          } catch (error) {
            console.error("Error loading class data:", error);
            setError("Không thể tải thông tin lớp học. Vui lòng thử lại.");
          }
        }

        // Cảnh báo nếu không có timeslots (có thể do backend lỗi)
        if (timeslotsArray.length === 0) {
          console.warn("Không tải được danh sách ca học. Có thể do:");
          console.warn(
            "1. Backend chưa hỗ trợ trường 'Day' mới trong timeslot"
          );
          console.warn("2. Database chưa được cập nhật lên dbver5");
          console.warn("3. Backend có lỗi khi query timeslots");
          setError(
            "Không thể tải danh sách ca học. Vui lòng kiểm tra backend và database đã được cập nhật lên dbver5 chưa."
          );
        }
      } catch (e) {
        if (!isMounted) return;
        const errorMessage = e?.message || "Không thể tải dữ liệu cần thiết";
        console.error("Load data error:", e);
        setError(errorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [classId]);

  const handleCancel = () => {
    navigate("/admin/classes");
  };

  const handleErrorModalClose = () => {
    setErrorModal((prev) => ({
      ...prev,
      open: false,
    }));
    if (errorModal.redirectPath) {
      navigate(errorModal.redirectPath, {
        state: errorModal.redirectState || {},
        replace: true,
      });
    }
  };

  const handleConflictModalClose = () => {
    setConflictModal((prev) => ({ ...prev, open: false }));
    conflictContextRef.current = null;
    navigate("/admin/classes", {
      state: {
        message:
          "Lớp đã được tạo. Một số buổi học chưa thêm được do xung đột, vui lòng kiểm tra lại.",
        warning: true,
      },
      replace: true,
    });
  };

  const handleSuggestionModalClose = () => {
    setSuggestionModal((prev) => ({ ...prev, open: false }));
    conflictContextRef.current = null;
    navigate("/admin/classes", {
      state: {
        message:
          "Lớp đã được tạo. Bạn có thể thêm buổi học bù trong màn lịch lớp.",
      },
      replace: true,
    });
  };

  const handleGenerateSuggestions = async () => {
    if (!conflictContextRef.current) {
      console.error(
        "[handleGenerateSuggestions] conflictContextRef.current không có dữ liệu"
      );
      return;
    }
    const { sessions, instructorId, classId } = conflictContextRef.current;

    const orderedConflicts = [...(conflictModal.conflicts || [])].sort(
      (a, b) => (a.sessionIndex || 0) - (b.sessionIndex || 0)
    );

    // Tìm buổi cuối cùng từ tất cả sessions (không chỉ conflict)
    const maxDate = (sessions || []).reduce((latest, session) => {
      if (!session?.Date) return latest;
      const dateValue = dayjs(session.Date);
      if (!dateValue.isValid()) return latest;
      if (!latest || dateValue.isAfter(latest)) {
        return dateValue;
      }
      return latest;
    }, null);
    let rollingStart = (maxDate || dayjs()).add(1, "day");

    setSuggestionFetching(true);
    try {
      const suggestionResults = [];

      for (const conflict of orderedConflicts) {
        const sessionIndex = (conflict.sessionIndex || 1) - 1;
        const sessionInfo = sessions?.[sessionIndex];
        if (!sessionInfo) {
          suggestionResults.push({
            conflict,
            suggestion: null,
            error: "Không tìm thấy dữ liệu buổi học gốc.",
          });
          continue;
        }

        // Lấy timeslotID từ sessionInfo của conflict này (không thử timeslot khác)
        const timeslotMeta = getTimeslotMeta(sessionInfo.TimeslotID) || {};

        // Logic mới: Lấy Day từ Date của session gốc thay vì từ timeslot.Day
        // Vì timeslot có thể được dùng cho nhiều ngày khác nhau
        const sessionDate =
          sessionInfo.Date ||
          conflict.conflictInfo?.date ||
          conflict.sessionData?.Date;
        let timeslotDay = null;

        if (sessionDate) {
          // Lấy Day từ Date của session gốc
          timeslotDay = getDayFromDate(sessionDate);
        }

        // Fallback: Nếu không lấy được từ Date, thử từ sessionInfo hoặc timeslotMeta
        if (!timeslotDay) {
          timeslotDay =
            sessionInfo.TimeslotDay ||
            timeslotMeta.Day ||
            timeslotMeta.day ||
            null;
        }

        if (!timeslotDay || !sessionInfo.TimeslotID) {
          suggestionResults.push({
            conflict,
            suggestion: null,
            error: "Không xác định được thứ hoặc ca học của buổi học gốc.",
          });
          continue;
        }

        let searchPointer = rollingStart.clone();
        let suggestion = null;
        let suggestionError = null;

        // Tìm slot rảnh chỉ cho timeslotID của session này (theo thứ trong tuần)
        // Chỉ cần tìm 1 buổi hợp lệ, không cần tìm nhiều
        for (let attempt = 0; attempt < 6 && !suggestion; attempt++) {
          try {
            const response = await classService.findInstructorAvailableSlots({
              InstructorID: instructorId,
              TimeslotID: sessionInfo.TimeslotID,
              Day: timeslotDay,
              startDate: searchPointer.format("YYYY-MM-DD"),
              numSuggestions: 1, // Chỉ cần tìm 1 buổi hợp lệ
              excludeClassId: classId, // Loại trừ các sessions đã tạo của class này
              ClassID: classId,
            });

            // Lấy tất cả suggestions (cả available và busy)
            const allSuggestions = response?.data?.suggestions || [];

            // Tìm candidate available đầu tiên
            const candidate =
              allSuggestions.find((item) => item.available) || null;

            // Nếu không có candidate, log lý do
            if (!candidate && allSuggestions.length > 0) {
            }

            if (candidate) {
              suggestion = {
                date: candidate.date,
                timeslotId: sessionInfo.TimeslotID,
                startTime:
                  sessionInfo.TimeslotStart ||
                  timeslotMeta.StartTime ||
                  timeslotMeta.startTime ||
                  null,
                endTime:
                  sessionInfo.TimeslotEnd ||
                  timeslotMeta.EndTime ||
                  timeslotMeta.endTime ||
                  null,
                title:
                  sessionInfo.Title ||
                  conflict.conflictInfo?.sessionTitle ||
                  `Buổi ${conflict.sessionIndex}`,
                description: sessionInfo.Description || "",
              };
              // Buổi bù tiếp theo sẽ được thêm sau buổi bù vừa tạo
              rollingStart = dayjs(candidate.date).add(1, "day");
              break;
            } else {
              // Không tìm thấy slot rảnh, tăng searchPointer lên 7 ngày (1 tuần) để tìm thứ tiếp theo
              searchPointer = searchPointer.add(7, "day");
              suggestionError =
                "Không tìm thấy lịch trống phù hợp cho ca học này.";
            }
          } catch (error) {
            console.error(
              `[handleGenerateSuggestions] Lỗi khi tìm slot cho TimeslotID ${sessionInfo.TimeslotID}:`,
              error
            );
            suggestionError = error?.message || "Không thể lấy gợi ý.";
            break;
          }
        }

        suggestionResults.push({
          conflict,
          suggestion,
          error: suggestion ? null : suggestionError,
        });
      }

      setSuggestionModal({
        open: true,
        suggestions: suggestionResults,
        classId,
      });
      setConflictModal((prev) => ({ ...prev, open: false }));
    } catch (error) {
      console.error("[handleGenerateSuggestions] Lỗi khi tạo gợi ý:", error);
      setErrorModal({
        open: true,
        title: "Lỗi gợi ý lịch bù",
        message:
          error?.message ||
          error?.response?.data?.message ||
          "Không thể tạo gợi ý buổi học bù.",
        errors: {},
        redirectPath: "/admin/classes",
        redirectState: {
          message:
            "Lớp đã tạo nhưng chưa thêm được toàn bộ buổi học. Vui lòng kiểm tra lại.",
          warning: true,
        },
      });
    } finally {
      setSuggestionFetching(false);
    }
  };

  const handleApplySuggestions = async () => {
    if (!suggestionModal.classId) {
      handleSuggestionModalClose();
      return;
    }

    const payloads = suggestionModal.suggestions
      .filter((item) => item.suggestion)
      .map((item) => {
        const { suggestion, conflict } = item;
        return {
          Title:
            suggestion.title ||
            `${conflict.conflictInfo?.sessionTitle || "Buổi học"} (bù)`,
          Description:
            suggestion.description ||
            `Buổi bù cho ${conflict.conflictInfo?.sessionTitle || "buổi học"}`,
          Date: suggestion.date,
          TimeslotID: suggestion.timeslotId,
        };
      });

    if (payloads.length === 0) {
      handleSuggestionModalClose();
      return;
    }

    setSuggestionApplying(true);
    try {
      for (const payload of payloads) {
        await classService.addMakeupSession(suggestionModal.classId, payload);
      }
      setSuggestionModal((prev) => ({ ...prev, open: false }));
      conflictContextRef.current = null;
      navigate("/admin/classes", {
        state: {
          message:
            "Đã thêm buổi học bù theo gợi ý. Vui lòng kiểm tra lại lịch.",
        },
        replace: true,
      });
    } catch (error) {
      setErrorModal({
        open: true,
        title: "Lỗi thêm buổi học bù",
        message:
          error?.message ||
          error?.response?.data?.message ||
          "Không thể thêm buổi học bù.",
        errors: {},
        redirectPath: "/admin/classes",
        redirectState: {
          message:
            "Lớp đã tạo nhưng một số buổi bù chưa thêm được. Vui lòng kiểm tra lại.",
          warning: true,
        },
      });
    } finally {
      setSuggestionApplying(false);
      setSuggestionModal((prev) => ({ ...prev, open: false }));
    }
  };

  const handleSubmit = async (submitData) => { 
    setSubmitting(true);
    setError("");
    conflictContextRef.current = null;
    submissionRef.current = submitData;
    try {
    const first = submitData.sessions[0];

    const start_time = `${first.Date}T${first.TimeslotStart}`;

    const [h1, m1] = first.TimeslotStart.split(":").map(Number);
    const [h2, m2] = first.TimeslotEnd.split(":").map(Number);
      const duration = h2 * 60 + m2 - (h1 * 60 + m1);

    const dayStringToNumber = {
      MONDAY: 2,
      TUESDAY: 3,
      WEDNESDAY: 4,
      THURSDAY: 5,
      FRIDAY: 6,
      SATURDAY: 7,
        SUNDAY: 8,
    };

    const weekly_days = [
        ...new Set(
          submitData.sessions.map((s) => dayStringToNumber[s.TimeslotDay])
        ),
    ]
    .sort((a, b) => a - b)
    .join(",");

    const result = {
      start_time,
      weekly_days,
        duration,
    };

      const zoomPayload = {
          topic: submitData.Name,
        start_time: result.start_time,
          duration: result.duration || 120,
          weekly_days: result.weekly_days,
          end_times: submitData.sessions.length,
        };
        const zoomResponse = await classService.createZoomMeeting(zoomPayload);
        console.log("Zoom meeting created:", zoomResponse);

      const isEdit = !!classId;
      const classPayload = {
        Name: submitData.Name,
        InstructorID: submitData.InstructorID,
        Fee: submitData.Fee,
        // Trường mới (dbver5) - BẮT BUỘC
        OpendatePlan: submitData.OpendatePlan,
        EnddatePlan: submitData.EnddatePlan,
        Numofsession: submitData.Numofsession,
        Maxstudent: submitData.Maxstudent,
        ZoomID: zoomResponse.id,
        Zoompass: zoomResponse.password,
        Status: submitData.Status || "DRAFT",
        CourseID: submitData.CourseID || null,
        
        // Trường cũ (backward compatibility - sẽ bỏ khi backend cập nhật)
        StartDate: submitData.StartDate || submitData.OpendatePlan,
        ExpectedSessions:
          submitData.ExpectedSessions || submitData.Numofsession,
        MaxLearners: submitData.MaxLearners || submitData.Maxstudent,
      };

      let resultClass;
      let classIdToUse = classId; 

      if (isEdit) {
        // Update existing class (metadata)
        resultClass = await classService.updateClass(classId, classPayload);
        classIdToUse = classId; // Giữ nguyên classId khi edit
      } else {
        // Create new class
        resultClass = await classService.createClass(classPayload);
        classIdToUse =
          resultClass?.ClassID ||
          resultClass?.id ||
          resultClass?.data?.ClassID ||
          resultClass?.data?.id;
      }

      const finalClassId = classIdToUse;

      if (!finalClassId) {
        console.error("[CreateClassPage] ERROR: Cannot get finalClassId!");
        console.error("[CreateClassPage] resultClass:", resultClass);
        setErrorModal({
          open: true,
          title: isEdit ? "Lỗi Cập Nhật Lớp Học" : "Lỗi Tạo Lớp Học",
          message: isEdit
            ? "Không thể cập nhật lớp học. Vui lòng thử lại."
            : "Không thể lấy ClassID sau khi tạo lớp. Vui lòng thử lại.",
          errors: {},
          redirectPath: null,
          redirectState: null,
        });
        setSubmitting(false);
        return;
      }

      // 2) Tạo / cập nhật sessions - BẮT BUỘC nếu có sessions

      if (
        Array.isArray(submitData.sessions) &&
        submitData.sessions.length > 0
      ) {
        // Map và validate sessions data
        const sessionsPayload = submitData.sessions
          .map((s, index) => {
            // Đảm bảo Date là string format YYYY-MM-DD
            let dateStr = s.Date;
            if (dateStr instanceof Date) {
              dateStr = dateStr.toISOString().split("T")[0];
            } else if (typeof dateStr === "string" && dateStr.includes("T")) {
              dateStr = dateStr.split("T")[0];
            } else if (typeof dateStr === "string") {
              // Đảm bảo format đúng YYYY-MM-DD
              dateStr = dateStr.trim();
            }

            // Đảm bảo TimeslotID là integer
            const timeslotId = parseInt(s.TimeslotID);
            if (isNaN(timeslotId) || timeslotId <= 0) {
              console.warn(
                `[CreateClassPage] Session ${
                  index + 1
                } has invalid TimeslotID:`,
                s.TimeslotID
              );
              return null;
            }

            // Validate Date format
            if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              console.warn(
                `[CreateClassPage] Session ${
                  index + 1
                } has invalid Date format:`,
                s.Date
              );
              return null;
            }

            const matchedZoom = zoomResponse.occurrences.find((z) => {
              const zoomDate = new Date(z.start_time);
              zoomDate.setHours(zoomDate.getHours() + 7); // Zoom UTC → GMT+7

              const zDate = zoomDate.toISOString().split("T")[0];

              return zDate === dateStr;
            }); 
            console.log(matchedZoom);
            localStorage.setItem(
              "zoomCreateResult",
              JSON.stringify(zoomResponse)
            );

            const saved = localStorage.getItem("zoomCreateResult");
            const zoomData = saved ? JSON.parse(saved) : null;

            const mappedSession = {
              SessionID: s.SessionID || s.sessionId || s.id || null,
              Title: s.Title || `Session ${s.number || index + 1}`,
              Description: s.Description || "",
              Date: dateStr, // YYYY-MM-DD string
              TimeslotID: timeslotId, // Integer
              InstructorID: submitData.InstructorID, // Integer
              ClassID: finalClassId, // Integer
              ZoomUUID: zoomData.occurrence_id || null,
            };
            return mappedSession;
          })
          .filter((s) => s !== null); // Loại bỏ sessions không hợp lệ

        // Validate sessions trước khi gửi
        if (sessionsPayload.length === 0) {
          console.error(
            "[CreateClassPage] ERROR: No valid sessions after filtering!"
          );
          console.error(
            "[CreateClassPage] Original sessions:",
            submitData.sessions
          );
          setErrorModal({
            open: true,
            title: "Lỗi Validation Sessions",
            message:
              "Không có buổi học hợp lệ nào để tạo. Vui lòng kiểm tra lại thông tin.",
            errors: {
              preview:
                "Tất cả buổi học đều có dữ liệu không hợp lệ (Date hoặc TimeslotID).",
            },
            redirectPath: null,
            redirectState: null,
          });
          setSubmitting(false);
          return;
        }

        const invalidSessions = sessionsPayload.filter(
          (s) => !s.Date || !s.TimeslotID || !s.ClassID || !s.InstructorID
        );
        if (invalidSessions.length > 0) {
          console.error(
            "[CreateClassPage] ERROR: Invalid sessions found after mapping:",
            invalidSessions
          );
          setErrorModal({
            open: true,
            title: "Lỗi Validation Sessions",
            message: `Có ${invalidSessions.length} buổi học thiếu thông tin bắt buộc. Vui lòng kiểm tra lại.`,
            errors: {
              preview: `Có ${invalidSessions.length} buổi học thiếu thông tin (Date, TimeslotID, ClassID hoặc InstructorID).`,
            },
            redirectPath: null,
            redirectState: null,
          });
          setSubmitting(false);
          return;
        }

        try {
          let bulkResult;

          if (isEdit) {
            // EDIT MODE: giữ UUID - reschedule hoặc tạo mới, tránh xoá toàn bộ
            const existingSessions = Array.isArray(classData?.sessions)
              ? classData.sessions
              : [];
            const existingById = new Map();
            existingSessions.forEach((s) => {
              const sid = s.SessionID || s.id || s.sessionId;
              if (sid) existingById.set(parseInt(sid, 10), s);
            });

            const toReschedule = [];
            const toCreate = [];

            sessionsPayload.forEach((s) => {
              const sid = s.SessionID ? parseInt(s.SessionID, 10) : null;
              if (sid && existingById.has(sid)) {
                const original = existingById.get(sid);
                const originalDate = original.Date || original.date;
                const originalTimeslot =
                  original.TimeslotID ||
                  original.timeslotId ||
                  original.Timeslot?.TimeslotID;
                if (
                  originalDate !== s.Date ||
                  parseInt(originalTimeslot, 10) !== s.TimeslotID
                ) {
                  toReschedule.push({
                    sessionId: sid,
                    Date: s.Date,
                    TimeslotID: s.TimeslotID,
                  });
                }
              } else {
                // Buổi mới
                toCreate.push(s);
              }
            });

            const conflicts = [];
            const created = [];

            // Helper: check learner conflict
            const checkLearnerConflict = async (Date, TimeslotID) => {
              try {
                const res = await classService.checkLearnerConflicts(
                  finalClassId,
                  Date,
                  TimeslotID
                );
                return res;
              } catch (err) {
                console.warn("checkLearnerConflicts error", err);
                return null;
              }
            };

            // Reschedule các buổi thay đổi
            for (const item of toReschedule) {
              try {
                const learnerCheck = await checkLearnerConflict(
                  item.Date,
                  item.TimeslotID
                );
                if (
                  learnerCheck?.conflicts?.length > 0 ||
                  learnerCheck?.hasConflicts
                ) {
                  conflicts.push({
                    sessionIndex: item.sessionId,
                    conflictInfo: {
                      message:
                        learnerCheck?.message ||
                        "Học viên của lớp có buổi trùng (learner conflict)",
                    },
                  });
                  continue;
                }

                await classService.rescheduleSession(
                  item.sessionId,
                  item.Date,
                  item.TimeslotID
                );
                created.push({ sessionId: item.sessionId, type: "reschedule" });
              } catch (err) {
                conflicts.push({
                  sessionIndex: item.sessionId,
                  conflictInfo: {
                    message:
                      err?.response?.data?.message ||
                      err?.message ||
                      "Không thể đổi lịch (reschedule)",
                  },
                });
              }
            }

            // Tạo mới các buổi chưa có SessionID
            for (const item of toCreate) {
              try {
                const learnerCheck = await checkLearnerConflict(
                  item.Date,
                  item.TimeslotID
                );
                if (
                  learnerCheck?.conflicts?.length > 0 ||
                  learnerCheck?.hasConflicts
                ) {
                  conflicts.push({
                    sessionIndex: item.Title,
                    conflictInfo: {
                      message:
                        learnerCheck?.message ||
                        "Học viên của lớp có buổi trùng (learner conflict)",
                    },
                  });
                  continue;
                }

                const result = await classService.createSession(item);
                if (result?.SessionID || result?.sessionId) {
                  created.push({
                    sessionId: result.SessionID || result.sessionId,
                    type: "create",
                  });
                } else {
                  conflicts.push({
                    sessionIndex: item.Title,
                    conflictInfo: {
                      message: "Không xác định được SessionID sau khi tạo",
                    },
                  });
                }
              } catch (err) {
                conflicts.push({
                  sessionIndex: item.Title,
                  conflictInfo: {
                    message:
                      err?.response?.data?.message ||
                      err?.message ||
                      "Không thể tạo buổi học mới",
                  },
                });
              }
            }

            if (conflicts.length > 0) {
              setConflictModal({
                open: true,
                conflicts,
                createdCount: created.length,
                totalCount: toReschedule.length + toCreate.length,
              });
              setSubmitting(false);
              return;
            }

            bulkResult = { success: true, created };
          } else {
            // CREATE MODE: dùng bulkCreateSessions như hiện tại
            bulkResult = await classService.bulkCreateSessions(sessionsPayload);
            setTimeout(() => {
              localStorage.removeItem("zoomCreateResult");
            }, 10000);
          }

          // Kiểm tra kết quả
          if (
            bulkResult?.hasConflicts ||
            bulkResult?.hasConflict ||
            bulkResult?.success === false
          ) {
            const rawConflicts = extractConflicts(bulkResult);
            const summary = extractSummary(bulkResult);
            const createdCount =
              summary.created ??
              summary.success ??
              bulkResult?.data?.created?.length ??
              bulkResult?.created?.length ??
              0;
            const totalAttempted = sessionsPayload.length;

            conflictContextRef.current = {
              sessions: submitData.sessions,
              instructorId: submitData.InstructorID,
              classId: finalClassId,
            };

            const decoratedConflicts = rawConflicts.map((conflict) => {
              const sessionIndex = (conflict.sessionIndex || 1) - 1;
              const sessionInfo = submitData.sessions?.[sessionIndex];
              const sessionData = conflict.sessionData || {};
              const timeslotMeta = sessionInfo
                ? getTimeslotMeta(sessionInfo.TimeslotID)
                : sessionData.TimeslotID
                ? getTimeslotMeta(sessionData.TimeslotID)
                : null;

              // Lấy thông tin từ nhiều nguồn với fallback
              const sessionTitle =
                conflict.conflictInfo?.sessionTitle ||
                sessionData.Title ||
                sessionInfo?.Title ||
                `Buổi ${conflict.sessionIndex}`;

              const date =
                conflict.conflictInfo?.date ||
                sessionData.Date ||
                sessionInfo?.Date ||
                null;

              const startTime =
                conflict.conflictInfo?.startTime ||
                sessionInfo?.TimeslotStart ||
                sessionData.TimeslotStart ||
                timeslotMeta?.StartTime ||
                timeslotMeta?.startTime ||
                null;

              const endTime =
                conflict.conflictInfo?.endTime ||
                sessionInfo?.TimeslotEnd ||
                sessionData.TimeslotEnd ||
                timeslotMeta?.EndTime ||
                timeslotMeta?.endTime ||
                null;

              return {
                ...conflict,
                conflictInfo: {
                  ...conflict.conflictInfo,
                  sessionTitle,
                  date: date || conflict.conflictInfo?.date || null,
                  startTime,
                  endTime,
                  message:
                    conflict.conflictInfo?.message ||
                    conflict.error ||
                    "Giảng viên trùng lịch",
                },
              };
            });

            setConflictModal({
              open: true,
              conflicts: decoratedConflicts,
              createdCount,
              totalCount: totalAttempted,
            });
            setSubmitting(false);
            return;
          } else {
            // Không có conflicts - tất cả sessions đã được tạo thành công
          }
        } catch (sessionError) {
          // Lỗi khi tạo sessions - hiển thị modal lỗi chi tiết

          const errorData = sessionError?.response?.data || {};
          const errorMessage =
            errorData.message ||
            sessionError?.message ||
            "Không thể tạo buổi học";
          const status = sessionError?.response?.status;

          // Parse error để hiển thị trong modal
          let fieldErrors = {};
          if (errorMessage.includes("Các trường bắt buộc:")) {
            const missingFields = errorMessage
              .replace("Các trường bắt buộc: ", "")
              .split(", ")
              .map((field) => field.trim());

            missingFields.forEach((field) => {
              fieldErrors[field] = `${field} là trường bắt buộc`;
            });
          } else if (
            errorMessage.includes(
              "Lớp học chỉ được chọn một ca học duy nhất cho tất cả các ngày"
            )
          ) {
            // Logic mới: Lớp DRAFT chỉ cho phép 1 timeslot duy nhất
            fieldErrors.preview =
              "Lớp học (nháp) chỉ được chọn một ca học duy nhất cho tất cả các ngày. Vui lòng chọn lại ca học ở bước 3.";
          }

          // Hiển thị modal lỗi
          setErrorModal({
            open: true,
            title:
              status === 400 ? "Lỗi Validation Sessions" : "Lỗi Tạo Buổi Học",
            message: `Lớp ${
              isEdit ? "đã cập nhật" : "đã tạo"
            } thành công (ClassID: ${finalClassId}), nhưng có lỗi khi tạo buổi học:\n\n${errorMessage}\n\nVui lòng kiểm tra và tạo lại buổi học trong màn lịch.`,
            errors: fieldErrors,
            redirectPath: "/admin/classes",
            redirectState: {
              message: `Lớp ${
                isEdit ? "đã cập nhật" : "đã tạo"
              } (ClassID: ${finalClassId}) nhưng lịch học chưa được thêm. Vui lòng kiểm tra lại.`,
              warning: true,
            },
          });

          // Không navigate ngay, để user có thể xem lỗi và quyết định
          setSubmitting(false);
          return;
        }
      } else {
        // Không có sessions - cảnh báo nhưng vẫn cho phép tạo lớp DRAFT
        // Logic mới: Lớp DRAFT có thể được tạo không có sessions khi lưu nháp ở bước 1-2
        // Nhưng khi đến Step 4 (lưu nháp), đã phải có sessions rồi
        setErrorModal({
          open: true,
          title: "Cảnh Báo",
          message: `Lớp ${
            isEdit ? "đã cập nhật" : "đã tạo"
          } thành công (ClassID: ${finalClassId}), nhưng không có buổi học nào được tạo.\n\n${
            submitData.Status === "DRAFT"
              ? "Lớp đang ở trạng thái nháp. Vui lòng hoàn thành bước 3 để tạo lịch học trước khi lưu nháp."
              : "Vui lòng tạo buổi học trong màn lịch sau."
          }`,
          errors: {
            preview:
              submitData.Status === "DRAFT"
                ? "Lớp nháp cần có lịch học. Vui lòng hoàn thành bước 3 để tạo lịch học."
                : "Vui lòng tạo buổi học trong màn lịch sau.",
          },
          redirectPath: null,
          redirectState: null,
        });
        setSubmitting(false);
        return;
      }

      // 3) Thành công → quay lại trang danh sách
      navigate("/admin/classes", {
        state: {
          message: isEdit
            ? `Cập nhật lớp học thành công. Đã tạo ${submitData.sessions.length} buổi học.`
            : `Tạo lớp (nháp) thành công. Đã tạo ${submitData.sessions.length} buổi học.`,
        },
        replace: true,
      });
    } catch (e) {
      console.error("[CreateClassPage] ========== ERROR ==========");
      console.error("[CreateClassPage] Create class error:", e);
      console.error("[CreateClassPage] Error name:", e?.name);
      console.error("[CreateClassPage] Error message:", e?.message);
      console.error("[CreateClassPage] Error stack:", e?.stack);
      console.error("[CreateClassPage] Error response:", e?.response);
      console.error(
        "[CreateClassPage] Error response data:",
        e?.response?.data
      );
      console.error(
        "[CreateClassPage] Error response status:",
        e?.response?.status
      );

      // Parse error từ backend
      const errorData = e?.response?.data || {};
      const errorMessage =
        errorData.message || e?.message || "Không thể tạo lớp";
      const status = e?.response?.status;

      console.error(
        "[CreateClassPage] Parsed errorData:",
        JSON.stringify(errorData, null, 2)
      );
      console.error("[CreateClassPage] Parsed errorMessage:", errorMessage);
      console.error("[CreateClassPage] Parsed status:", status);

      // Parse missing fields từ error message
      let fieldErrors = {};
      if (errorMessage.includes("Các trường bắt buộc:")) {
        const missingFields = errorMessage
          .replace("Các trường bắt buộc: ", "")
          .split(", ")
          .map((field) => field.trim());

        missingFields.forEach((field) => {
          fieldErrors[field] = `${field} là trường bắt buộc`;
        });
      } else if (errorMessage.includes("Số buổi dự kiến phải lớn hơn 0")) {
        fieldErrors.Numofsession = "Số buổi dự kiến phải lớn hơn 0";
      } else if (errorMessage.includes("Sĩ số tối đa phải lớn hơn 0")) {
        fieldErrors.Maxstudent = "Sĩ số tối đa phải lớn hơn 0";
      } else if (
        errorMessage.includes(
          "Lớp học chỉ được chọn một ca học duy nhất cho tất cả các ngày"
        )
      ) {
        // Logic mới: Lớp DRAFT chỉ cho phép 1 timeslot duy nhất
        fieldErrors.preview =
          "Lớp học (nháp) chỉ được chọn một ca học duy nhất cho tất cả các ngày. Vui lòng chọn lại ca học ở bước 3.";
      }

      // Hiển thị modal lỗi
      setErrorModal({
        open: true,
        title: status === 400 ? "Lỗi Validation" : "Lỗi Tạo Lớp Học",
        message: errorMessage,
        errors: fieldErrors,
        redirectPath: null,
        redirectState: null,
      });

      // Cũng set error để hiển thị ở top (nếu cần)
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 style={{ margin: 0, marginBottom: "16px" }}>
        {classData ? "Sửa lớp học" : "Tạo lớp học"}
      </h1>
      {error && (
        <div
          style={{
            marginBottom: "12px",
            padding: "10px 12px",
            color: "#dc3545",
            background: "#fdecea",
            border: "1px solid #f5c2c7",
            borderRadius: "6px",
          }}
        >
          {error}
        </div>
      )}
      {loading ? (
        <div>Đang tải dữ liệu...</div>
      ) : (
        <div
          style={{
            opacity: submitting ? 0.6 : 1,
            pointerEvents: submitting ? "none" : "auto",
          }}
        >
          <ClassWizard
            classData={classData}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            instructors={instructors}
            courses={courses}
            timeslots={timeslots}
            variant="page"
            readonly={isReadonly}
            classId={classId}
          />
        </div>
      )}

      {/* Error Modal */}
      <ErrorModal
        open={errorModal.open}
        onClose={handleErrorModalClose}
        title={errorModal.title}
        message={errorModal.message}
        errors={errorModal.errors}
      />
      <SessionConflictModal
        open={conflictModal.open}
        conflicts={conflictModal.conflicts}
        createdCount={conflictModal.createdCount}
        totalCount={conflictModal.totalCount}
        onClose={handleConflictModalClose}
        onSuggest={handleGenerateSuggestions}
        loadingSuggestions={suggestionFetching}
      />
      <SessionSuggestionModal
        open={suggestionModal.open}
        suggestions={suggestionModal.suggestions}
        onClose={handleSuggestionModalClose}
        onApply={handleApplySuggestions}
        applying={suggestionApplying}
      />
    </div>
  );
};

export default CreateClassPage;
