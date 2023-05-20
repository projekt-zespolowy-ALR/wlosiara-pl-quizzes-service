import type CreateQuizRequestBody from "./CreateQuizRequestBody.js";
import CreateQuizPayload from "../quizzes_service/CreateQuizPayload.js";
import {plainToClass} from "class-transformer";

export default function payloadifyCreateQuizRequestBody(
	createQuizRequestBody: CreateQuizRequestBody
): CreateQuizPayload {
	return plainToClass(CreateQuizPayload, createQuizRequestBody);
}
