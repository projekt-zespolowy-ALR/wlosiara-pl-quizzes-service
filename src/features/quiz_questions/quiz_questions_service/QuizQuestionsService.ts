import {Injectable} from "@nestjs/common";
import {QueryFailedError, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";

import deentityifyQuizEntity from "./deentityifyQuizQuestionEntity.js";
import QuizQuestionEntity from "./QuizQuestionEntity.js";
import type QuizQuestion from "../quiz_questions_controller/QuizQuestion.js";
import QuizQuestionsServiceQuizWithGivenIdNotFoundError from "./QuizQuestionsServiceQuizWithGivenIdNotFoundError.js";

import type CreateQuizQuestionPayload from "./CreateQuizQuestionPayload.js";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";
import QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError from "./QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError.js";
@Injectable()
export default class QuizQuestionsService {
	private readonly quizQuestionsRepository: Repository<QuizQuestionEntity>;
	private readonly quizzesRepository: Repository<QuizEntity>;

	public constructor(
		@InjectRepository(QuizQuestionEntity) quizQuestionsRepository: Repository<QuizQuestionEntity>,
		@InjectRepository(QuizEntity) quizzesRepository: Repository<QuizEntity>
	) {
		this.quizQuestionsRepository = quizQuestionsRepository;
		this.quizzesRepository = quizzesRepository;
	}

	public async createQuizQuestion(
		quizId: string,
		createQuizQuestionPayload: CreateQuizQuestionPayload
	): Promise<QuizQuestion> {
		try {
			const result = await this.quizQuestionsRepository.save({
				...createQuizQuestionPayload,
				quizId: quizId,
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
	public async getQuizQuestionOfQuizById(
		quizId: string,
		quizQuestionId: string
	): Promise<QuizQuestion> {
		const result = await this.quizzesRepository
			.createQueryBuilder("quiz")
			.leftJoinAndSelect(
				"quiz.quizQuestions",
				"quizQuestion",
				"quizQuestion.id = :quizQuestionId",
				{quizQuestionId}
			)
			.where("quiz.id = :quizId", {quizId})
			.getOne();
		if (result === null) {
			throw new QuizQuestionsServiceQuizWithGivenIdNotFoundError(quizId);
		}
		const quizQuestions = result.quizQuestions;
		const quizQuestion = quizQuestions[0];
		if (quizQuestion === undefined) {
			throw new QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError(quizQuestionId);
		}
		return deentityifyQuizEntity(quizQuestion);
	}
}
