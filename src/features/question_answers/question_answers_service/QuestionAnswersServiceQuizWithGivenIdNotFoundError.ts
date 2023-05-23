export default class QuestionAnswersServiceQuizWithGivenIdNotFoundError extends Error {
	public readonly quizId: string;

	public constructor(quizId: string) {
		super(`Quiz with id ${quizId} not found`);
		this.quizId = quizId;
	}
}
