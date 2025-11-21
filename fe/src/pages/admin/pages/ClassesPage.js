import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  ClassList,
  ClassForm,
  ClassWizard,
  StudentSelector,
} from "../components/class-management";
import {
  CLASS_STATUS,
  getStatusInfo,
  normalizeStatus,
} from "../../../constants/classStatus";
import "./style.css";

const ClassesPage = () => {
  const navigate = useNavigate();
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

  // Filter and search
  const [searchInput, setSearchInput] = useState(""); // Input value
  const [searchTerm, setSearchTerm] = useState(""); // Actual search term
  const [tabValue, setTabValue] = useState(0);
  const [dateFilterType, setDateFilterType] = useState("opendate"); // "opendate" or "daterange"
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");

  // Load data
  useEffect(() => {
    loadData();
  }, []);

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
        timeslotsData,
      ] = await Promise.all([
        classService.getAllClasses(),
        classService.getAllInstructors(),
        classService.getAllLearners(),
        classService.getAllCourses(),
        classService.getAllTimeslots(),
      ]);

      // Đảm bảo dữ liệu là array
      let classesArray = Array.isArray(classesData) ? classesData : [];

      // Debug: Log mẫu class để kiểm tra cấu trúc dữ liệu
      if (classesArray.length > 0) {
        console.log("Sample class data from API:", {
          ClassID: classesArray[0].ClassID || classesArray[0].id,
          Name: classesArray[0].Name || classesArray[0].title,
          InstructorID:
            classesArray[0].InstructorID || classesArray[0].instructorId,
          Instructor: classesArray[0].Instructor,
          instructorName: classesArray[0].instructorName,
        });
      }

      // Debug: Log instructors data
      if (instructorsData && instructorsData.length > 0) {
        console.log("Instructors loaded:", instructorsData.length);
        console.log("Sample instructor:", {
          InstructorID:
            instructorsData[0].InstructorID || instructorsData[0].id,
          FullName: instructorsData[0].FullName || instructorsData[0].fullName,
        });
      }

      // Cảnh báo nếu không có timeslots (có thể do backend lỗi)
      const timeslotsArray = Array.isArray(timeslotsData) ? timeslotsData : [];
      if (timeslotsArray.length === 0) {
        console.warn("Không tải được danh sách ca học. Có thể do:");
        console.warn("1. Backend chưa hỗ trợ trường 'Day' mới trong timeslot");
        console.warn("2. Database chưa được cập nhật lên dbver5");
        console.warn("3. Backend có lỗi khi query timeslots");
      }

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
      setTimeslots(Array.isArray(timeslotsData) ? timeslotsData : []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
      console.error("Error details:", error.response?.data || error.message);
      alert(" Không thể tải dữ liệu. Vui lòng thử lại!");

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
    navigate("/admin/classes/new");
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setShowClassForm(true);
    setShowClassWizard(false);
  };

  const handleManageStudents = (classItem) => {
    setSelectedClass(classItem);
    setShowStudentSelector(true);
  };

  const handleSubmitClassForm = async (formData) => {
    try {
      // Map formData sang format API theo dbver5
      // Gửi cả trường mới và trường cũ để tương thích với backend (backward compatibility)
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
        alert(" Cập nhật lớp học thành công!");
      } else {
        // Create new class
        await classService.createClass(apiData);
        alert(" Thêm lớp học mới thành công!");
      }
      setShowClassForm(false);
      setSelectedClass(null);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi lưu lớp học:", error);
      alert(" Không thể lưu lớp học. Vui lòng thử lại!");
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

      console.log("Created class with ID:", classId);

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

          console.log("Creating sessions:", sessionsWithClassId);

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
              alert(
                ` Lớp học đã được tạo!\n\n Đã tạo ${created.length} buổi học thành công.\n\n Có ${conflicts.length} buổi học bị trùng lịch.\n\nVui lòng vào trang lịch học để xem chi tiết và xử lý các buổi học bị trùng.`
              );
            } else {
              alert(
                ` Lớp học đã được tạo!\n\n Tất cả ${conflicts.length} buổi học đều bị trùng lịch.\n\nVui lòng vào trang lịch học để xem chi tiết và tạo lại lịch học.`
              );
            }
          } else {
            console.log(` Đã tạo ${sessionsWithClassId.length} buổi học!`);
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
            alert(
              ` Lớp học đã được tạo!\n\n Có lỗi khi tạo lịch học do trùng ca: ${errorMessage}\n\nVui lòng vào trang lịch học để xem chi tiết và tạo lại lịch học.`
            );
          } else {
            // Lỗi khác
            alert(
              ` Lớp học đã được tạo nhưng có lỗi khi tạo lịch học: ${errorMessage}\n\nVui lòng tạo lịch học thủ công sau.`
            );
          }

          setShowClassWizard(false);
          await loadData();
          return;
        }
      }

      alert(
        ` Tạo lớp học mới thành công! Trạng thái: DRAFT\n\nĐã tạo ${
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
      alert(` Lỗi: ${errorMessage}`);
    }
  };

  const handleSubmitForApproval = async (classId) => {
    const confirmed = window.confirm(
      " Bạn có chắc muốn gửi lớp học cho giảng viên chuẩn bị?"
    );
    if (confirmed) {
      try {
        await classService.submitForApproval(classId);
        alert(" Đã gửi lớp học cho giảng viên chuẩn bị!");
        await loadData();
      } catch (error) {
        console.error("Lỗi khi gửi lớp:", error);
        alert(" Không thể gửi lớp học. Vui lòng thử lại!");
      }
    }
  };

  const handleReviewClass = async (classId, action) => {
    if (action === "REJECT") {
      const feedback = window.prompt("Nhập lý do từ chối:");
      if (!feedback) {
        alert("Vui lòng nhập lý do từ chối!");
        return;
      }
      try {
        await classService.reviewClass(classId, action, feedback);
        alert(" Đã từ chối lớp học!");
        await loadData();
      } catch (error) {
        console.error("Lỗi khi từ chối lớp:", error);
        alert(" Không thể từ chối lớp học. Vui lòng thử lại!");
      }
    } else {
      const confirmed = window.confirm(
        " Bạn có chắc muốn chấp thuận lớp học này?"
      );
      if (confirmed) {
        try {
          await classService.reviewClass(classId, action);
          alert(" Đã chấp thuận lớp học!");
          await loadData();
        } catch (error) {
          console.error("Lỗi khi chấp thuận lớp:", error);
          alert(" Không thể chấp thuận lớp học. Vui lòng thử lại!");
        }
      }
    }
  };

  const handlePublishClass = async (classId) => {
    const confirmed = window.confirm(
      "🚀 Bạn có chắc muốn xuất bản lớp học này? Học viên có thể đăng ký sau khi xuất bản."
    );
    if (confirmed) {
      try {
        await classService.publishClass(classId);
        alert(" Đã xuất bản lớp học thành công!");
        await loadData();
      } catch (error) {
        console.error("Lỗi khi xuất bản lớp:", error);
        alert(" Không thể xuất bản lớp học. Vui lòng thử lại!");
      }
    }
  };

  const handleUpdateStudents = async (updatedEnrolledIds) => {
    try {
      // Xóa enrollments cũ và thêm enrollments mới
      const classId = selectedClass.ClassID || selectedClass.id;

      // Có thể cần API riêng để xóa enrollment
      // Tạm thời dùng updateClass với enrolledStudents
      await classService.updateClass(classId, {
        enrolledStudents: updatedEnrolledIds,
      });

      alert(" Cập nhật danh sách học viên thành công!");
      setShowStudentSelector(false);
      setSelectedClass(null);
      await loadData();
    } catch (error) {
      console.error("Lỗi khi cập nhật học viên:", error);
      alert(" Không thể cập nhật học viên. Vui lòng thử lại!");
    }
  };

  // Handle search
  const handleSearch = () => {
    setSearchTerm(searchInput);
  };

  const handleSearchKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Filter classes by search
  const searchFilteredClasses = classes.filter((classItem) => {
    // Search filter
    if (searchTerm) {
      const className = classItem.Name || classItem.title || "";
      const description = classItem.description || "";
      const instructorName =
        classItem.Instructor?.FullName || classItem.instructorName || "";

      const matchesSearch =
        className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        instructorName.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
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

  // Helper function: Check if class is opening soon (within 5 days)
  // Chỉ lấy các lớp có status ACTIVE (đang tuyển sinh)
  const isOpeningSoon = (classItem) => {
    // Chỉ lấy lớp có status ACTIVE
    const status = normalizeStatus(classItem.Status || classItem.status);
    if (status !== CLASS_STATUS.ACTIVE) return false;

    const opendatePlan = classItem.OpendatePlan;
    if (!opendatePlan) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const opendate = new Date(opendatePlan);
    opendate.setHours(0, 0, 0, 0);

    // Calculate days difference
    const daysDiff = Math.ceil((opendate - today) / (1000 * 60 * 60 * 24));

    // Return true if opendate is within 5 days (0 to 5 days from today)
    return daysDiff >= 0 && daysDiff <= 5;
  };

  // Filter by status tab
  const getFilteredClasses = () => {
    switch (tabValue) {
      case 0: // All
        return searchFilteredClasses;
      case 1: // DRAFT
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.DRAFT
        );
      case 2: // WAITING
        return searchFilteredClasses.filter(
          (c) =>
            normalizeStatus(c.Status || c.status) === CLASS_STATUS.WAITING
        );
      case 3: // PENDING
        return searchFilteredClasses.filter(
          (c) =>
            normalizeStatus(c.Status || c.status) === CLASS_STATUS.PENDING
        );
      case 4: // APPROVED
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.APPROVED
        );
      case 5: // ACTIVE
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.ACTIVE
        );
      case 6: // ON_GOING
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.ON_GOING
        );
      case 7: // CLOSE
        return searchFilteredClasses.filter(
          (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.CLOSE
        );
      case 8: // CANCEL
        return searchFilteredClasses.filter(
          (c) =>
            normalizeStatus(c.Status || c.status) === CLASS_STATUS.CANCEL
        );
      case 9: // Opening Soon (within 5 days)
        return searchFilteredClasses.filter((c) => isOpeningSoon(c));
      default:
        return searchFilteredClasses;
    }
  };

  const filteredClasses = getFilteredClasses();

  // Statistics
  const stats = {
    total: classes.length,
    draft: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.DRAFT
    ).length,
    waiting: classes.filter(
      (c) => normalizeStatus(c.Status || c.status) === CLASS_STATUS.WAITING
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
      label: "Chờ giảng viên",
      value: stats.waiting,
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
      color: "#06b6d4",
      bgColor: "#f0fdfa",
    },
    {
      label: "Chờ duyệt",
      value: stats.pending,
      icon: <HourglassEmpty sx={{ fontSize: 32 }} />,
      color: "#3b82f6",
      bgColor: "#eff6ff",
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
              Class Management
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Manage classes, schedules, and students
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Add />}
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
            Create New Class
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
            placeholder="Tìm kiếm lớp học (tên, mô tả, giảng viên)..."
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
          <Button
            variant="contained"
            onClick={handleSearch}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              px: 3,
            }}
          >
            <Search sx={{ mr: 1, fontSize: 18 }} />
            Tìm kiếm
          </Button>
          {searchTerm && (
            <Button
              variant="outlined"
              onClick={() => {
                setSearchInput("");
                setSearchTerm("");
              }}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Xóa
            </Button>
          )}
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
            label={`Chờ giảng viên (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) ===
                  CLASS_STATUS.WAITING
              ).length
            })`}
          />
          <Tab
            label={`Chờ duyệt (${
              searchFilteredClasses.filter(
                (c) =>
                  normalizeStatus(c.Status || c.status) ===
                  CLASS_STATUS.PENDING
              ).length
            })`}
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
                  normalizeStatus(c.Status || c.status) ===
                  CLASS_STATUS.CANCEL
              ).length
            })`}
          />
          <Tab
            label={`Sắp tới hạn mở lớp (${
              searchFilteredClasses.filter((c) => isOpeningSoon(c)).length
            })`}
            icon={<Event sx={{ fontSize: 18 }} />}
            iconPosition="start"
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
              Showing{" "}
              <strong style={{ color: "#667eea" }}>
                {filteredClasses.length}
              </strong>{" "}
              of {classes.length} classes
            </Typography>
          </Box>
          <ClassList
            classes={filteredClasses}
            courses={courses}
            instructors={instructors}
            onEdit={handleEditClass}
            onManageStudents={handleManageStudents}
            onSubmitForApproval={handleSubmitForApproval}
            onReview={handleReviewClass}
            onPublish={handlePublishClass}
          />
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
        />
      )}
    </Box>
  );
};

export default ClassesPage;
