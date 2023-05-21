import type CreateQuizQuestionRequestBody from "./CreateQuizQuestionRequestBody.js";
import CreateQuizQuestionPayload from "../quiz_questions_service/CreateQuizQuestionPayload.js";
import {plainToClass} from "class-transformer";

export default function payloadifyCreateQuizQuestionRequestBody(
	createQuizQuestionRequestBody: CreateQuizQuestionRequestBody
): CreateQuizQuestionPayload {
	return plainToClass(CreateQuizQuestionPayload, createQuizQuestionRequestBody);
}
