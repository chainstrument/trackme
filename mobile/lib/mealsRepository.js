import { getDatabase } from './db';

function generateId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

async function listMeals() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM meals ORDER BY created_at DESC');
}

async function createMeal({ name, category, calories, macros }) {
  const db = await getDatabase();
  const meal = {
    id: generateId(),
    name,
    category: category || 'lunch',
    calories: calories ?? null,
    macros: macros ?? null,
    created_at: new Date().toISOString()
  };
  await db.runAsync(
    'INSERT INTO meals (id, name, category, calories, macros, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    meal.id,
    meal.name,
    meal.category,
    meal.calories,
    meal.macros,
    meal.created_at
  );
  return meal;
}

async function listPlannedMeals() {
  const db = await getDatabase();
  return db.getAllAsync('SELECT * FROM planned_meals ORDER BY date');
}

async function planMeal({ mealId, date, category }) {
  const db = await getDatabase();
  const plannedMeal = {
    id: generateId(),
    meal_id: mealId,
    date,
    category: category || 'lunch',
    eaten: 0
  };
  await db.runAsync(
    'INSERT INTO planned_meals (id, meal_id, date, category, eaten) VALUES (?, ?, ?, ?, ?)',
    plannedMeal.id,
    plannedMeal.meal_id,
    plannedMeal.date,
    plannedMeal.category,
    plannedMeal.eaten
  );
  return plannedMeal;
}

async function toggleEaten(id) {
  const db = await getDatabase();
  const plannedMeal = await db.getFirstAsync('SELECT * FROM planned_meals WHERE id = ?', id);
  if (!plannedMeal) {
    return null;
  }
  const eaten = plannedMeal.eaten ? 0 : 1;
  await db.runAsync('UPDATE planned_meals SET eaten = ? WHERE id = ?', eaten, id);
  return { ...plannedMeal, eaten };
}

export { createMeal, listMeals, listPlannedMeals, planMeal, toggleEaten };
