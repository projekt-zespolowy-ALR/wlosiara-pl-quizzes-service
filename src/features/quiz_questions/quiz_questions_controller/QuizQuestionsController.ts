import {
	Body,
	Controller,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	ValidationPipe,
} from "@nestjs/common";
import QuizQuestionsService from "../quiz_questions_service/QuizQuestionsService.js";
import payloadifyCreateQuizQuestionRequestBody from "./payloadifyCreateQuizQuestionRequestBody.js";
import CreateQuizQuestionRequestBody from "./CreateQuizQuestionRequestBody.js";
import QuizQuestionsServiceQuizWithGivenIdNotFoundError from "../quiz_questions_service/QuizQuestionsServiceQuizWithGivenIdNotFoundError.js";
import type QuizQuestion from "./QuizQuestion.js";

@Controller("/")
export default class QuizQuestionsController {
	private readonly quizQuestionsService: QuizQuestionsService;
	public constructor(quizQuestionsService: QuizQuestionsService) {
		this.quizQuestionsService = quizQuestionsService;
	}
	@Post("/quizzes/:quizId/questions")
	public async createQuizQuestion(
		@Param(
			"quizId",
			new ParseUUIDPipe({
				version: "4",
			})
		)
		quizId: string,
		@Body(
			new ValidationPipe({
				transform: true, // Transform to instance of CreateCatRequestBody
				whitelist: true, // Do not allow other properties than those defined in CreateCatRequestBody
				forbidNonWhitelisted: true, // Throw an error if other properties than those defined in CreateCatRequestBody are present
			})
		)
		createQuizQuestionRequestBody: CreateQuizQuestionRequestBody
	): Promise<QuizQuestion> {
		try {
			const createdQuizQuestion = await this.quizQuestionsService.createQuizQuestion(
				quizId,
				payloadifyCreateQuizQuestionRequestBody(createQuizQuestionRequestBody)
			);
			return createdQuizQuestion;
		} catch (error) {
			if (error instanceof QuizQuestionsServiceQuizWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz with id "${error.quizId}" not found`);
			}
			throw error;
		}
	}
}
