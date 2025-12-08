import createUserManagementPage from "./createUserManagementPage";
import adminService from "../../../apiServices/adminService";

const AdminsPage = createUserManagementPage({
  entityLabel: "Admin",
  entityLabelPlural: "Admin",
  api: {
    fetchAll: () => adminService.getAllAdmins(),
    create: (payload) => adminService.createAdmin(payload),
    update: (id, payload) => adminService.updateAdmin(id, payload),
  },
});

export default AdminsPage;

