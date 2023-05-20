import {plainToClass} from "class-transformer";
import Quiz from "../quizzes_controller/Quiz.js";
import type QuizEntity from "./QuizEntity.js";

export default function deentityifyQuizEntity(quizEntity: QuizEntity): Quiz {
	return plainToClass(Quiz, quizEntity);
}
