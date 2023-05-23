import type CreateQuestionAnswerRequestBody from "./CreateQuestionAnswerRequestBody.js";
import CreateQuestionAnswerPayload from "../question_answers_service/CreateQuestionAnswerPayload.js";
import {plainToClass} from "class-transformer";

export default function payloadifyCreateQuestionAnswerRequestBody(
	createQuestionAnswerRequestBody: CreateQuestionAnswerRequestBody
): CreateQuestionAnswerPayload {
	return plainToClass(CreateQuestionAnswerPayload, createQuestionAnswerRequestBody);
}
