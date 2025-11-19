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
        borderColor: 'divider',
        '&:last-child': { borderBottom: 'none' },
        py: 2,
      }}
      secondaryAction={
        <Box sx={{ display: 'flex', gap: 1 }}>
          {canPreview && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<Visibility />}
              onClick={() => onView(material)}
            >
              Xem
            </Button>
          )}
          <Button
            variant="contained"
            size="small"
            startIcon={<Download />}
            onClick={() => onDownload(material)}
          >
            Tải
          </Button>
        </Box>
      }
    >
      <ListItemIcon>
        {getFileIcon(material.FileType)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
            <Typography variant="h6" sx={{ fontWeight: 500 }}>
              {material.Title}
            </Typography>
            <Chip 
              label={getFileTypeLabel(material.FileType)} 
              size="small" 
              color="primary"
              variant="outlined"
            />
          </Box>
        }
        secondary={
          <Typography variant="body2" color="text.secondary">
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
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 3 }}>
        Tài liệu khóa học ({materials.length} files)
      </Typography>

      {materials.length === 0 ? (
        <Alert severity="info">
          Chưa có tài liệu nào cho khóa học này.
        </Alert>
      ) : (
        <Card>
          <CardContent sx={{ p: 0 }}>
            {Object.entries(groupedMaterials).map(([type, typeMaterials]) => (
              <Box key={type}>
                <Box sx={{ 
                  px: 3, 
                  py: 2, 
                  bgcolor: 'primary.main', 
                  color: 'white' 
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {type} ({typeMaterials.length})
                  </Typography>
                </Box>
                
                <List>
                  {typeMaterials.map(material => (
                    <MaterialItem
                      key={material.MaterialID}
                      material={material}
                      onDownload={handleDownload}
                      onView={handleView}
                    />
                  ))}
                </List>
              </Box>
            ))}
          </CardContent>
        </Card>
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