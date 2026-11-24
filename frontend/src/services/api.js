const API_BASE_URL = '/api';

class ApiService {
  getToken() {
    return localStorage.getItem('civicsolve_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('civicsolve_token', token);
    } else {
      localStorage.removeItem('civicsolve_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (options.body instanceof FormData) {
      delete headers['Content-Type']; // Let browser set multipart boundary
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/demo-login')) {
      // Token might be expired
      // this.setToken(null);
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.detail || errorData.message || response.statusText;
      } catch (e) {
        errorMessage = response.statusText;
      }
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Auth
  login(email, password) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
  }

  register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  demoLogin(role) {
    return this.request(`/auth/demo-login?role=${role}`, {
      method: 'POST'
    });
  }

  getCurrentUser() {
    return this.request('/auth/me');
  }

  // Civic Problems
  getProblems(params = {}) {
    const query = new URLSearchParams();
    Object.keys(params).forEach(k => {
      if (params[k] !== undefined && params[k] !== null && params[k] !== '') {
        query.append(k, params[k]);
      }
    });
    return this.request(`/problems?${query.toString()}`);
  }

  getProblemById(id) {
    return this.request(`/problems/${id}`);
  }

  createProblem(data) {
    return this.request('/problems', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  uploadAttachment(problemId, file) {
    const formData = new FormData();
    formData.append('file', file);
    return this.request(`/problems/${problemId}/upload`, {
      method: 'POST',
      body: formData
    });
  }

  voteProblem(id) {
    return this.request(`/problems/${id}/vote`, {
      method: 'POST'
    });
  }

  removeVote(id) {
    return this.request(`/problems/${id}/vote`, {
      method: 'DELETE'
    });
  }

  saveProblem(id) {
    return this.request(`/problems/${id}/save`, {
      method: 'POST'
    });
  }

  unsaveProblem(id) {
    return this.request(`/problems/${id}/save`, {
      method: 'DELETE'
    });
  }

  getComments(problemId) {
    return this.request(`/problems/${problemId}/comments`);
  }

  addComment(problemId, content) {
    return this.request(`/problems/${problemId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content })
    });
  }

  submitFeedback(problemId, feedbackData) {
    return this.request(`/problems/${problemId}/feedback`, {
      method: 'POST',
      body: JSON.stringify(feedbackData)
    });
  }

  getDuplicates(problemId) {
    return this.request(`/problems/${problemId}/duplicates`);
  }

  // Real-time AI preview in reporting wizard
  previewAI(data) {
    return this.request('/ai/analyze-preview', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Admin
  getAdminStats() {
    return this.request('/admin/stats');
  }

  getPendingVerification() {
    return this.request('/admin/pending-verification');
  }

  verifyProblem(problemId, data) {
    return this.request(`/admin/problems/${problemId}/verify`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  assignProblem(problemId, data) {
    return this.request(`/admin/problems/${problemId}/assign`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getAllUsers() {
    return this.request('/admin/users');
  }

  updateUserRole(userId, newRole) {
    return this.request(`/admin/users/${userId}/role?new_role=${newRole}`, {
      method: 'POST'
    });
  }

  getAuditLogs() {
    return this.request('/admin/audit-logs');
  }

  // Authority Officer
  getOfficerAssignments(statusFilter = '') {
    return this.request(`/authority/assignments?status_filter=${statusFilter}`);
  }

  updateProblemStatus(problemId, data) {
    return this.request(`/authority/problems/${problemId}/status`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  // Government Command Center
  getGovernmentAnalytics() {
    return this.request('/government/analytics');
  }

  getGovernmentMapPoints() {
    return this.request('/government/map');
  }

  // Departments
  getDepartments() {
    return this.request('/departments');
  }

  getDepartmentOfficers(deptId) {
    return this.request(`/departments/${deptId}/officers`);
  }

  // Notifications
  getNotifications() {
    return this.request('/notifications');
  }

  markNotificationRead(id) {
    return this.request(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  }

  markAllNotificationsRead() {
    return this.request('/notifications/read-all', {
      method: 'POST'
    });
  }

  // Solution Hub & Innovation
  getChallenges() {
    return this.request('/solutions/challenges');
  }

  createChallenge(data) {
    return this.request('/solutions/challenges', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  getProposals(params = {}) {
    const query = new URLSearchParams(params).toString();
    return this.request(`/solutions/proposals?${query}`);
  }

  getProposalById(id) {
    return this.request(`/solutions/proposals/${id}`);
  }

  createProposal(data) {
    return this.request('/solutions/proposals', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  reviewProposal(proposalId, data) {
    return this.request(`/solutions/proposals/${proposalId}/review`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  addTask(proposalId, data) {
    return this.request(`/solutions/proposals/${proposalId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  updateTaskStatus(taskId, newStatus) {
    return this.request(`/solutions/tasks/${taskId}/status?new_status=${newStatus}`, {
      method: 'PATCH'
    });
  }

  addMilestone(proposalId, data) {
    return this.request(`/solutions/proposals/${proposalId}/milestones`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  toggleMilestone(milestoneId) {
    return this.request(`/solutions/milestones/${milestoneId}/toggle`, {
      method: 'PATCH'
    });
  }

  expressIndustryInterest(proposalId, data) {
    return this.request(`/solutions/proposals/${proposalId}/interest`, {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }
}

export const api = new ApiService();

