import React, { useState } from "react"
import { Outlet } from "react-router-dom"
import { InstructorSidebar } from  "../pages/instructor/SidebarInstructor"
import { HeaderInstructor } from "../pages/instructor/HeaderInstructor"

export default function InstructorLayout() {
  const [activeNav, setActiveNav] = useState("dashboard")

  return (
    <div style={{ display: "flex" }}>
      <InstructorSidebar activeNav={activeNav} onNavChange={setActiveNav} />
      <div style={{ marginLeft: "250px", width: "100%" }}>
        <HeaderInstructor />
        <div style={{ padding: "80px 20px" }}>
          <Outlet />
        </div>
      </div>
    </div>
  )
}
