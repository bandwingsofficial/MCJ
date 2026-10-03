import type { BranchAdmittedStudentBlock } from '../../domain/repositories/branch.repository';

export class GetBranchAdmittedStudentBlocksResult {
  constructor(public readonly blocks: BranchAdmittedStudentBlock[]) {}
}
