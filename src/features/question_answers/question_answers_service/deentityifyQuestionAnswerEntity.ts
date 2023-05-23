import {plainToInstance} from "class-transformer";
import type QuestionAnswerEntity from "./QuestionAnswerEntity.js";
import QuestionAnswer from "../question_answers_controller/QuestionAnswer.js";

export default function deentityifyQuestionAnswerEntity(
	questionAnswerEntity: QuestionAnswerEntity
): QuestionAnswer {
	return plainToInstance(QuestionAnswer, questionAnswerEntity);
}
