import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import ClassWizard from "../components/class-management/ClassWizard";
import ErrorModal from "../components/class-management/ErrorModal";
import SessionConflictModal from "../components/class-management/SessionConflictModal";
import SessionSuggestionModal from "../components/class-management/SessionSuggestionModal";
import classService from "../../../apiServices/classService";
import dayjs from "dayjs";

const CreateClassPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [instructors, setInstructors] = useState([]);
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
        const [instructorList, timeslotList] = await Promise.all([
          classService.getAllInstructors(),
          classService.getAllTimeslots(),
        ]);
        if (!isMounted) return;
        setInstructors(instructorList || []);
        const timeslotsArray = timeslotList || [];
        setTimeslots(timeslotsArray);
        
        // Cảnh báo nếu không có timeslots (có thể do backend lỗi)
        if (timeslotsArray.length === 0) {
          console.warn("Không tải được danh sách ca học. Có thể do:");
          console.warn("1. Backend chưa hỗ trợ trường 'Day' mới trong timeslot");
          console.warn("2. Database chưa được cập nhật lên dbver5");
          console.warn("3. Backend có lỗi khi query timeslots");
          setError("Không thể tải danh sách ca học. Vui lòng kiểm tra backend và database đã được cập nhật lên dbver5 chưa.");
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
  }, []);

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
      console.error("[handleGenerateSuggestions] conflictContextRef.current không có dữ liệu");
      return;
    }
    const { sessions, instructorId, classId } = conflictContextRef.current;
    console.log(`[handleGenerateSuggestions] Bắt đầu với:`, {
      sessionsCount: sessions?.length,
      instructorId,
      classId,
      conflictsCount: conflictModal.conflicts?.length,
    });

    const orderedConflicts = [...(conflictModal.conflicts || [])].sort(
      (a, b) => (a.sessionIndex || 0) - (b.sessionIndex || 0)
    );
    console.log(`[handleGenerateSuggestions] orderedConflicts:`, orderedConflicts);

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
        const timeslotDay =
          sessionInfo.TimeslotDay ||
          timeslotMeta.Day ||
          timeslotMeta.day ||
          null;

        if (!timeslotDay || !sessionInfo.TimeslotID) {
          suggestionResults.push({
            conflict,
            suggestion: null,
            error: "Không xác định được thứ hoặc ca học của buổi học gốc.",
          });
          continue;
        }

        console.log(`[handleGenerateSuggestions] Conflict ${conflict.sessionIndex}: TimeslotID=${sessionInfo.TimeslotID}, Day=${timeslotDay}`);

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
            });

            console.log(`[handleGenerateSuggestions] Response từ API (TimeslotID=${sessionInfo.TimeslotID}, Day=${timeslotDay}):`, response);
            console.log(`[handleGenerateSuggestions] response.data?.suggestions:`, response?.data?.suggestions);

            // Lấy tất cả suggestions (cả available và busy)
            const allSuggestions = response?.data?.suggestions || [];
            console.log(`[handleGenerateSuggestions] Tất cả suggestions (${allSuggestions.length}):`, allSuggestions);
            
            // Tìm candidate available đầu tiên
            const candidate =
              allSuggestions.find((item) => item.available) ||
              null;

            console.log(`[handleGenerateSuggestions] Candidate tìm được:`, candidate);
            
            // Nếu không có candidate, log lý do
            if (!candidate && allSuggestions.length > 0) {
              console.log(`[handleGenerateSuggestions] Có ${allSuggestions.length} suggestions nhưng không có available. Tất cả đều busy:`, 
                allSuggestions.map(s => ({ date: s.date, available: s.available, reason: s.reason }))
              );
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
              console.log(`[handleGenerateSuggestions] Không tìm thấy slot cho conflict ${conflict.sessionIndex}, attempt ${attempt + 1}, tăng searchPointer lên 7 ngày`);
              searchPointer = searchPointer.add(7, "day");
              suggestionError = "Không tìm thấy lịch trống phù hợp cho ca học này.";
            }
          } catch (error) {
            console.error(`[handleGenerateSuggestions] Lỗi khi tìm slot cho TimeslotID ${sessionInfo.TimeslotID}:`, error);
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

      console.log(`[handleGenerateSuggestions] Tổng kết suggestionResults:`, suggestionResults);
      console.log(`[handleGenerateSuggestions] Số lượng suggestions có dữ liệu:`, suggestionResults.filter(r => r.suggestion).length);
      console.log(`[handleGenerateSuggestions] Số lượng suggestions lỗi:`, suggestionResults.filter(r => r.error).length);

      console.log(`[handleGenerateSuggestions] Hoàn thành, mở modal với ${suggestionResults.length} suggestions`);

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
        await classService.addMakeupSession(
          suggestionModal.classId,
          payload
        );
      }
      setSuggestionModal((prev) => ({ ...prev, open: false }));
      conflictContextRef.current = null;
      navigate("/admin/classes", {
        state: {
          message: "Đã thêm buổi học bù theo gợi ý. Vui lòng kiểm tra lại lịch.",
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
      // 1) Tạo lớp (DRAFT) - Sử dụng các trường mới theo dbver5
      const createdClass = await classService.createClass({
        Name: submitData.Name,
        InstructorID: submitData.InstructorID,
        Fee: submitData.Fee,
        // Trường mới (dbver5) - BẮT BUỘC
        OpendatePlan: submitData.OpendatePlan,
        EnddatePlan: submitData.EnddatePlan,
        Numofsession: submitData.Numofsession,
        Maxstudent: submitData.Maxstudent,
        ZoomID: submitData.ZoomID,
        Zoompass: submitData.Zoompass,
        Status: submitData.Status || "DRAFT",
        CourseID: submitData.CourseID || null,
        // Trường cũ (backward compatibility - sẽ bỏ khi backend cập nhật)
        StartDate: submitData.StartDate || submitData.OpendatePlan,
        ExpectedSessions: submitData.ExpectedSessions || submitData.Numofsession,
        MaxLearners: submitData.MaxLearners || submitData.Maxstudent,
      });

      const classId =
        createdClass?.ClassID ||
        createdClass?.id ||
        createdClass?.data?.ClassID ||
        createdClass?.data?.id;

      if (!classId) {
        setErrorModal({
          open: true,
          title: "Lỗi Tạo Lớp Học",
          message: "Không thể lấy ClassID sau khi tạo lớp. Vui lòng thử lại.",
          errors: {},
          redirectPath: null,
          redirectState: null,
        });
        setSubmitting(false);
        return;
      }

      // 2) Tạo sessions ngay sau khi tạo lớp - BẮT BUỘC nếu có sessions
      if (Array.isArray(submitData.sessions) && submitData.sessions.length > 0) {
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
              console.warn(`Session ${index + 1} has invalid TimeslotID:`, s.TimeslotID);
              return null;
            }

            // Validate Date format
            if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
              console.warn(`Session ${index + 1} has invalid Date format:`, s.Date);
              return null;
            }

            return {
              Title: s.Title || `Session ${s.number || index + 1}`,
              Description: s.Description || '',
              Date: dateStr, // YYYY-MM-DD string
              TimeslotID: timeslotId, // Integer
              InstructorID: submitData.InstructorID, // Integer
              ClassID: classId, // Integer
            };
          })
          .filter((s) => s !== null); // Loại bỏ sessions không hợp lệ
        
        console.log('Creating sessions:', sessionsPayload.length, 'sessions for class:', classId);
        console.log('Sessions data (first 3):', sessionsPayload.slice(0, 3));
        console.log('All sessions data:', JSON.stringify(sessionsPayload, null, 2));
        
        // Validate sessions trước khi gửi
        if (sessionsPayload.length === 0) {
          console.error('No valid sessions after filtering');
          setErrorModal({
            open: true,
            title: "Lỗi Validation Sessions",
            message: "Không có buổi học hợp lệ nào để tạo. Vui lòng kiểm tra lại thông tin.",
            errors: {
              preview: "Tất cả buổi học đều có dữ liệu không hợp lệ (Date hoặc TimeslotID).",
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
          console.error('Invalid sessions found after mapping:', invalidSessions);
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
          const bulkResult = await classService.bulkCreateSessions(sessionsPayload);
          
          console.log('Bulk create result (full):', JSON.stringify(bulkResult, null, 2));
          console.log('Bulk create result keys:', Object.keys(bulkResult || {}));
          
          // Kiểm tra kết quả
          if (bulkResult?.hasConflicts || bulkResult?.hasConflict || bulkResult?.success === false) {
            const rawConflicts = extractConflicts(bulkResult);
            const summary = extractSummary(bulkResult);
            const createdCount =
              summary.created ??
              summary.success ??
              bulkResult?.data?.created?.length ??
              bulkResult?.created?.length ??
              0;
            const totalAttempted = sessionsPayload.length;
            
            console.warn(
              `Sessions created with conflicts: ${createdCount} created, ${rawConflicts.length} conflicts`
            );
            console.warn(
              "Conflict details:",
              rawConflicts
            );

            conflictContextRef.current = {
              sessions: submitData.sessions,
              instructorId: submitData.InstructorID,
              classId,
            };

            const decoratedConflicts = rawConflicts.map((conflict) => {
              const sessionIndex = (conflict.sessionIndex || 1) - 1;
              const sessionInfo = submitData.sessions?.[sessionIndex];
              const timeslotMeta = sessionInfo
                ? getTimeslotMeta(sessionInfo.TimeslotID)
                : null;
              const fallbackStart =
                conflict.conflictInfo?.startTime ||
                sessionInfo?.TimeslotStart ||
                timeslotMeta?.StartTime ||
                timeslotMeta?.startTime ||
                null;
              const fallbackEnd =
                conflict.conflictInfo?.endTime ||
                sessionInfo?.TimeslotEnd ||
                timeslotMeta?.EndTime ||
                timeslotMeta?.endTime ||
                null;

              return {
                ...conflict,
                conflictInfo: {
                  ...conflict.conflictInfo,
                  startTime: fallbackStart,
                  endTime: fallbackEnd,
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
            console.log('All sessions created successfully:', sessionsPayload.length);
          }
        } catch (sessionError) {
          // Lỗi khi tạo sessions - hiển thị modal lỗi chi tiết
          console.error("Error creating sessions:", sessionError);
          const errorData = sessionError?.response?.data || {};
          const errorMessage = errorData.message || sessionError?.message || "Không thể tạo buổi học";
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
          }
          
          // Hiển thị modal lỗi
          setErrorModal({
            open: true,
            title: status === 400 ? "Lỗi Validation Sessions" : "Lỗi Tạo Buổi Học",
            message: `Lớp đã tạo thành công (ClassID: ${classId}), nhưng có lỗi khi tạo buổi học:\n\n${errorMessage}\n\nVui lòng kiểm tra và tạo lại buổi học trong màn lịch.`,
            errors: fieldErrors,
            redirectPath: "/admin/classes",
            redirectState: {
              message: `Lớp đã tạo (ClassID: ${classId}) nhưng lịch học chưa được thêm. Vui lòng kiểm tra lại.`,
              warning: true,
            },
          });
          
          // Không navigate ngay, để user có thể xem lỗi và quyết định
          setSubmitting(false);
          return;
        }
      } else {
        // Không có sessions - cảnh báo nhưng vẫn cho phép tạo lớp
        console.warn("No sessions provided. Class created without sessions.");
        setErrorModal({
          open: true,
          title: "Cảnh Báo",
          message: `Lớp đã tạo thành công (ClassID: ${classId}), nhưng không có buổi học nào được tạo.\n\nVui lòng tạo buổi học trong màn lịch sau.`,
          errors: {},
          redirectPath: null,
          redirectState: null,
        });
        setSubmitting(false);
        return;
      }

      // 3) Thành công → quay lại trang danh sách
      navigate("/admin/classes", {
        state: {
          message: `Tạo lớp (nháp) thành công. Đã tạo ${submitData.sessions.length} buổi học.`,
        },
        replace: true,
      });
    } catch (e) {
      console.error("Create class error:", e);
      
      // Parse error từ backend
      const errorData = e?.response?.data || {};
      const errorMessage = errorData.message || e?.message || "Không thể tạo lớp";
      const status = e?.response?.status;
      
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
      <h1 style={{ margin: 0, marginBottom: "16px" }}>Tạo lớp học</h1>
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
        <div style={{ opacity: submitting ? 0.6 : 1, pointerEvents: submitting ? "none" : "auto" }}>
          <ClassWizard
            classData={null}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            instructors={instructors}
            timeslots={timeslots}
            variant="page"
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


