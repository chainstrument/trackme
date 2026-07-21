import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import * as ActivitiesRepo from '../lib/activitiesRepository';
import * as AlertRulesRepo from '../lib/alertRulesRepository';
import * as MealsRepo from '../lib/mealsRepository';

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
const TRIGGER_TYPES = [
  { value: 'fixed', label: 'Horaire fixe' },
  { value: 'interval', label: 'Récurrence' }
];
const INTERVAL_PRESETS = [
  { value: '30', label: '30 min' },
  { value: '60', label: '1 h' },
  { value: '120', label: '2 h' },
  { value: '240', label: '4 h' }
];

function describeSchedule(alert) {
  return alert.trigger_type === 'interval' ? `toutes les ${alert.interval_minutes} min` : alert.schedule;
}

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

export default function TodayScreen({ notificationsGranted }) {
  const [meals, setMeals] = useState([]);
  const [plannedMeals, setPlannedMeals] = useState([]);
  const [search, setSearch] = useState('');
  const [newMealName, setNewMealName] = useState('');
  const [activities, setActivities] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [alertHistory, setAlertHistory] = useState([]);
  const [activityForm, setActivityForm] = useState({ type: 'walk', duration: '30', intensity: 'moderate' });
  const [selectedDate, setSelectedDate] = useState('2026-07-20');
  const [alertRuleForm, setAlertRuleForm] = useState({
    type: 'drink',
    triggerType: 'fixed',
    schedule: '09:00',
    intervalMinutes: '60',
    message: 'Il est temps d’agir'
  });

  const loadData = async () => {
    const [localMeals, localPlannedMeals, localActivities, localAlerts, localAlertHistory] = await Promise.all([
      MealsRepo.listMeals(),
      MealsRepo.listPlannedMeals(),
      ActivitiesRepo.listActivities(),
      AlertRulesRepo.listAlertRules(),
      AlertRulesRepo.listAlertHistory()
    ]);
    setMeals(localMeals);
    setPlannedMeals(localPlannedMeals);
    setActivities(localActivities);
    setAlerts(localAlerts);
    setAlertHistory(localAlertHistory);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeals = meals.filter((meal) => meal.name.toLowerCase().includes(search.toLowerCase()));
  const selectedDayPlannedMeals = plannedMeals.filter((plannedMeal) => plannedMeal.date === selectedDate);
  const selectedDayActivities = activities.filter((activity) => activity.date === selectedDate);
  const selectedDayMinutes = selectedDayActivities.reduce((sum, activity) => sum + Number(activity.duration || 0), 0);
  const selectedDayAlerts = alerts.filter((alert) => alert.active);

  const addMeal = async () => {
    if (!newMealName.trim()) return;
    await MealsRepo.createMeal({ name: newMealName.trim(), category: MEAL_CATEGORY });
    setNewMealName('');
    loadData();
  };

  const planMeal = async (mealId) => {
    await MealsRepo.planMeal({ mealId, date: selectedDate, category: MEAL_CATEGORY });
    loadData();
  };

  const toggleEaten = async (plannedMealId) => {
    await MealsRepo.toggleEaten(plannedMealId);
    loadData();
  };

  const saveActivity = async () => {
    await ActivitiesRepo.createActivity({
      ...activityForm,
      duration: Number(activityForm.duration),
      date: selectedDate
    });
    loadData();
  };

  const changeDay = (direction) => {
    const currentDate = new Date(`${selectedDate}T00:00:00`);
    currentDate.setDate(currentDate.getDate() + direction);
    setSelectedDate(currentDate.toISOString().slice(0, 10));
  };

  const saveAlertRule = async () => {
    await AlertRulesRepo.createAlertRule({
      type: alertRuleForm.type,
      message: alertRuleForm.message,
      triggerType: alertRuleForm.triggerType,
      schedule: alertRuleForm.schedule,
      intervalMinutes: Number(alertRuleForm.intervalMinutes)
    });
    loadData();
  };

  const toggleAlertActive = async (rule) => {
    await AlertRulesRepo.setAlertRuleActive(rule.id, !rule.active);
    loadData();
  };

  const triggerAlerts = async () => {
    await AlertRulesRepo.triggerAlertsNow();
    loadData();
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
          <Text key={alert.id}>{alert.type} — {describeSchedule(alert)} — {alert.message}</Text>
        )) : <Text>Aucune alerte prévue.</Text>}
      </View>

      <View style={styles.section}>
        <Text style={styles.h2}>Administration — Règles d’alerte</Text>
        <ChoiceRow
          options={ALERT_TYPES}
          value={alertRuleForm.type}
          onChange={(type) => setAlertRuleForm({ ...alertRuleForm, type })}
        />
        <ChoiceRow
          options={TRIGGER_TYPES}
          value={alertRuleForm.triggerType}
          onChange={(triggerType) => setAlertRuleForm({ ...alertRuleForm, triggerType })}
        />
        {alertRuleForm.triggerType === 'fixed' ? (
          <TextInput
            value={alertRuleForm.schedule}
            onChangeText={(schedule) => setAlertRuleForm({ ...alertRuleForm, schedule })}
            placeholder="Horaire (HH:mm)"
            style={styles.input}
          />
        ) : (
          <>
            <ChoiceRow
              options={INTERVAL_PRESETS}
              value={alertRuleForm.intervalMinutes}
              onChange={(intervalMinutes) => setAlertRuleForm({ ...alertRuleForm, intervalMinutes })}
            />
            <TextInput
              value={alertRuleForm.intervalMinutes}
              onChangeText={(intervalMinutes) => setAlertRuleForm({ ...alertRuleForm, intervalMinutes })}
              keyboardType="numeric"
              placeholder="Intervalle (minutes)"
              style={styles.input}
            />
          </>
        )}
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
              <Text>{alert.type} — {describeSchedule(alert)} — {alert.message}</Text>
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
        <Text style={styles.h2}>Notifications</Text>
        <Text style={styles.pushStatus}>
          {notificationsGranted === null && 'Vérification de la permission…'}
          {notificationsGranted === true && 'Autorisées — les alertes se déclencheront sur cet appareil.'}
          {notificationsGranted === false && 'Refusées — active les notifications dans les réglages du téléphone pour recevoir les alertes.'}
        </Text>
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
