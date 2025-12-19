import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
  Chip,
  CircularProgress,
  Paper,
  Tabs,
  Tab,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormControl,
  FormLabel,
  Pagination,
  Divider,
  Autocomplete,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
} from "@mui/material";
import {
  Add,
  Search,
  Class,
  EditNote,
  HourglassEmpty,
  CheckCircle,
  Publish,
  PlayArrow,
  Lock,
  Cancel,
  Event,
} from "@mui/icons-material";
import classService from "../../../apiServices/classService";
import enrollmentService from "../../../apiServices/enrollmentService";
import { toast } from "react-toastify";
import {
  ClassList,
  ClassForm,
  ClassWizard,
  StudentSelector,
} from "../../admin/components/class-management";
import {
  CLASS_STATUS,
  getStatusInfo,
  normalizeStatus,
} from "../../../constants/classStatus";
import { useAuth } from "../../../contexts/AuthContext";

const ClassesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const currentStaffId = user?.StaffID; // Lấy StaffID của staff hiện tại
  const urlInstructorId = searchParams.get("instructorId");
  const urlCourseId = searchParams.get("courseId");

  const [classes, setClasses] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [learners, setLearners] = useState([]);
  const [courses, setCourses] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showClassForm, setShowClassForm] = useState(false);
  const [showClassWizard, setShowClassWizard] = useState(false);
  const [showStudentSelector, setShowStudentSelector] = useState(false);
  const [selectedClass, setSelectedClass] = useState(null);

  // Dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    title: "",
    message: "",
    confirmText: "Xác nhận",
    confirmColor: "primary",
    onConfirm: null,
  });

  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [classToReject, setClassToReject] = useState(null);

  const openConfirmDialog = ({
    title,
    message,
    confirmText = "Xác nhận",
    confirmColor = "primary",
    onConfirm,
  }) => {
    setConfirmDialog({
      open: true,
      title,
      message,
      confirmText,
      confirmColor,
      onConfirm,
    });
  };

  const closeConfirmDialog = () => {
    setConfirmDialog({
      open: false,
      title: "",
      message: "",
      confirmText: "Xác nhận",
      confirmColor: "primary",
      onConfirm: null,
    });
  };

  const handleConfirmDialogConfirm = () => {
    if (confirmDialog.onConfirm) {
      confirmDialog.onConfirm();
    }
    closeConfirmDialog();
  };

  // Filter and search
  const [searchInput, setSearchInput] = useState(""); // Input value for class name search
  const [searchTerm, setSearchTerm] = useState(""); // Actual search term
  const [instructorInput, setInstructorInput] = useState(
    urlInstructorId || "all"
  );
  const [instructorFilter, setInstructorFilter] = useState(
    urlInstructorId || "all"
  );
  const [courseInput, setCourseInput] = useState(urlCourseId || "all");
  const [courseFilter, setCourseFilter] = useState(urlCourseId || "all");
  const [tabValue, setTabValue] = useState(0);
  const [dateFilterType, setDateFilterType] = useState("opendate"); // "opendate" or "daterange"
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [openingSoonDays, setOpeningSoonDays] = useState(5); // Số ngày cho "Sắp tới hạn mở lớp" (mặc định 5 ngày)

  // Pagination
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  // Sync filters with URL params
  useEffect(() => {
    if (urlInstructorId) {
      setInstructorFilter(urlInstructorId);
      setInstructorInput(urlInstructorId);
    } else {
      setInstructorFilter("all");
      setInstructorInput("all");
    }
    if (urlCourseId) {
      setCourseFilter(urlCourseId);
      setCourseInput(urlCourseId);
    } else {
      setCourseFilter("all");
      setCourseInput("all");
    }
  }, [urlInstructorId, urlCourseId]);

  const loadData = async () => {
    try {
      setLoading(true);
      // Tự động cập nhật trạng thái lớp học theo ngày trước khi load
      await classService.autoUpdateClassStatus();

      const [
        classesData,
        instructorsData,
        learnersData,
        coursesData,
        timeslotResponse,
      ] = await Promise.all([
        // Lấy tất cả lớp học, truyền role và staffID để backend filter
        classService.getAllClasses({
          userRole: user?.role,
          staffID: currentStaffId,
        }),
        classService.getAllInstructors(),
        classService.getAllLearners(),
        classService.getAllCourses(),
        classService.getAllTimeslots({ limit: 500 }),
      ]);

      // Đảm bảo dữ liệu là array
      let classesArray = Array.isArray(classesData) ? classesData : [];

      const timeslotsArray = Array.isArray(timeslotResponse?.data)
        ? timeslotResponse.data
        : [];
      // Load enrollments và sessions cho từng lớp học nếu chưa có trong data
      classesArray = await Promise.all(
        classesArray.map(async (classItem) => {
          const classId = classItem.ClassID || classItem.id;
          let updatedItem = { ...classItem };

          // Load enrollments nếu chưa có
          if (
            updatedItem.enrolledStudents === undefined ||
            !Array.isArray(updatedItem.enrolledStudents)
          ) {
            try {
              if (classId) {
                const enrollments = await classService.getEnrollmentsByClassId(
                  classId
                );
                // Lấy danh sách LearnerID từ enrollments
                const enrolledIds = Array.isArray(enrollments)
                  ? enrollments
                      .map(
                        (enrollment) =>
                          enrollment.LearnerID ||
                          enrollment.Learner?.LearnerID ||
                          enrollment.id
                      )
                      .filter((id) => id !== undefined && id !== null)
                  : [];
                updatedItem.enrolledStudents = enrolledIds;
              }
            } catch (error) {
              console.warn(
                `Could not load enrollments for class ${classId}:`,
                error
              );
              updatedItem.enrolledStudents = [];
            }
          }

          // Load sessions nếu chưa có - ưu tiên dùng API đặc biệt cho frontend
          if (
            updatedItem.Sessions === undefined ||
            !Array.isArray(updatedItem.Sessions)
          ) {
            try {
              if (classId) {
                // Ưu tiên dùng API đặc biệt (đã có StartTime, EndTime)
                const sessions = await classService.getClassSessionsForFrontend(
                  classId
                );
                updatedItem.Sessions = Array.isArray(sessions) ? sessions : [];
              }
            } catch (error) {
              // Fallback: dùng API thông thường
              try {
                if (classId) {
                  const fallbackSessions =
                    await classService.getSessionsByClassId(classId);
                  updatedItem.Sessions = Array.isArray(fallbackSessions)
                    ? fallbackSessions
                    : [];
                }
              } catch (fallbackError) {
                // Silent fail for sessions - có thể lớp chưa có lịch
                updatedItem.Sessions = [];
              }
            }
          }

          // Load instructor nếu chưa có trong classItem
          const instructorId =
            updatedItem.InstructorID || updatedItem.instructorId;
          if (instructorId && !updatedItem.Instructor) {
            // Tìm trong instructors list đã load
            const foundInstructor = instructorsData.find((inst) => {
              const instId = inst.InstructorID || inst.id;
              return (
                instId === instructorId ||
                instId === parseInt(instructorId) ||
                parseInt(instId) === instructorId ||
                String(instId) === String(instructorId)
              );
            });

            if (foundInstructor) {
              updatedItem.Instructor = foundInstructor;
            } else {
              // Nếu không tìm thấy, có thể log để debug
              console.warn(
                `Class ${classId} has InstructorID ${instructorId} but instructor not found in instructors list`
              );
            }
          }

          return updatedItem;
        })
      );

      setClasses(classesArray);
      setInstructors(Array.isArray(instructorsData) ? instructorsData : []);
      setLearners(Array.isArray(learnersData) ? learnersData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setTimeslots(timeslotsArray);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      console.error("Error details:", error.response?.data || error.message);
      toast.error("Không thể tải dữ liệu. Vui lòng thử lại!");

      // Set empty arrays để tránh crash
      setClasses([]);
      setInstructors([]);
      setLearners([]);
      setCourses([]);
      setTimeslots([]);
    } finally {
      setLoading(false);
    }
  };

  // Handlers
  const handleAddClass = () => {
    navigate("/staff/classes/new");
  };

  const handleEditClass = (classItem) => {
    const status = normalizeStatus(classItem.Status || classItem.status);
    // Staff chỉ có thể chỉnh sửa khi status là DRAFT, còn lại chỉ xem
    if (status === CLASS_STATUS.DRAFT) {
      // Cho phép chỉnh sửa - navigate đến edit page
      navigate(`/staff/classes/edit/${classItem.ClassID || classItem.id}`);
    } else {
      // Chỉ xem - navigate đến edit page với mode readonly
      navigate(`/staff/classes/edit/${classItem.ClassID || classItem.id}`, {
        state: { readonly: true },
      });
    }
  };

  // Staff gửi lớp để duyệt (DRAFT → PENDING)
  // Backend sẽ tự động gửi notification đến toàn bộ admin
  const handleSubmitForApproval = async (classId) => {
    openConfirmDialog({
      title: "Gửi lớp để duyệt",
      message:
        "Bạn có chắc muốn gửi lớp học này để duyệt? Lớp sẽ chuyển sang trạng thái 'Chờ duyệt' và thông báo sẽ được gửi đến tất cả admin.",
      confirmText: "Gửi duyệt",
      confirmColor: "primary",
      onConfirm: async () => {
        try {
          await classService.submitClassForApproval(classId);
          toast.success(
            "Đã gửi yêu cầu duyệt lớp thành công! Lớp sẽ được duyệt bởi admin."
          );
          await loadData();
        } catch (error) {
          console.error("Lỗi khi gửi duyệt lớp:", error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể gửi duyệt lớp học. Vui lòng thử lại!";
          toast.error(`Lỗi: ${errorMessage}`);
        }
      },
    });
  };

  // Staff hủy yêu cầu duyệt (PENDING → DRAFT)
  const handleCancelApproval = async (classId) => {
    openConfirmDialog({
      title: "Hủy yêu cầu duyệt",
      message:
        "Bạn có chắc muốn hủy yêu cầu duyệt lớp này? Lớp sẽ chuyển về trạng thái 'Nháp'.",
      confirmText: "Hủy yêu cầu",
      confirmColor: "warning",
      onConfirm: async () => {
        try {
          await classService.updateClass(classId, {
            Status: CLASS_STATUS.DRAFT,
          });
          toast.success("Đã hủy yêu cầu duyệt lớp thành công!");
          await loadData();
        } catch (error) {
          console.error("Lỗi khi hủy yêu cầu duyệt:", error);
          const errorMessage =
            error?.response?.data?.message ||
            error?.message ||
            "Không thể hủy yêu cầu duyệt. Vui lòng thử lại!";
          toast.error(`Lỗi: ${errorMessage}`);
        }
      },
    });
  };

  const handleManageStudents = (classItem) => {
    setSelectedClass(classItem);
    setShowStudentSelector(true);
  };

  const handleSubmitClassForm = async (formData) => {
    try {
      const apiData = {
        Name: formData.title,
        Fee:
          formData.tuitionFee && parseFloat(formData.tuitionFee) > 0
            ? parseFloat(formData.tuitionFee)
            : 0,
        Status: formData.status,
        InstructorID: formData.instructorId || null,
        // Trường mới (dbver5)
        Maxstudent: parseInt(formData.maxStudents) || null,
        OpendatePlan: formData.opendatePlan || null,
        EnddatePlan: formData.enddatePlan || null,
        Numofsession: parseInt(formData.numofsession) || null,
        ZoomID: formData.zoomID || null,
        Zoompass: formData.zoompass || null,
        // Trường cũ (backward compatibility - sẽ bỏ khi backend cập nhật)
        MaxLearners: parseInt(formData.maxStudents) || null,
        StartDate: formData.opendatePlan || null,
        ExpectedSessions: parseInt(formData.numofsession) || null,
      };

      if (selectedClass) {
        // Update existing class
        await classService.updateClass(selectedClass.ClassID, apiData);
        toast.success("Cập nhật lớp học thành công!");
      } else {
        // Create new class
        await classService.createClass(apiData);
        toast.success("Thêm lớp học mới thành công!");
      }
      setShowClassForm(false);
      setSelectedClass(null);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi lưu lớp học:", error);
      toast.error("Không thể lưu lớp học. Vui lòng thử lại!");
    }
  };

  const handleSubmitWizard = async (formData) => {
    try {
      // Tách sessions ra khỏi classData để gửi riêng
      const { sessions, ...classData } = formData;
      // Tạo class trước
      const createdClass = await classService.createClass(classData);
      const classId =
        createdClass.ClassID ||
        createdClass.id ||
        createdClass.data?.ClassID ||
        createdClass.data?.id;

      if (!classId) {
        throw new Error("Không thể lấy ClassID sau khi tạo lớp học");
      }

      // Tạo sessions sau khi class đã được tạo
      if (sessions && Array.isArray(sessions) && sessions.length > 0) {
        try {
          // Thêm ClassID vào mỗi session
          const sessionsWithClassId = sessions.map((session) => ({
            Title: session.Title || `Session ${session.Date || ""}`,
            Description: session.Description || "",
            ClassID: classId,
            TimeslotID: session.TimeslotID,
            InstructorID: session.InstructorID || classData.InstructorID,
            Date: session.Date,
          }));

          // Validate sessions trước khi gửi
          const invalidSessions = sessionsWithClassId.filter(
            (s) =>
              !s.Title ||
              !s.ClassID ||
              !s.TimeslotID ||
              !s.InstructorID ||
              !s.Date
          );

          if (invalidSessions.length > 0) {
            console.error("Invalid sessions:", invalidSessions);
            throw new Error(
              `Có ${invalidSessions.length} session không hợp lệ. Vui lòng kiểm tra lại.`
            );
          }

          // Gọi bulk create sessions
          const sessionResponse = await classService.bulkCreateSessions(
            sessionsWithClassId
          );

          // Kiểm tra conflicts từ response
          if (
            sessionResponse?.hasConflicts ||
            sessionResponse?.data?.conflicts?.length > 0
          ) {
            const conflicts =
              sessionResponse.data?.conflicts ||
              sessionResponse.conflicts ||
              [];
            const created =
              sessionResponse.data?.created || sessionResponse.created || [];

            // Hiển thị thông báo về conflicts
            if (created.length > 0) {
              toast.warning(
                `Lớp học đã được tạo! Đã tạo ${created.length} buổi học thành công. Có ${conflicts.length} buổi học bị trùng lịch. Vui lòng vào trang lịch học để xem chi tiết và xử lý các buổi học bị trùng.`,
                { autoClose: 8000 }
              );
            } else {
              toast.warning(
                `Lớp học đã được tạo! Tất cả ${conflicts.length} buổi học đều bị trùng lịch. Vui lòng vào trang lịch học để xem chi tiết và tạo lại lịch học.`,
                { autoClose: 8000 }
              );
            }
          } else {
          }
        } catch (sessionError) {
          console.error("Lỗi khi tạo sessions:", sessionError);

          // Kiểm tra nếu error có conflict info
          const errorData = sessionError.response?.data || sessionError;
          const errorMessage =
            sessionError?.message || errorData?.message || "";

          const isConflictError =
            errorMessage.includes("trùng") ||
            errorMessage.includes("trùng thời gian") ||
            errorMessage.includes("trùng lịch") ||
            errorMessage.includes("conflict") ||
            errorMessage.includes("đã có ca học") ||
            errorMessage.includes("đã có session");

          if (
            isConflictError ||
            errorData?.hasConflicts ||
            errorData?.hasConflict
          ) {
            // Có conflict - hiển thị thông báo
            toast.warning(
              `Lớp học đã được tạo! Có lỗi khi tạo lịch học do trùng ca: ${errorMessage}. Vui lòng vào trang lịch học để xem chi tiết và tạo lại lịch học.`,
              { autoClose: 8000 }
            );
          } else {
            // Lỗi khác
            toast.warning(
              `Lớp học đã được tạo nhưng có lỗi khi tạo lịch học: ${errorMessage}. Vui lòng tạo lịch học thủ công sau.`,
              { autoClose: 8000 }
            );
          }

          setShowClassWizard(false);
          await loadData();
          return;
        }
      }

      toast.success(
        `Tạo lớp học mới thành công! Trạng thái: DRAFT. Đã tạo ${
          sessions?.length || 0
        } buổi học.`
      );
      setShowClassWizard(false);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi tạo lớp học:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Không thể tạo lớp học. Vui lòng thử lại!";
      toast.error(`Lỗi: ${errorMessage}`);
    }
  };

  const handleReviewClass = async (classId, action) => {
    if (action === "REJECT") {
      setClassToReject(classId);
      setRejectReason("");
      setRejectDialogOpen(true);
    } else {
      openConfirmDialog({
        title: "Chấp thuận lớp học",
        message: "Bạn có chắc muốn chấp thuận lớp học này?",
        confirmText: "Chấp thuận",
        confirmColor: "success",
        onConfirm: async () => {
          try {
            await classService.reviewClass(classId, action);
            toast.success("Đã chấp thuận lớp học!");
            await loadData();
          } catch (error) {
            console.error("Lỗi khi chấp thuận lớp:", error);
            toast.error("Không thể chấp thuận lớp học. Vui lòng thử lại!");
          }
        },
      });
    }
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }
    try {
      await classService.reviewClass(classToReject, "REJECT", rejectReason);
      toast.success("Đã từ chối lớp học!");
      setRejectDialogOpen(false);
      setRejectReason("");
      setClassToReject(null);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi từ chối lớp:", error);
      toast.error("Không thể từ chối lớp học. Vui lòng thử lại!");
    }
  };

  // Staff không có quyền duyệt lớp - chỉ có quyền gửi duyệt (handleSubmitForApproval)

  const handleChangeStatus = async (classId, newStatus) => {
    let confirmMessage = "";
    let successMessage = "";

    if (newStatus === "DRAFT") {
      confirmMessage =
        "⚠️ Bạn có chắc muốn chuyển lớp học này về trạng thái 'Nháp'?";
      successMessage = "Đã chuyển lớp học về trạng thái 'Nháp' thành công!";
    } else if (newStatus === "CANCEL") {
      confirmMessage = "⚠️ Bạn có chắc muốn hủy lớp học này?";
      successMessage = "Đã hủy lớp học thành công!";
    }

    openConfirmDialog({
      title: "Xác nhận thay đổi trạng thái",
      message: confirmMessage,
      confirmText: "Xác nhận",
      confirmColor: newStatus === "CANCEL" ? "error" : "warning",
      onConfirm: async () => {
        try {
          // Dùng updateClass để cập nhật Status
          await classService.updateClass(classId, { Status: newStatus });
          toast.success(successMessage);
          await loadData();
        } catch (error) {
          console.error(`Lỗi khi chuyển trạng thái lớp:`, error);
          toast.error("Không thể chuyển trạng thái lớp học. Vui lòng thử lại!");
        }
      },
    });
  };

  // Staff không có quyền xuất bản lớp - chỉ admin mới có quyền này

  const handleUpdateStudents = async (updatedEnrolledIds) => {
    try {
      // Xóa enrollments cũ và thêm enrollments mới
      const classId = selectedClass.ClassID || selectedClass.id;

      // Có thể cần API riêng để xóa enrollment
      // Tạm thời dùng updateClass với enrolledStudents
      await classService.updateClass(classId, {
        enrolledStudents: updatedEnrolledIds,
      });

      toast.success("Cập nhật danh sách học viên thành công!");
      setShowStudentSelector(false);
      setSelectedClass(null);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi cập nhật học viên:", error);
      toast.error("Không thể cập nhật học viên. Vui lòng thử lại!");
    }
  };

  // Handle search and filters
  const applyFilters = () => {
    setSearchTerm(searchInput);
    setInstructorFilter(instructorInput);
    setCourseFilter(courseInput);
    setPage(1);

    // Update URL with filters
    const newParams = new URLSearchParams();
    if (instructorInput && instructorInput !== "all") {
      newParams.set("instructorId", instructorInput);
    }
    if (courseInput && courseInput !== "all") {
      newParams.set("courseId", courseInput);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setInstructorInput("all");
    setInstructorFilter("all");
    setCourseInput("all");
    setCourseFilter("all");
    setPage(1);
    setStartDateFilter("");
    setEndDateFilter("");

    // Navigate to base URL without query params
    navigate("/staff/classes");
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      applyFilters();
    }
  };

  // Filter classes by search
  const searchFilteredClasses = classes.filter((classItem) => {
    // Search filter (only by class name and description, not instructor)
    if (searchTerm) {
      const className = classItem.Name || classItem.title || "";
      const description = classItem.description || "";

      const matchesSearch =
        className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
    }

    // Instructor filter
    if (instructorFilter && instructorFilter !== "all") {
      const classInstructorId =
        classItem.InstructorID ||
        classItem.Instructor?.InstructorID ||
        classItem.instructorId;
      if (
        !classInstructorId ||
        String(classInstructorId) !== String(instructorFilter)
      ) {
        return false;
      }
    }

    // Course filter
    if (courseFilter && courseFilter !== "all") {
      const classCourseId =
        classItem.CourseID || classItem.Course?.CourseID || classItem.courseId;
      if (!classCourseId || String(classCourseId) !== String(courseFilter)) {
        return false;
      }
    }

    // Date filter - Có 2 loại filter
    if (dateFilterType === "opendate") {
      // Filter theo ngày dự kiến bắt đầu (OpendatePlan)
      if (startDateFilter) {
        const classStartDate = classItem.OpendatePlan;
        if (!classStartDate || classStartDate < startDateFilter) {
          return false;
        }
      }

      if (endDateFilter) {
        const classStartDate = classItem.OpendatePlan;
        if (!classStartDate || classStartDate > endDateFilter) {
          return false;
        }
      }
    } else if (dateFilterType === "daterange") {
      // Filter theo khoảng thời gian - lấy các lớp đang diễn ra trong khoảng đó
      // Lớp đang diễn ra trong khoảng thời gian nếu:
      // OpendatePlan <= endDateFilter && EnddatePlan >= startDateFilter
      if (startDateFilter && endDateFilter) {
        const opendatePlan = classItem.OpendatePlan;
        const enddatePlan = classItem.EnddatePlan;

        // Nếu không có OpendatePlan hoặc EnddatePlan thì bỏ qua
        if (!opendatePlan || !enddatePlan) {
          return false;
        }

        // Kiểm tra xem lớp có đang diễn ra trong khoảng thời gian không
        // Lớp đang diễn ra nếu: OpendatePlan <= endDateFilter && EnddatePlan >= startDateFilter
        if (opendatePlan > endDateFilter || enddatePlan < startDateFilter) {
          return false;
        }
      } else if (startDateFilter) {
        // Chỉ có startDateFilter - lấy các lớp có EnddatePlan >= startDateFilter
        const enddatePlan = classItem.EnddatePlan;
        if (!enddatePlan || enddatePlan < startDateFilter) {
          return false;
        }
      } else if (endDateFilter) {
        // Chỉ có endDateFilter - lấy các lớp có OpendatePlan <= endDateFilter
        const opendatePlan = classItem.OpendatePlan;
        if (!opendatePlan || opendatePlan > endDateFilter) {
          return false;
        }
      }
    }

    return true;
  });

  // Helper function: Check if class is opening soon (within specified days)
  // Điều kiện:
  // - Status: PENDING / APPROVED / ACTIVE (đã duyệt)
  // - OpendatePlan trong khoảng 0..days từ hôm nay
  // Lưu ý: Không kiểm tra Opendate - hiển thị cả lớp đã mở nếu OpendatePlan trong khoảng
  const isOpeningSoon = (classItem, days = openingSoonDays) => {
    const classId = classItem.ClassID || classItem.id;
    const status = normalizeStatus(classItem.Status || classItem.status);

    const allowedStatuses = [
      CLASS_STATUS.PENDING,
      CLASS_STATUS.APPROVED,
      CLASS_STATUS.ACTIVE,
    ];

    // Điều kiện 1: Status phải đúng
    if (!allowedStatuses.includes(status)) {
      return false;
    }

    // Điều kiện 2: Phải có OpendatePlan
    const opendatePlan = classItem.OpendatePlan;
    if (!opendatePlan) {
      return false;
    }

    // Điều kiện 3: OpendatePlan trong khoảng 0..days từ hôm nay
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const opendatePlanDate = new Date(opendatePlan);
    if (Number.isNaN(opendatePlanDate.getTime())) {
      return false;
    }
    opendatePlanDate.setHours(0, 0, 0, 0);

    const daysDiff = Math.ceil(
      (opendatePlanDate - today) / (1000 * 60 * 60 * 24)
    );
    const result = daysDiff >= 0 && daysDiff <= Number(days || 0);

    return result;
  };

  // Filter by status tab
  // Lưu ý: Backend đã filter CHỈ lấy các lớp do staff hiện tại tạo (CreatedByStaffID = staffID)
  // Nên frontend chỉ cần filter theo status
  // Bỏ tab "Sắp tới hạn mở lớp" cho staff
  const getFilteredClasses = () => {
    switch (tabValue) {
      case 0: // All - hiển thị tất cả lớp do staff hiện tại tạo
        return searchFilteredClasses;
      case 1: // DRAFT
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.DRAFT
        );
      case 2: // PENDING
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.PENDING
        );
      case 3: // APPROVED
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.APPROVED
        );
      case 4: // ACTIVE
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.ACTIVE
        );
      case 5: // ON_GOING
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.ON_GOING
        );
      case 6: // CLOSE
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.CLOSE
        );
      case 7: // CANCEL
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status) === CLASS_STATUS.CANCEL
        );
      default:
        return searchFilteredClasses;
    }
  };

  const filteredClasses = getFilteredClasses();

  // Phân trang
  const paginatedClasses = useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredClasses.slice(startIndex, endIndex);
  }, [filteredClasses, page, pageSize]);

  const totalPages = Math.ceil(filteredClasses.length / pageSize) || 1;

  // Reset về trang 1 khi filter thay đổi
  useEffect(() => {
    setPage(1);
  }, [
    searchTerm,
    instructorFilter,
    courseFilter,
    tabValue,
    dateFilterType,
    startDateFilter,
    endDateFilter,
    openingSoonDays,
  ]);

  // Statistics - Backend đã filter CHỈ lấy các lớp do staff hiện tại tạo
  // Nên chỉ cần filter theo status
  const stats = {
    total: classes.length, // Đã được filter bởi backend (chỉ lớp do staff hiện tại tạo)
    draft: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.DRAFT
    ).length,
    pending: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.PENDING
    ).length,
    approved: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.APPROVED
    ).length,
    active: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.ACTIVE
    ).length,
    onGoing: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.ON_GOING
    ).length,
    closed: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.CLOSE
    ).length,
    cancelled: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.CANCEL
    ).length,
  };

  const statCards = [
    {
      label: "Tổng số lớp",
      value: stats.total,
      icon: <Class sx={{ fontSize: 32 }} />,
      color: "#667eea",
      bgColor: "#f0f4ff",
    },
    {
      label: "Nháp",
      value: stats.draft,
      icon: <EditNote sx={{ fontSize: 32 }} />,
      color: "#f59e0b",
      bgColor: "#fffbeb",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
      color: "#f97316",
      bgColor: "#fff7ed",
    },
    {
      label: "Đã duyệt",
      value: stats.approved,
      icon: <CheckCircle sx={{ fontSize: 32 }} />,
      color: "#10b981",
      bgColor: "#f0fdf4",
    },
    {
      label: "Đang tuyển sinh",
      value: stats.active,
      icon: <Publish sx={{ fontSize: 32 }} />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
    },
    {
      label: "Đang diễn ra",
      value: stats.onGoing,
      icon: <PlayArrow sx={{ fontSize: 32 }} />,
      color: "#8b5cf6",
      bgColor: "#faf5ff",
    },
    {
      label: "Đã kết thúc",
      value: stats.closed,
      icon: <Lock sx={{ fontSize: 32 }} />,
      color: "#6b7280",
      bgColor: "#f9fafb",
    },
    {
      label: "Đã hủy",
      value: stats.cancelled,
      icon: <Cancel sx={{ fontSize: 32 }} />,
      color: "#ef4444",
      bgColor: "#fef2f2",
    },
  ];

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quản lý lớp học
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Quản lý lớp học, lịch lớp học
            </Typography>
          </Box>
          <Button
            variant="contained"
            onClick={handleAddClass}
            sx={{
              backgroundColor: "#667eea",
              textTransform: "none",
              px: 3,
              py: 1.5,
              borderRadius: 2,
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#5568d3",
              },
            }}
          >
            Tạo lớp
          </Button>
        </Box>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          {statCards.map((stat, index) => (
            <Grid item xs={6} sm={4} md={2.4} key={index}>
              <Card
                sx={{
                  borderRadius: 3,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 8px 16px rgba(0,0,0,0.1)",
                  },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 2,
                      mb: 1,
                    }}
                  >
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        backgroundColor: stat.bgColor,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: stat.color,
                      }}
                    >
                      {stat.icon}
                    </Box>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 700 }}>
                        {stat.value}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "#64748b", fontSize: "13px" }}
                      >
                        {stat.label}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Filters */}
        <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
          <TextField
            placeholder="Tìm kiếm lớp học (tên, mô tả)..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            sx={{
              flex: 1,
              minWidth: "250px",
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                backgroundColor: "#fff",
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
          />
          <Autocomplete
            size="small"
            options={[
              { InstructorID: "all", FullName: "Tất cả giảng viên" },
              ...instructors,
            ]}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.FullName || ""
            }
            value={
              instructorInput === "all"
                ? { InstructorID: "all", FullName: "Tất cả giảng viên" }
                : instructors.find(
                    (i) => i.InstructorID === parseInt(instructorInput)
                  ) || { InstructorID: "all", FullName: "Tất cả giảng viên" }
            }
            onChange={(event, newValue) => {
              if (newValue) {
                setInstructorInput(
                  newValue.InstructorID === "all"
                    ? "all"
                    : newValue.InstructorID.toString()
                );
              } else {
                setInstructorInput("all");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Giảng viên"
                placeholder="Tìm kiếm giảng viên..."
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.InstructorID === value.InstructorID
            }
          />
          <Autocomplete
            size="small"
            options={[
              { CourseID: "all", Title: "Tất cả khóa học" },
              ...courses,
            ]}
            getOptionLabel={(option) =>
              typeof option === "string" ? option : option.Title || ""
            }
            value={
              courseInput === "all"
                ? { CourseID: "all", Title: "Tất cả khóa học" }
                : courses.find((c) => c.CourseID === parseInt(courseInput)) || {
                    CourseID: "all",
                    Title: "Tất cả khóa học",
                  }
            }
            onChange={(event, newValue) => {
              if (newValue) {
                setCourseInput(
                  newValue.CourseID === "all"
                    ? "all"
                    : newValue.CourseID.toString()
                );
              } else {
                setCourseInput("all");
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Khóa học"
                placeholder="Tìm kiếm khóa học..."
                sx={{
                  minWidth: 200,
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                    backgroundColor: "#fff",
                  },
                }}
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.CourseID === value.CourseID
            }
          />
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              onClick={applyFilters}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                px: 3,
              }}
            >
              Áp dụng
            </Button>
            {(searchTerm ||
              instructorFilter !== "all" ||
              courseFilter !== "all") && (
              <Button
                variant="outlined"
                onClick={resetFilters}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Xóa lọc
              </Button>
            )}
          </Stack>
        </Box>

        {/* Date Filters */}
        <Box sx={{ mb: 3, p: 2, bgcolor: "#f8fafc", borderRadius: 2 }}>
          <FormControl component="fieldset" sx={{ mb: 2 }}>
            <FormLabel
              component="legend"
              sx={{ mb: 1, fontWeight: 600, color: "#1e293b" }}
            >
              Loại filter ngày:
            </FormLabel>
            <RadioGroup
              row
              value={dateFilterType}
              onChange={(e) => {
                setDateFilterType(e.target.value);
                // Reset dates when switching filter type
                setStartDateFilter("");
                setEndDateFilter("");
              }}
            >
              <FormControlLabel
                value="opendate"
                control={<Radio size="small" />}
                label="Ngày dự kiến bắt đầu"
              />
              <FormControlLabel
                value="daterange"
                control={<Radio size="small" />}
                label="Khoảng thời gian (lớp đang diễn ra)"
              />
            </RadioGroup>
          </FormControl>

          <Box
            sx={{
              display: "flex",
              gap: 2,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {dateFilterType === "opendate" ? (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Tìm kiếm theo ngày dự kiến bắt đầu:
                </Typography>
                <TextField
                  label="Từ ngày dự kiến bắt đầu"
                  type="date"
                  size="small"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    minWidth: "200px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <TextField
                  label="Đến ngày dự kiến bắt đầu"
                  type="date"
                  size="small"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  min={startDateFilter}
                  sx={{
                    minWidth: "200px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </>
            ) : (
              <>
                <Typography
                  variant="body2"
                  sx={{ color: "#64748b", fontWeight: 500 }}
                >
                  Tìm kiếm các lớp đang diễn ra trong khoảng thời gian:
                </Typography>
                <TextField
                  label="Từ ngày"
                  type="date"
                  size="small"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  sx={{
                    minWidth: "200px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
                <TextField
                  label="Đến ngày"
                  type="date"
                  size="small"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  min={startDateFilter}
                  sx={{
                    minWidth: "200px",
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                      backgroundColor: "#fff",
                    },
                  }}
                />
              </>
            )}
            {(startDateFilter || endDateFilter) && (
              <Button
                variant="outlined"
                onClick={() => {
                  setStartDateFilter("");
                  setEndDateFilter("");
                }}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                }}
              >
                Xóa bộ lọc ngày
              </Button>
            )}
          </Box>
        </Box>

        {/* Tabs */}
        <Tabs
          value={tabValue}
          onChange={(e, newValue) => setTabValue(newValue)}
          sx={{
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: 600,
              fontSize: "14px",
              minHeight: "48px",
            },
            "& .Mui-selected": {
              color: "#667eea",
            },
            "& .MuiTabs-indicator": {
              backgroundColor: "#667eea",
            },
          }}
        >
          <Tab label={`Tất cả (${searchFilteredClasses.length})`} />
          <Tab
            label={`Nháp (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) === CLASS_STATUS.DRAFT
              ).length
            })`}
          />
          <Tab
            label={`Chờ duyệt (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) === CLASS_STATUS.PENDING
              ).length
            })`}
            iconPosition="start"
          />
          <Tab
            label={`Đã duyệt (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) ===
                  CLASS_STATUS.APPROVED
              ).length
            })`}
          />
          <Tab
            label={`Đang tuyển sinh (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) === CLASS_STATUS.ACTIVE
              ).length
            })`}
          />
          <Tab
            label={`Đang diễn ra (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) ===
                  CLASS_STATUS.ON_GOING
              ).length
            })`}
          />
          <Tab
            label={`Đã kết thúc (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) === CLASS_STATUS.CLOSE
              ).length
            })`}
          />
          <Tab
            label={`Đã hủy (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) === CLASS_STATUS.CANCEL
              ).length
            })`}
          />
        </Tabs>
      </Box>

      {/* Class List */}
      {loading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            py: 8,
          }}
        >
          <CircularProgress sx={{ color: "#667eea" }} />
          <Typography sx={{ ml: 2, color: "#64748b" }}>
            Loading classes...
          </Typography>
        </Box>
      ) : (
        <Box>
          <Box sx={{ mb: 2, px: 1 }}>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Hiển thị{" "}
              <strong style={{ color: "#667eea" }}>
                {(page - 1) * pageSize + 1} -{" "}
                {Math.min(page * pageSize, filteredClasses.length)}
              </strong>{" "}
              trong tổng số {filteredClasses.length} lớp học
              {filteredClasses.length !== classes.length && (
                <span> (tổng {classes.length} lớp)</span>
              )}
            </Typography>
          </Box>
          <ClassList
            classes={paginatedClasses}
            courses={courses}
            instructors={instructors}
            onEdit={handleEditClass}
            onManageStudents={handleManageStudents}
            onChangeStatus={handleChangeStatus}
            onSubmitForApproval={handleSubmitForApproval}
            onCancelApproval={handleCancelApproval}
            userRole="staff"
          />
          {filteredClasses.length > 0 && (
            <>
              <Divider sx={{ my: 2 }} />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 2,
                }}
              >
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                  size="large"
                  showFirstButton
                  showLastButton
                />
              </Box>
            </>
          )}
        </Box>
      )}

      {/* Modals */}
      {showClassWizard && (
        <ClassWizard
          classData={selectedClass}
          instructors={instructors}
          courses={courses}
          timeslots={timeslots}
          onSubmit={handleSubmitWizard}
          onCancel={() => setShowClassWizard(false)}
        />
      )}

      {showClassForm && (
        <ClassForm
          classData={selectedClass}
          instructors={instructors}
          onSubmit={handleSubmitClassForm}
          onCancel={() => setShowClassForm(false)}
        />
      )}

      {showStudentSelector && selectedClass && (
        <StudentSelector
          classData={selectedClass}
          allLearners={learners}
          onClose={() => setShowStudentSelector(false)}
          onUpdate={handleUpdateStudents}
          onChangeClass={undefined} // Staff không có quyền đổi lớp
          userRole="staff" // Truyền userRole để ẩn nút đổi lớp
        />
      )}

      {/* Confirm Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={closeConfirmDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          {confirmDialog.title}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1">{confirmDialog.message}</Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={closeConfirmDialog}
            sx={{ textTransform: "none" }}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmDialogConfirm}
            variant="contained"
            color={confirmDialog.confirmColor}
            sx={{ textTransform: "none" }}
          >
            {confirmDialog.confirmText}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => {
          setRejectDialogOpen(false);
          setRejectReason("");
          setClassToReject(null);
        }}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 2 }}>
          Từ chối lớp học
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối lớp học này.
          </Alert>
          <TextField
            fullWidth
            multiline
            rows={4}
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            placeholder="Nhập lý do từ chối..."
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason("");
              setClassToReject(null);
            }}
            sx={{ textTransform: "none" }}
            color="inherit"
          >
            Hủy
          </Button>
          <Button
            onClick={handleRejectConfirm}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
          >
            Xác nhận từ chối
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ClassesPage;
