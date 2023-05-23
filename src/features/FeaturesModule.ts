import {Module} from "@nestjs/common";
import QuizzesModule from "./quizzes/quizzes_module/QuizzesModule.js";
import QuizQuestionsModule from "./quiz_questions/quiz_questions_module/QuizQuestionsModule.js";
import QuestionAnswersModule from "./question_answers/question_answers_module/QuestionAnswersModule.js";

@Module({
	imports: [QuizzesModule, QuizQuestionsModule, QuestionAnswersModule],
	controllers: [],
	providers: [],
})
class FeaturesModule {
	public constructor() {}
}

export default FeaturesModule;
