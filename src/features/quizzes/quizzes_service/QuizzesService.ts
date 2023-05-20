import {Injectable} from "@nestjs/common";
import {EntityNotFoundError, Repository} from "typeorm";
import QuizEntity from "./QuizEntity.js";
import {InjectRepository} from "@nestjs/typeorm";
import type Page from "../../../paging/Page.js";
import type PagingOptions from "../../../paging/PagingOptions.js";
import paginatedFindAndCount from "../../../paging/paginatedFindAndCount.js";
import type Quiz from "../quizzes_controller/Quiz.js";
import deentityifyQuizEntity from "./deentityifyQuizEntity.js";
import type CreateQuizPayload from "./CreateQuizPayload.js";
import QuizzesServiceQuizWithGivenIdNotFoundError from "./QuizzesServiceQuizWithGivenIdNotFoundError.js";
@Injectable()
export default class QuizzesService {
	private readonly quizzesRepository: Repository<QuizEntity>;
	public constructor(@InjectRepository(QuizEntity) quizzesRepository: Repository<QuizEntity>) {
		this.quizzesRepository = quizzesRepository;
	}
	public async getQuizzes(pagingOptions: PagingOptions): Promise<Page<Quiz>> {
		return (await paginatedFindAndCount(this.quizzesRepository, pagingOptions)).map(
			deentityifyQuizEntity
		);
	}
	public async getQuizById(id: string): Promise<Quiz> {
		try {
			return deentityifyQuizEntity(await this.quizzesRepository.findOneByOrFail({id}));
		} catch (error) {
			if (error instanceof EntityNotFoundError) {
				throw new QuizzesServiceQuizWithGivenIdNotFoundError(id);
			}
			throw error;
		}
	}
	public async createQuiz(createQuizPayload: CreateQuizPayload): Promise<Quiz> {
		return deentityifyQuizEntity(await this.quizzesRepository.save(createQuizPayload));
	}
}
