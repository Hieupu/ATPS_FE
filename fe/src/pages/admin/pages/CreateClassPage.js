import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import ClassWizard from "../components/class-management/ClassWizard";
import ErrorModal from "../components/class-management/ErrorModal";
import classService from "../../../apiServices/classService";
import dayjs from "dayjs";
import { getDayFromDate } from "../../../utils/validate";
import {
  detectMetadataChanges,
  detectScheduleChanges,
  determineChangeType,
  buildMetadataPayload,
  buildSchedulePayload,
} from "../../../utils/classUpdateHelper";

const CreateClassPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams(); // Lấy classId từ URL nếu đang edit
  const [classData, setClassData] = useState(null); // Class data khi edit
  const isReadonly = location.state?.readonly || false; // Kiểm tra mode readonly
  const lockBasicInfoFromState = location.state?.lockBasicInfo || false;
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
  const submissionRef = useRef(null);

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

  const handleSubmit = async (submitData) => {
    setSubmitting(true);
    setError("");
    submissionRef.current = submitData;
    try {
      const isEdit = !!classId;

      // 1. Detect changes (chỉ cho edit mode)
      let metadataChanges = {};
      let scheduleChanges = {
        update: [],
        create: [],
        delete: [],
        reschedule: [],
      };
      let changeType = "NONE";

      if (isEdit && classData) {
  
        metadataChanges = detectMetadataChanges(submitData, classData);


        const newSessions = submitData.sessions || [];
        const oldSessions = classData.sessions || [];
        scheduleChanges = detectScheduleChanges(newSessions, oldSessions);

        changeType = determineChangeType(metadataChanges, scheduleChanges);

        console.log("[CreateClassPage] Change detection:", {
          metadataChanges,
          scheduleChanges: {
            update: scheduleChanges.update.length,
            create: scheduleChanges.create.length,
            delete: scheduleChanges.delete.length,
            reschedule: scheduleChanges.reschedule.length,
          },
          changeType,
        });
      }

      // 2. Xử lý theo change type (chỉ cho edit mode)
      if (isEdit && changeType === "METADATA_ONLY") {
        // Chỉ có metadata changes → chỉ gọi updateClass()
        const metadataPayload = buildMetadataPayload(metadataChanges);
        await classService.updateClass(classId, metadataPayload);

        // Thành công → quay lại trang danh sách
        navigate("/admin/classes", {
          state: {
            message: "Cập nhật lớp học thành công.",
          },
          replace: true,
        });
        setSubmitting(false);
        return;
      }

      // 3. Tạo hoặc cập nhật class (nếu có schedule changes hoặc create mode)
      const classPayload = {
        Name: submitData.Name,
        InstructorID: submitData.InstructorID,
        Fee: submitData.Fee,
        // Trường mới (dbver5) - BẮT BUỘC
        OpendatePlan: submitData.OpendatePlan,
        EnddatePlan: submitData.EnddatePlan,
        Numofsession: submitData.Numofsession,
        Maxstudent: submitData.Maxstudent,
        Status: submitData.Status || "DRAFT",
        CourseID: submitData.CourseID || null,
        StartDate: submitData.StartDate || submitData.OpendatePlan,
        ExpectedSessions:
          submitData.ExpectedSessions || submitData.Numofsession,
        MaxLearners: submitData.MaxLearners || submitData.Maxstudent,
      };

      let resultClass;
      let classIdToUse = classId;

      if (isEdit) {
        const metadataOnlyPayload = buildMetadataPayload(metadataChanges);
        if (Object.keys(metadataOnlyPayload).length > 0) {
          resultClass = await classService.updateClass(
            classId,
            metadataOnlyPayload
          );
        }
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

            const mappedSession = {
              SessionID: s.SessionID || s.sessionId || s.id || null,
              Title: s.Title || `Session ${s.number || index + 1}`,
              Description: s.Description || "",
              Date: dateStr, // YYYY-MM-DD string
              TimeslotID: timeslotId, // Integer
              InstructorID: submitData.InstructorID, // Integer
              ClassID: finalClassId, // Integer
              ZoomUUID: s.ZoomUUID || null,
              // Nếu là buổi rescheduled, gửi originalSessionID để backend biết cần xóa buổi cũ
              originalSessionID: s.originalSessionID || null,
            };

            // Logging để debug
            if (s.originalSessionID) {
              console.log(`[CreateClassPage] Session có originalSessionID:`, {
                Date: dateStr,
                TimeslotID: timeslotId,
                originalSessionID: s.originalSessionID,
                mappedOriginalSessionID: mappedSession.originalSessionID,
              });
            }

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
            // EDIT MODE: Gửi schedule với format mới
            // Build payload mới từ schedule changes
            const schedulePayload = buildSchedulePayload(scheduleChanges, {
              OpendatePlan: submitData.OpendatePlan,
              EnddatePlan: submitData.EnddatePlan,
              Numofsession: submitData.Numofsession,
              InstructorID: submitData.InstructorID,
            });

            console.log(
              "[CreateClassPage] Gửi schedule payload mới:",
              schedulePayload
            );

            bulkResult = await classService.updateClassSchedule(
              finalClassId,
              schedulePayload
            );
          } else {
            // CREATE MODE: bulk create như hiện tại (backend sẽ tạo ZoomUUID nếu có ZoomID)
            bulkResult = await classService.bulkCreateSessions(sessionsPayload);
          }

          // Logic mới: backend phải tạo đủ sessions hoặc trả lỗi; FE không còn xử lý kiểu
          // "tạo được một phần + gợi ý buổi học bù". Nếu backend vẫn trả flags hasConflicts,
          // cứ coi đó là lỗi và hiển thị ErrorModal chung.
          if (
            bulkResult?.hasConflicts ||
            bulkResult?.hasConflict ||
            bulkResult?.success === false
          ) {
            const message =
              bulkResult?.message ||
              "Backend báo có xung đột khi tạo buổi học. Vui lòng kiểm tra lại bước 3.";
            throw {
              response: {
                data: { message },
                status: 400,
              },
            };
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
            userRole="admin"
            lockBasicInfo={lockBasicInfoFromState}
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
    </div>
  );
};

export default CreateClassPage;
