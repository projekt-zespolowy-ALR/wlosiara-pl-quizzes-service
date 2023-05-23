import {Module} from "@nestjs/common";
import QuestionAnswersController from "../question_answers_controller/QuestionAnswersController.js";
import QuestionAnswersService from "../question_answers_service/QuestionAnswersService.js";
import QuestionAnswerEntity from "../question_answers_service/QuestionAnswerEntity.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";
import QuizQuestionEntity from "../../quiz_questions/quiz_questions_service/QuizQuestionEntity.js";
@Module({
	imports: [TypeOrmModule.forFeature([QuizEntity, QuizQuestionEntity, QuestionAnswerEntity])],
	controllers: [QuestionAnswersController],
	providers: [QuestionAnswersService],
})
export default class QuestionAnswersModule {
	public constructor() {}
}
