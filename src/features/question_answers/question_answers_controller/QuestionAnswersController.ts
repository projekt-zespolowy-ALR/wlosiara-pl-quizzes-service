import {Controller} from "@nestjs/common";

@Controller("/quizzes/:quizId/questions/:questionId/answers")
export default class QuestionAnswersController {
	public constructor() {}
}
