import { describe, it, expect, vi } from 'vitest';
import mongoose from 'mongoose';
import { sessionGuard } from '../../src/middleware/sessionGuard.js';
import { GameSession } from '../../src/models/GameSession.js';
import { GAME_STATUS } from '../../src/utils/constants.js';

describe('sessionGuard Middleware Unit Tests', () => {
  it('should throw 400 when sessionId is missing', async () => {
    const req = { body: {}, params: {}, query: {}, user: { id: 'user1' } };
    const res = {};
    const next = vi.fn();

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(400);
    expect(err.code).toBe('SESSION_ID_REQUIRED');
  });

  it('should throw 404 when session does not exist in DB', async () => {
    const randomId = new mongoose.Types.ObjectId();
    const req = { body: { sessionId: randomId.toString() }, user: { id: 'user1' } };
    const res = {};
    const next = vi.fn();

    vi.spyOn(GameSession, 'findById').mockResolvedValue(null);

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(404);
    expect(err.code).toBe('SESSION_NOT_FOUND');

    vi.restoreAllMocks();
  });

  it('should throw 403 when session belongs to a different player (Anti-IDOR)', async () => {
    const sessionId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();
    const attackerId = new mongoose.Types.ObjectId();

    const req = {
      body: { sessionId: sessionId.toString() },
      user: { id: attackerId.toString() },
    };
    const res = {};
    const next = vi.fn();

    vi.spyOn(GameSession, 'findById').mockResolvedValue({
      _id: sessionId,
      userId: ownerId,
      status: GAME_STATUS.IN_PROGRESS,
    });

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(403);
    expect(err.code).toBe('FORBIDDEN_SESSION_ACCESS');

    vi.restoreAllMocks();
  });

  it('should throw 409 when session is locked in FAILED status', async () => {
    const sessionId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();

    const req = {
      body: { sessionId: sessionId.toString() },
      user: { id: ownerId.toString() },
    };
    const res = {};
    const next = vi.fn();

    vi.spyOn(GameSession, 'findById').mockResolvedValue({
      _id: sessionId,
      userId: ownerId,
      status: GAME_STATUS.FAILED,
    });

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('SESSION_LOCKED');

    vi.restoreAllMocks();
  });

  it('should throw 409 when session is locked in COMPLETED status', async () => {
    const sessionId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();

    const req = {
      body: { sessionId: sessionId.toString() },
      user: { id: ownerId.toString() },
    };
    const res = {};
    const next = vi.fn();

    vi.spyOn(GameSession, 'findById').mockResolvedValue({
      _id: sessionId,
      userId: ownerId,
      status: GAME_STATUS.COMPLETED,
    });

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const err = next.mock.calls[0][0];
    expect(err.statusCode).toBe(409);
    expect(err.code).toBe('SESSION_LOCKED');

    vi.restoreAllMocks();
  });

  it('should attach session and call next() when valid and IN_PROGRESS', async () => {
    const sessionId = new mongoose.Types.ObjectId();
    const ownerId = new mongoose.Types.ObjectId();
    const mockSession = {
      _id: sessionId,
      userId: ownerId,
      status: GAME_STATUS.IN_PROGRESS,
    };

    const req = {
      body: { sessionId: sessionId.toString() },
      user: { id: ownerId.toString() },
    };
    const res = {};
    const next = vi.fn();

    vi.spyOn(GameSession, 'findById').mockResolvedValue(mockSession);

    await sessionGuard(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.gameSession).toBe(mockSession);

    vi.restoreAllMocks();
  });
});
