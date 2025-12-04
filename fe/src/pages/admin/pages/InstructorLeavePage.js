import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Stack,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Switch,
  Select,
  InputLabel,
  FormControl,
  CircularProgress,
  Pagination,
  Autocomplete,
  Checkbox,
  ListItemText,
  Grid,
  Card,
  CardContent,
  RadioGroup,
  Radio,
} from "@mui/material";
import { Delete, EventBusy, Add, Sync } from "@mui/icons-material";
import dayjs from "dayjs";
import classService from "../../../apiServices/classService";
import instructorService from "../../../apiServices/instructorService";
import { getDayFromDate } from "../../../utils/validate";

const STATUS_OPTIONS = [
  { value: "OTHER", label: "Đã lên lịch" },
  { value: "HOLIDAY", label: "Nghỉ lễ" },
  { value: "AVAILABLE", label: "Lịch cá nhân" },
];

const PAGE_SIZE = 10;

const InstructorLeavePage = () => {
  const [searchParams] = useSearchParams();
  const initialInstructor = searchParams.get("instructorId") || "";

  const [filters, setFilters] = useState({
    instructorId: initialInstructor,
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [appliedFilters, setAppliedFilters] = useState({
    instructorId: initialInstructor,
    status: "all",
    startDate: "",
    endDate: "",
  });
  const [instructors, setInstructors] = useState([]);
  const [timeslots, setTimeslots] = useState([]);
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_SIZE,
    total: 0,
    totalPages: 0,
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogLoading, setDialogLoading] = useState(false);
  const [selectedFilterInstructor, setSelectedFilterInstructor] =
    useState(null);
  const [selectedDialogInstructor, setSelectedDialogInstructor] =
    useState(null);
  const [dialogForm, setDialogForm] = useState({
    instructorId: initialInstructor,
    startDate: "",
    endDate: "",
    blockEntireDay: false,
    timeslotIds: [],
    status: "OTHER",
    note: "",
  });
  const [applyToAllInstructors, setApplyToAllInstructors] = useState(false);
  const [syncDialogOpen, setSyncDialogOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncTarget, setSyncTarget] = useState("selected");

  useEffect(() => {
    loadInstructors();
    loadTimeslots();
  }, []);

  useEffect(() => {
    // Set selectedFilterInstructor khi có initialInstructor
    if (initialInstructor && instructors.length > 0) {
      const instructor = instructors.find(
        (ins) => ins.InstructorID === parseInt(initialInstructor)
      );
      if (instructor) {
        setSelectedFilterInstructor(instructor);
      }
    }
  }, [initialInstructor, instructors]);

  useEffect(() => {
    fetchLeaves(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appliedFilters, page]);

  const loadInstructors = async () => {
    try {
      const data = await instructorService.getAllInstructors();
      setInstructors(data || []);
    } catch (error) {
      console.error("Unable to load instructors", error);
    }
  };

  const loadTimeslots = async () => {
    try {
      const response = await classService.getAllTimeslots({
        limit: 500,
      });
      setTimeslots(response?.data || []);
    } catch (error) {
      console.error("Unable to load timeslots", error);
    }
  };

  const fetchLeaves = async (pageToLoad = 1) => {
    try {
      setLoading(true);
      const params = {
        page: pageToLoad,
        limit: PAGE_SIZE,
      };
      if (appliedFilters.instructorId) {
        params.InstructorID = appliedFilters.instructorId;
      }
      if (appliedFilters.status !== "all") {
        params.Status = appliedFilters.status;
      }
      if (appliedFilters.startDate) {
        params.StartDate = appliedFilters.startDate;
      }
      if (appliedFilters.endDate) {
        params.EndDate = appliedFilters.endDate;
      }

      console.log("[InstructorLeavePage] Fetching leaves with params:", params);
      const result = await classService.getInstructorLeaves(params);
      console.log("[InstructorLeavePage] Leaves response:", result);
      setLeaves(result?.items || []);
      setPagination(result?.pagination || pagination);
      setPage(result?.pagination?.page || pageToLoad);
    } catch (error) {
      console.error("Failed to fetch instructor leaves", error);
      alert(error?.message || "Không thể tải danh sách lịch nghỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
  };

  const handleClearFilters = () => {
    const clearedFilters = {
      instructorId: "",
      status: "all",
      startDate: "",
      endDate: "",
    };
    setFilters(clearedFilters);
    setAppliedFilters(clearedFilters);
    setPage(1);
  };

  const handleDelete = async (leaveId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa lịch nghỉ này?")) return;
    try {
      console.log("[InstructorLeavePage] Deleting leave:", leaveId);
      await classService.deleteInstructorLeave(leaveId);
      alert("Đã xóa lịch nghỉ");
      fetchLeaves(page);
    } catch (error) {
      console.error("Delete leave failed", error);
      alert(error?.message || "Không thể xóa lịch nghỉ");
    }
  };

  // Tính toán các thứ trong tuần có trong khoảng thời gian
  const daysInRange = useMemo(() => {
    if (!dialogForm.startDate || !timeslots.length) return [];

    const startDate = dayjs(dialogForm.startDate).startOf("day");
    const endDate = dialogForm.endDate
      ? dayjs(dialogForm.endDate).startOf("day")
      : startDate;

    const daysSet = new Set();
    let currentDate = startDate;

    // Dùng isAfter với logic ngược (while !isAfter = while <=)
    while (!currentDate.isAfter(endDate)) {
      const dayLabel = getDayFromDate(currentDate.format("YYYY-MM-DD"));
      daysSet.add(dayLabel);
      currentDate = currentDate.add(1, "day");
    }

    return Array.from(daysSet);
  }, [dialogForm.startDate, dialogForm.endDate, timeslots]);

  // Nhóm ca học theo thứ trong tuần
  const timeslotsByDay = useMemo(() => {
    if (
      !dialogForm.startDate ||
      !timeslots.length ||
      daysInRange.length === 0
    ) {
      return {};
    }

    const grouped = {};
    daysInRange.forEach((day) => {
      grouped[day] = timeslots.filter((ts) => (ts.Day || ts.day) === day);
    });

    return grouped;
  }, [dialogForm.startDate, timeslots, daysInRange]);

  // Tất cả ca học có thể chọn (từ tất cả các thứ trong khoảng)
  const allAvailableTimeslots = useMemo(() => {
    if (!dialogForm.startDate || !timeslots.length) return [];

    if (daysInRange.length === 0) return [];

    const allSlots = [];
    daysInRange.forEach((day) => {
      const slotsForDay = timeslots.filter((ts) => (ts.Day || ts.day) === day);
      allSlots.push(...slotsForDay);
    });

    // Loại bỏ trùng lặp (cùng TimeslotID)
    const uniqueSlots = [];
    const seenIds = new Set();
    allSlots.forEach((slot) => {
      const id = slot.TimeslotID;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        uniqueSlots.push(slot);
      }
    });

    return uniqueSlots;
  }, [dialogForm.startDate, timeslots, daysInRange]);

  const handleDialogOpen = () => {
    const initialInstructorObj = filters.instructorId
      ? instructors.find(
          (ins) => ins.InstructorID === parseInt(filters.instructorId)
        )
      : null;
    setSelectedDialogInstructor(initialInstructorObj);
    setApplyToAllInstructors(false);
    setDialogForm((prev) => ({
      instructorId: filters.instructorId || prev.instructorId || "",
      startDate: "",
      endDate: "",
      blockEntireDay: false,
      timeslotIds: [],
      status: "OTHER",
      note: "",
    }));
    setDialogOpen(true);
  };

  const handleSyncHoliday = async () => {
    setSyncLoading(true);
    try {
      if (syncTarget === "selected" && appliedFilters.instructorId) {
        // Đồng bộ cho giảng viên đã chọn
        const result = await classService.syncHolidayForInstructor(
          appliedFilters.instructorId
        );
        alert(
          `Đã đồng bộ ${
            result.data?.added || result.added || 0
          } ngày nghỉ cho giảng viên này`
        );
      } else if (syncTarget === "all") {
        // Đồng bộ cho tất cả giảng viên
        const instructorsList = await instructorService.getAllInstructors();
        let totalAdded = 0;
        for (const instructor of instructorsList) {
          try {
            const result = await classService.syncHolidayForInstructor(
              instructor.InstructorID
            );
            totalAdded += result.data?.added || result.added || 0;
          } catch (error) {
            console.error(
              `Error syncing for instructor ${instructor.InstructorID}:`,
              error
            );
          }
        }
        alert(`Đã đồng bộ ${totalAdded} ngày nghỉ cho tất cả giảng viên`);
      }
      fetchLeaves(page);
    } catch (error) {
      console.error("Error syncing holiday:", error);
      alert(
        error?.response?.data?.message ||
          error?.message ||
          "Không thể đồng bộ lịch nghỉ"
      );
    } finally {
      setSyncLoading(false);
      setSyncDialogOpen(false);
    }
  };

  const handleDialogSubmit = async () => {
    if (applyToAllInstructors) {
      // Thêm cho tất cả giảng viên với Status = HOLIDAY
      if (!dialogForm.startDate) {
        alert("Vui lòng chọn ngày nghỉ bắt đầu");
        return;
      }
      if (!dialogForm.blockEntireDay && dialogForm.timeslotIds.length === 0) {
        alert("Vui lòng chọn ít nhất 1 ca học");
        return;
      }

      try {
        setDialogLoading(true);
        const startDate = dayjs(dialogForm.startDate);
        const endDate = dialogForm.endDate
          ? dayjs(dialogForm.endDate)
          : startDate;

        if (endDate.isBefore(startDate)) {
          alert("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
          setDialogLoading(false);
          return;
        }

        const daysDiff = endDate.diff(startDate, "day") + 1;
        let successCount = 0;
        let errorCount = 0;

        for (let i = 0; i < daysDiff; i++) {
          const currentDate = startDate.add(i, "day").format("YYYY-MM-DD");
          try {
            await classService.addHolidayForAllInstructors({
              Date: currentDate,
              Status: "HOLIDAY",
              Note: dialogForm.note,
              blockEntireDay: dialogForm.blockEntireDay,
              TimeslotID: dialogForm.blockEntireDay
                ? null
                : dialogForm.timeslotIds.length > 0
                ? parseInt(dialogForm.timeslotIds[0], 10)
                : null,
              TimeslotIDs: dialogForm.blockEntireDay
                ? null
                : dialogForm.timeslotIds.map((id) => parseInt(id, 10)),
            });
            successCount++;
          } catch (error) {
            errorCount++;
            console.error(
              `Error adding holiday for all instructors on ${currentDate}:`,
              error
            );
          }
        }

        if (errorCount > 0) {
          alert(
            `Đã thêm ${successCount} ngày nghỉ. Có ${errorCount} ngày lỗi.`
          );
        } else {
          alert(
            `Đã thêm ${successCount} ngày nghỉ cho tất cả giảng viên thành công`
          );
        }

        setDialogOpen(false);
        fetchLeaves(page);
      } catch (error) {
        console.error("Add holiday for all instructors failed", error);
        alert(
          error?.message || "Không thể thêm lịch nghỉ cho tất cả giảng viên"
        );
      } finally {
        setDialogLoading(false);
      }
      return;
    }

    // Logic cũ: thêm cho một giảng viên
    if (!dialogForm.instructorId) {
      alert("Vui lòng chọn giảng viên");
      return;
    }
    if (!dialogForm.startDate) {
      alert("Vui lòng chọn ngày nghỉ bắt đầu");
      return;
    }
    if (!dialogForm.blockEntireDay && dialogForm.timeslotIds.length === 0) {
      alert("Vui lòng chọn ít nhất 1 ca học");
      return;
    }

    try {
      setDialogLoading(true);

      // Xác định date range
      const startDate = dayjs(dialogForm.startDate);
      const endDate = dialogForm.endDate
        ? dayjs(dialogForm.endDate)
        : startDate; // Nếu không có endDate, chỉ thêm 1 ngày

      if (endDate.isBefore(startDate)) {
        alert("Ngày kết thúc phải sau hoặc bằng ngày bắt đầu");
        setDialogLoading(false);
        return;
      }

      // Tính số ngày cần thêm
      const daysDiff = endDate.diff(startDate, "day") + 1;

      // Gọi API cho từng ngày trong range
      let successCount = 0;
      let errorCount = 0;
      const errors = [];

      for (let i = 0; i < daysDiff; i++) {
        const currentDate = startDate.add(i, "day").format("YYYY-MM-DD");
        if (dialogForm.blockEntireDay) {
          try {
            await classService.addBulkInstructorLeave({
              InstructorID: dialogForm.instructorId,
              Date: currentDate,
              Status: dialogForm.status,
              Note: dialogForm.note,
              blockEntireDay: true,
              TimeslotID: null,
            });
            successCount++;
          } catch (error) {
            errorCount++;
            errors.push(
              `${currentDate}: ${error?.message || "Lỗi không xác định"}`
            );
          }
        } else {
          for (const timeslotId of dialogForm.timeslotIds) {
            try {
              await classService.addBulkInstructorLeave({
                InstructorID: dialogForm.instructorId,
                Date: currentDate,
                Status: dialogForm.status,
                Note: dialogForm.note,
                blockEntireDay: false,
                TimeslotID: parseInt(timeslotId, 10),
              });
              successCount++;
            } catch (error) {
              errorCount++;
              errors.push(
                `${currentDate} - Ca ${timeslotId}: ${
                  error?.message || "Lỗi không xác định"
                }`
              );
            }
          }
        }
      }

      if (errorCount > 0) {
        alert(
          `Đã thêm ${successCount} ngày nghỉ. Có ${errorCount} ngày lỗi:\n${errors.join(
            "\n"
          )}`
        );
      } else {
        alert(`Đã thêm ${successCount} ngày nghỉ thành công`);
      }

      setDialogOpen(false);
      fetchLeaves(page);
    } catch (error) {
      console.error("Add leave failed", error);
      alert(error?.message || "Không thể thêm lịch nghỉ");
    } finally {
      setDialogLoading(false);
    }
  };

  const renderStatusChip = (status) => {
    const statusMap = {
      OTHER: "Đã lên lịch",
      HOLIDAY: "Nghỉ lễ",
      AVAILABLE: "Lịch cá nhân",
    };
    const colorMap = {
      OTHER: "default",
      HOLIDAY: "success",
      AVAILABLE: "info",
    };
    return (
      <Chip
        label={statusMap[status] || status || "Đã lên lịch"}
        color={colorMap[status] || "default"}
        size="small"
      />
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            Quản lý lịch nghỉ và lịch tự chọn của giảng viên
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Theo dõi và quản lý các ngày nghỉ, ngày dạy tự chọn của giảng viên,
            đảm bảo lịch học không bị gián đoạn.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<Sync />}
            onClick={() => setSyncDialogOpen(true)}
          >
            Cập nhật lịch nghỉ
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={handleDialogOpen}
          >
            Thêm lịch nghỉ
          </Button>
        </Box>
      </Stack>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "center" }}
        >
          <Autocomplete
            options={instructors}
            getOptionLabel={(option) =>
              `${option.FullName || option.fullName || ""} - ${
                option.Major || option.major || ""
              }`
            }
            value={selectedFilterInstructor}
            onChange={(event, newValue) => {
              setSelectedFilterInstructor(newValue);
              handleFilterChange(
                "instructorId",
                newValue ? newValue.InstructorID : ""
              );
            }}
            size="small"
            sx={{ minWidth: 250 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Giảng viên"
                placeholder="Tìm và chọn giảng viên..."
              />
            )}
            isOptionEqualToValue={(option, value) =>
              option.InstructorID === value?.InstructorID
            }
          />

          <TextField
            select
            label="Trạng thái"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            size="small"
            sx={{ minWidth: 160 }}
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {STATUS_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Từ ngày"
            type="date"
            size="small"
            value={filters.startDate}
            onChange={(e) => handleFilterChange("startDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Đến ngày"
            type="date"
            size="small"
            value={filters.endDate}
            onChange={(e) => handleFilterChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
          <Button
            variant="outlined"
            onClick={handleApplyFilters}
            disabled={loading}
          >
            Áp dụng
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFilters}
            disabled={loading}
          >
            Xóa lọc
          </Button>
        </Stack>
      </Paper>

      <Paper>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              py: 6,
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#f8fafc" }}>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Thứ</TableCell>
                    <TableCell>Ca học</TableCell>
                    <TableCell>Giảng viên</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Ghi chú</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {leaves.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                        <Typography color="text.secondary">
                          Chưa có lịch nghỉ nào
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    leaves.map((leave) => (
                      <TableRow key={leave.InstructortimeslotID}>
                        <TableCell>
                          {dayjs(leave.Date).format("DD/MM/YYYY")}
                        </TableCell>
                        <TableCell>
                          {leave.Day || getDayFromDate(leave.Date)}
                        </TableCell>
                        <TableCell>
                          {leave.StartTime && leave.EndTime
                            ? `${leave.StartTime} - ${leave.EndTime}`
                            : "Toàn ngày"}
                        </TableCell>
                        <TableCell>
                          {
                            instructors.find(
                              (ins) => ins.InstructorID === leave.InstructorID
                            )?.FullName
                          }
                        </TableCell>
                        <TableCell>{renderStatusChip(leave.Status)}</TableCell>
                        <TableCell>
                          {leave.Note || (
                            <Typography color="text.secondary">
                              Không có
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="Xóa">
                            <IconButton
                              color="error"
                              onClick={() =>
                                handleDelete(leave.InstructortimeslotID)
                              }
                            >
                              <Delete fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
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
                Tổng: {pagination.total || 0} lịch
              </Typography>
              <Pagination
                shape="rounded"
                color="primary"
                page={pagination.page || 1}
                count={pagination.totalPages || 0}
                onChange={(_, value) => {
                  setPage(value);
                  fetchLeaves(value);
                }}
              />
            </Box>
          </>
        )}
      </Paper>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle fontWeight={700}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <EventBusy />
            <span>Thêm lịch nghỉ</span>
          </Stack>
        </DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2}>
            {!applyToAllInstructors && (
              <Autocomplete
                options={instructors}
                getOptionLabel={(option) =>
                  `${option.FullName || option.fullName || ""} - ${
                    option.Major || option.major || ""
                  }`
                }
                value={selectedDialogInstructor}
                onChange={(event, newValue) => {
                  setSelectedDialogInstructor(newValue);
                  setDialogForm((prev) => ({
                    ...prev,
                    instructorId: newValue ? newValue.InstructorID : "",
                  }));
                }}
                fullWidth
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Giảng viên"
                    placeholder="Tìm và chọn giảng viên..."
                  />
                )}
                isOptionEqualToValue={(option, value) =>
                  option.InstructorID === value?.InstructorID
                }
              />
            )}
            {applyToAllInstructors && (
              <TextField
                label="Giảng viên"
                value="Tất cả giảng viên"
                disabled
                fullWidth
                helperText="Lịch nghỉ sẽ được thêm cho tất cả giảng viên với Status: HOLIDAY"
              />
            )}
            <TextField
              label="Từ ngày"
              type="date"
              value={dialogForm.startDate}
              onChange={(e) =>
                setDialogForm((prev) => ({
                  ...prev,
                  startDate: e.target.value,
                  endDate:
                    prev.endDate && prev.endDate < e.target.value
                      ? ""
                      : prev.endDate,
                  timeslotIds: [],
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Đến ngày (tùy chọn)"
              type="date"
              value={dialogForm.endDate}
              disabled={!dialogForm.startDate}
              onChange={(e) =>
                setDialogForm((prev) => ({
                  ...prev,
                  endDate: e.target.value,
                }))
              }
              InputLabelProps={{ shrink: true }}
              fullWidth
              inputProps={{
                min: dialogForm.startDate || undefined,
              }}
              helperText="Để trống nếu chỉ thêm 1 ngày"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={dialogForm.blockEntireDay}
                  onChange={(e) =>
                    setDialogForm((prev) => ({
                      ...prev,
                      blockEntireDay: e.target.checked,
                      timeslotIds: [],
                    }))
                  }
                />
              }
              label="Chặn toàn bộ ngày"
            />
            {!dialogForm.blockEntireDay && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1.5, fontWeight: 600 }}
                >
                  Chọn ca học cần chặn
                  {dialogForm.endDate && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      (Áp dụng cho tất cả các ngày trong khoảng)
                    </Typography>
                  )}
                </Typography>
                {!dialogForm.startDate ? (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      bgcolor: "grey.50",
                      border: "1px dashed",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Vui lòng chọn "Từ ngày" trước
                    </Typography>
                  </Paper>
                ) : allAvailableTimeslots.length === 0 ? (
                  <Paper
                    sx={{
                      p: 3,
                      textAlign: "center",
                      bgcolor: "grey.50",
                      border: "1px dashed",
                      borderColor: "grey.300",
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Không có ca học phù hợp cho khoảng thời gian đã chọn
                    </Typography>
                  </Paper>
                ) : (
                  <Box>
                    {Object.keys(timeslotsByDay).length > 1 ? (
                      // Hiển thị theo nhóm thứ nếu có nhiều thứ
                      <Stack spacing={2}>
                        {Object.entries(timeslotsByDay).map(([day, slots]) => (
                          <Box key={day}>
                            <Typography
                              variant="caption"
                              sx={{
                                fontWeight: 600,
                                color: "primary.main",
                                mb: 1,
                                display: "block",
                              }}
                            >
                              {day}
                            </Typography>
                            <Grid container spacing={1}>
                              {slots.map((ts) => {
                                const isSelected =
                                  dialogForm.timeslotIds.indexOf(
                                    `${ts.TimeslotID}`
                                  ) > -1;
                                return (
                                  <Grid
                                    item
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    key={ts.TimeslotID}
                                  >
                                    <Card
                                      sx={{
                                        cursor: "pointer",
                                        border: isSelected
                                          ? "2px solid"
                                          : "1px solid",
                                        borderColor: isSelected
                                          ? "primary.main"
                                          : "grey.300",
                                        bgcolor: isSelected
                                          ? "primary.50"
                                          : "white",
                                        "&:hover": {
                                          borderColor: "primary.main",
                                          bgcolor: isSelected
                                            ? "primary.50"
                                            : "grey.50",
                                        },
                                        transition: "all 0.2s",
                                      }}
                                      onClick={() => {
                                        const currentIds = [
                                          ...dialogForm.timeslotIds,
                                        ];
                                        const idStr = `${ts.TimeslotID}`;
                                        const index = currentIds.indexOf(idStr);
                                        if (index > -1) {
                                          currentIds.splice(index, 1);
                                        } else {
                                          currentIds.push(idStr);
                                        }
                                        setDialogForm((prev) => ({
                                          ...prev,
                                          timeslotIds: currentIds,
                                        }));
                                      }}
                                    >
                                      <CardContent
                                        sx={{
                                          p: 1.5,
                                          "&:last-child": { pb: 1.5 },
                                        }}
                                      >
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                        >
                                          <Checkbox
                                            checked={isSelected}
                                            size="small"
                                            sx={{ p: 0 }}
                                          />
                                          <Box>
                                            <Typography
                                              variant="body2"
                                              fontWeight={500}
                                            >
                                              {ts.StartTime} - {ts.EndTime}
                                            </Typography>
                                          </Box>
                                        </Stack>
                                      </CardContent>
                                    </Card>
                                  </Grid>
                                );
                              })}
                            </Grid>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      // Hiển thị dạng grid đơn giản nếu chỉ có 1 thứ
                      <Grid container spacing={1}>
                        {allAvailableTimeslots.map((ts) => {
                          const isSelected =
                            dialogForm.timeslotIds.indexOf(`${ts.TimeslotID}`) >
                            -1;
                          return (
                            <Grid item xs={6} sm={4} md={3} key={ts.TimeslotID}>
                              <Card
                                sx={{
                                  cursor: "pointer",
                                  border: isSelected
                                    ? "2px solid"
                                    : "1px solid",
                                  borderColor: isSelected
                                    ? "primary.main"
                                    : "grey.300",
                                  bgcolor: isSelected ? "primary.50" : "white",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    bgcolor: isSelected
                                      ? "primary.50"
                                      : "grey.50",
                                  },
                                  transition: "all 0.2s",
                                }}
                                onClick={() => {
                                  const currentIds = [
                                    ...dialogForm.timeslotIds,
                                  ];
                                  const idStr = `${ts.TimeslotID}`;
                                  const index = currentIds.indexOf(idStr);
                                  if (index > -1) {
                                    currentIds.splice(index, 1);
                                  } else {
                                    currentIds.push(idStr);
                                  }
                                  setDialogForm((prev) => ({
                                    ...prev,
                                    timeslotIds: currentIds,
                                  }));
                                }}
                              >
                                <CardContent
                                  sx={{
                                    p: 1.5,
                                    "&:last-child": { pb: 1.5 },
                                  }}
                                >
                                  <Stack
                                    direction="row"
                                    alignItems="center"
                                    spacing={1}
                                  >
                                    <Checkbox
                                      checked={isSelected}
                                      size="small"
                                      sx={{ p: 0 }}
                                    />
                                    <Box>
                                      <Typography
                                        variant="body2"
                                        fontWeight={500}
                                      >
                                        {ts.StartTime} - {ts.EndTime}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                </CardContent>
                              </Card>
                            </Grid>
                          );
                        })}
                      </Grid>
                    )}
                    {dialogForm.timeslotIds.length > 0 && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ mt: 1, display: "block" }}
                      >
                        Đã chọn {dialogForm.timeslotIds.length} ca học
                      </Typography>
                    )}
                  </Box>
                )}
              </Box>
            )}
            <FormControlLabel
              control={
                <Switch
                  checked={applyToAllInstructors}
                  onChange={(e) => {
                    setApplyToAllInstructors(e.target.checked);
                    if (e.target.checked) {
                      setDialogForm((prev) => ({
                        ...prev,
                        status: "HOLIDAY",
                        instructorId: "",
                      }));
                      setSelectedDialogInstructor(null);
                    }
                  }}
                />
              }
              label="Áp dụng cho tất cả giảng viên (Status: HOLIDAY)"
            />
            <TextField
              select
              label="Trạng thái"
              value={dialogForm.status}
              disabled={applyToAllInstructors}
              onChange={(e) =>
                setDialogForm((prev) => ({
                  ...prev,
                  status: e.target.value,
                }))
              }
            >
              {STATUS_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Ghi chú"
              multiline
              minRows={2}
              value={dialogForm.note}
              onChange={(e) =>
                setDialogForm((prev) => ({
                  ...prev,
                  note: e.target.value,
                }))
              }
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleDialogSubmit}
            disabled={dialogLoading}
          >
            {dialogLoading ? "Đang lưu..." : "Lưu"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog đồng bộ lịch nghỉ HOLIDAY */}
      <Dialog
        open={syncDialogOpen}
        onClose={() => setSyncDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Cập nhật lịch nghỉ HOLIDAY</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <FormControl component="fieldset" fullWidth>
            <RadioGroup
              value={syncTarget}
              onChange={(e) => setSyncTarget(e.target.value)}
            >
              <FormControlLabel
                value="all"
                control={<Radio />}
                label="Đồng bộ cho tất cả giảng viên"
              />
            </RadioGroup>
          </FormControl>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Hệ thống sẽ lấy tất cả các ngày nghỉ HOLIDAY hiện có và thêm vào cho
            giảng viên (chỉ thêm những ngày chưa có).
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSyncDialogOpen(false)}>Hủy</Button>
          <Button
            variant="contained"
            onClick={handleSyncHoliday}
            disabled={
              syncLoading ||
              (syncTarget === "selected" && !appliedFilters.instructorId)
            }
          >
            {syncLoading ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default InstructorLeavePage;
