// Service quản lý lớp học (Class Management)
import apiClient from "./apiClient";

const classService = {
  // Lấy danh sách tất cả lớp học
  getAllClasses: async () => {
    try {
      const response = await apiClient.get("/classes");
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silently fallback to mock data if endpoint not available (404/403)
      if (error.response?.status === 404 || error.response?.status === 403) {
        // Endpoint chưa có hoặc không có quyền, dùng mock data
        return [
          {
            ClassID: 1,
            Name: "JavaScript Fundamentals 2024",
            Status: "DRAFT",
            Fee: 2500000,
            CourseID: 1,
            InstructorID: 1,
            Instructor: {
              InstructorID: 1,
              FullName: "Nguyễn Văn A",
              Major: "Full Stack Development",
            },
            description: "Khóa học JavaScript cơ bản cho người mới bắt đầu",
            startDate: "2024-02-01",
            endDate: "2024-04-30",
            enrolledStudents: [],
            maxStudents: 30,
          },
          {
            ClassID: 2,
            Name: "React Advanced Techniques",
            Status: "WAITING",
            Fee: 3000000,
            CourseID: 2,
            InstructorID: 2,
            Instructor: {
              InstructorID: 2,
              FullName: "Trần Thị B",
              Major: "Frontend Development",
            },
            description: "Khóa học React nâng cao với hooks và context",
            startDate: "2024-03-01",
            endDate: "2024-05-30",
            enrolledStudents: [1, 2],
            maxStudents: 25,
          },
        ];
      }
      // Log other errors
      console.error("Get classes error:", error);
      return [];
    }
  },

  // Lấy thông tin chi tiết một lớp học
  getClassById: async (id) => {
    try {
      const response = await apiClient.get(`/classes/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get class error:", error);
      throw error.response?.data || { message: "Failed to fetch class" };
    }
  },

  // Tạo lớp học mới
  createClass: async (classData) => {
    try {
      const response = await apiClient.post("/classes", classData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create class error:", error);
      throw error.response?.data || { message: "Failed to create class" };
    }
  },

  // Cập nhật lớp học
  updateClass: async (id, classData) => {
    try {
      const response = await apiClient.put(`/classes/${id}`, classData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update class error:", error);
      throw error.response?.data || { message: "Failed to update class" };
    }
  },

  // Xóa lớp học
  deleteClass: async (id) => {
    try {
      const response = await apiClient.delete(`/classes/${id}`);
      return response.data;
    } catch (error) {
      console.error("Delete class error:", error);
      throw error.response?.data || { message: "Failed to delete class" };
    }
  },

  // Lấy danh sách giảng viên
  getAllInstructors: async () => {
    try {
      const response = await apiClient.get("/classes/instructors");
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silently fallback to mock data if endpoint not available (404/403)
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [
          {
            InstructorID: 1,
            FullName: "Nguyễn Văn A",
            Major: "Full Stack Development",
          },
          {
            InstructorID: 2,
            FullName: "Trần Thị B",
            Major: "Frontend Development",
          },
          {
            InstructorID: 3,
            FullName: "Lê Văn C",
            Major: "Backend Development",
          },
        ];
      }
      console.error("Get instructors error:", error);
      return [];
    }
  },

  // Lấy danh sách lớp học theo instructor ID
  getClassesByInstructorId: async (instructorId) => {
    try {
      const response = await apiClient.get(`/classes/instructor/${instructorId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get classes by instructor error:", error);
      throw error.response?.data || { message: "Failed to fetch classes by instructor" };
    }
  },

  // Lấy danh sách khóa học
  getAllCourses: async () => {
    try {
      const response = await apiClient.get("/classes/courses");
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silently fallback to mock data if endpoint not available (404/403)
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [
          {
            CourseID: 1,
            Title: "JavaScript Fundamentals",
            Description: "Khóa học JavaScript cơ bản",
            Duration: 40,
            Fee: 2000000,
            Status: "active",
          },
          {
            CourseID: 2,
            Title: "React Advanced",
            Description: "Khóa học React nâng cao",
            Duration: 50,
            Fee: 2500000,
            Status: "active",
          },
        ];
      }
      console.error("Get courses error:", error);
      return [];
    }
  },

  // ========== TIMESLOT APIs ==========

  // Lấy danh sách ca học (timeslots)
  getAllTimeslots: async (params = {}) => {
    try {
      const response = await apiClient.get("/timeslots", { params });
      const payload = response.data || {};
      const rawList = Array.isArray(payload.data)
        ? payload.data
        : Array.isArray(payload)
        ? payload
        : [];

      const normalizedList = rawList.map((ts) => {
        const dayValue = ts.Day || ts.day || null;
        return {
          ...ts,
          Day: dayValue ? String(dayValue).toUpperCase() : null,
        };
      });

      return {
        data: normalizedList,
        pagination: payload.pagination || {
          page: params.page || 1,
          limit: params.limit || normalizedList.length,
          total: normalizedList.length,
          totalPages: 1,
        },
      };
    } catch (error) {
      const status = error.response?.status;

      if (status === 404 || status === 403) {
        console.warn("Timeslots endpoint not available, using fallback data");
        const fallback = [
          {
            TimeslotID: 1,
            StartTime: "08:00:00",
            EndTime: "10:00:00",
            Day: "T2",
          },
          {
            TimeslotID: 2,
            StartTime: "14:00:00",
            EndTime: "16:00:00",
            Day: "T3",
          },
          {
            TimeslotID: 3,
            StartTime: "19:00:00",
            EndTime: "21:00:00",
            Day: "T4",
          },
        ];
        return {
          data: fallback,
          pagination: {
            page: 1,
            limit: fallback.length,
            total: fallback.length,
            totalPages: 1,
          },
        };
      }

      if (status === 500) {
        console.error(
          "Get timeslots error (500): Backend server error. Possible causes:"
        );
        console.error("1. Backend chưa hỗ trợ trường 'Day' mới trong timeslot");
        console.error("2. Database chưa được cập nhật lên dbver5");
        console.error("3. Backend có lỗi khi query timeslots");
        console.error("Error details:", error.response?.data || error.message);
        return {
          data: [],
          pagination: { page: 1, limit: 0, total: 0, totalPages: 1 },
        };
      }

      console.error("Get timeslots error:", error);
      return {
        data: [],
        pagination: { page: 1, limit: 0, total: 0, totalPages: 1 },
      };
    }
  },

  // Lấy chi tiết ca học
  getTimeslotById: async (timeslotId) => {
    try {
      const response = await apiClient.get(`/timeslots/${timeslotId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get timeslot error:", error);
      throw error.response?.data || { message: "Failed to fetch timeslot" };
    }
  },

  // Tạo ca học mới
  createTimeslot: async (timeslotData) => {
    try {
      const response = await apiClient.post("/timeslots", timeslotData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create timeslot error:", error);
      throw error.response?.data || { message: "Failed to create timeslot" };
    }
  },

  // Cập nhật ca học
  updateTimeslot: async (timeslotId, timeslotData) => {
    try {
      const response = await apiClient.put(
        `/timeslots/${timeslotId}`,
        timeslotData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update timeslot error:", error);
      throw error.response?.data || { message: "Failed to update timeslot" };
    }
  },

  // Xóa ca học
  deleteTimeslot: async (timeslotId) => {
    try {
      const response = await apiClient.delete(`/timeslots/${timeslotId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete timeslot error:", error);
      throw error.response?.data || { message: "Failed to delete timeslot" };
    }
  },

  // Lấy lịch học của lớp (format cho frontend) - API đặc biệt
  getClassSessionsForFrontend: async (classId) => {
    try {
      const response = await apiClient.get(
        `/timeslots/class/${classId}/sessions`
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silent fallback to empty array for 404/403 errors
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [];
      }
      console.error("Get class sessions for frontend error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch class sessions" }
      );
    }
  },

  // Lấy danh sách học viên
  getAllLearners: async () => {
    try {
      const response = await apiClient.get("/learners");
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silently fallback to mock data if endpoint not available (404/403)
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [
          {
            LearnerID: 1,
            FullName: "Học viên Một",
            Email: "hocvien1@example.com",
          },
          {
            LearnerID: 2,
            FullName: "Học viên Hai",
            Email: "hocvien2@example.com",
          },
        ];
      }
      console.error("Get learners error:", error);
      return [];
    }
  },

  // Lấy danh sách học viên đã enroll vào lớp
  getEnrollmentsByClassId: async (classId) => {
    try {
      const response = await apiClient.get(`/classes/${classId}/enrollments`);
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silently fallback to empty array if endpoint not available (404/403)
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [];
      }
      console.error("Get enrollments error:", error);
      throw error.response?.data || { message: "Failed to fetch enrollments" };
    }
  },

  // ========== SESSION APIs ==========

  // Lấy tất cả sessions
  getAllSessions: async () => {
    try {
      const response = await apiClient.get("/sessions");
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get all sessions error:", error);
      throw error.response?.data || { message: "Failed to fetch sessions" };
    }
  },

  // Lấy chi tiết session
  getSessionById: async (sessionId) => {
    try {
      const response = await apiClient.get(`/sessions/${sessionId}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get session error:", error);
      throw error.response?.data || { message: "Failed to fetch session" };
    }
  },

  // Lấy sessions của một lớp
  getSessionsByClassId: async (classId) => {
    try {
      const response = await apiClient.get(`/sessions/class/${classId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      // Silent fallback to empty array for 404/403 errors
      if (error.response?.status === 404 || error.response?.status === 403) {
        return [];
      }
      console.error("Get sessions error:", error);
      throw error.response?.data || { message: "Failed to fetch sessions" };
    }
  },

  // Lấy sessions theo giảng viên
  getSessionsByInstructorId: async (instructorId) => {
    try {
      const response = await apiClient.get(
        `/sessions/instructor/${instructorId}`
      );
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get sessions by instructor error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch instructor sessions",
        }
      );
    }
  },

  // Tạo session mới
  createSession: async (sessionData) => {
    try {
      const response = await apiClient.post(`/sessions`, {
        Title: sessionData.Title || `Session ${sessionData.Date || ""}`,
        Description: sessionData.Description || "",
        ClassID: sessionData.ClassID,
        TimeslotID: sessionData.TimeslotID,
        InstructorID: sessionData.InstructorID,
        Date: sessionData.Date,
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create session error:", error);
      throw error.response?.data || { message: "Failed to create session" };
    }
  },

  // Cập nhật session
  updateSession: async (sessionId, sessionData) => {
    try {
      const response = await apiClient.put(
        `/sessions/${sessionId}`,
        sessionData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update session error:", error);
      throw error.response?.data || { message: "Failed to update session" };
    }
  },

  // Xóa session
  deleteSession: async (sessionId) => {
    try {
      // Validate sessionId
      if (!sessionId || sessionId === undefined || sessionId === null) {
        throw new Error("SessionID is required");
      }

      // Đảm bảo sessionId là số nguyên
      const sessionIdNum = parseInt(sessionId);
      if (isNaN(sessionIdNum) || sessionIdNum <= 0) {
        throw new Error(`Invalid SessionID: ${sessionId}`);
      }

      console.log("Calling delete session API with ID:", sessionIdNum);
      const response = await apiClient.delete(`/sessions/${sessionIdNum}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete session error:", error);
      throw error.response?.data || { message: "Failed to delete session" };
    }
  },

  // Bulk Create Sessions - Tạo nhiều sessions cùng lúc
  bulkCreateSessions: async (sessionsData) => {
    try {
      console.log(
        "Sending bulk create request with",
        sessionsData.length,
        "sessions"
      );
      console.log("First 3 sessions:", sessionsData.slice(0, 3));

      const response = await apiClient.post(`/sessions/bulk`, {
        sessions: sessionsData, // Array of session objects
      });

      // Trả về toàn bộ response để xử lý conflicts
      console.log(
        "Bulk create API response (full):",
        JSON.stringify(response.data, null, 2)
      );
      console.log(
        "Bulk create API response keys:",
        Object.keys(response.data || {})
      );
      console.log("Bulk create API response.data:", response.data?.data);
      console.log("Bulk create API response.status:", response.status);

      return response.data || response.data?.data;
    } catch (error) {
      console.error("Bulk create sessions error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error message:", error.message);

      const errorData = error.response?.data || {};
      // Lấy error message từ nhiều nguồn: error.response.data.error, error.response.data.message, hoặc error.message
      const errorMessage =
        errorData.error || errorData.message || error.message || "";

      // Kiểm tra nếu error message chứa conflict keywords
      const isConflictError =
        errorMessage.includes("trùng") ||
        errorMessage.includes("trùng thời gian") ||
        errorMessage.includes("trùng lịch") ||
        errorMessage.includes("conflict") ||
        errorMessage.includes("đã có ca học") ||
        errorMessage.includes("đã có session");

      // Nếu có conflict info trong error response (structured data)
      if (
        errorData.hasConflict ||
        errorData.hasConflicts ||
        (errorData.data?.conflicts && errorData.data.conflicts.length > 0) ||
        (errorData.conflicts && errorData.conflicts.length > 0)
      ) {
        // Trả về conflict data để frontend xử lý
        return errorData;
      }

      // Nếu error message chứa conflict info (unstructured error từ backend throw)
      if (isConflictError) {
        // Parse conflict info từ error message và tạo conflict structure
        // Ví dụ: "Session 1: Instructor đã có ca học trùng thời gian. Lớp "thinh12" đã có session "Session 7" vào 2025-11-28 (10:00:00 - 12:00:00)"
        const conflicts = [];

        // Tách message thành các conflicts - pattern: "Session X: ..."
        const sessionPattern = /Session\s+(\d+):\s*(.+?)(?=Session\s+\d+:|$)/g;
        let match;

        while ((match = sessionPattern.exec(errorMessage)) !== null) {
          const sessionIndex = parseInt(match[1]);
          const conflictText = match[2].trim();

          if (conflictText) {
            // Parse thông tin từ message
            const classNameMatch = conflictText.match(/Lớp\s+"([^"]+)"/);
            const sessionTitleMatch =
              conflictText.match(/session\s+"([^"]+)"/i);
            const dateMatch = conflictText.match(/(\d{4}-\d{2}-\d{2})/);
            const timeMatch = conflictText.match(
              /(\d{2}:\d{2}:\d{2})\s*-\s*(\d{2}:\d{2}:\d{2})/
            );

            conflicts.push({
              sessionIndex: sessionIndex,
              conflictType: conflictText.includes("Instructor")
                ? "instructor"
                : "class",
              conflictInfo: {
                className: classNameMatch ? classNameMatch[1] : "N/A",
                sessionTitle: sessionTitleMatch ? sessionTitleMatch[1] : "N/A",
                date: dateMatch ? dateMatch[1] : "N/A",
                startTime: timeMatch ? timeMatch[1] : "N/A",
                endTime: timeMatch ? timeMatch[2] : "N/A",
                message: conflictText,
              },
            });
          }
        }

        // Nếu không parse được theo pattern "Session X:", tạo conflict chung
        if (conflicts.length === 0 && errorMessage) {
          conflicts.push({
            sessionIndex: 1,
            conflictType: errorMessage.includes("Instructor")
              ? "instructor"
              : "class",
            conflictInfo: {
              message: errorMessage,
            },
          });
        }

        if (conflicts.length > 0) {
          // Trả về conflict structure để frontend xử lý
          return {
            success: false,
            hasConflicts: true,
            message: errorMessage,
            data: {
              created: [],
              conflicts: conflicts,
              summary: {
                total: sessionsData.length,
                success: 0,
                conflicts: conflicts.length,
              },
            },
          };
        }
      }

      // Nếu là lỗi thật (không phải conflict), throw error
      throw (
        error.response?.data || {
          message: errorMessage || "Failed to bulk create sessions",
        }
      );
    }
  },

  // Update Class Schedule (Edit Wizard) - Xoá session cũ trong vùng, tạo lại session mới
  updateClassSchedule: async (classId, sessionsData, options = {}) => {
    try {
      const payload = {
        sessions: sessionsData,
      };
      if (options.startDate) payload.startDate = options.startDate;
      if (options.endDate) payload.endDate = options.endDate;

      const response = await apiClient.post(
        `/classes/${classId}/schedule/update`,
        payload
      );

      // Backend trả { success, conflicts, summary } hoặc bọc trong data
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Update class schedule error:", error);
      // Trả về error structured (nếu có) để FE vẫn đọc được conflicts
      throw (
        error.response?.data || {
          message: "Failed to update class schedule",
        }
      );
    }
  },

  findInstructorAvailableSlots: async ({
    InstructorID,
    TimeslotID,
    Day,
    startDate,
    numSuggestions,
    excludeClassId,
  }) => {
    try {
      const params = new URLSearchParams({
        InstructorID,
        TimeslotID,
        Day,
      });
      if (startDate) {
        params.append("startDate", startDate);
      }
      if (numSuggestions) {
        params.append("numSuggestions", numSuggestions);
      }
      if (excludeClassId) {
        params.append("excludeClassId", excludeClassId);
      }
      const url = `/classes/instructor/available-slots?${params.toString()}`;
      console.log(`[findInstructorAvailableSlots] Gọi API: ${url}`);
      console.log(`[findInstructorAvailableSlots] Params:`, {
        InstructorID,
        TimeslotID,
        Day,
        startDate,
        numSuggestions,
        excludeClassId,
      });
      const response = await apiClient.get(url);
      console.log(`[findInstructorAvailableSlots] Response:`, response.data);
      return response.data;
    } catch (error) {
      console.error("Find instructor slots error:", error);
      throw error.response?.data || { message: "Failed to get suggestions" };
    }
  },

  addMakeupSession: async (classId, payload) => {
    try {
      const response = await apiClient.post(
        `/classes/${classId}/sessions/makeup`,
        payload
      );
      return response.data;
    } catch (error) {
      console.error("Add makeup session error:", error);
      throw error.response?.data || { message: "Failed to add makeup session" };
    }
  },

  // Get Sessions by Date Range
  getSessionsByDateRange: async (startDate, endDate) => {
    try {
      const response = await apiClient.get(`/sessions/date-range`, {
        params: {
          startDate: startDate, // Format: YYYY-MM-DD
          endDate: endDate, // Format: YYYY-MM-DD
        },
      });
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get sessions by date range error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch sessions by date range",
        }
      );
    }
  },

  // Get Sessions by Timeslot
  getSessionsByTimeslotId: async (timeslotId) => {
    try {
      const response = await apiClient.get(`/sessions/timeslot/${timeslotId}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get sessions by timeslot error:", error);
      throw (
        error.response?.data || {
          message: "Failed to fetch sessions by timeslot",
        }
      );
    }
  },

  // Duyệt lớp học (Approve class) - Thay thế submitForApproval
  approveClass: async (classId) => {
    try {
      // Thử endpoint /classes/{id}/status trước, nếu không có thì dùng updateClass
      const response = await apiClient.put(`/classes/${classId}/status`, {
        Status: "APPROVED",
      });
      return response.data?.data || response.data;
    } catch (error) {
      // Nếu endpoint /status không tồn tại (404), thử dùng updateClass
      if (error.response?.status === 404) {
        console.log("Endpoint /status không tồn tại, thử dùng updateClass");
        try {
          const response = await apiClient.put(`/classes/${classId}`, {
            Status: "APPROVED",
          });
          return response.data?.data || response.data;
        } catch (updateError) {
          console.error("Approve class error (updateClass):", updateError);
          throw (
            updateError.response?.data || { message: "Failed to approve class" }
          );
        }
      } else {
        console.error("Approve class error:", error);
        throw (
          error.response?.data || {
            message: error.response?.data?.message || "Failed to approve class",
          }
        );
      }
    }
  },

  // Gửi cho giảng viên chuẩn bị (Submit for approval) - DEPRECATED: Dùng approveClass thay thế
  submitForApproval: async (classId) => {
    // Backward compatibility: chuyển sang approveClass
    return classService.approveClass(classId);
  },

  // Duyệt lớp học (Review class)
  reviewClass: async (classId, action, adminFeedback = "") => {
    try {
      // Thử endpoint /classes/{id}/review trước
      const response = await apiClient.put(`/classes/${classId}/review`, {
        action,
        adminFeedback,
      });
      return response.data?.data || response.data;
    } catch (error) {
      // Nếu endpoint /review không tồn tại (404), thử dùng updateClass
      if (error.response?.status === 404) {
        console.log("Endpoint /review không tồn tại, thử dùng updateClass");
        try {
          // Map action thành Status
          let status = "DRAFT";
          if (action === "APPROVE") {
            status = "APPROVED";
          } else if (action === "REJECT") {
            status = "REJECTED";
          }

          const updateData = {
            Status: status,
          };

          // Nếu có feedback, có thể lưu vào field khác (tùy backend)
          if (adminFeedback) {
            updateData.AdminFeedback = adminFeedback;
            updateData.Feedback = adminFeedback;
          }

          const response = await apiClient.put(
            `/classes/${classId}`,
            updateData
          );
          return response.data?.data || response.data;
        } catch (updateError) {
          console.error("Review class error (updateClass):", updateError);
          throw (
            updateError.response?.data || { message: "Failed to review class" }
          );
        }
      } else {
        console.error("Review class error:", error);
        throw (
          error.response?.data || {
            message: error.response?.data?.message || "Failed to review class",
          }
        );
      }
    }
  },

  // Xuất bản lớp học
  publishClass: async (classId) => {
    try {
      // Thử endpoint /classes/{id}/publish trước
      const response = await apiClient.put(`/classes/${classId}/publish`);
      return response.data?.data || response.data;
    } catch (error) {
      // Nếu endpoint /publish không tồn tại (404), thử dùng updateClass
      if (error.response?.status === 404) {
        console.log("Endpoint /publish không tồn tại, thử dùng updateClass");
        try {
          const response = await apiClient.put(`/classes/${classId}`, {
            Status: "PUBLISHED",
          });
          return response.data?.data || response.data;
        } catch (updateError) {
          console.error("Publish class error (updateClass):", updateError);
          throw (
            updateError.response?.data || { message: "Failed to publish class" }
          );
        }
      } else {
        console.error("Publish class error:", error);
        throw (
          error.response?.data || {
            message: error.response?.data?.message || "Failed to publish class",
          }
        );
      }
    }
  },

  // Lấy lớp học theo status
  getClassesByStatus: async (status) => {
    try {
      const response = await apiClient.get(`/classes/status/${status}`);
      return response.data?.data || response.data || [];
    } catch (error) {
      console.error("Get classes by status error:", error);
      throw error.response?.data || { message: "Failed to fetch classes" };
    }
  },

  // Tự động cập nhật trạng thái lớp học theo ngày
  autoUpdateClassStatus: async () => {
    try {
      const response = await apiClient.post("/classes/auto-update-status");
      return response.data?.data || response.data;
    } catch (error) {
      // Không throw error để không làm gián đoạn việc load trang
      // Chỉ log error và tiếp tục
      console.warn("Auto update class status error (non-blocking):", error);
      return null;
    }
  },

  // ========== DBVER5 NEW APIs ==========

  // Tạo lớp với Wizard (3 lần kiểm tra)
  createClassWizard: async (wizardData) => {
    try {
      const response = await apiClient.post("/classes/wizard", wizardData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Create class wizard error:", error);
      throw (
        error.response?.data || {
          message: "Failed to create class with wizard",
        }
      );
    }
  },

  // Dời buổi học đầu
  delayClassStart: async (classId) => {
    try {
      const response = await apiClient.post(`/classes/${classId}/delay-start`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delay class start error:", error);
      throw error.response?.data || { message: "Failed to delay class start" };
    }
  },

  // Tìm ca rảnh của giảng viên (Bước 1)
  findAvailableInstructorSlots: async (
    instructorId,
    timeslotId,
    day,
    numSuggestions = 5
  ) => {
    try {
      const params = new URLSearchParams({
        InstructorID: instructorId.toString(),
        TimeslotID: timeslotId.toString(),
        Day: day,
        numSuggestions: numSuggestions.toString(),
      });
      const response = await apiClient.get(
        `/classes/instructor/available-slots?${params}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Find available instructor slots error:", error);
      throw (
        error.response?.data || { message: "Failed to find available slots" }
      );
    }
  },

  // Phân tích độ bận định kỳ của instructor
  analyzeBlockedDays: async (params) => {
    try {
      const response = await apiClient.post(
        "/classes/instructor/analyze-blocked-days",
        params
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Analyze blocked days error:", error);
      throw (
        error.response?.data || { message: "Failed to analyze blocked days" }
      );
    }
  },

  // Tìm ngày bắt đầu phù hợp theo desired timeslots (API chuyên dụng - tối ưu)
  searchTimeslots: async (params) => {
    try {
      const response = await apiClient.post(
        "/classes/search-timeslots",
        params
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Search timeslots error:", error);
      throw error.response?.data || { message: "Failed to search timeslots" };
    }
  },

  // Lấy lý do chi tiết tại sao một timeslot bị khóa
  getTimeslotLockReasons: async (params) => {
    try {
      const response = await apiClient.get("/classes/timeslot-lock-reasons", {
        params,
      });
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get timeslot lock reasons error:", error);
      throw (
        error.response?.data || {
          message: "Failed to get timeslot lock reasons",
        }
      );
    }
  },

  // Kiểm tra xung đột với học viên (Bước 2)
  checkLearnerConflicts: async (classId, date, timeslotId) => {
    try {
      const response = await apiClient.post(
        "/classes/check-learner-conflicts",
        {
          ClassID: classId,
          Date: date,
          TimeslotID: timeslotId,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Check learner conflicts error:", error);
      throw (
        error.response?.data || { message: "Failed to check learner conflicts" }
      );
    }
  },

  // Thêm lịch nghỉ hàng loạt cho giảng viên
  addBulkInstructorLeave: async (leaveData) => {
    try {
      console.log("[classService] addBulkInstructorLeave payload:", leaveData);
      const response = await apiClient.post(
        "/classes/instructor/leave/bulk",
        leaveData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Add bulk instructor leave error:", error);
      throw (
        error.response?.data || { message: "Failed to add instructor leave" }
      );
    }
  },

  // Lấy danh sách lịch nghỉ giảng viên
  getInstructorLeaves: async (params) => {
    try {
      console.log("[classService] getInstructorLeaves params:", params);
      const response = await apiClient.get("/classes/instructor/leave", {
        params,
      });
      console.log(
        "[classService] getInstructorLeaves response:",
        response.data
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get instructor leave error:", error);
      throw (
        error.response?.data || { message: "Failed to fetch instructor leaves" }
      );
    }
  },

  // Xóa lịch nghỉ giảng viên
  deleteInstructorLeave: async (leaveId) => {
    try {
      console.log("[classService] deleteInstructorLeave id:", leaveId);
      const response = await apiClient.delete(
        `/classes/instructor/leave/${leaveId}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Delete instructor leave error:", error);
      throw (
        error.response?.data || { message: "Failed to delete instructor leave" }
      );
    }
  },

  // Kiểm tra cảnh báo xung đột tương lai
  checkFutureConflicts: async (instructorId, date, timeslotId, status) => {
    try {
      const response = await apiClient.post(
        "/classes/instructor/leave/check-conflicts",
        {
          InstructorID: instructorId,
          Date: date,
          TimeslotID: timeslotId,
          Status: status,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Check future conflicts error:", error);
      throw (
        error.response?.data || { message: "Failed to check future conflicts" }
      );
    }
  },

  // Xử lý lớp bị ảnh hưởng
  handleAffectedClass: async (
    classId,
    action,
    sessionIds,
    newSchedule = null
  ) => {
    try {
      const requestData = {
        ClassID: classId,
        action: action, // 'cancel', 'reschedule', 'makeup'
        sessionIds: sessionIds,
      };
      if (newSchedule) {
        requestData.newSchedule = newSchedule;
      }
      const response = await apiClient.post(
        `/classes/${classId}/handle-affected`,
        requestData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Handle affected class error:", error);
      throw (
        error.response?.data || { message: "Failed to handle affected class" }
      );
    }
  },

  // Đếm học viên
  countLearners: async (classId) => {
    try {
      const response = await apiClient.get(
        `/classes/${classId}/learners/count`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Count learners error:", error);
      throw error.response?.data || { message: "Failed to count learners" };
    }
  },

  // Kiểm tra đầy lớp
  checkFullClass: async (classId) => {
    try {
      const response = await apiClient.get(`/classes/${classId}/full`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Check full class error:", error);
      throw error.response?.data || { message: "Failed to check full class" };
    }
  },

  // Dời lịch session
  rescheduleSession: async (sessionId, newDate, newTimeslotId) => {
    try {
      const response = await apiClient.put(
        `/sessions/${sessionId}/reschedule`,
        {
          Date: newDate,
          TimeslotID: newTimeslotId,
        }
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Reschedule session error:", error);
      throw error.response?.data || { message: "Failed to reschedule session" };
    }
  },

  // Hủy session
  cancelSession: async (sessionId) => {
    try {
      const response = await apiClient.delete(`/sessions/${sessionId}/cancel`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Cancel session error:", error);
      throw error.response?.data || { message: "Failed to cancel session" };
    }
  },

  // Hủy lớp học (Cancel class)
  cancelClass: async (classId) => {
    try {
      const response = await apiClient.put(`/classes/${classId}/status`, {
        Status: "CANCEL",
      });
      return response.data;
    } catch (error) {
      console.error("Cancel class error:", error);
      throw error.response?.data || { message: "Failed to cancel class" };
    }
  },

  // Thêm buổi học bù
  addMakeupSession: async (classId, sessionData) => {
    try {
      const response = await apiClient.post(
        `/classes/${classId}/sessions/makeup`,
        sessionData
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Add makeup session error:", error);
      throw error.response?.data || { message: "Failed to add makeup session" };
    }
  },

  // Thêm lịch nghỉ HOLIDAY cho tất cả giảng viên
  addHolidayForAllInstructors: async (data) => {
    try {
      const response = await apiClient.post(
        "/classes/instructor/leave/bulk-all",
        data
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Add holiday for all instructors error:", error);
      throw (
        error.response?.data ||
        { message: "Failed to add holiday for all instructors" }
      );
    }
  },

  // Đồng bộ lịch nghỉ HOLIDAY cho giảng viên
  syncHolidayForInstructor: async (instructorId) => {
    try {
      const response = await apiClient.post(
        `/classes/instructor/leave/sync-holiday/${instructorId}`
      );
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Sync holiday for instructor error:", error);
      throw (
        error.response?.data ||
        { message: "Failed to sync holiday for instructor" }
      );
    }
  },

  // Lấy danh sách unique DATE có Status = HOLIDAY
  getHolidayDates: async () => {
    try {
      const response = await apiClient.get("/classes/instructor/leave/holiday-dates");
      return response.data?.data || response.data;
    } catch (error) {
      console.error("Get holiday dates error:", error);
      throw (
        error.response?.data || { message: "Failed to get holiday dates" }
      );
    }
  },
};

export default classService;
