import React from "react";
import {
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Article as ArticleIcon,
} from "@mui/icons-material";

export default function MaterialList({
  materials = [],
  onAddMaterial, // () => void
  onEditMaterial, // (material) => void
  onDeleteMaterial, // (materialId) => void
}) {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#1e293b" }}>
          Tài liệu
        </Typography>
        <Button
          size="small"
          startIcon={<AddIcon />}
          onClick={onAddMaterial}
          sx={{
            textTransform: "none",
            borderRadius: 2,
            bgcolor: "#5b5bff",
            color: "white",
            "&:hover": { bgcolor: "#4a4acc" },
          }}
        >
          Thêm tài liệu
        </Button>
      </Box>

      {!materials || materials.length === 0 ? (
        <Box
          sx={{
            p: 3,
            textAlign: "center",
            bgcolor: "#f8f9ff",
            borderRadius: 2,
            color: "#64748b",
          }}
        >
          Chưa có tài liệu nào
        </Box>
      ) : (
        <List sx={{ bgcolor: "#f8f9ff", borderRadius: 2, p: 1 }}>
          {materials.map((material) => (
            <ListItem
              key={material.MaterialID}
              sx={{ borderRadius: 1, mb: 1, bgcolor: "white" }}
              secondaryAction={
                <Box sx={{ display: "flex", gap: 0.5 }}>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onEditMaterial(material)}
                    sx={{ color: "#5b5bff" }}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={() => onDeleteMaterial(material.MaterialID)}
                    sx={{ color: "#ef4444" }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Box>
              }
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <ArticleIcon sx={{ color: "#5b5bff", fontSize: 20 }} />
                <ListItemText
                  primary={material.Title}
                  secondary={material.FileURL}
                  primaryTypographyProps={{
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                  secondaryTypographyProps={{
                    fontSize: "0.75rem",
                    sx: {
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: "300px",
                    },
                  }}
                />
              </Box>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
