import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Alert,
  CircularProgress,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  PictureAsPdf,
  VideoLibrary,
  InsertDriveFile,
  Download,
  Visibility,
  Description,
  Slideshow,
  Archive,
} from '@mui/icons-material';
import ReactPlayer from 'react-player';
import { getCourseMaterialsApi } from "../../../apiServices/materialService";

const getFileIcon = (fileType) => {
  switch ((fileType || "").toLowerCase()) {
    case "pdf":
      return <PictureAsPdf color="error" />;
    case "video":
    case "mp4":
    case "mov":
    case "avi":
      return <VideoLibrary color="primary" />;
    case "ppt":
    case "pptx":
      return <Slideshow color="warning" />;
    case "doc":
    case "docx":
      return <Description color="info" />;
    case "zip":
    case "rar":
      return <Archive color="secondary" />;
    default:
      return <InsertDriveFile />;
  }
};

const getFileTypeLabel = (fileType) => {
  switch ((fileType || "").toLowerCase()) {
    case "pdf": return "PDF";
    case "video": 
    case "mp4":
    case "mov":
    case "avi": return "Video";
    case "ppt":
    case "pptx": return "PowerPoint";
    case "doc":
    case "docx": return "Word";
    case "zip":
    case "rar": return "Archive";
    default: return "File";
  }
};

const MaterialItem = ({ material, onDownload, onView }) => {
  const canPreview = ['pdf', 'video', 'mp4', 'mov', 'avi'].includes(
    (material.FileType || '').toLowerCase()
  );

  return (
    <ListItem
      sx={{
        borderBottom: '1px solid',
        borderColor: 'rgba(99,102,241,0.1)',
        '&:last-child': { borderBottom: 'none' },
        py: 2.5,
        px: 3,
        transition: "all 0.3s ease",
        "&:hover": {
          bgcolor: "#f8f9fe",
          transform: "translateX(4px)",
        },
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {canPreview && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => onView(material)}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                borderColor: "primary.main",
                color: "primary.main",
                "&:hover": {
                  bgcolor: "primary.light",
                  borderColor: "primary.main",
                },
              }}
            >
              Xem
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<Download />}
            onClick={() => onDownload(material)}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
            }}
          >
            Tải
          </Button>
        </Box>
      }
    >
      <ListItemIcon sx={{ minWidth: 48 }}>
        {getFileIcon(material.FileType)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
            <Typography
              variant="body1"
              sx={{
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
              }}
            >
              {material.Title}
            </Typography>
            <Chip 
              label={getFileTypeLabel(material.FileType)} 
              size="small" 
              sx={{
                bgcolor: "rgba(102,126,234,0.1)",
                color: "primary.main",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 22,
              }}
            />
          </Box>
        }
        secondary={
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.85rem" }}>
            {material.Description || 'Tài liệu học tập'}
          </Typography>
        }
      />
    </ListItem>
  );
};

const CourseMaterials = ({ courseId }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  const fetchMaterials = useCallback(async () => {
    if (!courseId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getCourseMaterialsApi(courseId);
      const materialsList = (data.materials || []).map(material => ({
        MaterialID: material.MaterialID,
        Title: material.Title,
        FileURL: material.FileURL,
        FileType: (material.fileType || material.FileType || '').toLowerCase(),
        Description: material.Description,
        FileSize: material.FileSize,
        UploadDate: material.UploadDate,
      }));
      setMaterials(materialsList);
    } catch (err) {
      console.error('Error fetching materials:', err);
      setError(err.message || 'Không thể tải tài liệu khóa học');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleDownload = (material) => {
    if (!material?.FileURL) return;
    window.open(material.FileURL, '_blank', 'noopener,noreferrer');
  };

  const handleView = (material) => {
    setPreviewItem(material);
    setPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setPreviewOpen(false);
    setPreviewItem(null);
  };

  // Group materials by type
  const groupedMaterials = materials.reduce((groups, material) => {
    const type = getFileTypeLabel(material.FileType);
    if (!groups[type]) {
      groups[type] = [];
    }
    groups[type].push(material);
    return groups;
  }, {});

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error">
        {error}
      </Alert>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            fontFamily: "'Poppins', sans-serif",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          📚 Tài liệu khóa học
          <Chip
            label={`${materials.length} files`}
            size="small"
            sx={{
              bgcolor: "primary.main",
              color: "white",
              fontWeight: 600,
            }}
          />
        </Typography>
      </Box>

      {materials.length === 0 ? (
        <Alert
          severity="info"
          sx={{
            borderRadius: 3,
            border: "1px solid rgba(33, 150, 243, 0.2)",
          }}
        >
          Chưa có tài liệu nào cho khóa học này.
        </Alert>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {Object.entries(groupedMaterials).map(([type, typeMaterials]) => (
            <Card
              key={type}
              elevation={0}
              sx={{
                borderRadius: 4,
                border: "1px solid rgba(99,102,241,0.15)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  px: 3,
                  py: 2,
                  background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                }}
              >
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {type} ({typeMaterials.length})
                </Typography>
              </Box>

              <CardContent sx={{ p: 0 }}>
                <List>
                  {typeMaterials.map((material) => (
                    <MaterialItem
                      key={material.MaterialID}
                      material={material}
                      onDownload={handleDownload}
                      onView={handleView}
                    />
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {previewItem?.Title || 'Xem tài liệu'}
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {previewItem && (
            <Box sx={{ width: '100%' }}>
              {(() => {
                const type = previewItem.FileType;
                const url = previewItem.FileURL;

                if (type === 'video' || type === 'mp4' || type === 'mov' || type === 'avi') {
                  return (
                    <Box sx={{ position: 'relative', paddingTop: '56.25%' }}>
                      <Box sx={{ 
                        position: 'absolute', 
                        top: 0, 
                        left: 0, 
                        right: 0, 
                        bottom: 0 
                      }}>
                        <ReactPlayer
                          url={url}
                          width="100%"
                          height="100%"
                          controls
                          playing={false}
                          config={{
                            file: {
                              attributes: {
                                controlsList: 'nodownload'
                              }
                            }
                          }}
                        />
                      </Box>
                    </Box>
                  );
                } else if (type === 'pdf') {
                  return (
                    <Box sx={{ height: '600px' }}>
                      <iframe
                        src={url}
                        width="100%"
                        height="100%"
                        title={previewItem.Title}
                        style={{ border: 'none' }}
                      />
                    </Box>
                  );
                } else {
                  return (
                    <Alert severity="info">
                      Không hỗ trợ xem trực tiếp loại tài liệu này. Vui lòng tải xuống để xem.
                    </Alert>
                  );
                }
              })()}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          {previewItem?.FileURL && (
            <Button onClick={() => handleDownload(previewItem)}>
              Tải xuống
            </Button>
          )}
          <Button variant="contained" onClick={handleClosePreview}>
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CourseMaterials;