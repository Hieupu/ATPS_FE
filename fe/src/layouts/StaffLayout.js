import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarStaff } from "../pages/staff/common/SidebarStaff";
import { HeaderStaff } from "../pages/staff/common/HeaderStaff";
import "../pages/admin/pages/style.css";

// StaffLayout sử dụng SidebarStaff và HeaderStaff riêng
function StaffLayout() {
  return (
    <div className="admin-page">
      <SidebarStaff />
      <main
        style={{ marginLeft: "250px", paddingTop: "80px", minHeight: "100vh" }}
      >
        <HeaderStaff />
        <div style={{ padding: "24px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default StaffLayout;
