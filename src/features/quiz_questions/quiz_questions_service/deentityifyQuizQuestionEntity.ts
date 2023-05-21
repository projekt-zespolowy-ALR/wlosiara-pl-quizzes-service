import {plainToClass} from "class-transformer";
import Quiz from "../quiz_questions_controller/QuizQuestion.js";
import type QuizQuestionEntity from "./QuizQuestionEntity.js";
import type QuizQuestion from "../quiz_questions_controller/QuizQuestion.js";

export default function deentityifyQuizQuestionEntity(
	quizQuestionEntity: QuizQuestionEntity
): QuizQuestion {
	return plainToClass(Quiz, quizQuestionEntity);
}
