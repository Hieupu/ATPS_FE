import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Box,
  Avatar,
  Menu,
  MenuItem,
  useMediaQuery,
  Divider,
} from "@mui/material";
import {
  School,
  Menu as MenuIcon,
  Person,
  ShoppingCart,
  Favorite,
  Logout,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AppHeader = () => {
  const navigate = useNavigate();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);

  const navItems = ["Home", "Courses", "About", "Contact"];
  const [mobileOpen, setMobileOpen] = useState(false);

  // ✅ Load thông tin đăng nhập (nếu có)
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (token && userData) setUser(JSON.parse(userData));
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/auth/login");
  };

  return (
    <>
      {/* Header chính */}
      <AppBar
        position="sticky"
        elevation={2}
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
        }}
      >
        <Toolbar sx={{ py: 1 }}>
          {/* Logo + tên */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              flexGrow: 1,
              cursor: "pointer",
              transition: "transform 0.3s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 45,
                height: 45,
                borderRadius: "12px",
                background: "rgba(255, 255, 255, 0.2)",
                backdropFilter: "blur(10px)",
                mr: 1.5,
              }}
            >
              <School sx={{ fontSize: 28, color: "white" }} />
            </Box>
            <Box>
              <Typography
                variant="h6"
                component="div"
                sx={{
                  fontWeight: 800,
                  color: "white",
                  letterSpacing: 1,
                  lineHeight: 1,
                }}
              >
                ATPS
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  color: "rgba(255, 255, 255, 0.8)",
                  fontSize: "0.7rem",
                  fontWeight: 500,
                  letterSpacing: 0.5,
                }}
              >
                Education
              </Typography>
            </Box>
          </Box>

          {/* Menu Desktop */}
          {!isMobile ? (
            <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
              {navItems.map((item) => (
                <Button
                  key={item}
                  sx={{
                    color: "white",
                    fontWeight: 600,
                    position: "relative",
                    fontSize: "0.95rem",
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -4,
                      left: 0,
                      width: 0,
                      height: 2,
                      background: "rgba(255, 255, 255, 0.8)",
                      transition: "width 0.3s ease",
                    },
                    "&:hover::after": {
                      width: "100%",
                    },
                  }}
                >
                  {item}
                </Button>
              ))}

              {/* ✅ Nếu chưa login */}
              {!user ? (
                <>
                  <Button
                    variant="outlined"
                    sx={{
                      color: "white",
                      borderColor: "rgba(255, 255, 255, 0.5)",
                      fontWeight: 600,
                      ml: 2,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "rgba(255, 255, 255, 0.1)",
                        borderColor: "white",
                      },
                    }}
                    onClick={() => navigate("/auth/login")}
                  >
                    Login
                  </Button>
                  <Button
                    variant="contained"
                    sx={{
                      background: "rgba(255, 255, 255, 0.2)",
                      color: "white",
                      fontWeight: 600,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        background: "white",
                        color: "#667eea",
                      },
                    }}
                    onClick={() => navigate("/auth/register")}
                  >
                    Register
                  </Button>
                </>
              ) : (
                <>
                  <Avatar
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                      cursor: "pointer",
                      background:
                        "linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)",
                      border: "2px solid #ffffff",
                      boxShadow: "0 4px 10px rgba(0, 0, 0, 0.2)",
                      fontWeight: 700,
                      fontSize: "1.2rem",
                      width: 48,
                      height: 48,
                      transition: "all 0.3s ease-in-out",
                      "&:hover": {
                        background:
                          "linear-gradient(45deg, #1976D2 30%, #42A5F5 90%)",
                        transform: "scale(1.05)",
                        boxShadow: "0 6px 15px rgba(0, 0, 0, 0.3)",
                      },
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={() => setAnchorEl(null)}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        minWidth: 200,
                        borderRadius: 2,
                        mt: 1.5,
                        background: "#ffffff",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem
                      onClick={() => navigate("/profile")}
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        color: "#374151",
                        "&:hover": {
                          background: "#f0f9ff",
                          color: "#1e40af",
                        },
                      }}
                    >
                      <Person sx={{ mr: 1, color: "#6b7280" }} />
                      Profile
                    </MenuItem>
                    <MenuItem
                      onClick={() => navigate("/mylearning")}
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        color: "#374151",
                        "&:hover": {
                          background: "#f0f9ff",
                          color: "#1e40af",
                        },
                      }}
                    >
                      <School sx={{ mr: 1, color: "#6b7280" }} />
                      My Learning
                    </MenuItem>
                    <MenuItem
                      onClick={() => navigate("/cart")}
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        color: "#374151",
                        "&:hover": {
                          background: "#f0f9ff",
                          color: "#1e40af",
                        },
                      }}
                    >
                      <ShoppingCart sx={{ mr: 1, color: "#6b7280" }} />
                      My Cart
                    </MenuItem>
                    <MenuItem
                      onClick={() => navigate("/wishlist")}
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        color: "#374151",
                        "&:hover": {
                          background: "#f0f9ff",
                          color: "#1e40af",
                        },
                      }}
                    >
                      <Favorite sx={{ mr: 1, color: "#6b7280" }} />
                      Wishlist
                    </MenuItem>
                    <Divider sx={{ my: 0.5 }} />
                    <MenuItem
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        fontSize: "1rem",
                        color: "#dc2626",
                        "&:hover": {
                          background: "#fef2f2",
                          color: "#b91c1c",
                        },
                      }}
                    >
                      <Logout sx={{ mr: 1, color: "#dc2626" }} />
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              )}
            </Box>
          ) : (
            <IconButton onClick={toggleMobileMenu} sx={{ color: "white" }}>
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Menu Mobile */}
      <Drawer anchor="right" open={mobileMenuOpen} onClose={toggleMobileMenu}>
        <Box sx={{ width: 250, pt: 2 }}>
          <List>
            {navItems.map((item) => (
              <ListItem button key={item}>
                <ListItemText primary={item} />
              </ListItem>
            ))}

            {!user ? (
              <>
                <ListItem>
                  <Button
                    variant="outlined"
                    fullWidth
                    color="primary"
                    sx={{ mb: 1 }}
                    onClick={() => navigate("/auth/login")}
                  >
                    Login
                  </Button>
                </ListItem>
                <ListItem>
                  <Button
                    variant="contained"
                    fullWidth
                    color="primary"
                    onClick={() => navigate("/auth/register")}
                  >
                    Register
                  </Button>
                </ListItem>
              </>
            ) : (
              <ListItem>
                <Button
                  variant="outlined"
                  fullWidth
                  color="primary"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </ListItem>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  );
};

export default AppHeader;
