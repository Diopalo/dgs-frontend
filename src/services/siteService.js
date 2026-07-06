import api from "./api";

export const getSites = async () => {
  const response = await api.get("/sites");
  return response.data;
};

export const getSiteById = async (id) => {
  const response = await api.get(`/sites/${id}`);
  return response.data;
};

export const createSite = async (siteData) => {
  const response = await api.post(
    "/sites",
    siteData
  );

  return response.data;
};

export const updateSite = async (id,siteData) => {
  const response = await api.put(
    `/sites/${id}`,
    siteData
  );

  return response.data;
};

export const deleteSite = async (id) => {
  const response = await api.delete(
    `/sites/${id}`
  );

  return response.data;
};