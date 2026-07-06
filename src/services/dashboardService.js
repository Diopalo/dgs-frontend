import api from "./api";

export const getSiteDashboard = async (siteId) => {
  const response = await api.get(
    `/sites/${siteId}/dashboard`
  );

  return response.data;
};

export const getGlobalDashboard = async () => {
  const response = await api.get(
    "/dashboard/global"
  );

  return response.data;
};

