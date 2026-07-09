import axios from "axios";

const API_URL = "http://localhost:3000/api/projets";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const getProjects = async () => {
  const response = await axios.get(API_URL, getAuthHeaders());
  return response.data;
};

export const getProjectById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeaders());
  return response.data;
};

export const createProject = async (projectData) => {
  const response = await axios.post(
    API_URL,
    projectData,
    getAuthHeaders()
  );
  return response.data;
};

export const updateProject = async (id, projectData) => {
  const response = await axios.put(
    `${API_URL}/${id}`,
    projectData,
    getAuthHeaders()
  );
  return response.data;
};

export const deleteProject = async (id) => {
  const response = await axios.delete(
    `${API_URL}/${id}`,
    getAuthHeaders()
  );
  return response.data;
};