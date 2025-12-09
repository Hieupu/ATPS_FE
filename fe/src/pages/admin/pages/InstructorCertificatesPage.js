import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  InputAdornment,
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
  IconButton,
  Stack,
  Autocomplete,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Search,
  CheckCircle,
  Cancel,
  Visibility,
  ArrowBack,
  Verified,
} from "@mui/icons-material";
import certificateService from "../../../apiServices/certificateService";
import instructorService from "../../../apiServices/instructorServicead";

const InstructorCertificatesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const instructorId = searchParams.get("instructorId");

  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [statusInput, setStatusInput] = useState("all");
  const [instructorFilter, setInstructorFilter] = useState(
    instructorId || "all"
  );
  const [instructorInput, setInstructorInput] = useState(instructorId || "all");
  const [instructors, setInstructors] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [updateDialogOpen, setUpdateDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [instructorInfo, setInstructorInfo] = useState(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  // Store initial instructorId from URL to reset to it later
  const [initialInstructorId] = useState(instructorId);

  useEffect(() => {
    const initialize = async () => {
      // Load instructors first
      await loadInstructors();

      if (instructorId) {
        setInstructorFilter(instructorId);
        setInstructorInput(instructorId);
        await loadCertificates(1, searchTerm, statusFilter);
        await loadInstructorInfo();
      } else {
        setInstructorFilter("all");
        setInstructorInput("all");
        await loadAllCertificates(1, searchTerm, statusFilter, "all");
        setInstructorInfo(null);
      }
      setPage(1);
    };
    initialize();
  }, [instructorId]);

  const loadCertificates = async (
    pageNum = page,
    searchTerm = searchInput,
    statusFilter = statusInput
  ) => {
    try {
      setLoading(true);
      const result = await certificateService.getCertificatesByInstructorId(
        instructorId,
        {
          page: pageNum,
          pageSize: pageSize,
          search: searchTerm || null,
          status: statusFilter !== "all" ? statusFilter : null,
        }
      );
      const certificatesList = Array.isArray(result.data) ? result.data : [];
      setCertificates(certificatesList);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      setCertificates([]);
      setPagination({ total: 0, totalPages: 0 });
      alert("Không thể tải danh sách chứng chỉ!");
    } finally {
      setLoading(false);
    }
  };

  const loadAllCertificates = async (
    pageNum = page,
    searchTerm = searchInput,
    statusFilter = statusInput,
    instructorFilterValue = instructorInput
  ) => {
    try {
      setLoading(true);
      const filters = {
        page: pageNum,
        pageSize: pageSize,
        search: searchTerm || null,
        status: statusFilter !== "all" ? statusFilter : null,
        instructorId:
          instructorFilterValue && instructorFilterValue !== "all"
            ? parseInt(instructorFilterValue)
            : null,
      };
      const result = await certificateService.getAllCertificates(filters);
      const certificatesList = Array.isArray(result.data) ? result.data : [];
      setCertificates(certificatesList);
      if (result.pagination) {
        setPagination(result.pagination);
      }
    } catch (error) {
      console.error("Error loading certificates:", error);
      setCertificates([]);
      setPagination({ total: 0, totalPages: 0 });
      alert("Không thể tải danh sách chứng chỉ!");
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

  const loadInstructorInfo = async (id = null) => {
    const targetId = id || instructorId;
    if (!targetId) return;
    try {
      const data = await instructorService.getInstructorById(targetId);
      setInstructorInfo(data);
    } catch (error) {
      console.error("Error loading instructor info:", error);
      // Fallback: try to find from instructors list
      const instructor = instructors.find(
        (i) => i.InstructorID === parseInt(targetId)
      );
      if (instructor) {
        setInstructorInfo(instructor);
      }
    }
  };

  const applyFilters = async () => {
    setSearchTerm(searchInput);
    setStatusFilter(statusInput);
    setPage(1); // Reset to first page

    // Update URL based on instructorInput
    const newParams = new URLSearchParams(searchParams);
    if (instructorInput && instructorInput !== "all") {
      // Update URL with new instructorId
      newParams.set("instructorId", instructorInput);
      setInstructorFilter(instructorInput);
      setSearchParams(newParams);
      // URL change will trigger useEffect, but we also load data here to apply search/status filters
      await loadAllCertificates(1, searchInput, statusInput, instructorInput);
      await loadInstructorInfo(instructorInput);
    } else {
      // Remove instructorId from URL if "all" is selected
      newParams.delete("instructorId");
      setInstructorFilter("all");
      setSearchParams(newParams);
      // Load all certificates with search/status filters
      await loadAllCertificates(1, searchInput, statusInput, "all");
      setInstructorInfo(null);
    }
  };

  const resetFilters = () => {
    setSearchInput("");
    setStatusInput("all");
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);

    // Reset to "all" and navigate to base URL without query params
    setInstructorInput("all");
    setInstructorFilter("all");
    setInstructorInfo(null);

    // Navigate to base URL without query params
    // useEffect will automatically reload data when URL changes
    navigate("/admin/instructor-certificates");
  };

  const totalPages = pagination.totalPages || 1;

  const handleChangePage = async (event, value) => {
    setPage(value);

    // Load data for new page based on current URL instructorId
    if (instructorId) {
      // If URL has instructorId, use it
      await loadCertificates(value, searchInput, statusInput);
    } else {
      // If no URL instructorId, use instructorFilter
      await loadAllCertificates(
        value,
        searchInput,
        statusInput,
        instructorFilter
      );
    }
  };

  const handleViewCertificate = (certificate) => {
    setSelectedCertificate(certificate);
    setViewDialogOpen(true);
  };

  const handleUpdateStatus = (certificate, newStatusValue) => {
    setSelectedCertificate(certificate);
    setNewStatus(newStatusValue);
    setUpdateDialogOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedCertificate || !newStatus) return;

    try {
      setUpdating(true);
      await certificateService.updateCertificateStatus(
        selectedCertificate.CertificateID,
        newStatus
      );
      alert("Cập nhật trạng thái chứng chỉ thành công!");
      setUpdateDialogOpen(false);

      // Reload current page based on current URL instructorId
      if (instructorId) {
        await loadCertificates(page, searchInput, statusInput);
      } else {
        await loadAllCertificates(
          page,
          searchInput,
          statusInput,
          instructorFilter
        );
      }
    } catch (error) {
      console.error("Error updating certificate status:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể cập nhật trạng thái chứng chỉ!"
      );
    } finally {
      setUpdating(false);
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

  const getStatusColor = (status) => {
    const colors = {
      PENDING: "#f59e0b",
      APPROVED: "#10b981",
      REJECTED: "#ef4444",
    };
    return colors[status] || "#94a3b8";
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
          Đang tải chứng chỉ...
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
              Quản lý chứng chỉ giảng viên
            </Typography>
          </Box>
        </Box>

        {/* Search and Filter */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            flexWrap: "wrap",
            alignItems: { xs: "stretch", lg: "center" },
          }}
        >
          <TextField
            placeholder="Tìm kiếm chứng chỉ..."
            size="small"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            sx={{
              flex: 1,
              maxWidth: 300,
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
                const newInstructorId =
                  newValue.InstructorID === "all"
                    ? "all"
                    : newValue.InstructorID.toString();
                setInstructorInput(newInstructorId);
                // Note: URL instructorId is kept, but filter can be changed
              } else {
                // If URL has instructorId, reset to it; otherwise reset to "all"
                setInstructorInput(instructorId || "all");
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
            <Button
              variant="outlined"
              size="small"
              onClick={resetFilters}
              sx={{ textTransform: "none" }}
            >
              Xóa lọc
            </Button>
          </Stack>
        </Box>
      </Box>

      {/* Certificates Table */}
      {certificates.length === 0 ? (
        <Paper
          sx={{
            p: 8,
            textAlign: "center",
            borderRadius: 3,
            backgroundColor: "#fff",
          }}
        >
          <Verified sx={{ fontSize: 64, color: "#94a3b8", mb: 2 }} />
          <Typography variant="h6" sx={{ mb: 1, color: "#64748b" }}>
            Không tìm thấy chứng chỉ
          </Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8" }}>
            Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
          </Typography>
        </Paper>
      ) : (
        <>
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
                    Tên chứng chỉ
                  </TableCell>
                  {!instructorId && (
                    <TableCell sx={{ fontWeight: 700, color: "#1e293b" }}>
                      Giảng viên
                    </TableCell>
                  )}
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
                {certificates.map((certificate) => (
                  <TableRow
                    key={certificate.CertificateID}
                    sx={{
                      "&:hover": {
                        backgroundColor: "#f8fafc",
                      },
                    }}
                  >
                    <TableCell sx={{ fontWeight: 600 }}>
                      {certificate.Title}
                    </TableCell>
                    {!instructorId && (
                      <TableCell>
                        {certificate.InstructorName || "N/A"}
                      </TableCell>
                    )}
                    <TableCell>{getStatusLabel(certificate.Status)}</TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                      >
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleViewCertificate(certificate)}
                          sx={{
                            textTransform: "none",
                            borderColor: "black",
                            color: "black",
                          }}
                        >
                          Xem
                        </Button>

                        {certificate.Status === "PENDING" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleUpdateStatus(certificate, "APPROVED")
                            }
                            sx={{
                              textTransform: "none",
                              borderColor: "black",
                              color: "black",
                            }}
                          >
                            Duyệt
                          </Button>
                        )}

                        {certificate.Status === "PENDING" && (
                          <Button
                            size="small"
                            variant="outlined"
                            onClick={() =>
                              handleUpdateStatus(certificate, "REJECTED")
                            }
                            sx={{
                              textTransform: "none",
                              borderColor: "black",
                              color: "black",
                            }}
                          >
                            Từ chối
                          </Button>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {certificates.length > 0 && (
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
                    {Math.min(page * pageSize, pagination.total || 0)} trong
                    tổng số {pagination.total || 0} chứng chỉ
                  </Typography>
                  <Pagination
                    count={totalPages}
                    page={page}
                    onChange={handleChangePage}
                    color="primary"
                    shape="rounded"
                  />
                </Box>
              </>
            )}
          </TableContainer>
        </>
      )}

      {/* View Certificate Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
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
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Verified sx={{ color: "#667eea" }} />
            <Typography variant="h6">Chi tiết chứng chỉ</Typography>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedCertificate && (
            <Box>
              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                Tên chứng chỉ
              </Typography>
              <Typography variant="body1" sx={{ mb: 3, fontWeight: 600 }}>
                {selectedCertificate.Title}
              </Typography>

              {!instructorId && (
                <>
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "#64748b", mb: 1 }}
                  >
                    Giảng viên
                  </Typography>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    {selectedCertificate.InstructorName || "N/A"}
                  </Typography>
                </>
              )}

              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                Trạng thái
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                {getStatusLabel(selectedCertificate.Status)}
              </Typography>

              <Typography variant="subtitle2" sx={{ color: "#64748b", mb: 1 }}>
                File chứng chỉ
              </Typography>
              <Box sx={{ mb: 2 }}>
                {selectedCertificate.FileURL ? (
                  <Button
                    variant="outlined"
                    href={selectedCertificate.FileURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ textTransform: "none" }}
                  >
                    Xem file chứng chỉ
                  </Button>
                ) : (
                  <Typography variant="body2" sx={{ color: "#94a3b8" }}>
                    Không có file
                  </Typography>
                )}
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setViewDialogOpen(false)}
            sx={{
              textTransform: "none",
            }}
          >
            Đóng
          </Button>
        </DialogActions>
      </Dialog>

      {/* Update Status Dialog */}
      <Dialog
        open={updateDialogOpen}
        onClose={() => !updating && setUpdateDialogOpen(false)}
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
          Cập nhật trạng thái chứng chỉ
        </DialogTitle>
        <DialogContent sx={{ mt: 2 }}>
          {selectedCertificate && (
            <Box>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Chứng chỉ: <strong>{selectedCertificate.Title}</strong>
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: "#64748b" }}>
                Trạng thái mới: <strong>{getStatusLabel(newStatus)}</strong>
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: "1px solid #e2e8f0" }}>
          <Button
            onClick={() => setUpdateDialogOpen(false)}
            disabled={updating}
            sx={{ textTransform: "none" }}
          >
            Hủy
          </Button>
          <Button
            onClick={handleConfirmUpdate}
            disabled={updating || !newStatus}
            sx={{ textTransform: "none" }}
          >
            {updating ? "Đang cập nhật..." : "Xác nhận"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorCertificatesPage;
