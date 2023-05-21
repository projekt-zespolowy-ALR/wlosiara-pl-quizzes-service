import {Injectable} from "@nestjs/common";
import {QueryFailedError, Repository} from "typeorm";
import {InjectRepository} from "@nestjs/typeorm";

import deentityifyQuizEntity from "./deentityifyQuizQuestionEntity.js";
import QuizQuestionEntity from "./QuizQuestionEntity.js";
import type QuizQuestion from "../quiz_questions_controller/QuizQuestion.js";
import QuizQuestionsServiceQuizWithGivenIdNotFoundError from "./QuizQuestionsServiceQuizWithGivenIdNotFoundError.js";

import type CreateQuizQuestionPayload from "./CreateQuizQuestionPayload.js";
@Injectable()
export default class QuizQuestionsService {
	private readonly quizQuestionsRepository: Repository<QuizQuestionEntity>;

	public constructor(
		@InjectRepository(QuizQuestionEntity) quizQuestionsRepository: Repository<QuizQuestionEntity>
	) {
		this.quizQuestionsRepository = quizQuestionsRepository;
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
}
