import { useEffect, useState } from "react";
import { fetchDiets } from "./api";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function Dashboard() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [diet, setDiet] = useState("");
  const [search, setSearch] = useState("");
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchDiets({ page, pageSize: 6, diet, search }).then((res) => {
      setItems(res.items);
      setHasMore(res.hasMore);
    });
  }, [page, diet, search]);

  const chartData = {
    labels: items.map((i) => i.Recipe_name.slice(0, 15)),
    datasets: [
      {
        label: "Protein (g)",
        data: items.map((i) => i["Protein(g)"]),
        backgroundColor: "#6366f1",
      },
    ],
  };

  return (
    <div style={{ padding: 30 }}>
      <h1 style={{ textAlign: "center" }}>🥗 Diet Dashboard</h1>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <input
          placeholder="Search recipe..."
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        <select
          value={diet}
          onChange={(e) => {
            setPage(1);
            setDiet(e.target.value);
          }}
        >
          <option value="">All</option>
          <option value="vegan">Vegan</option>
          <option value="paleo">Paleo</option>
          <option value="keto">Keto</option>
        </select>
      </div>

      {/* Recipes */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 15 }}>
        {items.map((i, idx) => (
          <div key={idx} style={{ border: "1px solid #ddd", padding: 15 }}>
            <h3>{i.Recipe_name}</h3>
            <p>{i.Diet_type} | {i.Cuisine_type}</p>
            <p>
              🥩 {i["Protein(g)"]}g | 🍞 {i["Carbs(g)"]}g | 🧈 {i["Fat(g)"]}g
            </p>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div style={{ marginTop: 20, display: "flex", justifyContent: "space-between" }}>
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
        >
          Prev
        </button>

        <span>Page {page}</span>

        <button
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>

      {/* Chart */}
      <div style={{ marginTop: 40 }}>
        <h2>Protein Comparison</h2>
        <Bar data={chartData} />
      </div>
    </div>
  );
}

