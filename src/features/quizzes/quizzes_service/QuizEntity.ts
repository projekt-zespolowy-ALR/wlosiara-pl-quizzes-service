import {Entity, Column, PrimaryGeneratedColumn} from "typeorm";

@Entity({name: "quizzes"})
export default class QuizEntity {
	@PrimaryGeneratedColumn("uuid", {name: "id"})
	public readonly id!: string;
	@Column({name: "name", type: "text"})
	public readonly name!: string;

	@Column({name: "slug", type: "text"})
	public readonly slug!: string;
}
