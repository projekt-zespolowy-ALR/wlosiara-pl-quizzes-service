import {
	Body,
	Controller,
	Get,
	NotFoundException,
	Param,
	Post,
	ValidationPipe,
} from "@nestjs/common";
import type QuestionAnswer from "./QuestionAnswer.js";
import CreateQuestionAnswerRequestBody from "./CreateQuestionAnswerRequestBody.js";
import QuestionAnswersService from "../question_answers_service/QuestionAnswersService.js";
import QuestionAnswersServiceQuizWithGivenIdNotFoundError from "../question_answers_service/QuestionAnswersServiceQuizWithGivenIdNotFoundError.js";
import QuestionAnswersServiceQuestionWithGivenIdNotFoundError from "../question_answers_service/QuestionAnswersServiceQuestionWithGivenIdNotFoundError.js";
import payloadifyCreateQuestionAnswerRequestBody from "./payloadifyCreateQuestionAnswerRequestBody.js";

@Controller("/quizzes/:quizId/questions/:questionId/answers")
export default class QuestionAnswersController {
	private readonly questionAnswersService: QuestionAnswersService;
	public constructor(questionAnswersService: QuestionAnswersService) {
		this.questionAnswersService = questionAnswersService;
	}

	@Post("/")
	public async createQuestionAnswer(
		@Param("quizId") quizId: string,
		@Param("questionId") questionId: string,

		@Body(
			new ValidationPipe({
				transform: true, // Transform to instance of CreateCatRequestBody
				whitelist: true, // Do not allow other properties than those defined in CreateCatRequestBody
				forbidNonWhitelisted: true, // Throw an error if other properties than those defined in CreateCatRequestBody are present
			})
		)
		createQuestionAnswerRequestBody: CreateQuestionAnswerRequestBody
	): Promise<QuestionAnswer> {
		try {
			const createdQuestionAnswer = await this.questionAnswersService.createQuestionAnswer(
				quizId,
				questionId,
				payloadifyCreateQuestionAnswerRequestBody(createQuestionAnswerRequestBody)
			);
			return createdQuestionAnswer;
		} catch (error) {
			if (error instanceof QuestionAnswersServiceQuizWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz with id "${error.quizId}" not found`);
			}
			if (error instanceof QuestionAnswersServiceQuestionWithGivenIdNotFoundError) {
				throw new NotFoundException(`Question with id "${error.questionId}" not found`);
			}
			throw error;
		}
	}

	@Get("/")
	public async getQuestionAnswers(
		@Param("quizId") quizId: string,
		@Param("questionId") questionId: string
	): Promise<QuestionAnswer[]> {
		try {
			const questionAnswers = await this.questionAnswersService.getQuestionAnswers(
				quizId,
				questionId
			);
			return questionAnswers;
		} catch (error) {
			if (error instanceof QuestionAnswersServiceQuizWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz with id "${error.quizId}" not found`);
			}
			if (error instanceof QuestionAnswersServiceQuestionWithGivenIdNotFoundError) {
				throw new NotFoundException(`Question with id "${error.questionId}" not found`);
			}
			throw error;
		}
	}
}
