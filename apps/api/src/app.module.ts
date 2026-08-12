import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthModule } from './modules/auth/auth.module';
import { BatchModule } from './modules/batch/batch.module';
import { BranchModule } from './modules/branch/branch.module';
import { BranchUserModule } from './modules/branch-user/branch-user.module';
import { CategoryModule } from './modules/category/category.module';
import { CourseModule } from './modules/course/course.module';
import { CommunityPostCommentModule } from './modules/community-post-comment/community-post-comment.module';
import { CommunityPostLikeModule } from './modules/community-post-like/community-post-like.module';
import { CommunityPostModule } from './modules/community-post/community-post.module';
import { CourseModuleModule } from './modules/course-module/course-module.module';
import { CourseLessonModule } from './modules/course-lesson/course-lesson.module';
import { CourseResourceModule } from './modules/course-resource/course-resource.module';
import { EnrollmentModule } from './modules/enrollment/enrollment.module';
import { UploadsModule } from './modules/uploads/uploads.module';
import { FinancialArticleModule } from './modules/financial-article/financial-article.module';
import { JobModule } from './modules/job/job.module';
import { JobApplicationModule } from './modules/job-application/job-application.module';
import { PaymentModule } from './modules/payment/payment.module';
import { PlacementModule } from './modules/placement/placement.module';
import { ProfileModule } from './modules/profile/profile.module';
import { StudentModule } from './modules/student/student.module';
import { StudentPortalModule } from './modules/student-portal/student-portal.module';
import { TrainerModule } from './modules/trainer/trainer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    ProfileModule,
    BranchModule,
    BranchUserModule,
    UploadsModule,
    CategoryModule,
    CourseModule,
    CourseModuleModule,
    CourseLessonModule,
    CourseResourceModule,
    TrainerModule,
    BatchModule,
    StudentModule,
    EnrollmentModule,
    PaymentModule,
    FinancialArticleModule,
    StudentPortalModule,
    JobModule,
    JobApplicationModule,
    PlacementModule,
    CommunityPostModule,
    CommunityPostLikeModule,
    CommunityPostCommentModule,
  ],
})
export class AppModule {}
