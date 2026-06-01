import { describe, it, expect } from 'vitest';
import DailyRecord from './DailyRecord';
import mongoose from 'mongoose';

describe('DailyRecord Model Schema', () => {
  it('should validate correctly with valid fields', () => {
    const validRecord = new DailyRecord({
      date: '2026-06-01',
      userId: new mongoose.Types.ObjectId(),
      steps: 8500,
      habits: {
        noFastFood: true,
        hitGym: true,
        noAlcohol: false,
        socialMediaDetox: true,
        learnStudy: true,
        noSugar: false,
        drinkWater: 2.5,
      },
      dailyTotalPoints: 7,
      notes: 'Super active day!',
    });

    const validationError = validRecord.validateSync();
    expect(validationError).toBeUndefined();
  });

  it('should populate default values properly', () => {
    const defaultRecord = new DailyRecord({
      date: '2026-06-01',
      userId: new mongoose.Types.ObjectId(),
    });

    // Check defaults
    expect(defaultRecord.steps).toBe(0);
    expect(defaultRecord.stepPoints).toBe(0);
    expect(defaultRecord.dailyTotalPoints).toBe(0);
    expect(defaultRecord.habits.noFastFood).toBe(false);
    expect(defaultRecord.habits.hitGym).toBe(false);
    expect(defaultRecord.habits.drinkWater).toBe(0);
  });

  it('should fail validation if required fields are missing', () => {
    const missingRecord = new DailyRecord({}); // Missing date and userId
    const validationError = missingRecord.validateSync();

    expect(validationError).toBeDefined();
    
    const errors = validationError?.errors;
    expect(errors?.date).toBeDefined();
    expect(errors?.userId).toBeDefined();
  });
});
