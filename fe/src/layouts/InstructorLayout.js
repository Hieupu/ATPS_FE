import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { InstructorSidebar } from "../pages/instructor/common/SidebarInstructor";
import { HeaderInstructor } from "../pages/instructor/common/HeaderInstructor";

export default function InstructorLayout() {
  const [activeNav, setActiveNav] = useState("dashboard");

  return (
    <div style={{ display: "flex" }}>
      <InstructorSidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div style={{ marginLeft: "250px", width: "100%" }}>
        <HeaderInstructor />
        <div style={{ padding: "80px 0" }}>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
