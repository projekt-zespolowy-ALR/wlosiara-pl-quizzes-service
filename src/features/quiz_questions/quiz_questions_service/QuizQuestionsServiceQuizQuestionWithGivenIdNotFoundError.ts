export default class QuizQuestionsServiceQuizQuestionWithGivenIdNotFoundError extends Error {
	public readonly quizQuestionId: string;

	public constructor(quizQuestionId: string) {
		super(`Quiz question with id ${quizQuestionId} not found`);
		this.quizQuestionId = quizQuestionId;
	}
}
