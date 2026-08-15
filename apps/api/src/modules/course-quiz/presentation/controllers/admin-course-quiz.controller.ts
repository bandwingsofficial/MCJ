import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { CurrentUser } from '@common/decorators/current-user.decorator';
import type { AuthUser } from '@common/decorators/current-user.decorator';
import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { CreateQuizCommand } from '../../application/create-quiz/create-quiz.command';
import { CreateQuizHandler } from '../../application/create-quiz/create-quiz.handler';
import { DeleteQuizCommand } from '../../application/delete-quiz/delete-quiz.command';
import { DeleteQuizHandler } from '../../application/delete-quiz/delete-quiz.handler';
import { GetQuizHandler } from '../../application/get-quiz/get-quiz.handler';
import { GetQuizQuery } from '../../application/get-quiz/get-quiz.query';
import { ListCourseQuizzesHandler } from '../../application/list-course-quizzes/list-course-quizzes.handler';
import { ListCourseQuizzesQuery } from '../../application/list-course-quizzes/list-course-quizzes.query';
import { PublishQuizCommand } from '../../application/publish-quiz/publish-quiz.command';
import { PublishQuizHandler } from '../../application/publish-quiz/publish-quiz.handler';
import { CreateQuestionCommand } from '../../application/create-question/create-question.command';
import { CreateQuestionHandler } from '../../application/create-question/create-question.handler';
import { ReorderQuestionsCommand } from '../../application/reorder-questions/reorder-questions.command';
import { ReorderQuestionsHandler } from '../../application/reorder-questions/reorder-questions.handler';
import { UpdateQuizCommand } from '../../application/update-quiz/update-quiz.command';
import { UpdateQuizHandler } from '../../application/update-quiz/update-quiz.handler';
import { CreateCourseQuizDto } from '../dtos/create-course-quiz.dto';
import { CreateCourseQuizQuestionDto } from '../dtos/create-course-quiz-question.dto';
import { ListCourseQuizzesQueryDto } from '../dtos/list-course-quizzes-query.dto';
import { ReorderCourseQuizQuestionsDto } from '../dtos/reorder-course-quiz-questions.dto';
import { UpdateCourseQuizDto } from '../dtos/update-course-quiz.dto';

@ApiTags('Admin Course Quizzes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-quizzes')
export class AdminCourseQuizController {
  constructor(
    private readonly createQuizHandler: CreateQuizHandler,
    private readonly listCourseQuizzesHandler: ListCourseQuizzesHandler,
    private readonly getQuizHandler: GetQuizHandler,
    private readonly updateQuizHandler: UpdateQuizHandler,
    private readonly deleteQuizHandler: DeleteQuizHandler,
    private readonly publishQuizHandler: PublishQuizHandler,
    private readonly createQuestionHandler: CreateQuestionHandler,
    private readonly reorderQuestionsHandler: ReorderQuestionsHandler,
  ) {}

  @Post()
  async create(
    @Body() dto: CreateCourseQuizDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.createQuizHandler.execute(
      new CreateQuizCommand(
        dto.lessonId,
        dto.title,
        dto.description,
        dto.passingScore,
        dto.timeLimitMinutes,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course quiz created successfully',
      data: result,
    };
  }

  @Get()
  async list(@Query() query: ListCourseQuizzesQueryDto) {
    const result = await this.listCourseQuizzesHandler.execute(
      new ListCourseQuizzesQuery(
        query.lessonId,
        query.includeDeleted,
      ),
    );

    return {
      success: true,
      message: 'Course quizzes fetched successfully',
      data: result,
    };
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    const result = await this.getQuizHandler.execute(
      new GetQuizQuery(id, undefined, false, true),
    );

    return {
      success: true,
      message: 'Course quiz fetched successfully',
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseQuizDto,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.updateQuizHandler.execute(
      new UpdateQuizCommand(
        id,
        dto.title,
        dto.description,
        dto.passingScore,
        dto.timeLimitMinutes,
        dto.displayOrder,
        user?.sub,
      ),
    );

    return {
      success: true,
      message: 'Course quiz updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteQuizHandler.execute(
      new DeleteQuizCommand(id),
    );

    return {
      success: true,
      message: 'Course quiz deleted successfully',
      data: result,
    };
  }

  @Patch(':id/publish')
  async publish(
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ) {
    const result = await this.publishQuizHandler.execute(
      new PublishQuizCommand(id, user?.sub),
    );

    return {
      success: true,
      message: 'Course quiz published successfully',
      data: result,
    };
  }

  @Post(':id/questions')
  async createQuestion(
    @Param('id') id: string,
    @Body() dto: CreateCourseQuizQuestionDto,
  ) {
    const result = await this.createQuestionHandler.execute(
      new CreateQuestionCommand(
        id,
        dto.questionText,
        dto.type,
        dto.explanation,
        dto.points,
        dto.options,
      ),
    );

    return {
      success: true,
      message: 'Course quiz question created successfully',
      data: result,
    };
  }

  @Patch(':id/questions/reorder')
  async reorderQuestions(
    @Param('id') id: string,
    @Body() dto: ReorderCourseQuizQuestionsDto,
  ) {
    const result = await this.reorderQuestionsHandler.execute(
      new ReorderQuestionsCommand(id, dto.questionIds),
    );

    return {
      success: true,
      message: 'Course quiz questions reordered successfully',
      data: result,
    };
  }
}
