import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Grid,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from "@mui/material";
import {
  Folder,
  Description,
  VideoLibrary,
  PictureAsPdf,
  InsertDriveFile,
  Download,
  ExpandMore,
  School,
} from "@mui/icons-material";
import { useAuth } from "../../contexts/AuthContext";
import { getLearnerMaterialsApi } from "../../apiServices/materialService";
import { getLearnerIdFromAccount } from "../../utils/learnerUtils";
import AppHeader from "../../components/Header/AppHeader";

const MaterialsPage = () => {
  const { user, isLearner } = useAuth();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMaterials = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const accId = user.AccID || user.AccID || user.id || user.AccountID;
      console.log("User object:", user);

      if (!accId) {
        const errorMsg =
          "Không tìm thấy Account ID. Vui lòng đăng xuất và đăng nhập lại.";
        console.error("AccID not found in user object:", user);
        throw new Error(errorMsg);
      }

      console.log("Using AccID:", accId);
      const learnerId = await getLearnerIdFromAccount(accId);

      if (!learnerId) {
        throw new Error(
          "Không tìm thấy Learner ID. Hãy đảm bảo bạn đã có profile learner."
        );
      }

      console.log("LearnerID found:", learnerId);
      const data = await getLearnerMaterialsApi(learnerId);

      // Transform backend array into UI-friendly object keyed by courseId
      const grouped = {};
      (data.materials || []).forEach((courseGroup) => {
        const courseId = courseGroup.CourseID;
        grouped[courseId] = {
          courseName: courseGroup.CourseTitle,
          materials: (courseGroup.Materials || []).map((m) => ({
            MaterialID: m.MaterialID,
            Title: m.Title,
            FileURL: m.FileURL,
            // Normalize for UI
            FileType: (m.fileType || "").toLowerCase(),
            FileSize: m.FileSize || "",
          })),
        };
      });

      setMaterials(grouped);
    } catch (err) {
      console.error("Error fetching materials:", err);
      setError(err.message || "Không thể tải tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user && isLearner) {
      fetchMaterials();
    } else {
      setError("Chỉ học viên mới có thể xem tài liệu");
      setLoading(false);
    }
  }, [user, isLearner, fetchMaterials]);

  const getFileIcon = (type) => {
    switch (type?.toLowerCase()) {
      case "pdf":
        return <PictureAsPdf color="error" />;
      case "video":
      case "mp4":
        return <VideoLibrary color="primary" />;
      case "image":
      case "jpg":
      case "png":
        return <Description color="info" />;
      default:
        return <InsertDriveFile />;
    }
  };

  const handleDownload = (material) => {
    if (!material?.FileURL) return;
    window.open(material.FileURL, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f8f9fe",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
        <AppHeader />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Alert severity="error">{error}</Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f8f9fe" }}>
      <AppHeader />
      {/* Header */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            sx={{ fontWeight: 700, mb: 2, textAlign: "center" }}
          >
            Tài liệu khóa học
          </Typography>
          <Typography
            variant="body1"
            sx={{ textAlign: "center", opacity: 0.9 }}
          >
            Tải xuống và xem tài liệu học tập
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {Object.keys(materials).map((courseId) => {
          const courseMaterials = materials[courseId];

          return (
            <Accordion key={courseId} sx={{ mb: 2 }}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 2,
                    width: "100%",
                  }}
                >
                  <School color="primary" />
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {courseMaterials.courseName}
                  </Typography>
                  <Chip
                    label={`${courseMaterials.materials?.length || 0} tài liệu`}
                    size="small"
                    color="primary"
                    sx={{ ml: "auto" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <List>
                  {courseMaterials.materials?.map((material) => (
                    <ListItem
                      key={material.MaterialID}
                      disablePadding
                      sx={{ borderBottom: 1, borderColor: "divider" }}
                    >
                      <ListItemButton>
                        <ListItemIcon>
                          {getFileIcon(material.FileType)}
                        </ListItemIcon>
                        <ListItemText
                          primary={material.Title}
                          secondary={
                            <Box sx={{ mt: 0.5 }}>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {material.FileType} • {material.FileSize}
                              </Typography>
                            </Box>
                          }
                        />
                        <Button
                          startIcon={<Download />}
                          onClick={() => handleDownload(material)}
                          size="small"
                        >
                          Tải xuống
                        </Button>
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}

        {Object.keys(materials).length === 0 && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Chưa có tài liệu nào trong các khóa học của bạn.
          </Alert>
        )}
      </Container>
    </Box>
  );
};

export default MaterialsPage;
