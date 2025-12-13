import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from "recharts";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Heart,
  User,
  LogOut,
  Download,
  Moon,
  Sun,
  Activity,
  Zap,
  Award,
  Star,
  X
} from "lucide-react";

// Azure Function API URL
const API_URL = "https://dietfunc21963.azurewebsites.net/api/DietApi";

const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

const dietColors = {
  vegan: '#10b981',
  paleo: '#f59e0b',
  keto: '#8b5cf6',
  default: '#6b7280'
};

export default function Dashboard({ user, onLogout }) {
  const [recipes, setRecipes] = useState([]);
  const [allRecipes, setAllRecipes] = useState([]);
  const [page, setPage] = useState(1);
  const [diet, setDiet] = useState("All Diets");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [sortBy, setSortBy] = useState("name");
  const [favorites, setFavorites] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [stats, setStats] = useState({ total: 0, vegan: 0, paleo: 0, keto: 0 });
  const pageSize = 9;

  // Debounce search input - wait 500ms after user stops typing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  const fetchRecipes = async () => {
    setLoading(true);
    try {
      let url = `${API_URL}?page=${page}&pageSize=${pageSize}`;

      if (diet !== "All Diets") url += `&diet=${diet}`;
      if (debouncedSearch.trim() !== "") url += `&search=${debouncedSearch}`;

      const res = await fetch(url);
      const data = await res.json();
      setRecipes(data);

      // Fetch all recipes for stats (only on first load)
      if (allRecipes.length === 0) {
        const allRes = await fetch(`${API_URL}?page=1&pageSize=1000`);
        const allData = await allRes.json();
        setAllRecipes(allData);
        calculateStats(allData);
      }
    } catch (error) {
      console.error("Error fetching recipes:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (data) => {
    setStats({
      total: data.length,
      vegan: data.filter(r => r.diet_type?.toLowerCase().includes('vegan')).length,
      paleo: data.filter(r => r.diet_type?.toLowerCase().includes('paleo')).length,
      keto: data.filter(r => r.diet_type?.toLowerCase().includes('keto')).length,
    });
  };

  useEffect(() => {
    fetchRecipes();
  }, [page]);

  useEffect(() => {
    setPage(1);
    fetchRecipes();
  }, [diet, debouncedSearch]);

  const toggleFavorite = (recipe) => {
    const isFavorited = favorites.some(fav => fav.recipe_name === recipe.recipe_name);
    if (isFavorited) {
      setFavorites(favorites.filter(fav => fav.recipe_name !== recipe.recipe_name));
    } else {
      setFavorites([...favorites, recipe]);
    }
  };

  const isFavorited = (recipe) => {
    return favorites.some(fav => fav.recipe_name === recipe.recipe_name);
  };

  const exportData = () => {
    const csvContent = "data:text/csv;charset=utf-8,"
      + "Recipe Name,Diet Type,Protein(g),Carbs(g),Fat(g)\n"
      + recipes.map(r =>
        `"${r.recipe_name}","${r.diet_type}",${r["protein(g)"]},${r["carbs(g)"]},${r["fat(g)"]}`
      ).join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "recipes_export.csv";
    link.click();
  };

  const chartData = recipes.map((r) => ({
    name: r.recipe_name?.slice(0, 15) || "Unknown",
    Protein: r["protein(g)"] || 0,
    Carbs: r["carbs(g)"] || 0,
    Fat: r["fat(g)"] || 0,
  }));

  const pieData = [
    { name: 'Vegan', value: stats.vegan, color: dietColors.vegan },
    { name: 'Paleo', value: stats.paleo, color: dietColors.paleo },
    { name: 'Keto', value: stats.keto, color: dietColors.keto },
  ];

  const radarData = chartData.slice(0, 6).map(r => ({
    recipe: r.name.slice(0, 10),
    protein: r.Protein,
    carbs: r.Carbs,
    fat: r.Fat,
  }));

  const calculateCalories = (protein, carbs, fat) => {
    return (protein * 4) + (carbs * 4) + (fat * 9);
  };

  const getDietBadgeColor = (dietType) => {
    const type = dietType?.toLowerCase() || '';
    if (type.includes('vegan')) return 'bg-green-100 text-green-800 border-green-300';
    if (type.includes('paleo')) return 'bg-amber-100 text-amber-800 border-amber-300';
    if (type.includes('keto')) return 'bg-purple-100 text-purple-800 border-purple-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
    }`}>
      {/* HEADER */}
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Activity className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  NutriDash Pro
                </h1>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your Personal Nutrition Hub
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`p-2 rounded-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition`}
              >
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right mr-2">
                  <p className={`text-sm font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    {user?.displayName || user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user?.email}
                  </p>
                </div>
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="Profile"
                    className="w-10 h-10 rounded-full border-2 border-purple-500"
                  />
                ) : (
                  <div className={`w-10 h-10 ${darkMode ? 'bg-gray-700' : 'bg-gradient-to-br from-blue-400 to-purple-500'} rounded-full flex items-center justify-center`}>
                    <User className="w-6 h-6 text-white" />
                  </div>
                )}
                <button
                  onClick={onLogout}
                  className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                    darkMode ? 'bg-red-900 hover:bg-red-800' : 'bg-red-500 hover:bg-red-600'
                  } text-white transition shadow-lg hover:shadow-xl`}
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* STATS CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 border-l-4 border-purple-500 transform hover:scale-105 transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Total Recipes</p>
                <p className="text-3xl font-bold mt-2">{stats.total}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 border-l-4 border-green-500 transform hover:scale-105 transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Vegan</p>
                <p className="text-3xl font-bold mt-2">{stats.vegan}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                <Zap className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 border-l-4 border-amber-500 transform hover:scale-105 transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Paleo</p>
                <p className="text-3xl font-bold mt-2">{stats.paleo}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                <Award className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>

          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 border-l-4 border-pink-500 transform hover:scale-105 transition`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} font-medium`}>Favorites</p>
                <p className="text-3xl font-bold mt-2">{favorites.length}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-pink-400 to-pink-600 rounded-full flex items-center justify-center">
                <Heart className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* CONTROLS */}
        <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6 mb-8`}>
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[250px]">
              <div className="relative">
                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                  type="text"
                  placeholder="Search recipes, ingredients..."
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                    darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                  }`}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                {search !== debouncedSearch && search !== "" && (
                  <div className="absolute -bottom-6 left-0 text-xs text-purple-500 flex items-center space-x-1">
                    <div className="animate-spin rounded-full h-3 w-3 border-2 border-purple-500 border-t-transparent"></div>
                    <span>Searching...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                className={`px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                  darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
                }`}
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              >
                <option value="All Diets">All Diets</option>
                <option value="vegan">Vegan</option>
                <option value="paleo">Paleo</option>
                <option value="keto">Keto</option>
              </select>
            </div>

            <select
              className={`px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-200'
              }`}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="name">Sort by Name</option>
              <option value="protein">Sort by Protein</option>
              <option value="carbs">Sort by Carbs</option>
              <option value="fat">Sort by Fat</option>
            </select>

            <button
              onClick={exportData}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition flex items-center space-x-2 shadow-lg"
            >
              <Download className="w-5 h-5" />
              <span>Export</span>
            </button>
          </div>
        </div>

        {/* RECIPES GRID */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-500 border-t-transparent"></div>
          </div>
        ) : recipes.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-12 text-center`}>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              No recipes found. Try adjusting your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {recipes.map((r, i) => (
              <div
                key={i}
                className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden cursor-pointer`}
                onClick={() => setSelectedRecipe(r)}
              >
                <div className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500"></div>

                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-bold text-xl flex-1 pr-2">
                      {r.recipe_name || "Unnamed Recipe"}
                    </h2>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(r);
                      }}
                      className={`${isFavorited(r) ? 'text-red-500' : darkMode ? 'text-gray-600' : 'text-gray-400'} hover:text-red-500 transition`}
                    >
                      <Heart className={`w-6 h-6 ${isFavorited(r) ? 'fill-current' : ''}`} />
                    </button>
                  </div>

                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold border mb-4 ${getDietBadgeColor(r.diet_type)}`}>
                    {r.diet_type || "General"}
                  </span>

                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Protein</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500" style={{width: `${Math.min((r["protein(g)"] / 50) * 100, 100)}%`}}></div>
                        </div>
                        <span className="font-bold text-sm">{r["protein(g)"]}g</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Carbs</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500" style={{width: `${Math.min((r["carbs(g)"] / 100) * 100, 100)}%`}}></div>
                        </div>
                        <span className="font-bold text-sm">{r["carbs(g)"]}g</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Fat</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-amber-500 to-orange-500" style={{width: `${Math.min((r["fat(g)"] / 50) * 100, 100)}%`}}></div>
                        </div>
                        <span className="font-bold text-sm">{r["fat(g)"]}g</span>
                      </div>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'} flex items-center justify-between`}>
                    <div>
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Calories</p>
                      <p className="text-lg font-bold text-purple-600">
                        {calculateCalories(r["protein(g)"], r["carbs(g)"], r["fat(g)"])} kcal
                      </p>
                    </div>
                    <Star className={`w-6 h-6 ${darkMode ? 'text-gray-600' : 'text-yellow-400'} fill-current`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            className={`p-3 rounded-xl flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } shadow-lg`}
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            <ChevronLeft className="w-5 h-5" />
            <span className="font-medium">Previous</span>
          </button>

          <div className={`px-6 py-3 rounded-xl font-bold ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            Page <span className="text-purple-600">{page}</span>
          </div>

          <button
            className={`p-3 rounded-xl flex items-center space-x-2 disabled:opacity-40 disabled:cursor-not-allowed transition ${
              darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
            } shadow-lg`}
            disabled={recipes.length < pageSize}
            onClick={() => setPage((p) => p + 1)}
          >
            <span className="font-medium">Next</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* CHARTS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* BAR CHART */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <span>Macronutrient Comparison</span>
            </h2>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="name"
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Bar dataKey="Protein" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Carbs" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="Fat" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* PIE CHART */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Activity className="w-6 h-6 text-purple-500" />
              <span>Diet Distribution</span>
            </h2>
            <div className="w-full h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="45%"
                    labelLine={true}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={90}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* LINE CHART */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Zap className="w-6 h-6 text-purple-500" />
              <span>Nutrition Trends</span>
            </h2>
            <div className="w-full h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <XAxis
                    dataKey="name"
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    fontSize={12}
                  />
                  <YAxis stroke={darkMode ? '#9ca3af' : '#6b7280'} fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    iconType="circle"
                  />
                  <Line type="monotone" dataKey="Protein" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6', r: 4 }} />
                  <Line type="monotone" dataKey="Carbs" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
                  <Line type="monotone" dataKey="Fat" stroke="#f59e0b" strokeWidth={2} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* RADAR CHART */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl shadow-xl p-6`}>
            <h2 className="text-xl font-bold mb-4 flex items-center space-x-2">
              <Award className="w-6 h-6 text-purple-500" />
              <span>Nutritional Profile</span>
            </h2>
            <div className="w-full h-[350px] flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke={darkMode ? '#374151' : '#e5e7eb'} />
                  <PolarAngleAxis
                    dataKey="recipe"
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    fontSize={11}
                  />
                  <PolarRadiusAxis
                    stroke={darkMode ? '#9ca3af' : '#6b7280'}
                    fontSize={10}
                  />
                  <Radar name="Protein" dataKey="protein" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.5} />
                  <Radar name="Carbs" dataKey="carbs" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.5} />
                  <Radar name="Fat" dataKey="fat" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.5} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      color: darkMode ? '#fff' : '#000'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* RECIPE DETAIL MODAL */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedRecipe(null)}>
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto`} onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">{selectedRecipe.recipe_name}</h2>
              <button onClick={() => setSelectedRecipe(null)} className="text-white hover:bg-white/20 rounded-full p-2 transition">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold border ${getDietBadgeColor(selectedRecipe.diet_type)}`}>
                  {selectedRecipe.diet_type || "General"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-purple-50'} rounded-xl p-4`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-purple-600'} font-medium mb-1`}>Protein</p>
                  <p className="text-3xl font-bold">{selectedRecipe["protein(g)"]}g</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} rounded-xl p-4`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-blue-600'} font-medium mb-1`}>Carbs</p>
                  <p className="text-3xl font-bold">{selectedRecipe["carbs(g)"]}g</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-amber-50'} rounded-xl p-4`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-amber-600'} font-medium mb-1`}>Fat</p>
                  <p className="text-3xl font-bold">{selectedRecipe["fat(g)"]}g</p>
                </div>
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-green-50'} rounded-xl p-4`}>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-green-600'} font-medium mb-1`}>Calories</p>
                  <p className="text-3xl font-bold">
                    {calculateCalories(selectedRecipe["protein(g)"], selectedRecipe["carbs(g)"], selectedRecipe["fat(g)"])}
                  </p>
                </div>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => toggleFavorite(selectedRecipe)}
                  className={`flex-1 py-3 rounded-xl font-semibold transition flex items-center justify-center space-x-2 ${
                    isFavorited(selectedRecipe)
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${isFavorited(selectedRecipe) ? 'fill-current' : ''}`} />
                  <span>{isFavorited(selectedRecipe) ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

