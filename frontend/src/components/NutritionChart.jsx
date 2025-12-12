import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";

export default function NutritionChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="mt-12 bg-white p-6 rounded-2xl shadow-lg">
      <h2 className="text-xl font-bold mb-4">Protein Comparison</h2>

      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="Recipe_name" hide />
          <YAxis />
          <Tooltip />
          <Bar dataKey="Protein(g)" fill="#22c55e" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

