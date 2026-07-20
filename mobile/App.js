import React, { useEffect, useState } from 'react';

const API_URL = 'http://127.0.0.1:3001';

export default function App() {
  const [meals, setMeals] = useState([]);
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [mealsRes, activitiesRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/api/meals`),
        fetch(`${API_URL}/api/activities`),
        fetch(`${API_URL}/api/alerts`)
      ]);
      setMeals(await mealsRes.json());
      setActivities(await activitiesRes.json());
      setAlerts(await alertsRes.json());
    };

    load();
  }, []);

  return (
    <div style={{ fontFamily: 'sans-serif', padding: 24, maxWidth: 720, margin: '0 auto' }}>
      <h1>TrackMe</h1>
      <p>Vue quotidienne de démarrage</p>
      <section style={{ marginTop: 24 }}>
        <h2>Repas du jour</h2>
        {meals.length ? meals.map((meal) => <p key={meal.id}>{meal.name}</p>) : <p>Aucun repas planifié.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Activités</h2>
        {activities.length ? activities.map((activity) => <p key={activity.id}>{activity.type} — {activity.duration} min</p>) : <p>Aucune activité enregistrée.</p>}
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Alertes</h2>
        {alerts.length ? alerts.map((alert) => <p key={alert.id}>{alert.type}: {alert.message}</p>) : <p>Aucune alerte.</p>}
      </section>
    </div>
  );
}
