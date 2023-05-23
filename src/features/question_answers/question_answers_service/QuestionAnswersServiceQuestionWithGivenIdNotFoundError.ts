export default class QuestionAnswersServiceQuestionWithGivenIdNotFoundError extends Error {
	public readonly questionId: string;

	public constructor(questionId: string) {
		super(`Question with id ${questionId} not found`);
		this.questionId = questionId;
	}
}
