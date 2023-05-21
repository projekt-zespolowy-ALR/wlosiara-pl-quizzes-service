import {Module} from "@nestjs/common";
import {TypeOrmModule} from "@nestjs/typeorm";
import QuizQuestionEntity from "../quiz_questions_service/QuizQuestionEntity.js";
import QuizQuestionsController from "../quiz_questions_controller/QuizQuestionsController.js";
import QuizQuestionsService from "../quiz_questions_service/QuizQuestionsService.js";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";
@Module({
	imports: [TypeOrmModule.forFeature([QuizEntity, QuizQuestionEntity])],
	controllers: [QuizQuestionsController],
	providers: [QuizQuestionsService],
})
export default class QuizQuestionsModule {
	public constructor() {}
}
