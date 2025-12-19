import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IconButton, Menu, MenuItem } from "@mui/material";
import {
  MoreVert,
  Edit,
  Delete,
  People,
  CalendarToday,
  Person,
  AccessTime,
  AttachMoney,
  Group,
  Event,
  Lightbulb,
  Description,
  HourglassEmpty,
  CheckCircle,
  Send,
  Publish,
  ArrowBack,
  Cancel,
} from "@mui/icons-material";
import {
  CLASS_STATUS,
  getStatusInfo,
  normalizeStatus,
} from "../../../../constants/classStatus";
import CancelClassDialog from "./CancelClassDialog";
import classService from "../../../../apiServices/classService";
import { toast } from "react-toastify";
import "./ClassList.css";

const ClassList = ({
  classes,
  courses = [],
  instructors = [], 
  onEdit,
  onManageStudents,
  onApprove, 
  onReject, 
  onPublish,
  onChangeStatus,
  onSubmitForApproval,
  onCancelApproval, 
  userRole, 
}) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedClass, setSelectedClass] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelLoading, setCancelLoading] = useState(false);
  const [classToCancel, setClassToCancel] = useState(null);

  const STAFF_EDITABLE_STATUSES = [CLASS_STATUS.DRAFT];
  const ADMIN_EDITABLE_STATUSES = [
    CLASS_STATUS.DRAFT,
    CLASS_STATUS.APPROVED,
    CLASS_STATUS.ACTIVE,
  ];

  const handleMenuOpen = (event, classItem) => {
    setAnchorEl(event.currentTarget);
    setSelectedClass(classItem);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedClass(null);
  };
  const handleEdit = () => {
    if (selectedClass) {
      const classId = selectedClass.ClassID;
      const status = normalizeStatus(
        selectedClass.Status || selectedClass.status
      );
      const isEditableForStaff = STAFF_EDITABLE_STATUSES.includes(status);
      const isEditableForAdmin = ADMIN_EDITABLE_STATUSES.includes(status);
      const isEditable =
        userRole === "staff" ? isEditableForStaff : isEditableForAdmin;

      const basePath = userRole === "staff" ? "/staff" : "/admin";

      // Với admin: khi chỉnh sửa lớp đã duyệt / đang tuyển sinh,
      // Step 1 (Giảng viên, Khóa/Môn) sẽ bị disable (không cho đổi)
      const shouldLockBasicInfo =
        userRole === "admin" &&
        (status === CLASS_STATUS.APPROVED || status === CLASS_STATUS.ACTIVE);

      if (isEditable) {
        // Cho phép chỉnh sửa - gọi onEdit hoặc navigate
        navigate(`${basePath}/classes/edit/${classId}`, {
          state: {
            classData: selectedClass,
            lockBasicInfo: shouldLockBasicInfo,
          },
        });
      } else {
        // Chỉ xem - navigate với readonly
        navigate(`${basePath}/classes/edit/${classId}`, {
          state: { readonly: true, classData: selectedClass },
        });
      }
    }
    handleMenuClose();
  };

  const handleManageStudents = () => {
    if (selectedClass) {
      onManageStudents(selectedClass);
    }
    handleMenuClose();
  };

  const handleCancelClass = (classItem) => {
    setClassToCancel(classItem);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!classToCancel) return;

    const classId = classToCancel.ClassID;
    if (!classId) {
      toast.error("Không tìm thấy ID lớp học");
      return;
    }

    setCancelLoading(true);
    try {
      const result = await classService.cancelClass(classId);

      // Hiển thị thông báo thành công
      const deletedSessions = result?.data?.deletedSessions || 0;
      const refundRequests = result?.data?.refundRequests || 0;
      const message =
        result?.message ||
        `Hủy lớp thành công. Đã xóa ${deletedSessions} buổi học và tạo ${refundRequests} yêu cầu hoàn tiền.`;

      toast.success(message);

      // Gọi onChangeStatus để refresh danh sách nếu có
      if (onChangeStatus) {
        onChangeStatus(classId, "CANCEL");
      } else {
        // Nếu không có onChangeStatus, reload trang
        window.location.reload();
      }

      setCancelDialogOpen(false);
      setClassToCancel(null);
    } catch (error) {
      console.error("Error canceling class:", error);
      const errorMessage =
        error?.message ||
        error?.response?.data?.message ||
        "Có lỗi xảy ra khi hủy lớp học";
      toast.error(`Lỗi: ${errorMessage}`);
    } finally {
      setCancelLoading(false);
    }
  };

  const handleCloseCancelDialog = () => {
    if (!cancelLoading) {
      setCancelDialogOpen(false);
      setClassToCancel(null);
    }
  };
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusClass = (status) => {
    const normalized = normalizeStatus(status);
    switch (normalized) {
      case CLASS_STATUS.DRAFT:
        return "status-draft";
      case CLASS_STATUS.PENDING:
        return "status-pending";
      case CLASS_STATUS.APPROVED:
        return "status-approved";
      case CLASS_STATUS.ACTIVE:
        return "status-open";
      case CLASS_STATUS.ONGOING:
        return "status-ongoing";
      case CLASS_STATUS.CLOSE:
        return "status-closed";
      case CLASS_STATUS.CANCEL:
        return "status-cancelled";
      default:
        return "status-inactive";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    const normalized = normalizeStatus(status);
    const statusInfo = getStatusInfo(normalized);

    // Nếu có label từ constants, dùng nó
    if (statusInfo && statusInfo.label) {
      return statusInfo.label;
    }

    const statusMap = {
      DRAFT: "Nháp",
      PENDING: "Chờ duyệt",
      APPROVED: "Đã duyệt",
      PUBLISHED: "Đã xuất bản",
      OPEN: "Đang tuyển sinh",
      ONGOING: "Đang diễn ra",
      ON_GOING: "Đang diễn ra", 
      CLOSED: "Đã kết thúc",
      CANCELLED: "Đã hủy",
      "Đang hoạt động": "Đang hoạt động",
      "Sắp khai giảng": "Sắp khai giảng",
      "Đã kết thúc": "Đã kết thúc",
      "Chưa phân giảng viên": "Chưa phân giảng viên",
    };
    return statusMap[status] || statusMap[normalized] || status;
  };

  return (
    <div className="class-list-container">
      {classes.length === 0 ? (
        <div className="empty-state">
          <p>Chưa có lớp học nào. Hãy thêm lớp học mới!</p>
        </div>
      ) : (
        <div className="class-grid">
          {classes.map((classItem) => {
            const classId = classItem.ClassID;
            const className = classItem.Name;
            const classStatus = classItem.Status;

            const classFee = classItem.Fee || 0;
            const courseId = classItem.CourseID;
            const course = courses.find((c) => c.CourseID === courseId);
            const displayFee = classFee || null;

            // Lấy thông tin giảng viên
            const instructorId = classItem.InstructorID;
            let instructor = classItem.Instructor;

            if (
              !instructor &&
              instructorId &&
              instructors &&
              instructors.length > 0
            ) {
              instructor = instructors.find((inst) => {
                const instId = inst.InstructorID;
                return (
                  instId === instructorId ||
                  instId === parseInt(instructorId) ||
                  parseInt(instId) === instructorId ||
                  String(instId) === String(instructorId) ||
                  Number(instId) === Number(instructorId)
                );
              });
            }

            if (!instructor) {
              if (classItem.instructorName) {
                instructor = {
                  FullName: classItem.instructorName,
                };
              } else if (instructorId) {
                console.warn(
                  `Class ${classId} (${className}) has InstructorID ${instructorId} but instructor not found.`,
                  `Available instructors: ${instructors?.length || 0}`,
                  `Instructor IDs in list: ${
                    instructors
                      ?.map((i) => i.InstructorID || i.id)
                      .join(", ") || "none"
                  }`
                );
                instructor = {
                  FullName: "Chưa phân công",
                };
              } else {
                instructor = {
                  FullName: "Chưa phân công",
                };
              }
            }

            return (
              <div key={classId} className="class-card">
                <div className="class-header" style={{ position: "relative" }}>
                  <h3 className="class-title">{className}</h3>
                  <span
                    className={`status-badge ${getStatusClass(classStatus)}`}
                  >
                    {getStatusLabel(classStatus)}
                  </span>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, classItem)}
                    sx={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "4px",
                      backgroundColor: "rgba(255,255,255,0.9)",
                      "&:hover": { backgroundColor: "white" },
                    }}
                  >
                    <MoreVert sx={{ fontSize: 18 }} />
                  </IconButton>
                </div>

                <div className="class-body">
                  <p className="class-description">
                    {classItem.description || ""}
                  </p>

                  <div className="class-info">
                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Person sx={{ fontSize: 16 }} /> Giảng viên:
                      </span>
                      <span className="info-value">
                        {instructor.FullName || instructor.fullName || ""}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AccessTime sx={{ fontSize: 16 }} /> Số buổi học:
                      </span>
                      <span className="info-value">
                        {(() => {
                          const totalSessions =
                            classItem.Numofsession ||
                            classItem.numofsession ||
                            classItem.ExpectedSessions ||
                            classItem.expectedSessions ||
                            0;
                          const createdSessions = Array.isArray(
                            classItem.Sessions
                          )
                            ? classItem.Sessions.length
                            : Array.isArray(classItem.sessions)
                            ? classItem.sessions.length
                            : classItem.createdSessions ||
                              classItem.sessionCount ||
                              0;
                          return totalSessions > 0
                            ? `${createdSessions}/${totalSessions}`
                            : "";
                        })()}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <AttachMoney sx={{ fontSize: 16 }} /> Học phí:
                      </span>
                      <span className="info-value">
                        {displayFee ? formatCurrency(displayFee) : ""}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Group sx={{ fontSize: 16 }} /> Học viên:
                      </span>
                      <span className="info-value">
                        {(() => {
                          // Lấy số học viên đã enroll
                          const enrolledCount = Array.isArray(
                            classItem.enrolledStudents
                          )
                            ? classItem.enrolledStudents.length
                            : classItem.enrolledCount || 0;

                          const maxLearners = classItem.Maxstudent;

                          // Hiển thị
                          if (
                            maxLearners !== undefined &&
                            maxLearners !== null
                          ) {
                            return `${enrolledCount}/${maxLearners}`;
                          } else if (enrolledCount > 0) {
                            return `${enrolledCount}`;
                          }
                          return "";
                        })()}
                      </span>
                    </div>

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Event sx={{ fontSize: 16 }} /> Ngày dự kiến bắt đầu:
                      </span>
                      <span className="info-value">
                        {classItem.OpendatePlan ||
                          classItem.StartDate ||
                          classItem.startDate ||
                          classItem.opendatePlan ||
                          ""}
                      </span>
                    </div>

                    {(classItem.Opendate || classItem.opendate) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Event sx={{ fontSize: 16 }} /> Ngày bắt đầu thực tế:
                        </span>
                        <span className="info-value">
                          {classItem.Opendate || classItem.opendate}
                        </span>
                      </div>
                    )}

                    <div className="info-row">
                      <span
                        className="info-label"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Event sx={{ fontSize: 16 }} /> Ngày dự kiến kết thúc:
                      </span>
                      <span className="info-value">
                        {classItem.EnddatePlan ||
                          classItem.EndDate ||
                          classItem.endDate ||
                          classItem.enddatePlan ||
                          ""}
                      </span>
                    </div>

                    {(classItem.Enddate || classItem.enddate) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Event sx={{ fontSize: 16 }} /> Ngày kết thúc thực tế:
                        </span>
                        <span className="info-value">
                          {classItem.Enddate || classItem.enddate}
                        </span>
                      </div>
                    )}

                    {(classItem.ZoomID || classItem.zoomID) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Zoom ID:
                        </span>
                        <span className="info-value">
                          {classItem.ZoomID || classItem.zoomID}
                        </span>
                      </div>
                    )}

                    {(classItem.Zoompass || classItem.zoompass) && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Mật khẩu Zoom:
                        </span>
                        <span className="info-value">
                          {classItem.Zoompass || classItem.zoompass}
                        </span>
                      </div>
                    )}

                    {classItem.ZoomURL && (
                      <div className="info-row">
                        <span
                          className="info-label"
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Description sx={{ fontSize: 16 }} /> Zoom URL:
                        </span>
                        <span className="info-value">
                          <a
                            href={classItem.ZoomURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: "#667eea",
                              textDecoration: "underline",
                            }}
                          >
                            {classItem.ZoomURL}
                          </a>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="class-actions">
 
                  {normalizeStatus(classStatus) === CLASS_STATUS.DRAFT &&
                    userRole === "staff" &&
                    onSubmitForApproval && (
                      <button
                        className="btn btn-warning btn-sm"
                        onClick={() => onSubmitForApproval(classId)}
                        title="Gửi lớp học để duyệt"
                      >
                        <Send sx={{ fontSize: 14, mr: 0.5 }} />
                        Gửi duyệt
                      </button>
                    )}

                  {normalizeStatus(classStatus) === CLASS_STATUS.PENDING &&
                    userRole === "staff" &&
                    onCancelApproval && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => onCancelApproval(classId)}
                        title="Hủy yêu cầu duyệt"
                      >
                        <ArrowBack sx={{ fontSize: 14, mr: 0.5 }} />
                        Hủy
                      </button>
                    )}

                  {/* Admin: Duyệt lớp PENDING (PENDING -> APPROVED) */}
                  {normalizeStatus(classStatus) === CLASS_STATUS.PENDING &&
                    userRole === "admin" &&
                    onApprove && (
                      <button
                        className="btn btn-success btn-sm"
                        onClick={() => onApprove(classId)}
                        title="Duyệt lớp học"
                      >
                        <CheckCircle sx={{ fontSize: 14, mr: 0.5 }} />
                        Duyệt
                      </button>
                    )}

                  {/* Admin: Từ chối lớp PENDING (PENDING -> DRAFT) */}
                  {normalizeStatus(classStatus) === CLASS_STATUS.PENDING &&
                    userRole === "admin" &&
                    onReject && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => onReject(classId, classItem)}
                        title="Từ chối lớp học"
                      >
                        <Cancel sx={{ fontSize: 14, mr: 0.5 }} />
                        Từ chối
                      </button>
                    )}

                  {/* Chỉ admin được chuyển lớp đã duyệt / đang tuyển sinh về DRAFT để chỉnh sửa */}
                  {userRole === "admin" &&
                    (normalizeStatus(classStatus) === CLASS_STATUS.APPROVED ||
                      normalizeStatus(classStatus) === CLASS_STATUS.ACTIVE) &&
                    onChangeStatus && (
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => {
                          console.log(
                            "[ClassList][AdminEdit] Click Chỉnh sửa → onChangeStatus('DRAFT')",
                            { classId, status: normalizeStatus(classStatus) }
                          );
                          onChangeStatus(classId, "DRAFT");
                        }}
                        title="Chuyển sang trạng thái Nháp"
                      >
                        <ArrowBack sx={{ fontSize: 14, mr: 0.5 }} />
                        Chỉnh sửa
                      </button>
                    )}

                  {normalizeStatus(classStatus) === CLASS_STATUS.APPROVED &&
                    onPublish && (
                      <button
                        className="btn btn-purple btn-sm"
                        onClick={() => onPublish(classId)}
                        title="Tuyển sinh"
                      >
                        <Publish sx={{ fontSize: 14, mr: 0.5 }} />
                        Mở tuyển sinh
                      </button>
                    )}

                  {userRole === "admin" &&
                    (normalizeStatus(classStatus) === CLASS_STATUS.ACTIVE ||
                      normalizeStatus(classStatus) === CLASS_STATUS.APPROVED) &&
                    !(
                      normalizeStatus(classStatus) === CLASS_STATUS.ONGOING ||
                      normalizeStatus(classStatus) === CLASS_STATUS.CANCEL
                    ) && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelClass(classItem)}
                        title="Hủy lớp học"
                        disabled={cancelLoading}
                      >
                        <Cancel sx={{ fontSize: 14, mr: 0.5 }} />
                        Hủy lớp
                      </button>
                    )}

                  {/* Lịch button */}
                  {/* Với staff: chỉ hiển thị cho DRAFT (có thể chỉnh sửa) */}
                  {/* Với admin: luôn hiển thị, nhưng readonly cho các status đã duyệt */}
                  {((userRole === "staff" &&
                    normalizeStatus(classStatus) === CLASS_STATUS.DRAFT) ||
                    normalizeStatus(classStatus) === CLASS_STATUS.PENDING ||
                    userRole === "admin" ||
                    normalizeStatus(classStatus) === CLASS_STATUS.APPROVED ||
                    normalizeStatus(classStatus) === CLASS_STATUS.ACTIVE ||
                    normalizeStatus(classStatus) === CLASS_STATUS.ON_GOING ||
                    normalizeStatus(classStatus) === CLASS_STATUS.CLOSE ||
                    normalizeStatus(classStatus) === CLASS_STATUS.CANCEL) && (
                    <button
                      className="btn btn-info btn-sm"
                      onClick={() => {
                        // Với các status đã duyệt, chỉ xem (readonly)
                        const isReadonly =
                          normalizeStatus(classStatus) ===
                            CLASS_STATUS.APPROVED ||
                          normalizeStatus(classStatus) ===
                            CLASS_STATUS.ACTIVE ||
                          normalizeStatus(classStatus) ===
                            CLASS_STATUS.ON_GOING ||
                          normalizeStatus(classStatus) === CLASS_STATUS.CLOSE ||
                          normalizeStatus(classStatus) === CLASS_STATUS.CANCEL;
                        navigate(
                          userRole === "staff"
                            ? `/staff/classes/${classId}/schedule`
                            : `/admin/classes/${classId}/schedule`,
                          {
                            state: { readonly: isReadonly },
                          }
                        );
                      }}
                      title={
                        normalizeStatus(classStatus) === CLASS_STATUS.DRAFT
                          ? "Quản lý lịch học"
                          : "Xem lịch học"
                      }
                    >
                      <CalendarToday sx={{ fontSize: 14, mr: 0.5 }} />
                      Lịch
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            minWidth: 200,
          },
        }}
      >
        {selectedClass && (
          <div>
            {(() => {
              const status = normalizeStatus(
                selectedClass.Status || selectedClass.status
              );
              const isEditableForStaff =
                STAFF_EDITABLE_STATUSES.includes(status);
              const isEditableForAdmin =
                ADMIN_EDITABLE_STATUSES.includes(status);
              const canEdit =
                userRole === "staff" ? isEditableForStaff : isEditableForAdmin;

              return canEdit ? (
                <MenuItem key="edit" onClick={handleEdit}>
                  <Edit sx={{ fontSize: 18, mr: 1.5 }} /> Chỉnh sửa
                </MenuItem>
              ) : (
                <MenuItem key="view" onClick={handleEdit}>
                  <Edit sx={{ fontSize: 18, mr: 1.5 }} /> Xem
                </MenuItem>
              );
            })()}

            <MenuItem key="manage-students" onClick={handleManageStudents}>
              <People sx={{ fontSize: 18, mr: 1.5 }} /> Quản lý học viên
            </MenuItem>
          </div>
        )}
      </Menu>

      {/* Cancel Class Dialog */}
      <CancelClassDialog
        open={cancelDialogOpen}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
        classInfo={classToCancel}
        loading={cancelLoading}
      />
    </div>
  );
};

export default ClassList;
