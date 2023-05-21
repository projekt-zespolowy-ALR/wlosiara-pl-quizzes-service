import {Entity, Column, PrimaryGeneratedColumn, OneToMany, type Relation} from "typeorm";
import QuizQuestionEntity from "../../quiz_questions/quiz_questions_service/QuizQuestionEntity.js";

@Entity({name: "quizzes"})
export default class QuizEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@Column({name: "name", type: "text"})
	public readonly name!: string;

	@Column({name: "slug", type: "text"})
	public readonly slug!: string;

	@OneToMany(() => QuizQuestionEntity, (quizQuestion) => quizQuestion.quiz)
	public readonly quizQuestions!: Relation<QuizQuestionEntity>[];
}
