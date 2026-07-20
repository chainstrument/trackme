import React, { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:3001';

export default function App() {
  const [meals, setMeals] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activityForm, setActivityForm] = useState({ type: 'walk', duration: 30, intensity: 'moderate', date: '2026-07-20' });

  const loadData = async () => {
    const [mealsRes, plannedRes, activitiesRes, alertsRes] = await Promise.all([
      fetch(`${API_URL}/api/meals`),
      fetch(`${API_URL}/api/planned-meals`),
      fetch(`${API_URL}/api/activities`),
      fetch(`${API_URL}/api/alerts`)
    ]);
    setMeals(await mealsRes.json());
    setPlannedMeals(await plannedRes.json());
    setActivities(await activitiesRes.json());
    setAlerts(await alertsRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeals = meals.filter((meal) => meal.name.toLowerCase().includes(search.toLowerCase()));
  const todayActivities = activities.filter((activity) => activity.date === activityForm.date);
  const todayMinutes = todayActivities.reduce((sum, activity) => sum + Number(activity.duration || 0), 0);

  const addMeal = async () => {
    const name = window.prompt('Nom du plat');
    if (!name) return;
    const response = await fetch(`${API_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, category: 'lunch' })
    });
    if (response.ok) {
      loadData();
    }
  };

  const planMeal = async (mealId) => {
    const response = await fetch(`${API_URL}/api/planned-meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId, date: '2026-07-20', category: 'lunch' })
    });
    if (response.ok) {
      loadData();
    }
  };

  const toggleEaten = async (plannedMealId) => {
    const response = await fetch(`${API_URL}/api/planned-meals/${plannedMealId}`, { method: 'PATCH' });
    if (response.ok) {
      loadData();
    }
  };

  const saveActivity = async (event) => {
    event.preventDefault();
    const response = await fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityForm)
    });
    if (response.ok) {
      loadData();
    }
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h1>TrackMe</h1>
      <p>Module activité — saisie manuelle et synthèse</p>
      <button onClick={addMeal} style={{ marginTop: 12 }}>Ajouter un plat</button>
      <section style={{ marginTop: 24 }}>
        <h2>Bibliothèque</h2>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un plat" style={{ width: '100%', padding: 8 }} />
        {filteredMeals.length ? filteredMeals.map((meal) => (
          <div key={meal.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 8 }}>
            <strong>{meal.name}</strong>
            <div>{meal.category}</div>
            <button onClick={() => planMeal(meal.id)} style={{ marginTop: 8 }}>Planifier</button>
          </div>
        )) : <p>Aucun plat trouvé.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Repas prévus</h2>
        {plannedMeals.length ? plannedMeals.map((plannedMeal) => (
          <div key={plannedMeal.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 8 }}>
            <div>{plannedMeal.date} — {plannedMeal.category}</div>
            <div>État: {plannedMeal.eaten ? 'Mangé' : 'À faire'}</div>
            <button onClick={() => toggleEaten(plannedMeal.id)} style={{ marginTop: 8 }}>Basculer</button>
          </div>
        )) : <p>Aucun repas prévu.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Activité du jour</h2>
        <p>Temps total : {todayMinutes} min</p>
        <form onSubmit={saveActivity}>
          <select value={activityForm.type} onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })}>
            <option value="walk">Marche</option>
            <option value="sport">Sport</option>
            <option value="bike">Vélo</option>
            <option value="other">Autre</option>
          </select>
          <input type="number" value={activityForm.duration} onChange={(event) => setActivityForm({ ...activityForm, duration: Number(event.target.value) })} style={{ marginLeft: 8 }} />
          <input value={activityForm.date} onChange={(event) => setActivityForm({ ...activityForm, date: event.target.value })} style={{ marginLeft: 8 }} />
          <button type="submit" style={{ marginLeft: 8 }}>Enregistrer</button>
        </form>
        <div style={{ marginTop: 12 }}>
          {todayActivities.length ? todayActivities.map((activity) => <p key={activity.id}>{activity.type} — {activity.duration} min</p>) : <p>Aucune activité enregistrée aujourd’hui.</p>}
        </div>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Historique</h2>
        {activities.length ? activities.map((activity) => <p key={activity.id}>{activity.date} — {activity.type} — {activity.duration} min</p>) : <p>Aucun historique.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Alertes</h2>
        {alerts.length ? alerts.map((alert) => <p key={alert.id}>{alert.type}: {alert.message}</p>) : <p>Aucune alerte.</p>}
      </section>
    </div>
  );
}
