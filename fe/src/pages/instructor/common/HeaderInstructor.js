import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
  AppBar, Toolbar, Typography, IconButton, Avatar,
  Menu, MenuItem, Badge, Divider, InputBase, Box
} from "@mui/material"
import NotificationsIcon from "@mui/icons-material/Notifications"
import SearchIcon from "@mui/icons-material/Search"
import EditIcon from "@mui/icons-material/Edit"
import { useAuth } from "../../../contexts/AuthContext" 

export function HeaderInstructor() {
  const [anchorEl, setAnchorEl] = useState(null)
  const navigate = useNavigate()
  const handleMenuClose = () => setAnchorEl(null)
  const { logout } = useAuth()
  const handleLogout = () => {
    logout() 
    navigate("/")
  }

  return (
    <AppBar position="fixed"
      sx={{
        backgroundColor: "white", color: "#1e293b",
        boxShadow: "0 1px 3px rgba(0,0,0,.08)", borderBottom: "1px solid #e2e8f0",
        ml: "250px", width: "calc(100% - 250px)", zIndex: 999
      }}
    >
      <Toolbar sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b", fontSize: "18px" }}>
            Hello Alysia 👋
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", fontSize: "13px" }}>
            Let's learn something new today!
          </Typography>
        </Box>

        {/* Search */}
        <Box sx={{
          display: "flex", alignItems: "center", backgroundColor: "#f1f5f9",
          borderRadius: "8px", px: 2, py: 1, width: "300px", gap: 1
        }}>
          <SearchIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
          <InputBase placeholder="Search..."
            sx={{ flex: 1, fontSize: "14px", color: "#1e293b",
              "& input::placeholder": { color: "#94a3b8", opacity: 1 } }}
          />
        </Box>

        {/* Right side */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <IconButton color="inherit" sx={{ mr: 1 }}>
            <Badge badgeContent={4} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>

          {/* Avatar menu */}
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width: 36, height: 36, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}>
              AI
            </Avatar>
          </IconButton>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleMenuClose}>
            <MenuItem onClick={() => { handleMenuClose(); navigate("/profile"); }}>
              Profile
            </MenuItem>
            <MenuItem onClick={() => { handleMenuClose(); navigate("/instructor/settings"); }}>
              Settings
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => { handleMenuClose(); handleLogout(); }}
              sx={{ color: "error.main", fontWeight: 600 }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  )
}