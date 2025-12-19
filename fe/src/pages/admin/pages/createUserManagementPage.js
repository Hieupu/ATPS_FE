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
  Stack,
  MenuItem,
  Pagination,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Search as SearchIcon,
  Edit as EditIcon,
  Lock,
  LockOpen,
} from "@mui/icons-material";
import uploadService from "../../../apiServices/uploadService";
import accountService from "../../../apiServices/accountService";
import { useAuth } from "../../../contexts/AuthContext";
import { toast } from "react-toastify";
import {
  validateEmail,
  validatePassword,
  validatePhone,
  validateFullName,
  validateConfirmPassword,
} from "../../../utils/validate";
import {
  handleStatusToggle,
  getStatusButtonLabel,
  getStatusLabel,
} from "../../../utils/statusToggle";
import UserFormModal from "../components/UserFormModal";

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
    const [newErrors, setNewErrors] = useState({});

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

    // Helper function để check xem có phải đang edit chính mình không
    const checkIsEditingSelf = (item) => {
      if (!item || !user) return false;
      const currentUserAccID = user.AccID || user.accID || user.id;
      const itemAccID = item.AccID || item.accID;
      return (
        currentUserAccID &&
        itemAccID &&
        currentUserAccID === itemAccID
      );
    };

    // Kiểm tra xem đang edit chính account của mình không (cho modal)
    const isEditingSelf = useMemo(() => {
      return checkIsEditingSelf(selectedItem);
    }, [selectedItem, user]);

    const loadItems = async () => {
      try {
        setLoading(true);
        const data = await api.fetchAll();
        setItems(data || []);
      } catch (error) {
        console.error(`Fetch ${entityLabelPlural} failed:`, error);
        showToast(
          "error",
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
        Address: item?.Address || "",
        DateOfBirth: item?.DateOfBirth ? item.DateOfBirth.split("T")[0] : "",
        ProfilePicture: item?.ProfilePicture || "",
        Gender: item?.Gender || "other",
        ConfirmPassword: "",
      });
      setNewErrors({});
      setModalOpen(true);
    };

    const closeModal = () => {
      setModalOpen(false);
      setSelectedItem(null);
      setFormData({ ...defaultForm });
      setNewErrors({});
    };

    const handleSubmit = async () => {
      // Clear previous errors
      const errors = {};

      // Validate FullName using utils
      const fullNameError = validateFullName(formData.FullName);
      if (fullNameError) {
        errors.FullName = fullNameError;
      }

      // Validate Email
      const emailError = validateEmail(formData.Email);
      if (emailError) {
        errors.Email = emailError;
      }

      // Validate Password (required when creating)
      if (!selectedItem) {
        const passwordError = validatePassword(formData.Password, true);
        if (passwordError) {
          errors.Password = passwordError;
        }
        // Validate confirm password when creating
        const confirmPasswordError = validateConfirmPassword(
          formData.Password,
          formData.ConfirmPassword,
          true
        );
        if (confirmPasswordError) {
          errors.ConfirmPassword = confirmPasswordError;
        }
      } else if (formData.Password) {
        // Validate password when updating (if provided)
        const passwordError = validatePassword(formData.Password, false);
        if (passwordError) {
          errors.Password = passwordError;
        }
        // Validate confirm password when updating (if password is provided)
        const confirmPasswordError = validateConfirmPassword(
          formData.Password,
          formData.ConfirmPassword,
          false
        );
        if (confirmPasswordError) {
          errors.ConfirmPassword = confirmPasswordError;
        }
      }

      // Validate Phone (if provided)
      if (formData.Phone) {
        const phoneError = validatePhone(formData.Phone);
        if (phoneError) {
          errors.Phone = phoneError;
        }
      }

      // If there are errors, set them and return
      if (Object.keys(errors).length > 0) {
        setNewErrors(errors);
        return;
      }

      // Clear errors if validation passes
      setNewErrors({});

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
              accountPayload.Email = formData.Email.trim().toLowerCase();
            }
            if (
              formData.Phone !== undefined &&
              formData.Phone !== selectedItem.Phone
            ) {
              accountPayload.Phone = formData.Phone.trim();
            }
            if (formData.Password) {
              accountPayload.Password = formData.Password;
            }
            // Update Gender if changed
            if (
              formData.Gender &&
              formData.Gender !== (selectedItem.Gender || "other")
            ) {
              accountPayload.Gender = formData.Gender;
            }

            if (Object.keys(accountPayload).length > 0) {
              await accountService.updateAccount(
                selectedItem.AccID,
                accountPayload
              );
            }
          }

          showToast("success", `Đã cập nhật ${entityLabel.toLowerCase()}!`);
        } else {
          const createPayload = {
            ...payload,
            Email: formData.Email.trim().toLowerCase(),
            Phone: formData.Phone?.trim() || "",
            Password: formData.Password,
            Gender: formData.Gender || "other",
          };

          await api.create(createPayload);
          showToast("success", `Đã tạo ${entityLabel.toLowerCase()} mới!`);
        }

        closeModal();
        loadItems();
      } catch (error) {
        console.error("Save error:", error);
        showToast("error", error?.message || "Không thể lưu dữ liệu");
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
                <MenuItem value="active">Hoạt động</MenuItem>
                <MenuItem value="inactive">Không hoạt động</MenuItem>
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
                            label={getStatusLabel(
                              item.Status || item.AccountStatus || "active"
                            )}
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
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <IconButton
                              color="primary"
                              onClick={() => openModal(item)}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            {!checkIsEditingSelf(item) && (
                              <IconButton
                                color={
                                  (item.Status || item.AccountStatus || "active")
                                    .toLowerCase() === "active"
                                    ? "error"
                                    : "success"
                                }
                                onClick={() =>
                                  handleStatusToggle(
                                    item,
                                    accountService,
                                    loadItems,
                                    entityLabel.toLowerCase()
                                  )
                                }
                                title={getStatusButtonLabel(
                                  item.Status || item.AccountStatus || "active"
                                )}
                              >
                                {(item.Status || item.AccountStatus || "active")
                                  .toLowerCase() === "active" ? (
                                  <Lock fontSize="small" />
                                ) : (
                                  <LockOpen fontSize="small" />
                                )}
                              </IconButton>
                            )}
                          </Stack>
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

        <UserFormModal
          open={modalOpen}
          onClose={closeModal}
          onSubmit={handleSubmit}
          title={
            selectedItem
              ? `Cập nhật ${entityLabel.toLowerCase()}`
              : `Thêm ${entityLabel.toLowerCase()} mới`
          }
          formData={formData}
          setFormData={setFormData}
          errors={newErrors}
          setErrors={setNewErrors}
          saving={saving}
          isEditing={!!selectedItem}
          showInstructorFields={false}
        />
      </Box>
    );
  };

  return PageComponent;
};

export default createUserManagementPage;
