export default function RecipeCard({ recipe }) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-4 hover:scale-[1.02] transition">
      <h2 className="font-bold text-lg mb-2">
        {recipe.Recipe_name}
      </h2>

      <p className="text-sm text-gray-500 mb-3">
        {recipe.Diet_type} • {recipe.Cuisine_type}
      </p>

      <div className="flex justify-between text-sm font-medium">
        <span>🥩 {recipe["Protein(g)"]}g</span>
        <span>🍞 {recipe["Carbs(g)"]}g</span>
        <span>🧈 {recipe["Fat(g)"]}g</span>
      </div>
    </div>
  );
}

