import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = {
  async getAuthenticators() {
    const response = await axios.get(`${API_BASE_URL}/authenticators`);
    if (response.data.success) {
      return response.data; // 返回完整响应，包含server_time
    }
    throw new Error(response.data.error || '获取验证器失败');
  },

  async addAuthenticator(data) {
    const response = await axios.post(`${API_BASE_URL}/authenticators`, data);
    if (!response.data.success) {
      throw new Error(response.data.error || '添加失败');
    }
    return response.data;
  },

  async deleteAuthenticator(id) {
    const response = await axios.delete(`${API_BASE_URL}/authenticators/${id}`);
    if (!response.data.success) {
      throw new Error(response.data.error || '删除失败');
    }
    return response.data;
  }
};

export default api;