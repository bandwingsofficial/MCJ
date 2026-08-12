import { Injectable } from '@nestjs/common';

import { Placement } from '../entities/placement.entity';
import {
  PlacementAlreadyExistsException,
  PlacementNotFoundException,
} from '../errors/placement-business.exception';
import type {
  PlacementDetailView,
  PlacementRepository,
} from '../repositories/placement.repository';

@Injectable()
export class PlacementDomainService {
  ensureExists(placement: Placement | null): Placement {
    if (!placement) {
      throw new PlacementNotFoundException();
    }

    return placement;
  }

  ensureDetailExists(
    placement: PlacementDetailView | null,
  ): PlacementDetailView {
    if (!placement) {
      throw new PlacementNotFoundException();
    }

    return placement;
  }

  async ensureApplicationHasNoPlacement(
    repo: PlacementRepository,
    applicationId: string,
  ): Promise<void> {
    if (await repo.existsByApplicationId(applicationId)) {
      throw new PlacementAlreadyExistsException();
    }
  }
}
