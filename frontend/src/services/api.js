import axios from "axios";

const API_BASE = "https://dietfunc21963.azurewebsites.net/api/dietapi";

export const fetchRecipes = async ({ page, pageSize, diet, search }) => {
  const params = { page, pageSize };

  if (diet && diet !== "All") params.diet = diet;
  if (search && search.length > 0) params.search = search;

  const res = await axios.get(API_BASE, { params });
  return res.data;
};

