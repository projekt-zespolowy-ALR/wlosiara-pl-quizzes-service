import {Module} from "@nestjs/common";
import QuizzesController from "../quizzes_controller/QuizzesController.js";
import QuizzesService from "../quizzes_service/QuizzesService.js";
import QuizEntity from "../quizzes_service/QuizEntity.js";
import {TypeOrmModule} from "@nestjs/typeorm";
import QuizQuestionEntity from "../../quiz_questions/quiz_questions_service/QuizQuestionEntity.js";

@Module({
	imports: [TypeOrmModule.forFeature([QuizEntity, QuizQuestionEntity])],
	controllers: [QuizzesController],
	providers: [QuizzesService],
})
export default class QuizzesModule {
	public constructor() {}
}
