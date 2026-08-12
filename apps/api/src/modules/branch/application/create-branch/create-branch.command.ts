// src/modules/branch/application/create-branch/create-branch.command.ts

import { BranchStatus } from '../../domain/enums/branch-status.enum';

export class CreateBranchCommand {
  constructor(
    // 🏢 branch info
    public readonly branchName: string,

    public readonly branchCode: string,

    // 📧 contact
    public readonly email?: string,
    public readonly phone?: string,

    // 📍 address
    public readonly addressLine1?: string,
    public readonly addressLine2?: string,

    public readonly city?: string,
    public readonly state?: string,
    public readonly country?: string,

    public readonly postalCode?: string,

    // 🌍 geo location
    public readonly latitude?: number,
    public readonly longitude?: number,

    // ⚙️ status
    public readonly status?: BranchStatus,

    // 🧠 extras
    public readonly description?: string,
  ) {}
}