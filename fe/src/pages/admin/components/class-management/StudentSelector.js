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
} from "@mui/material";
import {
  MoreVert,
  Visibility,
  Delete,
  Person,
  Email,
  Phone,
  CalendarToday,
} from "@mui/icons-material";
import "./StudentSelector.css";

const StudentSelector = ({ classData, allLearners, onClose, onUpdate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedLearner, setSelectedLearner] = useState(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);

  // Lấy danh sách ID học viên đã enroll
  // enrolledStudents có thể là mảng IDs hoặc mảng enrollment objects
  const enrolledStudentIds = useMemo(() => {
    const enrolled = classData.enrolledStudents || [];
    if (!Array.isArray(enrolled)) {
      console.warn("enrolledStudents is not an array:", enrolled);
      return [];
    }
    
    // Debug log
    console.log("Class enrolledStudents:", enrolled);
    console.log("All learners count:", allLearners?.length || 0);
    
    // Nếu là mảng objects (enrollments), lấy LearnerID từ mỗi object
    if (enrolled.length > 0 && typeof enrolled[0] === 'object' && enrolled[0] !== null) {
      const ids = enrolled
        .map(enrollment => {
          const id = enrollment.LearnerID || enrollment.Learner?.LearnerID || enrollment.LearnerID || enrollment.id;
          return id;
        })
        .filter(id => id !== undefined && id !== null);
      console.log("Extracted learner IDs from enrollments:", ids);
      return ids;
    }
    
    // Nếu là mảng IDs, trả về trực tiếp
    const ids = enrolled.filter(id => id !== undefined && id !== null);
    console.log("Using enrolled as IDs:", ids);
    return ids;
  }, [classData.enrolledStudents, allLearners]);

  // Lấy danh sách học viên đã enroll (chỉ hiển thị những người đã enroll)
  const enrolledLearners = useMemo(() => {
    if (!Array.isArray(allLearners)) {
      console.warn("allLearners is not an array:", allLearners);
      return [];
    }
    
    const filtered = allLearners.filter((learner) => {
      if (!learner) return false;
      const learnerId = learner.LearnerID || learner.id;
      // So sánh với nhiều cách để tránh type mismatch
      const isEnrolled = enrolledStudentIds.some(id => 
        id === learnerId ||
        id === parseInt(learnerId) ||
        parseInt(id) === learnerId ||
        String(id) === String(learnerId) ||
        Number(id) === Number(learnerId)
      );
      return isEnrolled;
    });
    
    console.log(`Found ${filtered.length} enrolled learners out of ${allLearners.length} total learners`);
    console.log("Enrolled learners:", filtered.map(l => ({ id: l.LearnerID || l.id, name: l.FullName || l.fullName })));
    
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

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedLearner(null);
  };

  const handleViewDetail = () => {
    setShowDetailDialog(true);
    handleMenuClose();
  };

  const handleDeleteLearner = () => {
    if (!selectedLearner) return;
    const learnerId = selectedLearner.LearnerID || selectedLearner.id;
    const confirmed = window.confirm(
      `Bạn có chắc muốn xóa học viên "${selectedLearner.FullName || selectedLearner.fullName}" khỏi lớp học này?`
    );
    if (confirmed) {
      // Xóa khỏi danh sách enrolled
      const updatedEnrolled = enrolledStudentIds.filter(id => id !== learnerId);
      onUpdate(updatedEnrolled);
      handleMenuClose();
    }
  };

  const handleCloseDetailDialog = () => {
    setShowDetailDialog(false);
    setSelectedLearner(null);
  };

  return (
    <div className="student-selector-overlay">
      <div className="student-selector-container">
        <div className="selector-header">
          <div>
            <h2>Quản lý học viên</h2>
            <p className="class-name">{classData.Name || classData.title || ""}</p>
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
              <span className="stat-value">{classData.Maxstudent || classData.MaxLearners || classData.maxLearners || classData.maxStudents || 0}</span>
              <span className="stat-label">Sĩ số tối đa</span>
            </div>
            <div className="stat-item">
              <span className="stat-value">
                {(classData.Maxstudent || classData.MaxLearners || classData.maxLearners || classData.maxStudents || 0) - enrolledLearners.length}
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
                            <div className="student-contact">
                              {email}
                            </div>
                            <div className="student-contact">
                              {phone}
                            </div>
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
          <MenuItem onClick={handleDeleteLearner}>
            <Delete sx={{ fontSize: 18, mr: 1.5 }} /> Xóa khỏi lớp
          </MenuItem>
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
            {selectedLearner && (
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
                    {(selectedLearner.FullName || selectedLearner.fullName || "?")[0]}
                  </Box>
                  <Box>
                    <Typography variant="h6">
                      {selectedLearner.FullName || selectedLearner.fullName || ""}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      ID: {selectedLearner.LearnerID || selectedLearner.id || ""}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Email sx={{ color: "#64748b" }} />
                    <Typography variant="body1">
                      <strong>Email:</strong> {selectedLearner.Email || selectedLearner.email || ""}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Phone sx={{ color: "#64748b" }} />
                    <Typography variant="body1">
                      <strong>Số điện thoại:</strong> {selectedLearner.Phone || selectedLearner.phone || ""}
                    </Typography>
                  </Box>
                  {selectedLearner.DateOfBirth && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <CalendarToday sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Ngày sinh:</strong> {selectedLearner.DateOfBirth || selectedLearner.dateOfBirth || ""}
                      </Typography>
                    </Box>
                  )}
                  {selectedLearner.Address && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Địa chỉ:</strong> {selectedLearner.Address || selectedLearner.address || ""}
                      </Typography>
                    </Box>
                  )}
                  {selectedLearner.Job && (
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Person sx={{ color: "#64748b" }} />
                      <Typography variant="body1">
                        <strong>Nghề nghiệp:</strong> {selectedLearner.Job || selectedLearner.job || ""}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDetailDialog}>Đóng</Button>
          </DialogActions>
        </Dialog>
      </div>
    </div>
  );
};

export default StudentSelector;
