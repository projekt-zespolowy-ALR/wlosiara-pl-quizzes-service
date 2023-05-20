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
import QuizzesService from "../quizzes_service/QuizzesService.js";
import PagingOptions from "../../../paging/PagingOptions.js";
import type Page from "../../../paging/Page.js";
import type Quiz from "./Quiz.js";
import QuizzesServiceQuizWithGivenIdNotFoundError from "../quizzes_service/QuizzesServiceQuizWithGivenIdNotFoundError.js";
import CreateQuizRequestBody from "./CreateQuizRequestBody.js";
import payloadifyCreateQuizRequestBody from "./payloadifyCreateQuizRequestBody.js";

@Controller("/")
export default class QuizzesController {
	private readonly quizzesService: QuizzesService;
	public constructor(quizzesService: QuizzesService) {
		this.quizzesService = quizzesService;
	}
	@Get("/quizzes")
	public async getQuizzes(
		@Query(
			new ValidationPipe({
				transform: true, // Transform to instance of PagingOptions
				whitelist: true, // Do not put other query parameters into the object
			})
		)
		pagingOptions: PagingOptions
	): Promise<Page<Quiz>> {
		return await this.quizzesService.getQuizzes(pagingOptions);
	}

	@Get("/quizzes/:quizId")
	public async getQuizById(
		@Param(
			"quizId",
			new ParseUUIDPipe({
				version: "4",
			})
		)
		quizId: string
	): Promise<Quiz> {
		try {
			const targetQuiz = await this.quizzesService.getQuizById(quizId);
			return targetQuiz;
		} catch (error) {
			if (error instanceof QuizzesServiceQuizWithGivenIdNotFoundError) {
				throw new NotFoundException(`Quiz with id "${quizId}" not found`);
			}
			throw error;
		}
	}

	@Post("/quizzes")
	public async createQuiz(
		@Body(
			new ValidationPipe({
				transform: true, // Transform to instance of CreateCatRequestBody
				whitelist: true, // Do not allow other properties than those defined in CreateCatRequestBody
				forbidNonWhitelisted: true, // Throw an error if other properties than those defined in CreateCatRequestBody are present
			})
		)
		createQuizRequestBody: CreateQuizRequestBody
	): Promise<Quiz> {
		return await this.quizzesService.createQuiz(
			payloadifyCreateQuizRequestBody(createQuizRequestBody)
		);
	}
}
