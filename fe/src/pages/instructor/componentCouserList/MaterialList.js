// src/pages/instructor/components/MaterialList.js
import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Button,
  Tooltip,
  Chip,
} from "@mui/material";
import {
  Add,
  Edit,
  Delete,
  Description,
  InsertDriveFile,
} from "@mui/icons-material";

export default function MaterialList({
  materials = [],
  onOpenModal,
  onDeleteMaterial,
}) {
  // Hàm lấy extension file
  const getFileExtension = (url) => {
    if (!url) return "";
    const match = url.match(/\.([^.]+)$/);
    return match ? match[1].toUpperCase() : "";
  };

  // Hàm lấy màu theo loại file
  const getFileColor = (url) => {
    const ext = getFileExtension(url).toLowerCase();
    if (["pdf"].includes(ext)) return "#ef4444";
    if (["doc", "docx"].includes(ext)) return "#3b82f6";
    if (["xls", "xlsx"].includes(ext)) return "#10b981";
    if (["ppt", "pptx"].includes(ext)) return "#f97316";
    return "#757575";
  };

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
          pb: 1.5,
          borderBottom: "2px solid #e0e0e0",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#1a1a1a",
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <Description sx={{ color: "#5b5bff", fontSize: 28 }} />
          Tài liệu
        </Typography>

        <Button
          size="small"
          variant="outlined"
          startIcon={<Add />}
          onClick={() => onOpenModal("createMaterial")}
          sx={{
            color: "#5b5bff",
            borderColor: "#5b5bff",
            textTransform: "none",
            fontWeight: 500,
            px: 2,
            "&:hover": {
              borderColor: "#5b5bff",
              backgroundColor: "rgba(91, 91, 255, 0.08)",
            },
          }}
        >
          Thêm Tài liệu
        </Button>
      </Box>

      {/* Empty State */}
      {materials.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            border: "2px dashed #e0e0e0",
            borderRadius: "8px",
            backgroundColor: "#fafafa",
          }}
        >
          <InsertDriveFile sx={{ fontSize: 48, color: "#bdbdbd", mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Chưa có tài liệu
          </Typography>
        </Box>
      ) : (
        /* Material List */
        <List sx={{ p: 0 }}>
          {materials.map((material) => (
            <ListItem
              key={material.MaterialID}
              sx={{
                border: "1px solid #e0e0e0",
                borderRadius: "8px",
                mb: 1.5,
                transition: "all 0.2s ease-in-out",
                "&:hover": {
                  backgroundColor: "#f4f4ff",
                  borderColor: "#5b5bff",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(91, 91, 255, 0.1)",
                },
                pl: 2,
                pr: 2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>
                <Description
                  sx={{
                    color: getFileColor(material.FileURL),
                    fontSize: 28,
                  }}
                />
              </ListItemIcon>

              <ListItemText
                primary={
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      mb: 0.5,
                    }}
                  >
                    <Typography
                      variant="body1"
                      sx={{
                        fontWeight: 500,
                        color: "#1a1a1a",
                      }}
                    >
                      {material.Title}
                    </Typography>
                    {getFileExtension(material.FileURL) && (
                      <Chip
                        label={getFileExtension(material.FileURL)}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.7rem",
                          fontWeight: 600,
                          backgroundColor: getFileColor(material.FileURL),
                          color: "white",
                        }}
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "500px",
                    }}
                  >
                    {material.FileURL}
                  </Typography>
                }
              />

              <Box sx={{ display: "flex", gap: 0.5, ml: 1 }}>
                <Tooltip title="Chỉnh sửa tài liệu" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onOpenModal("updateMaterial", material)}
                    sx={{
                      color: "#5b5bff",
                      "&:hover": {
                        backgroundColor: "rgba(91, 91, 255, 0.1)",
                      },
                    }}
                  >
                    <Edit fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Xóa tài liệu" arrow>
                  <IconButton
                    size="small"
                    onClick={() => onDeleteMaterial(material.MaterialID)}
                    sx={{
                      color: "#ef4444",
                      "&:hover": {
                        backgroundColor: "rgba(239, 68, 68, 0.1)",
                      },
                    }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
