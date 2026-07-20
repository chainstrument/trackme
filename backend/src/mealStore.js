const meals = [];
const plannedMeals = [];

function listMeals() {
  return meals;
}

function createMeal(payload) {
  const meal = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name: payload.name,
    category: payload.category || 'lunch',
    calories: payload.calories || null,
    macros: payload.macros || null,
    createdAt: new Date().toISOString()
  };
  meals.push(meal);
  return meal;
}

function updateMeal(id, payload) {
  const index = meals.findIndex((meal) => meal.id === id);
  if (index === -1) {
    return null;
  }
  meals[index] = { ...meals[index], ...payload };
  return meals[index];
}

function deleteMeal(id) {
  const index = meals.findIndex((meal) => meal.id === id);
  if (index === -1) {
    return false;
  }
  meals.splice(index, 1);
  return true;
}

function listPlannedMeals() {
  return plannedMeals;
}

function planMeal(payload) {
  const plannedMeal = {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    mealId: payload.mealId,
    date: payload.date,
    category: payload.category || 'lunch',
    eaten: false
  };
  plannedMeals.push(plannedMeal);
  return plannedMeal;
}

function toggleEaten(id) {
  const plannedMeal = plannedMeals.find((entry) => entry.id === id);
  if (!plannedMeal) {
    return null;
  }
  plannedMeal.eaten = !plannedMeal.eaten;
  return plannedMeal;
}

export { listMeals, createMeal, updateMeal, deleteMeal, listPlannedMeals, planMeal, toggleEaten };
