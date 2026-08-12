// src/modules/branch/domain/repositories/branch.repository.ts

import { Branch } from '../entities/branch.entity';
import { BranchStatus } from '../enums/branch-status.enum';

export interface BranchListFilters {
  status?: BranchStatus;
  search?: string;
  city?: string;
  state?: string;
  country?: string;
  includeDeleted?: boolean;
  skip?: number;
  take?: number;
}

export interface BranchRepository {
  // =====================
  // 💾 PERSISTENCE
  // =====================

  save(branch: Branch): Promise<void>;

  delete(branchId: string): Promise<void>;

  // =====================
  // 🔍 FINDERS
  // =====================

  findById(id: string): Promise<Branch | null>;

  findByBranchCode(
    branchCode: string,
  ): Promise<Branch | null>;

  findAll(
    filters?: BranchListFilters,
  ): Promise<Branch[]>;

  findByIdIncludingDeleted(
  id: string,
): Promise<Branch | null>;

  // =====================
  // ✅ EXISTENCE CHECKS
  // =====================

  existsById(id: string): Promise<boolean>;

  existsByBranchCode(
    branchCode: string,
  ): Promise<boolean>;

  // =====================
  // 🧠 BRANCH OPERATIONS
  // =====================

  updateEmail(
    branchId: string,
    email: string | null,
  ): Promise<void>;

  updatePhone(
    branchId: string,
    phone: string | null,
  ): Promise<void>;

  updateLocation(
    branchId: string,
    params: {
      latitude?: number | null;
      longitude?: number | null;
    },
  ): Promise<void>;

  updateAddress(
    branchId: string,
    params: {
      addressLine1?: string | null;
      addressLine2?: string | null;

      city?: string | null;
      state?: string | null;
      country?: string | null;

      postalCode?: string | null;
    },
  ): Promise<void>;

  updateStatus(
    branchId: string,
    status: BranchStatus,
  ): Promise<void>;
}