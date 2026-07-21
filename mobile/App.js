import React, { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:3001';

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

export default function App() {
  const [meals, setMeals] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [activityForm, setActivityForm] = useState({ type: 'walk', duration: 30, intensity: 'moderate', date: '2026-07-20' });
  const [selectedDate, setSelectedDate] = useState('2026-07-20');

  const loadData = async () => {
    const [mealsRes, plannedRes, activitiesRes, alertsRes, historyRes] = await Promise.all([
      fetch(`${API_URL}/api/meals`),
      fetch(`${API_URL}/api/planned-meals`),
      fetch(`${API_URL}/api/activities`),
      fetch(`${API_URL}/api/alerts`),
      fetch(`${API_URL}/api/alert-history`)
    ]);
    setMeals(await mealsRes.json());
    setPlannedMeals(await plannedRes.json());
    setActivities(await activitiesRes.json());
    setAlerts(await alertsRes.json());
    setAlertHistory(await historyRes.json());
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeals = meals.filter((meal) => meal.name.toLowerCase().includes(search.toLowerCase()));
  const selectedDayPlannedMeals = plannedMeals.filter((plannedMeal) => plannedMeal.date === selectedDate);
  const selectedDayActivities = activities.filter((activity) => activity.date === selectedDate);
  const selectedDayMinutes = selectedDayActivities.reduce((sum, activity) => sum + Number(activity.duration || 0), 0);
  const selectedDayAlerts = alerts.filter((alert) => alert.schedule);

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
      body: JSON.stringify({ mealId, date: selectedDate, category: 'lunch' })
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
      body: JSON.stringify({ ...activityForm, date: selectedDate })
    });
    if (response.ok) {
      loadData();
    }
  };

  const changeDay = (direction) => {
    const currentDate = new Date(`${selectedDate}T00:00:00`);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().slice(0, 10));
  };

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 760, margin: '0 auto' }}>
      <h1>TrackMe</h1>
      <p>Vue quotidienne — repas, activité et alertes</p>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12 }}>
        <button onClick={() => changeDay(-1)}>{'<'}</button>
        <strong>{formatDate(selectedDate)}</strong>
        <button onClick={() => changeDay(1)}>{'>'}</button>
      </div>
      <section style={{ marginTop: 24 }}>
        <h2>Aujourd’hui</h2>
        <p>Temps d’activité : {selectedDayMinutes} min</p>
        <p>Alertes prévues : {selectedDayAlerts.length}</p>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Repas du jour</h2>
        <button onClick={addMeal} style={{ marginBottom: 12 }}>Ajouter un plat</button>
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un plat" style={{ width: '100%', padding: 8 }} />
        {filteredMeals.length ? filteredMeals.map((meal) => (
          <div key={meal.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 8 }}>
            <strong>{meal.name}</strong>
            <div>{meal.category}</div>
            <button onClick={() => planMeal(meal.id)} style={{ marginTop: 8 }}>Planifier</button>
          </div>
        )) : <p>Aucun plat trouvé.</p>}
        <div style={{ marginTop: 12 }}>
          {selectedDayPlannedMeals.length ? selectedDayPlannedMeals.map((plannedMeal) => (
            <div key={plannedMeal.id} style={{ border: '1px solid #ddd', padding: 12, marginTop: 8 }}>
              <div>État: {plannedMeal.eaten ? 'Mangé' : 'À faire'}</div>
              <button onClick={() => toggleEaten(plannedMeal.id)} style={{ marginTop: 8 }}>Basculer</button>
            </div>
          )) : <p>Aucun repas prévu pour ce jour.</p>}
        </div>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Activité</h2>
        <form onSubmit={saveActivity}>
          <select value={activityForm.type} onChange={(event) => setActivityForm({ ...activityForm, type: event.target.value })}>
            <option value="walk">Marche</option>
            <option value="sport">Sport</option>
            <option value="bike">Vélo</option>
            <option value="other">Autre</option>
          </select>
          <input type="number" value={activityForm.duration} onChange={(event) => setActivityForm({ ...activityForm, duration: Number(event.target.value) })} style={{ marginLeft: 8 }} />
          <button type="submit" style={{ marginLeft: 8 }}>Enregistrer</button>
        </form>
        <div style={{ marginTop: 12 }}>
          {selectedDayActivities.length ? selectedDayActivities.map((activity) => <p key={activity.id}>{activity.type} — {activity.duration} min</p>) : <p>Aucune activité enregistrée ce jour.</p>}
        </div>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Alertes du jour</h2>
        {selectedDayAlerts.length ? selectedDayAlerts.map((alert) => <p key={alert.id}>{alert.type} — {alert.schedule} — {alert.message}</p>) : <p>Aucune alerte prévue.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Historique des alertes</h2>
        {alertHistory.length ? alertHistory.map((entry) => <p key={entry.id}>{entry.type}: {entry.message}</p>) : <p>Aucun historique.</p>}
      </section>
    </div>
  );
}
