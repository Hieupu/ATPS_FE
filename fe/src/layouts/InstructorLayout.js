import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { InstructorSidebar } from "../pages/instructor/common/SidebarInstructor";
import { HeaderInstructor } from "../pages/instructor/common/HeaderInstructor";

export default function InstructorLayout() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div className="instructor-page">
      <InstructorSidebar />
      <main style={{ marginLeft: "250px", paddingTop: "80px", minHeight: "100vh" }}>
        <HeaderInstructor />
        <div style={{ padding: "80px 0" }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
