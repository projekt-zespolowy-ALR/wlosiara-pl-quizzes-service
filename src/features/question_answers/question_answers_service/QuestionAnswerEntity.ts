import {
	Entity,
	Column,
	PrimaryGeneratedColumn,
	ManyToOne,
	JoinColumn,
	type Relation,
} from "typeorm";
import QuizQuestionEntity from "../../quiz_questions/quiz_questions_service/QuizQuestionEntity.js";

@Entity({name: "question_answers"})
export default class QuestionAnswerEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;

	@Column({name: "question_id", type: "uuid"})
	public readonly questionId!: string;

	@Column({name: "content", type: "text"})
	public readonly content!: string;

	@Column({name: "kind", type: "text"})
	public readonly kind!: string;

	@ManyToOne(() => QuizQuestionEntity, (quiz) => quiz.questionAnswers)
	@JoinColumn({referencedColumnName: "id", name: "question_id"})
	public readonly question!: Relation<QuizQuestionEntity>;
}
