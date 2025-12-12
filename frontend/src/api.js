const BASE_URL = "https://dietfunc21963.azurewebsites.net/api/dietapi";

export async function fetchDiets({ page = 1, pageSize = 6, diet = "", search = "" }) {
  const params = new URLSearchParams({ page, pageSize });

  if (diet) params.append("diet", diet);
  if (search) params.append("search", search);

  const res = await fetch(`${BASE_URL}?${params.toString()}`);
  const data = await res.json();

  return {
    items: data,
    hasMore: data.length === pageSize
  };
}

