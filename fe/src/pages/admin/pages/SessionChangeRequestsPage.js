import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  TextField,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  Select,
  InputLabel,
  MenuItem,
  Stack,
  Autocomplete,
  Pagination,
  Divider,
} from "@mui/material";
import { SwapHoriz } from "@mui/icons-material";
import sessionChangeRequestService from "../../../apiServices/sessionChangeRequestService";
import instructorService from "../../../apiServices/instructorServicead";
import { toast } from "react-toastify";

const SessionChangeRequestsPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const urlInstructorId = searchParams.get("instructorId");

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusInput, setStatusInput] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [instructorInput, setInstructorInput] = useState(
    urlInstructorId || "all"
  );
  const [instructorFilter, setInstructorFilter] = useState(
    urlInstructorId || "all"
  );
  const [instructors, setInstructors] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [processing, setProcessing] = useState(false);

  const showToast = (severity, message) => {
    const content = (
      <div style={{ whiteSpace: "pre-line" }}>{String(message || "")}</div>
    );
    switch (severity) {
      case "success":
        return toast.success(content);
      case "error":
        return toast.error(content);
      case "warn":
        return toast.warn(content);
      case "info":
      default:
        return toast.info(content);
    }
  };
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);

  useEffect(() => {
    const initialize = async () => {
      await loadInstructors();
      await loadRequests();
    };
    initialize();
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
  }, [urlInstructorId]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const data = await sessionChangeRequestService.getAllRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading requests:", error);
      setRequests([]);
      showToast("error", "Không thể tải danh sách yêu cầu đổi lịch!");
    } finally {
      setLoading(false);
    }
  };

  const loadInstructors = async () => {
    try {
      const data = await instructorService.getAllInstructorsAdmin();
      setInstructors(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading instructors:", error);
      setInstructors([]);
    }
  };

  const applyFilters = () => {
    setStatusFilter(statusInput);
    setInstructorFilter(instructorInput);
    setPage(1);

    // Update URL with filters
    const newParams = new URLSearchParams();
    if (instructorInput && instructorInput !== "all") {
      newParams.set("instructorId", instructorInput);
    }
    setSearchParams(newParams);
  };

  const resetFilters = () => {
    setStatusInput("all");
    setStatusFilter("all");
    setInstructorInput("all");
    setInstructorFilter("all");
    setPage(1);

    // Navigate to base URL without query params
    navigate("/admin/session-change-requests");
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    try {
      setProcessing(true);
      await sessionChangeRequestService.approveRequest(
        selectedRequest.RequestID
      );
      showToast("success", "Duyệt yêu cầu đổi lịch thành công!");
      setApproveDialogOpen(false);
      await loadRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Không thể duyệt yêu cầu!"
      );
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectReason.trim()) {
      showToast("warn", "Vui lòng nhập lý do từ chối!");
      return;
    }

    try {
      setProcessing(true);
      await sessionChangeRequestService.rejectRequest(
        selectedRequest.RequestID,
        rejectReason
      );
      showToast("success", "Từ chối yêu cầu đổi lịch thành công!");
      setRejectDialogOpen(false);
      setRejectReason("");
      await loadRequests();
    } catch (error) {
      console.error("Error rejecting request:", error);
      showToast(
        "error",
        error?.response?.data?.message ||
          error?.message ||
          "Không thể từ chối yêu cầu!"
      );
    } finally {
      setProcessing(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: "Đang chờ duyệt",
      APPROVED: "Đã duyệt",
      REJECTED: "Đã từ chối",
    };
    return labels[status] || status;
  };

  // Filter requests
  const filteredRequests = requests.filter((request) => {
    // Status filter
    if (statusFilter !== "all" && request.Status !== statusFilter) {
      return false;
    }

    // Instructor filter
    if (
      instructorFilter !== "all" &&
      request.InstructorID !== parseInt(instructorFilter)
    ) {
      return false;
    }

    return true;
  });

  // Pagination
  const paginatedRequests = React.useMemo(() => {
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredRequests.slice(startIndex, endIndex);
  }, [filteredRequests, page, pageSize]);

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1;

  // Reset về trang 1 khi filter thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [statusFilter, instructorFilter]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          py: 8,
          minHeight: "100vh",
          backgroundColor: "#f8fafc",
        }}
      >
        <CircularProgress sx={{ color: "#667eea" }} />
        <Typography sx={{ ml: 2, color: "#64748b" }}>
          Đang tải yêu cầu đổi lịch...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            mb: 3,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Quản lý yêu cầu chuyển lịch
            </Typography>
          </Box>
        </Box>

        {/* Filter */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
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
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Trạng thái</InputLabel>
            <Select
              value={statusInput}
              label="Trạng thái"
              onChange={(e) => setStatusInput(e.target.value)}
              sx={{
                borderRadius: 2,
                backgroundColor: "#fff",
              }}
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="PENDING">Đang chờ duyệt</MenuItem>
              <MenuItem value="APPROVED">Đã duyệt</MenuItem>
              <MenuItem value="REJECTED">Đã từ chối</MenuItem>
            </Select>
          </FormControl>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              size="small"
              onClick={applyFilters}
              sx={{ textTransform: "none" }}
            >
              Áp dụng
            </Button>
            {(instructorFilter !== "all" || statusFilter !== "all") && (
              <Button
                variant="outlined"
                size="small"
                onClick={resetFilters}
                sx={{ textTransform: "none" }}
              >
                Xóa lọc
              </Button>
            )}
          </Stack>
        </Box>
      </Box>

      {/* Requests Table */}
      {filteredRequests.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <SwapHoriz sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không tìm thấy yêu cầu đổi lịch
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Hãy thử thay đổi bộ lọc
          </Typography>
        </Paper>
      ) : (
        <TableContainer
          component={Paper}
          sx={{
            borderRadius: 3,
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            border: "1px solid #e2e8f0",
          }}
        >
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Giảng viên
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Buổi học
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Ngày cũ
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Ngày mới
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Ca mới
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Lý do
                </TableCell>
                <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                  Trạng thái
                </TableCell>
                <TableCell
                  sx={{ fontWeight: 700, color: "#1e293b" }}
                  align="right"
                >
                  Thao tác
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRequests.map((request) => {
                const instructor = instructors.find(
                  (i) => i.InstructorID === request.InstructorID
                );
                return (
                  <TableRow
                    key={request.RequestID}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {instructor?.FullName || `ID: ${request.InstructorID}`}
                    </TableCell>
                    <TableCell>Session #{request.SessionID}</TableCell>
                    <TableCell>{formatDate(request.OldDate)}</TableCell>
                    <TableCell>{formatDate(request.NewDate)}</TableCell>
                    <TableCell>Ca {request.NewTimeslotID}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {request.Reason || "N/A"}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusLabel(request.Status)}
                        size="small"
                        sx={{
                          backgroundColor:
                            request.Status === "APPROVED"
                              ? "#10b981"
                              : request.Status === "REJECTED"
                              ? "#ef4444"
                              : "#f59e0b",
                          color: "white",
                          fontWeight: 600,
                          fontSize: "11px",
                        }}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        {request.Status === "PENDING" && (
                          <>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedRequest(request);
                                setApproveDialogOpen(true);
                              }}
                              sx={{
                                textTransform: "none",
                                borderColor: "black",
                                color: "black",
                              }}
                            >
                              Duyệt
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectDialogOpen(true);
                                setRejectReason("");
                              }}
                              sx={{
                                textTransform: "none",
                                borderColor: "black",
                                color: "black",
                              }}
                            >
                              Từ chối
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {filteredRequests.length > 0 && (
            <>
              <Divider />
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 2,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  Hiển thị {(page - 1) * pageSize + 1} -{" "}
                  {Math.min(page * pageSize, filteredRequests.length)} trong
                  tổng số {filteredRequests.length} yêu cầu
                </Typography>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  color="primary"
                  shape="rounded"
                />
              </Box>
            </>
          )}
        </TableContainer>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={approveDialogOpen}
        onClose={() => !processing && setApproveDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Duyệt yêu cầu đổi lịch
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Bạn có chắc chắn muốn duyệt yêu cầu đổi lịch này không?
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                <strong>Giảng viên:</strong>{" "}
                {instructors.find(
                  (i) => i.InstructorID === selectedRequest.InstructorID
                )?.FullName || `ID: ${selectedRequest.InstructorID}`}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                <strong>Buổi học:</strong> Session #{selectedRequest.SessionID}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                <strong>Ngày mới:</strong> {formatDate(selectedRequest.NewDate)}
              </Typography>
              <Typography variant="body2" sx={{ mb: 1, color: "#64748b" }}>
                <strong>Ca mới:</strong> Ca {selectedRequest.NewTimeslotID}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setApproveDialogOpen(false)}
            disabled={processing}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleApprove}
            disabled={processing}
            variant="contained"
            sx={{ textTransform: "none" }}
          >
            {processing ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog
        open={rejectDialogOpen}
        onClose={() => !processing && setRejectDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: 700, pb: 2, borderBottom: "2px solid #e2e8f0" }}
        >
          Từ chối yêu cầu đổi lịch
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedRequest && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Vui lòng nhập lý do từ chối:
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={4}
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Ví dụ: Lịch phòng máy ngày hôm đó đã kín, vui lòng chọn ngày khác."
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 2,
                  },
                }}
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => {
              setRejectDialogOpen(false);
              setRejectReason("");
            }}
            disabled={processing}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleReject}
            disabled={processing || !rejectReason.trim()}
            variant="contained"
            color="error"
            sx={{ textTransform: "none" }}
          >
            {processing ? "Đang xử lý..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionChangeRequestsPage;
