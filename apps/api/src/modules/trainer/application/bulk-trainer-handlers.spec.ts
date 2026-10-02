import { Trainer } from '../domain/entities/trainer.entity';
import { TrainerStatus } from '../domain/enums/trainer-status.enum';

import { BulkDeleteTrainersHandler } from './bulk-delete-trainers/bulk-delete-trainers.handler';
import { BulkDeleteTrainersCommand } from './bulk-delete-trainers/bulk-delete-trainers.command';

import { BulkUpdateTrainerStatusHandler } from './bulk-update-trainer-status/bulk-update-trainer-status.handler';
import { BulkUpdateTrainerStatusCommand } from './bulk-update-trainer-status/bulk-update-trainer-status.command';

const makeTrainer = (params: {
  id: string;
  status?: TrainerStatus;
  displayOrder?: number | null;
}) =>
  Trainer.create({
    id: params.id,
    firstName: 'Trainer',
    lastName: params.id,
    email: `${params.id}@example.com`,
    status: params.status ?? TrainerStatus.ACTIVE,
    displayOrder: params.displayOrder ?? null,
  });

describe('Bulk trainer handlers', () => {
  describe('BulkUpdateTrainerStatusHandler', () => {
    it('blocks bulk deactivation atomically when any trainer has branch assignments', async () => {
      const blocked = makeTrainer({
        id: 'blocked',
        status: TrainerStatus.ACTIVE,
        displayOrder: 2,
      });
      const clear = makeTrainer({
        id: 'clear',
        status: TrainerStatus.ACTIVE,
        displayOrder: 1,
      });

      const trainerRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'blocked') {
              return blocked;
            }
            if (id === 'clear') {
              return clear;
            }
            return null;
          }),
        countBranchAssignments: jest
          .fn()
          .mockImplementation(async (id: string) =>
            id === 'blocked' ? 1 : 0,
          ),
        findBranchAssignmentNames: jest
          .fn()
          .mockResolvedValue(['Branch A']),
        closeDisplayOrderGap: jest.fn(),
        save: jest.fn(),
        getMaxActiveDisplayOrder: jest.fn(),
      };

      const handler = new BulkUpdateTrainerStatusHandler(
        trainerRepo as never,
      );

      const result = await handler.execute(
        new BulkUpdateTrainerStatusCommand(
          ['blocked', 'clear'],
          TrainerStatus.INACTIVE,
        ),
      );

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(trainerRepo.save).not.toHaveBeenCalled();
      expect(blocked.status).toBe(TrainerStatus.ACTIVE);
      expect(clear.status).toBe(TrainerStatus.ACTIVE);
    });
  });

  describe('BulkDeleteTrainersHandler', () => {
    it('blocks bulk archive atomically when any trainer has branch assignments', async () => {
      const blocked = makeTrainer({ id: 'blocked', displayOrder: 2 });
      const clear = makeTrainer({ id: 'clear', displayOrder: 1 });

      const trainerRepo = {
        findByIdIncludingDeleted: jest
          .fn()
          .mockImplementation(async (id: string) => {
            if (id === 'blocked') {
              return blocked;
            }
            if (id === 'clear') {
              return clear;
            }
            return null;
          }),
        countBranchAssignments: jest
          .fn()
          .mockImplementation(async (id: string) =>
            id === 'blocked' ? 2 : 0,
          ),
        findBranchAssignmentNames: jest
          .fn()
          .mockResolvedValue(['Branch A', 'Branch B']),
        closeDisplayOrderGap: jest.fn(),
        save: jest.fn(),
      };

      const handler = new BulkDeleteTrainersHandler(trainerRepo as never);

      const result = await handler.execute(
        new BulkDeleteTrainersCommand(['blocked', 'clear']),
      );

      expect(result.successCount).toBe(0);
      expect(result.failedCount).toBe(2);
      expect(trainerRepo.save).not.toHaveBeenCalled();
      expect(blocked.isDeleted).toBe(false);
      expect(clear.isDeleted).toBe(false);
    });
  });
});
