import createUserManagementPage from "./createUserManagementPage";
import staffService from "../../../apiServices/staffService";

const StaffPage = createUserManagementPage({
  entityLabel: "Nhân viên",
  entityLabelPlural: "Nhân viên",
  api: {
    fetchAll: () => staffService.getAllStaff(),
    create: (payload) => staffService.createStaff(payload),
    update: (id, payload) => staffService.updateStaff(id, payload),
  },
});

export default StaffPage;

