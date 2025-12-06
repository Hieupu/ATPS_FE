import React, { useEffect, useMemo, useState } from "react";
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stack,
  MenuItem,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
} from "@mui/icons-material";
import uploadService from "../../../apiServices/uploadService";
import accountService from "../../../apiServices/accountService";
import { useAuth } from "../../../contexts/AuthContext";

const statusOptions = [
  { value: "active", label: "Hoạt động" },
  { value: "inactive", label: "Không hoạt động" },
];

const genderOptions = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

const defaultForm = {
  FullName: "",
  Email: "",
  Phone: "",
  Password: "",
  Status: "active",
  Address: "",
  DateOfBirth: "",
  ProfilePicture: "",
  Gender: "other",
};

const createUserManagementPage = ({ entityLabel, entityLabelPlural, api }) => {
  const PageComponent = () => {
    const { user } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [searchInput, setSearchInput] = useState("");
    const [statusInput, setStatusInput] = useState("all");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formData, setFormData] = useState({ ...defaultForm });
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);

    // Kiểm tra xem đang edit chính account của mình không
    const isEditingSelf = useMemo(() => {
      if (!selectedItem || !user) return false;
      const currentUserAccID = user.AccID || user.accID || user.id;
      const selectedItemAccID = selectedItem.AccID || selectedItem.accID;
      return (
        currentUserAccID &&
        selectedItemAccID &&
        currentUserAccID === selectedItemAccID
      );
    }, [selectedItem, user]);

    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await api.fetchAll();
        setItems(data || []);
      } catch (error) {
        console.error(`Fetch ${entityLabelPlural} failed:`, error);
        alert(
          error?.message ||
            `Không thể tải danh sách ${entityLabelPlural.toLowerCase()}`
        );
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      loadItems();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const stats = useMemo(() => {
      const total = items.length;
      const active = items.filter((item) => {
        const statusValue = (
          item.Status ||
          item.AccountStatus ||
          "active"
        ).toLowerCase();
        return statusValue === "active";
      }).length;
      const inactive = items.filter((item) => {
        const statusValue = (
          item.Status ||
          item.AccountStatus ||
          "active"
        ).toLowerCase();
        return statusValue === "inactive";
      }).length;
      return { total, active, inactive };
    }, [items]);

    const filteredItems = useMemo(() => {
      const search = searchTerm.trim().toLowerCase();
      return items.filter((item) => {
        const matchesSearch =
          !search ||
          item.FullName?.toLowerCase().includes(search) ||
          item.Email?.toLowerCase().includes(search) ||
          item.Phone?.toLowerCase().includes(search);

        const normalizedStatus = item.Status || item.AccountStatus || "active";

        const matchesStatus =
          statusFilter === "all" ||
          normalizedStatus?.toLowerCase() === statusFilter;

        return matchesSearch && matchesStatus;
      });
    }, [items, searchTerm, statusFilter]);

    // Phân trang
    const paginatedItems = useMemo(() => {
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      return filteredItems.slice(startIndex, endIndex);
    }, [filteredItems, page, pageSize]);

    const totalPages = Math.ceil(filteredItems.length / pageSize) || 1;

    // Reset về trang 1 khi filter thay đổi
    useEffect(() => {
      setPage(1);
    }, [searchTerm, statusFilter]);

    const openModal = (item = null) => {
      setSelectedItem(item);
      setFormData({
        ...defaultForm,
        FullName: item?.FullName || "",
        Email: item?.Email || "",
        Phone: item?.Phone || "",
        Status:
          (item?.Status || item?.AccountStatus || "active").toLowerCase() ===
          "inactive"
            ? "inactive"
            : "active",
        Address: item?.Address || "",
        DateOfBirth: item?.DateOfBirth ? item.DateOfBirth.split("T")[0] : "",
        ProfilePicture: item?.ProfilePicture || "",
        Gender: item?.Gender || "other",
      });
      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
      setSelectedItem(null);
      setFormData({ ...defaultForm });
    };

    const handleAvatarUpload = async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const loadingMsg = document.createElement("div");
      loadingMsg.textContent = "Đang tải ảnh lên...";
      loadingMsg.style.cssText =
        "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 20px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 9999;";
      document.body.appendChild(loadingMsg);

      try {
        const result = await uploadService.uploadAvatar(file);
        setFormData((prev) => ({
          ...prev,
          ProfilePicture: result.url || result.data?.url,
        }));
      } catch (error) {
        alert(error?.message || "Không thể tải ảnh");
      } finally {
        if (document.body.contains(loadingMsg)) {
          document.body.removeChild(loadingMsg);
        }
      }
    };

    const handleSubmit = async () => {
      if (!formData.FullName?.trim()) {
        alert("Vui lòng nhập họ tên");
        return;
      }
      if (!formData.Email?.trim()) {
        alert("Vui lòng nhập email");
        return;
      }

      try {
        setSaving(true);
        const payload = {
          FullName: formData.FullName.trim(),
          DateOfBirth: formData.DateOfBirth || null,
          ProfilePicture: formData.ProfilePicture || null,
          Address: formData.Address || null,
        };

        if (selectedItem) {
          const entityId =
            selectedItem.StaffID || selectedItem.AdminID || selectedItem.id;
          await api.update(entityId, payload);

          // Update account info nếu có AccID
          if (selectedItem.AccID) {
            const accountPayload = {};
            if (formData.Email && formData.Email !== selectedItem.Email) {
              accountPayload.Email = formData.Email;
            }
            if (
              formData.Phone !== undefined &&
              formData.Phone !== selectedItem.Phone
            ) {
              accountPayload.Phone = formData.Phone;
            }
            const currentStatus = (
              selectedItem.Status ||
              selectedItem.AccountStatus ||
              ""
            ).toLowerCase();
            // Không cho phép sửa Status của chính mình
            if (
              formData.Status &&
              formData.Status !== currentStatus &&
              !isEditingSelf
            ) {
              accountPayload.Status = formData.Status;
            }
            if (formData.Password) {
              accountPayload.Password = formData.Password;
            }

            if (Object.keys(accountPayload).length > 0) {
              await accountService.updateAccount(
                selectedItem.AccID,
                accountPayload
              );
            }
          }

          alert(`Đã cập nhật ${entityLabel.toLowerCase()}!`);
        } else {
          const createPayload = {
            ...payload,
            Email: formData.Email.trim(),
            Phone: formData.Phone || "",
            Status: formData.Status || "active",
            Password: formData.Password,
            Gender: formData.Gender || "other",
          };

          await api.create(createPayload);
          alert(`Đã tạo ${entityLabel.toLowerCase()} mới!`);
        }

        closeModal();
        loadItems();
      } catch (error) {
        console.error("Save error:", error);
        alert(error?.message || "Không thể lưu dữ liệu");
      } finally {
        setSaving(false);
      }
    };

    return (
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Tổng {entityLabelPlural.toLowerCase()}
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Đang hoạt động
                </Typography>
                <Typography variant="h4" fontWeight={700} color="success.main">
                  {stats.active}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Không hoạt động
                </Typography>
                <Typography variant="h4" fontWeight={700} color="warning.main">
                  {stats.inactive}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "stretch", md: "center" }}
              justifyContent="space-between"
            >
              <TextField
                placeholder={`Tìm kiếm ${entityLabel.toLowerCase()}...`}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                size="small"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                sx={{ minWidth: 250 }}
              />
              <TextField
                select
                label="Trạng thái"
                value={statusInput}
                onChange={(e) => setStatusInput(e.target.value)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                <MenuItem value="all">Tất cả</MenuItem>
                {statusOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  size="small"
                  onClick={() => {
                    setSearchTerm(searchInput.trim());
                    setStatusFilter(statusInput);
                  }}
                >
                  Áp dụng
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => {
                    setSearchInput("");
                    setStatusInput("all");
                    setSearchTerm("");
                    setStatusFilter("all");
                  }}
                >
                  Xóa lọc
                </Button>
              </Stack>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => openModal(null)}
              >
                Thêm {entityLabel.toLowerCase()}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            {loading ? (
              <Typography align="center" sx={{ py: 4 }}>
                Đang tải...
              </Typography>
            ) : (
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Họ tên</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Điện thoại</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="right">Thao tác</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedItems.map((item, index) => (
                      <TableRow
                        key={`${entityLabel}-${
                          item.StaffID || item.AdminID || item.AccID || index
                        }`}
                      >
                        <TableCell>{item.FullName}</TableCell>
                        <TableCell>{item.Email || "—"}</TableCell>
                        <TableCell>{item.Phone || "—"}</TableCell>
                        <TableCell>
                          <Chip
                            label={(() => {
                              const statusValue = (
                                item.Status ||
                                item.AccountStatus ||
                                "active"
                              ).toLowerCase();
                              return (
                                statusOptions.find(
                                  (opt) => opt.value === statusValue
                                )?.label || "Không rõ"
                              );
                            })()}
                            color={
                              (
                                item.Status ||
                                item.AccountStatus ||
                                ""
                              ).toLowerCase() === "active"
                                ? "success"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <IconButton
                            color="primary"
                            onClick={() => openModal(item)}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
            {filteredItems.length > 0 && (
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
                    {Math.min(page * pageSize, filteredItems.length)} trong tổng
                    số {filteredItems.length} {entityLabelPlural.toLowerCase()}
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
          </CardContent>
        </Card>

        <Dialog open={modalOpen} onClose={closeModal} fullWidth maxWidth="sm">
          <DialogTitle sx={{ fontWeight: 600 }}>
            {selectedItem
              ? `Cập nhật ${entityLabel.toLowerCase()}`
              : `Thêm ${entityLabel.toLowerCase()} mới`}
          </DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2}>
              <TextField
                label="Họ tên"
                value={formData.FullName}
                onChange={(e) =>
                  setFormData({ ...formData, FullName: e.target.value })
                }
                fullWidth
                required
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="Email"
                  value={formData.Email}
                  onChange={(e) =>
                    setFormData({ ...formData, Email: e.target.value })
                  }
                  fullWidth
                  required
                />
                <TextField
                  label="Điện thoại"
                  value={formData.Phone}
                  onChange={(e) =>
                    setFormData({ ...formData, Phone: e.target.value })
                  }
                  fullWidth
                />
              </Stack>
              {!selectedItem && (
                <TextField
                  label="Mật khẩu"
                  type="password"
                  value={formData.Password}
                  onChange={(e) =>
                    setFormData({ ...formData, Password: e.target.value })
                  }
                  fullWidth
                  required
                />
              )}
              {selectedItem && (
                <TextField
                  label="Đặt lại mật khẩu (tùy chọn)"
                  type="password"
                  value={formData.Password}
                  onChange={(e) =>
                    setFormData({ ...formData, Password: e.target.value })
                  }
                  fullWidth
                />
              )}
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  select
                  label="Trạng thái"
                  value={formData.Status}
                  onChange={(e) =>
                    setFormData({ ...formData, Status: e.target.value })
                  }
                  fullWidth
                  disabled={isEditingSelf}
                  helperText={
                    isEditingSelf
                      ? "Bạn không thể thay đổi trạng thái của chính mình"
                      : ""
                  }
                >
                  {statusOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Giới tính"
                  value={formData.Gender}
                  onChange={(e) =>
                    setFormData({ ...formData, Gender: e.target.value })
                  }
                  fullWidth
                >
                  {genderOptions.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                label="Địa chỉ"
                value={formData.Address}
                onChange={(e) =>
                  setFormData({ ...formData, Address: e.target.value })
                }
                fullWidth
              />
              <TextField
                label="Ngày sinh"
                type="date"
                value={formData.DateOfBirth}
                onChange={(e) =>
                  setFormData({ ...formData, DateOfBirth: e.target.value })
                }
                InputLabelProps={{ shrink: true }}
                fullWidth
              />
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Ảnh đại diện
                </Typography>
                {formData.ProfilePicture && (
                  <Box sx={{ mb: 1 }}>
                    <img
                      src={formData.ProfilePicture}
                      alt="avatar preview"
                      style={{
                        width: 140,
                        height: 140,
                        borderRadius: 12,
                        objectFit: "cover",
                        border: "1px solid #ddd",
                      }}
                    />
                  </Box>
                )}
                <input
                  type="file"
                  id="user-avatar-input"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleAvatarUpload}
                />
                <Button
                  variant="outlined"
                  component="label"
                  htmlFor="user-avatar-input"
                  size="small"
                >
                  Chọn ảnh
                </Button>
              </Box>
            </Stack>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={closeModal} disabled={saving}>
              Hủy
            </Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={saving}
            >
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  };

  return PageComponent;
};

export default createUserManagementPage;
