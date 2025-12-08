import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarAdmin } from "../pages/admin/common/SidebarAdmin";
import { HeaderAdmin } from "../pages/admin/common/HeaderAdmin";
import "../pages/admin/pages/style.css";

const AdminLayout = () => {
  return (
    <div className="admin-page">
      <SidebarAdmin />
      <main style={{ marginLeft: "250px", paddingTop: "80px", minHeight: "100vh" }}>
        <HeaderAdmin />
        <div style={{ padding: "24px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
