import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from "typeorm";
import QuizEntity from "../../quizzes/quizzes_service/QuizEntity.js";

@Entity({name: "quiz_questions"})
export default class QuizQuestionEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "quiz_id", type: "uuid"})
	public readonly quizId!: string;

	@Column({name: "content", type: "text"})
	public readonly content!: string;

	@ManyToOne(() => QuizEntity, (quiz) => quiz.quizQuestions)
	@JoinColumn({referencedColumnName: "id", name: "quiz_id"})
	public readonly quiz!: QuizEntity;
}
