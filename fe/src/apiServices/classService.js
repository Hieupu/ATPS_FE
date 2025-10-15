// Service quản lý lớp học (Class Management)
// Sử dụng localStorage để lưu trữ tạm thời

const STORAGE_KEYS = {
  CLASSES: "atps_classes",
  INSTRUCTORS: "atps_instructors",
  LEARNERS: "atps_learners",
};

// Mock data ban đầu (phù hợp với DB schema)
const INITIAL_CLASSES = [
  {
    id: 1,
    courseId: 101,
    title: "Lập trình Web Frontend",
    description: "Khóa học về HTML, CSS, JavaScript và React.js",
    duration: 60, // giờ
    tuitionFee: 5000000,
    status: "Sắp khai giảng",
    instructorId: 1,
    instructorName: "Nguyễn Văn A",
    enrolledStudents: [1, 2, 3],
    maxStudents: 30,
    startDate: "2025-01-15",
    endDate: "2025-03-15",
  },
  {
    id: 2,
    courseId: 102,
    title: "An toàn thông tin mạng",
    description: "Khóa học về bảo mật hệ thống và mạng máy tính",
    duration: 80,
    tuitionFee: 7000000,
    status: "Đang hoạt động",
    instructorId: 2,
    instructorName: "Trần Thị B",
    enrolledStudents: [2, 4, 5],
    maxStudents: 25,
    startDate: "2025-01-20",
    endDate: "2025-04-20",
  },
  {
    id: 3,
    courseId: 103,
    title: "Python cho Data Science",
    description: "Khóa học về Python và các thư viện phân tích dữ liệu",
    duration: 70,
    tuitionFee: 6000000,
    status: "Sắp khai giảng",
    instructorId: 3,
    instructorName: "Lê Văn C",
    enrolledStudents: [1, 3],
    maxStudents: 20,
    startDate: "2025-02-01",
    endDate: "2025-04-30",
  },
  {
    id: 4,
    courseId: 104,
    title: "Machine Learning cơ bản",
    description: "Khóa học về machine learning và AI cơ bản",
    duration: 90,
    tuitionFee: 8000000,
    status: "Chưa phân giảng viên",
    instructorId: "",
    instructorName: "",
    enrolledStudents: [],
    maxStudents: 25,
    startDate: "2025-03-01",
    endDate: "2025-06-30",
  },
  {
    id: 5,
    courseId: 105,
    title: "DevOps và CI/CD",
    description: "Khóa học về DevOps, Docker, Kubernetes và CI/CD",
    duration: 80,
    tuitionFee: 7500000,
    status: "Chưa phân giảng viên",
    instructorId: "",
    instructorName: "",
    enrolledStudents: [],
    maxStudents: 20,
    startDate: "2025-03-15",
    endDate: "2025-06-15",
  },
  {
    id: 6,
    courseId: 106,
    title: "React Native cơ bản",
    description: "Khóa học về phát triển ứng dụng di động với React Native",
    duration: 70,
    tuitionFee: 6500000,
    status: "Đang hoạt động",
    instructorId: 2,
    instructorName: "Trần Thị B",
    enrolledStudents: [1, 2],
    maxStudents: 25,
    startDate: "2024-11-01",
    endDate: "2024-12-31",
  },
];

const INITIAL_INSTRUCTORS = [
  {
    id: 1,
    fullName: "Nguyễn Văn A",
    major: "Công nghệ phần mềm",
    email: "nguyenvana@example.com",
  },
  {
    id: 2,
    fullName: "Trần Thị B",
    major: "An toàn thông tin",
    email: "tranthib@example.com",
  },
  {
    id: 3,
    fullName: "Lê Văn C",
    major: "Khoa học dữ liệu",
    email: "levanc@example.com",
  },
  {
    id: 4,
    fullName: "Phạm Thị D",
    major: "Trí tuệ nhân tạo",
    email: "phamthid@example.com",
  },
  {
    id: 5,
    fullName: "Hoàng Văn E",
    major: "Mạng máy tính",
    email: "hoangvane@example.com",
  },
];

const INITIAL_LEARNERS = [
  {
    id: 1,
    fullName: "Học viên Một",
    email: "hocvien1@example.com",
    phone: "0901234567",
  },
  {
    id: 2,
    fullName: "Học viên Hai",
    email: "hocvien2@example.com",
    phone: "0901234568",
  },
  {
    id: 3,
    fullName: "Học viên Ba",
    email: "hocvien3@example.com",
    phone: "0901234569",
  },
  {
    id: 4,
    fullName: "Học viên Bốn",
    email: "hocvien4@example.com",
    phone: "0901234570",
  },
  {
    id: 5,
    fullName: "Học viên Năm",
    email: "hocvien5@example.com",
    phone: "0901234571",
  },
  {
    id: 6,
    fullName: "Học viên Sáu",
    email: "hocvien6@example.com",
    phone: "0901234572",
  },
  {
    id: 7,
    fullName: "Học viên Bảy",
    email: "hocvien7@example.com",
    phone: "0901234573",
  },
];

// Khởi tạo dữ liệu nếu chưa có
const initializeData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.CLASSES)) {
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
  }
  if (!localStorage.getItem(STORAGE_KEYS.INSTRUCTORS)) {
    localStorage.setItem(
      STORAGE_KEYS.INSTRUCTORS,
      JSON.stringify(INITIAL_INSTRUCTORS)
    );
  }
  if (!localStorage.getItem(STORAGE_KEYS.LEARNERS)) {
    localStorage.setItem(
      STORAGE_KEYS.LEARNERS,
      JSON.stringify(INITIAL_LEARNERS)
    );
  }
};

// API Methods
const classService = {
  // Lấy danh sách tất cả lớp học
  getAllClasses: () => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    return Promise.resolve(classes);
  },

  // Lấy thông tin chi tiết một lớp học
  getClassById: (id) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const classItem = classes.find((c) => c.id === parseInt(id));
    return Promise.resolve(classItem);
  },

  // Tạo lớp học mới
  createClass: (classData) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const newId =
      classes.length > 0 ? Math.max(...classes.map((c) => c.id)) + 1 : 1;
    const newClass = {
      ...classData,
      id: newId,
      enrolledStudents: classData.enrolledStudents || [],
    };
    classes.push(newClass);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return Promise.resolve(newClass);
  },

  // Cập nhật lớp học
  updateClass: (id, classData) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const index = classes.findIndex((c) => c.id === parseInt(id));
    if (index !== -1) {
      classes[index] = { ...classes[index], ...classData, id: parseInt(id) };
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      return Promise.resolve(classes[index]);
    }
    return Promise.reject(new Error("Không tìm thấy lớp học"));
  },

  // Xóa lớp học
  deleteClass: (id) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const filteredClasses = classes.filter((c) => c.id !== parseInt(id));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(filteredClasses));
    return Promise.resolve({ success: true });
  },

  // Lấy danh sách giảng viên
  getAllInstructors: () => {
    initializeData();
    const instructors = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.INSTRUCTORS) || "[]"
    );
    return Promise.resolve(instructors);
  },

  // Lấy danh sách học viên
  getAllLearners: () => {
    initializeData();
    const learners = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.LEARNERS) || "[]"
    );
    return Promise.resolve(learners);
  },

  // Thêm học viên vào lớp
  addStudentToClass: (classId, studentId) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const index = classes.findIndex((c) => c.id === parseInt(classId));
    if (index !== -1) {
      if (!classes[index].enrolledStudents.includes(studentId)) {
        classes[index].enrolledStudents.push(studentId);
        localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      }
      return Promise.resolve(classes[index]);
    }
    return Promise.reject(new Error("Không tìm thấy lớp học"));
  },

  // Xóa học viên khỏi lớp
  removeStudentFromClass: (classId, studentId) => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );
    const index = classes.findIndex((c) => c.id === parseInt(classId));
    if (index !== -1) {
      classes[index].enrolledStudents = classes[index].enrolledStudents.filter(
        (id) => id !== studentId
      );
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
      return Promise.resolve(classes[index]);
    }
    return Promise.reject(new Error("Không tìm thấy lớp học"));
  },

  // Tự động cập nhật trạng thái lớp học theo ngày
  autoUpdateClassStatus: () => {
    initializeData();
    const classes = JSON.parse(
      localStorage.getItem(STORAGE_KEYS.CLASSES) || "[]"
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time để chỉ so sánh ngày

    let hasUpdates = false;

    classes.forEach((classItem) => {
      const startDate = new Date(classItem.startDate);
      const endDate = new Date(classItem.endDate);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);

      let newStatus = classItem.status;

      // Logic cập nhật trạng thái theo ngày
      if (
        classItem.status === "Sắp khai giảng" &&
        today >= startDate &&
        classItem.instructorId
      ) {
        // Chuyển từ "Sắp khai giảng" sang "Đang hoạt động" khi đến ngày bắt đầu và có giảng viên
        newStatus = "Đang hoạt động";
      } else if (classItem.status === "Đang hoạt động" && today > endDate) {
        // Chuyển từ "Đang hoạt động" sang "Đã kết thúc" khi qua ngày kết thúc
        newStatus = "Đã kết thúc";
      } else if (
        classItem.status === "Chưa phân giảng viên" &&
        today >= startDate
      ) {
        // Nếu đến ngày bắt đầu mà vẫn chưa có giảng viên, giữ nguyên trạng thái
        // (có thể thêm logic khác nếu cần)
        newStatus = "Chưa phân giảng viên";
      }

      // Cập nhật trạng thái nếu có thay đổi
      if (newStatus !== classItem.status) {
        classItem.status = newStatus;
        hasUpdates = true;
      }
    });

    // Lưu lại nếu có thay đổi
    if (hasUpdates) {
      localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    }

    return Promise.resolve(classes);
  },
};

export default classService;
