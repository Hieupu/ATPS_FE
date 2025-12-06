// components/assignment/QuestionManager.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  getAssignmentQuestionsApi,
  addQuestionToAssignmentApi,
  removeQuestionFromAssignmentApi
} from '../../../../apiServices/assignmentService';
import QuestionForm from './QuestionForm';
import QuestionList from './QuestionList';

const Alert = ({ message, type }) => {
  if (!message) return null;
  const style = type === 'error'
    ? { backgroundColor: '#FEE2E2', color: '#DC2626', padding: '12px', borderRadius: '8px', margin: '16px 0' }
    : { backgroundColor: '#D1FAE5', color: '#065F46', padding: '12px', borderRadius: '8px', margin: '16px 0' };
  return <div style={style}>{message}</div>;
};

export default function QuestionManager({
  assignmentId,
  overrideQuestions = [],
  onAddQuestion,
  onDeleteQuestion
}) {
  const [questions, setQuestions] = useState(overrideQuestions);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const isLocalMode = !assignmentId;

  const fetchQuestions = useCallback(async () => {
    if (isLocalMode) {
      setQuestions(overrideQuestions);
      setLoading(false);
      return;
    }
    if (!assignmentId) return;
    setLoading(true);
    try {
      const data = await getAssignmentQuestionsApi(assignmentId);
      setQuestions(data || []);
    } catch (err) {
      setError(err.message || "Lỗi tải câu hỏi.");
    } finally {
      setLoading(false);
    }
  }, [assignmentId, overrideQuestions, isLocalMode]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  useEffect(() => {
    if (isLocalMode) {
      setQuestions(overrideQuestions);
    }
  }, [overrideQuestions, isLocalMode]);

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError('');
        setSuccess('');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleAddQuestion = async (questionData) => {
    setBusy(true);
    setError('');
    setSuccess('');

    if (isLocalMode) {
      const result = onAddQuestion?.(questionData);
      if (result) setSuccess("Đã thêm câu hỏi!");
      setBusy(false);
      return result;
    }

    try {
      const result = await addQuestionToAssignmentApi(assignmentId, questionData);
      setSuccess(result.message || "Thêm câu hỏi thành công!");
      fetchQuestions();
      setBusy(false);
      return true;
    } catch (err) {
      setError(err.message || "Không thể thêm câu hỏi.");
      setBusy(false);
      return false;
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm("Bạn có chắc muốn xóa câu hỏi này?")) return;

    setError('');
    setSuccess('');

    if (isLocalMode) {
      onDeleteQuestion?.(questionId);
      setSuccess("Đã xóa câu hỏi!");
      return;
    }

    try {
      const result = await removeQuestionFromAssignmentApi(assignmentId, questionId);
      setSuccess(result.message || "Xóa câu hỏi thành công!");
      setQuestions(prev => prev.filter(q => q.QuestionID !== questionId));
    } catch (err) {
      setError(err.message || "Lỗi khi xóa câu hỏi.");
    }
  };

  return (
    <div style={styles.container}>
      <QuestionForm onAdd={handleAddQuestion} busy={busy} />
      <Alert message={error} type="error" />
      <Alert message={success} type="success" />
      <QuestionList
        questions={questions}
        onDelete={handleDeleteQuestion}
        loading={loading}
      />
    </div>
  );
}

const styles = {
  container: {
    padding: '24px',
    backgroundColor: '#F9FAFB',
    borderRadius: '8px'
  }
};