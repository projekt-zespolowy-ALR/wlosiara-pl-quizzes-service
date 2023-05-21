import {plainToInstance} from "class-transformer";
import type QuizQuestionEntity from "./QuizQuestionEntity.js";
import QuizQuestion from "../quiz_questions_controller/QuizQuestion.js";

export default function deentityifyQuizQuestionEntity(
	quizQuestionEntity: QuizQuestionEntity
): QuizQuestion {
	return plainToInstance(QuizQuestion, quizQuestionEntity);
}
