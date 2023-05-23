import {Injectable} from "@nestjs/common";
import type CreateQuestionAnswerPayload from "./CreateQuestionAnswerPayload.js";
import type QuestionAnswer from "../question_answers_controller/QuestionAnswer.js";
import {EntityNotFoundError, QueryFailedError, Repository} from "typeorm";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";
import QuestionAnswerEntity from "./QuestionAnswerEntity.js";
import {InjectRepository} from "@nestjs/typeorm";

import QuestionAnswersServiceQuestionWithGivenIdNotFoundError from "./QuestionAnswersServiceQuestionWithGivenIdNotFoundError.js";
import QuestionAnswersServiceQuizWithGivenIdNotFoundError from "./QuestionAnswersServiceQuizWithGivenIdNotFoundError.js";
import deentityifyQuestionAnswerEntity from "./deentityifyQuestionAnswerEntity.js";
@Injectable()
export default class QuestionAnswersService {
	private readonly quizzesRepository: Repository<QuizEntity>;

	private readonly questionAnswersRepository: Repository<QuestionAnswerEntity>;

	public constructor(
		@InjectRepository(QuizEntity) quizzesRepository: Repository<QuizEntity>,
		@InjectRepository(QuestionAnswerEntity)
		questionAnswersRepository: Repository<QuestionAnswerEntity>
	) {
		this.quizzesRepository = quizzesRepository;
		this.questionAnswersRepository = questionAnswersRepository;
	}
	public async createQuestionAnswer(
		quizId: string,
		questionId: string,
		createQuestionAnswerPayload: CreateQuestionAnswerPayload
	): Promise<QuestionAnswer> {
		try {
			return deentityifyQuestionAnswerEntity(
				await this.questionAnswersRepository.save({
					...createQuestionAnswerPayload,
					questionId,
				})
			);
		} catch (error) {
			if (
				error instanceof QueryFailedError &&
				error.message.includes("violates foreign key constraint")
			) {
				await this.quizzesRepository
					.findOneOrFail({where: {id: quizId}})
					.then(() => {
						throw new QuestionAnswersServiceQuestionWithGivenIdNotFoundError(questionId);
					})
					.catch((error) => {
						if (error instanceof EntityNotFoundError) {
							throw new QuestionAnswersServiceQuizWithGivenIdNotFoundError(quizId);
						}
						throw error;
					});
			}
			throw error;
		}
	}
	public async getQuestionAnswers(quizId: string, questionId: string): Promise<QuestionAnswer[]> {
		const result = (
			await this.quizzesRepository
				.createQueryBuilder("quiz")
				.leftJoinAndSelect("quiz.quizQuestions", "quizQuestion", "quizQuestion.id = :questionId", {
					questionId,
				})
				.leftJoinAndSelect("quizQuestion.questionAnswers", "questionAnswer")
				.where("quiz.id = :quizId", {quizId})
				.getMany()
		)[0];
		if (result === undefined) {
			throw new QuestionAnswersServiceQuizWithGivenIdNotFoundError(quizId);
		}
		const quizQuestion = result.quizQuestions[0];
		if (quizQuestion === undefined) {
			throw new QuestionAnswersServiceQuestionWithGivenIdNotFoundError(questionId);
		}
		return quizQuestion.questionAnswers.map(deentityifyQuestionAnswerEntity);
	}
}
