import React from "react"
import { Outlet } from "react-router-dom"
import { InstructorSidebar } from "../pages/instructor/common/SidebarInstructor"
import { HeaderInstructor } from "../pages/instructor/common/HeaderInstructor"
import "../pages/instructor/pages/style.css"

export default function InstructorLayout() {
  return (
    <div className="instructor-page">
      <InstructorSidebar />
      <main style={{ marginLeft: "250px", paddingTop: "80px", minHeight: "100vh" }}>
        <HeaderInstructor />
        <div style={{ padding: "24px" }}>
          <Outlet />
        </div>
      </main>
    </div>
  )
}
