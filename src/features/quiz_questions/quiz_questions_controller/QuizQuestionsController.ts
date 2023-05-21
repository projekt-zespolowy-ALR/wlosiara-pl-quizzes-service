import {
	Body,
	Controller,
	Get,
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
import QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError from "../quiz_questions_service/QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError.js";

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

	@Get("/quizzes/:quizId/questions/:quizQuestionId")
	public async getQuizQuestionById(
		@Param(
			"quizId",
			new ParseUUIDPipe({
				version: "4",
			})
		)
		quizId: string,
		@Param(
			"quizQuestionId",
			new ParseUUIDPipe({
				version: "4",
			})
		)
		quizQuestionId: string
	): Promise<QuizQuestion> {
		try {
			const targetQuizQuestion = await this.quizQuestionsService.getQuizQuestionOfQuizById(
				quizId,
				quizQuestionId
			);
			return targetQuizQuestion;
		} catch (error) {
			if (error instanceof QuizQuestionsServiceQuizWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz with id "${error.quizId}" not found`);
			}
			if (error instanceof QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz question with id "${error.quizQuestionId}" not found`);
			}
			throw error;
		}
	}
}
