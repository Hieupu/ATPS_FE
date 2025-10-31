import React, { useState } from "react";
import {
  Box, Grid, Typography, Button, TextField, Tabs, Tab, Snackbar, Alert, CircularProgress, Card, CardContent
} from "@mui/material";
import { Add, FilterList, Search } from "@mui/icons-material";
import AssignmentCard from "../components/assignment/AssignmentCard";
import AssignmentActionsMenu from "../components/assignment/AssignmentActionsMenu";
import AssignmentFormDialog from "../components/assignment/AssignmentFormDialog";
import StatusConfirmDialog from "../components/assignment/StatusConfirmDialog";
import useAssignment from "../hooks/useAssignment";

export default function AssignmentsPage() {
  const {
    assignments, filtered, stats, loading, busy, error, success, setError, setSuccess,
    tabValue, setTabValue, searchQuery, setSearchQuery,
    form, setForm, openCreate, setOpenCreate, openEdit, setOpenEdit,
    openStatus, setOpenStatus, statusTarget, setStatusTarget,
    submitCreate, submitEdit, submitStatus, editFromItem,
  } = useAssignment();

  const [anchorEl, setAnchorEl] = useState(null);
  const [selected, setSelected] = useState(null);
  const openMenu = (e, item) => { setAnchorEl(e.currentTarget); setSelected(item); };
  const closeMenu = () => { setAnchorEl(null); setSelected(null); };

  return (
    <Box sx={{ p: 2, backgroundColor: "#f8fafc", minHeight: "100vh" }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700 }}>Assignments</Typography>
        <Button startIcon={<Add />} variant="contained" onClick={() => setOpenCreate(true)} disabled={busy}>
          Create New
        </Button>
      </Box>

      {/* Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {[{label:"Total",value:stats.total},{label:"Active",value:stats.open},{label:"Grading",value:stats.grading},{label:"Deleted",value:stats.deleted}]
          .map((s,i)=>(
          <Grid item xs={6} sm={3} key={i}>
            <Card><CardContent>
              <Typography variant="caption" color="text.secondary">{s.label}</Typography>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>{s.value}</Typography>
            </CardContent></Card>
          </Grid>
        ))}
      </Grid>

      {/* Search + Tabs */}
      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField size="small" placeholder="Search by title or class..." value={searchQuery}
          onChange={(e)=>setSearchQuery(e.target.value)} sx={{ flex:1 }}
          InputProps={{ startAdornment:<Search sx={{ mr:1 }}/> }} />
        <Button variant="outlined" startIcon={<FilterList/>}>Filter</Button>
      </Box>
      <Tabs value={tabValue} onChange={(e,v)=>setTabValue(v)}>
        <Tab label={`All (${assignments.length})`} />
        <Tab label={`Assignments`} />
        <Tab label={`Exams`} />
      </Tabs>

      {/* List */}
      {loading ? (
        <Box sx={{ display:"flex",justifyContent:"center",mt:8 }}><CircularProgress/></Box>
      ) : filtered.length === 0 ? (
        <Typography align="center" sx={{ mt:8 }}>Không có bài tập nào phù hợp</Typography>
      ) : (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {filtered.map((it)=>(
            <Grid item xs={12} sm={6} md={4} key={it.AssignmentID}>
              <AssignmentCard item={it} onMenu={openMenu}/>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Actions menu */}
      <AssignmentActionsMenu
        anchorEl={anchorEl}
        onClose={closeMenu}
        item={selected}
        onEdit={(it)=>editFromItem(it)}
        onAskStatus={(it,next)=>{ setStatusTarget({ id: it.AssignmentID, next }); setOpenStatus(true); }}
      />

      {/* Dialogs */}
      <AssignmentFormDialog
        open={openCreate}
        onClose={()=>setOpenCreate(false)}
        onSubmit={submitCreate}
        busy={busy}
        form={form}
        setForm={setForm}
        editMode={false}
      />
      <AssignmentFormDialog
        open={openEdit}
        onClose={()=>setOpenEdit(false)}
        onSubmit={submitEdit}
        busy={busy}
        form={form}
        setForm={setForm}
        editMode={true}
      />
      <StatusConfirmDialog
        open={openStatus}
        onClose={()=>setOpenStatus(false)}
        onConfirm={submitStatus}
        next={statusTarget.next}
        busy={busy}
      />

      {/* Snackbars */}
      <Snackbar open={!!error} autoHideDuration={4000} onClose={() => setError("")}>
        <Alert severity="error" onClose={() => setError("")} variant="filled">{error}</Alert>
      </Snackbar>
      <Snackbar open={!!success} autoHideDuration={3000} onClose={() => setSuccess("")}>
        <Alert severity="success" onClose={() => setSuccess("")} variant="filled">{success}</Alert>
      </Snackbar>
    </Box>
  );
}
