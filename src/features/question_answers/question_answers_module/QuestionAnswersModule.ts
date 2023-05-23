import {Module} from "@nestjs/common";
import QuestionAnswersController from "../question_answers_controller/QuestionAnswersController.js";
import QuestionAnswersService from "../question_answers_service/QuestionAnswersService.js";
@Module({
	imports: [],
	controllers: [QuestionAnswersController],
	providers: [QuestionAnswersService],
})
export default class QuestionAnswersModule {
	public constructor() {}
}
