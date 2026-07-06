import api from "./api";

export const login = async (userData) => {
  const response = await api.post(
    "/auth/connexion",
    userData
  );

  return response.data;
};

export const register = async (userData) => {
  const response = await api.post(
    "/auth/inscription",
    userData
  );
  return response.data;
};