import {Injectable} from "@nestjs/common";
import {Connection, DataSource, QueryFailedError, Repository} from "typeorm";
import {InjectConnection, InjectRepository} from "@nestjs/typeorm";
import type Page from "../../../paging/Page.js";
import type PagingOptions from "../../../paging/PagingOptions.js";
import paginatedFindAndCount from "../../../paging/paginatedFindAndCount.js";
import deentityifyQuizEntity from "./deentityifyQuizQuestionEntity.js";
import QuizQuestionEntity from "./QuizQuestionEntity.js";
import type QuizQuestion from "../quiz_questions_controller/QuizQuestion.js";
import QuizQuestionsServiceQuizWithGivenIdNotFoundError from "./QuizQuestionsServiceQuizWithGivenIdNotFoundError.js";
import QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError from "./QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError.js";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";
import paginateSelectQueryBuilder from "../../../paging/paginateSelectQueryBuilder.js";
import type CreateQuizQuestionPayload from "./CreateQuizQuestionPayload.js";
import buildPage from "../../../paging/buildPage.js";
@Injectable()
export default class QuizQuestionsService {
	private readonly quizQuestionsRepository: Repository<QuizQuestionEntity>;

	private readonly typeOrmDataSource: DataSource;
	private readonly quizzesRepository: Repository<QuizEntity>;
	public constructor(
		@InjectRepository(QuizQuestionEntity) quizQuestionsRepository: Repository<QuizQuestionEntity>,
		@InjectRepository(QuizEntity) quizzesRepository: Repository<QuizEntity>,
		typeOrmDataSource: DataSource
	) {
		this.quizQuestionsRepository = quizQuestionsRepository;
		this.quizzesRepository = quizzesRepository;
		this.typeOrmDataSource = typeOrmDataSource;
	}

	public async getQuizQuestionOfQuizById(
		quizId: string,
		quizQuestionId: string
	): Promise<QuizQuestion> {
		console.log(quizId, quizQuestionId);
		// console log all existing quizzes
		console.log(await this.quizzesRepository.find());
		const queryBuilder = this.quizzesRepository
			.createQueryBuilder("quiz")
			.leftJoinAndSelect("quiz.quizQuestions", "quizQuestion")
			.where("quiz.id = :quizId", {quizId});
		// .andWhere("quizQuestion.id = :quizQuestionId", {quizQuestionId});
		const result = await queryBuilder.getOne();
		console.log(result);
		if (!result) {
			throw new QuizQuestionsServiceQuizWithGivenIdNotFoundError(quizId);
		}
		const quizQuestions = result.quizQuestions;
		const quizQuestion = quizQuestions[0];
		if (!quizQuestion) {
			throw new QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError(quizQuestionId);
		}
		return quizQuestion;
	}

	public async getQuizQuestionsOfQuiz(
		quizId: string,
		pagingOptions: PagingOptions
	): Promise<Page<QuizQuestion>> {
		// list all quizzes with their questions
		console.log(
			await this.quizzesRepository.find({
				relations: ["quizQuestions"],
			})
		);
		const e = await this.quizzesRepository
			.createQueryBuilder("quiz")
			.leftJoinAndSelect("quiz.quizQuestions", "quizQuestion")
			.where("quiz.id = :quizId", {quizId})
			.loadRelationCountAndMap("quiz.abc", "quiz.quizQuestions")
			.limit(1) // TODO: Continue here, use for pagination
			.take(1)
			.getMany();
		console.log(e);
		// console.log(e[0]?.quizQuestions[0]);
		return null as any;

		// console.log(e);
		// if (e.items.length === 0) {
		// 	throw new QuizQuestionsServiceQuizWithGivenIdNotFoundError(quizId);
		// }

		// return buildPage({
		// 	items: [],
		// 	totalItemsCount: 0,
		// 	skip: e.meta.skip,
		// 	take: e.meta.take,
		// });
	}

	public async createQuizQuestion(
		quizId: string,
		createQuizQuestionPayload: CreateQuizQuestionPayload
	): Promise<QuizQuestion> {
		try {
			const result = await this.quizQuestionsRepository.save({
				...createQuizQuestionPayload,
				quiz: {
					id: quizId,
				},
			});
			return deentityifyQuizEntity(result);
		} catch (error) {
			if (
				error instanceof QueryFailedError &&
				error.message.includes("violates foreign key constraint")
			) {
				throw new QuizQuestionsServiceQuizWithGivenIdNotFoundError(quizId);
			}
			throw error;
		}
	}
}
