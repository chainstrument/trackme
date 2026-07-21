import test from 'node:test';
import assert from 'node:assert/strict';
import { createAlertRule, startScheduler, stopScheduler } from '../src/alertStore.js';

test('startScheduler calls onTriggered with due alerts', (t) => {
  t.mock.timers.enable({ apis: ['setInterval', 'Date'] });
  t.mock.timers.setTime(new Date('2026-07-21T08:00:00').getTime());
  t.after(() => {
    stopScheduler();
    t.mock.timers.reset();
  });

  const rule = createAlertRule({ type: 'walk', schedule: '08:00', message: 'Va marcher' });

  const triggeredBatches = [];
  startScheduler(1000, (triggered) => triggeredBatches.push(triggered));

  t.mock.timers.tick(1000);

  assert.equal(triggeredBatches.length, 1);
  assert.equal(triggeredBatches[0].length, 1);
  assert.equal(triggeredBatches[0][0].ruleId, rule.id);
});
