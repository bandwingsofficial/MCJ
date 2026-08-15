import {
  Body,
  Controller,
  Delete,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

import { SuperAdminGuard } from '@common/guards/super-admin.guard';
import { JwtAuthGuard } from '@modules/auth/presentation/guards/jwt-auth.guard';

import { DeleteQuestionCommand } from '../../application/delete-question/delete-question.command';
import { DeleteQuestionHandler } from '../../application/delete-question/delete-question.handler';
import { UpdateQuestionCommand } from '../../application/update-question/update-question.command';
import { UpdateQuestionHandler } from '../../application/update-question/update-question.handler';
import { UpdateCourseQuizQuestionDto } from '../dtos/update-course-quiz-question.dto';

@ApiTags('Admin Course Quiz Questions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, SuperAdminGuard)
@Controller('admin/course-quiz-questions')
export class AdminCourseQuizQuestionController {
  constructor(
    private readonly updateQuestionHandler: UpdateQuestionHandler,
    private readonly deleteQuestionHandler: DeleteQuestionHandler,
  ) {}

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCourseQuizQuestionDto,
  ) {
    const result = await this.updateQuestionHandler.execute(
      new UpdateQuestionCommand(
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
      message: 'Course quiz question updated successfully',
      data: result,
    };
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    const result = await this.deleteQuestionHandler.execute(
      new DeleteQuestionCommand(id),
    );

    return {
      success: true,
      message: 'Course quiz question deleted successfully',
      data: result,
    };
  }
}
