import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

const API_URL = 'http://127.0.0.1:3001';

const MEAL_CATEGORY = 'lunch';
const ACTIVITY_TYPES = [
  { value: 'walk', label: 'Marche' },
  { value: 'sport', label: 'Sport' },
  { value: 'bike', label: 'Vélo' },
  { value: 'other', label: 'Autre' }
];
const ALERT_TYPES = [
  { value: 'drink', label: 'Boire' },
  { value: 'walk', label: 'Marcher' },
  { value: 'move', label: 'Bouger' },
  { value: 'snack', label: 'Collation' }
];

function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
}

function ChoiceRow({ options, value, onChange }) {
  return (
    <View style={styles.choiceRow}>
      {options.map((option) => (
        <Pressable
          key={option.value}
          onPress={() => onChange(option.value)}
          style={[styles.choiceChip, value === option.value && styles.choiceChipSelected]}
        >
          <Text style={value === option.value ? styles.choiceChipTextSelected : styles.choiceChipText}>
            {option.label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function Button({ label, onPress, style }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, style]}>
      <Text style={styles.buttonText}>{label}</Text>
    </Pressable>
  );
}

export default function TodayScreen({ pushToken, pushError }) {
  const [meals, setMeals] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [newMealName, setNewMealName] = useState('');
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [activityForm, setActivityForm] = useState({ type: 'walk', duration: '30', intensity: 'moderate' });
  const [selectedDate, setSelectedDate] = useState('2026-07-20');
  const [alertRuleForm, setAlertRuleForm] = useState({ type: 'drink', schedule: '09:00', message: 'Il est temps d’agir' });

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
    if (!newMealName.trim()) return;
    const response = await fetch(`${API_URL}/api/meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newMealName.trim(), category: MEAL_CATEGORY })
    });
    if (response.ok) {
      setNewMealName('');
      loadData();
    }
  };

  const planMeal = async (mealId) => {
    const response = await fetch(`${API_URL}/api/planned-meals`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mealId, date: selectedDate, category: MEAL_CATEGORY })
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

  const saveActivity = async () => {
    const response = await fetch(`${API_URL}/api/activities`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...activityForm, duration: Number(activityForm.duration), date: selectedDate })
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

  const saveAlertRule = async () => {
    const response = await fetch(`${API_URL}/api/alerts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(alertRuleForm)
    });
    if (response.ok) {
      loadData();
    }
  };

  const toggleAlertActive = async (rule) => {
    const response = await fetch(`${API_URL}/api/alerts/${rule.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !rule.active })
    });
    if (response.ok) {
      loadData();
    }
  };

  const triggerAlerts = async () => {
    const response = await fetch(`${API_URL}/api/trigger-alerts`, { method: 'POST' });
    if (response.ok) {
      loadData();
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.h1}>TrackMe</Text>
      <Text style={styles.subtitle}>Vue quotidienne — repas, activité et alertes</Text>

      <View style={styles.dateNav}>
        <Button label="<" onPress={() => changeDay(-1)} />
        <Text style={styles.dateLabel}>{formatDate(selectedDate)}</Text>
        <Button label=">" onPress={() => changeDay(1)} />
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Aujourd’hui</Text>
        <Text>Temps d’activité : {selectedDayMinutes} min</Text>
        <Text>Alertes prévues : {selectedDayAlerts.length}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Repas du jour</Text>
        <View style={styles.inlineForm}>
          <TextInput
            value={newMealName}
            onChangeText={setNewMealName}
            placeholder="Nom du plat"
            style={styles.inputGrow}
          />
          <Button label="Ajouter" onPress={addMeal} />
        </View>
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Rechercher un plat"
          style={styles.input}
        />
        {filteredMeals.length ? filteredMeals.map((meal) => (
          <View key={meal.id} style={styles.card}>
            <Text style={styles.cardTitle}>{meal.name}</Text>
            <Text>{meal.category}</Text>
            <Button label="Planifier" onPress={() => planMeal(meal.id)} style={styles.cardButton} />
          </View>
        )) : <Text>Aucun plat trouvé.</Text>}
        <View style={{ marginTop: 12 }}>
          {selectedDayPlannedMeals.length ? selectedDayPlannedMeals.map((plannedMeal) => (
            <View key={plannedMeal.id} style={styles.card}>
              <Text>État : {plannedMeal.eaten ? 'Mangé' : 'À faire'}</Text>
              <Button label="Basculer" onPress={() => toggleEaten(plannedMeal.id)} style={styles.cardButton} />
            </View>
          )) : <Text>Aucun repas prévu pour ce jour.</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Activité</Text>
        <ChoiceRow
          options={ACTIVITY_TYPES}
          value={activityForm.type}
          onChange={(type) => setActivityForm({ ...activityForm, type })}
        />
        <View style={styles.inlineForm}>
          <TextInput
            value={activityForm.duration}
            onChangeText={(duration) => setActivityForm({ ...activityForm, duration })}
            keyboardType="numeric"
            placeholder="Durée (min)"
            style={styles.inputGrow}
          />
          <Button label="Enregistrer" onPress={saveActivity} />
        </View>
        <View style={{ marginTop: 12 }}>
          {selectedDayActivities.length ? selectedDayActivities.map((activity) => (
            <Text key={activity.id}>{activity.type} — {activity.duration} min</Text>
          )) : <Text>Aucune activité enregistrée ce jour.</Text>}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Alertes du jour</Text>
        {selectedDayAlerts.length ? selectedDayAlerts.map((alert) => (
          <Text key={alert.id}>{alert.type} — {alert.schedule} — {alert.message}</Text>
        )) : <Text>Aucune alerte prévue.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Administration — Règles d’alerte</Text>
        <ChoiceRow
          options={ALERT_TYPES}
          value={alertRuleForm.type}
          onChange={(type) => setAlertRuleForm({ ...alertRuleForm, type })}
        />
        <TextInput
          value={alertRuleForm.schedule}
          onChangeText={(schedule) => setAlertRuleForm({ ...alertRuleForm, schedule })}
          placeholder="Horaire (HH:mm)"
          style={styles.input}
        />
        <TextInput
          value={alertRuleForm.message}
          onChangeText={(message) => setAlertRuleForm({ ...alertRuleForm, message })}
          placeholder="Message"
          style={styles.input}
        />
        <Button label="Créer" onPress={saveAlertRule} style={{ marginTop: 8 }} />
        <View style={{ marginTop: 12 }}>
          {alerts.length ? alerts.map((alert) => (
            <View key={alert.id} style={styles.card}>
              <Text>{alert.type} — {alert.schedule} — {alert.message}</Text>
              <Text>État : {alert.active ? 'Active' : 'Désactivée'}</Text>
              <Button
                label={alert.active ? 'Désactiver' : 'Activer'}
                onPress={() => toggleAlertActive(alert)}
                style={styles.cardButton}
              />
            </View>
          )) : <Text>Aucune règle d’alerte.</Text>}
        </View>
        <Button label="Déclencher les alertes" onPress={triggerAlerts} style={{ marginTop: 12 }} />
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Historique des alertes</Text>
        {alertHistory.length ? alertHistory.map((entry) => (
          <Text key={entry.id}>{entry.type} : {entry.message}</Text>
        )) : <Text>Aucun historique.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Notifications push</Text>
        {pushToken ? (
          <Text style={styles.pushStatus}>Appareil enregistré : {pushToken}</Text>
        ) : (
          <Text style={styles.pushStatus}>{pushError || 'Enregistrement en cours…'}</Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  content: {
    padding: 24,
    paddingBottom: 48
  },
  h1: {
    fontSize: 24,
    fontWeight: 'bold'
  },
  subtitle: {
    marginTop: 4,
    color: '#555'
  },
  h2: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12
  },
  dateLabel: {
    fontWeight: 'bold'
  },
  section: {
    marginTop: 24
  },
  inlineForm: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginTop: 8
  },
  inputGrow: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginTop: 8
  },
  cardTitle: {
    fontWeight: 'bold'
  },
  cardButton: {
    marginTop: 8,
    alignSelf: 'flex-start'
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 8,
    paddingHorizontal: 14
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600'
  },
  choiceRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4
  },
  choiceChip: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12
  },
  choiceChipSelected: {
    backgroundColor: '#2563eb',
    borderColor: '#2563eb'
  },
  choiceChipText: {
    color: '#333'
  },
  choiceChipTextSelected: {
    color: '#fff',
    fontWeight: '600'
  },
  pushStatus: {
    color: '#555',
    fontSize: 12
  }
});
