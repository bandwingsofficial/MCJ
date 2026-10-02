export type CourseDeleteBlockingBatch = {
  batchId: string;
  batchName: string;
  lifecycleStatus: 'UPCOMING' | 'ONGOING';
};
