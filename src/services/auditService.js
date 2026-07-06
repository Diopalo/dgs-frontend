import axios from "axios";

const API_URL = "http://localhost:3000/api";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const launchAudit = async (siteId) => {
  const response = await axios.post(
    `${API_URL}/sites/${siteId}/audits`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const getAuditResult = async (siteId) => {
  const response = await axios.get(
    `${API_URL}/sites/${siteId}/audits?_t=${Date.now()}`,
    getAuthHeaders()
  );
  return response.data;
};

export const getAllAudits = async () => {
  const response = await axios.get(
    `${API_URL}/audits`,
    getAuthHeaders()
  );
  return response.data;
};