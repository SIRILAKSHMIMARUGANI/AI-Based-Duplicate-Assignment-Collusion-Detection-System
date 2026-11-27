
import API from "./api";

export const registerUser = async (userData) => {
  const response = await API.post(
    "/auth/register",
    userData
  );

  return response.data;
};

export const loginUser = async (credentials) => {
  const response = await API.post(
    "/auth/login",
    credentials
  );

  const { token, user } = response.data;

  sessionStorage.setItem("token", token);
  sessionStorage.setItem("user", JSON.stringify(user));

  return response.data;
};

export const logoutUser = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
};
