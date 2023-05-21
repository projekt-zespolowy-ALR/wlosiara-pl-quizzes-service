import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
	ValidationPipe,
} from "@nestjs/common";
import QuizQuestionsService from "../quiz_questions_service/QuizQuestionsService.js";
import PagingOptions from "../../../paging/PagingOptions.js";
import type Page from "../../../paging/Page.js";
import type QuizQuestion from "./QuizQuestion.js";
import QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError from "../quiz_questions_service/QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError.js";
import QuizQuestionsServiceQuizWithGivenIdNotFoundError from "../quiz_questions_service/QuizQuestionsServiceQuizWithGivenIdNotFoundError.js";
import CreateQuizQuestionRequestBody from "./CreateQuizQuestionRequestBody.js";
import payloadifyCreateQuizQuestionRequestBody from "./payloadifyCreateQuizQuestionRequestBody.js";

@Controller("/")
export default class QuizQuestionsController {
	private readonly quizQuestionsService: QuizQuestionsService;
	public constructor(quizQuestionsService: QuizQuestionsService) {
		this.quizQuestionsService = quizQuestionsService;
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
