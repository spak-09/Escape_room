import { describe, it, expect, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connectDB, disconnectDB } from '../../src/config/db.js';

describe('MongoDB Connection Architecture', () => {
  afterAll(async () => {
    await disconnectDB();
  });

  it('should connect successfully to the local MongoDB database and disconnect cleanly', async () => {
    await connectDB();
    expect(mongoose.connection.readyState).toBe(1); // 1 = connected

    await disconnectDB();
    expect(mongoose.connection.readyState).toBe(0); // 0 = disconnected
  });
});
