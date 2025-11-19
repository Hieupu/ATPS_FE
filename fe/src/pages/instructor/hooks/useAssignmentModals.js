import { useState, useCallback } from "react";

export function useAssignmentModals() {
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const openTypeModal = useCallback(() => {
    setShowTypeModal(true);
  }, []);

  const closeTypeModal = useCallback(() => {
    setShowTypeModal(false);
  }, []);

  const openCreateForm = useCallback((type) => {
    setShowTypeModal(false);
    setShowCreateForm(true);
  }, []);

  const closeCreateForm = useCallback(() => {
    setShowCreateForm(false);
    setEditingId(null);
  }, []);

  const openEditForm = useCallback((assignmentId) => {
    setEditingId(assignmentId);
    setShowEditForm(true);
  }, []);

  const closeEditForm = useCallback(() => {
    setShowEditForm(false);
    setEditingId(null);
  }, []);

  return {
    showTypeModal,
    showCreateForm,
    showEditForm,
    editingId,
    openTypeModal,
    closeTypeModal,
    openCreateForm,
    closeCreateForm,
    openEditForm,
    closeEditForm
  };
}