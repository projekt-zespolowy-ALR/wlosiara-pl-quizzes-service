import {Module} from "@nestjs/common";
import QuizzesModule from "./quizzes/quizzes_module/QuizzesModule.js";
import QuizQuestionsModule from "./quiz_questions/quiz_questions_module/QuizQuestionsModule.js";

@Module({
	imports: [QuizzesModule, QuizQuestionsModule],
	controllers: [],
	providers: [],
})
class FeaturesModule {
	public constructor() {}
}

export default FeaturesModule;
