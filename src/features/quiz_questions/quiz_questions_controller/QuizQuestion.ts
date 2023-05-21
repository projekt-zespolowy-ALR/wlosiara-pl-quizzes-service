import {Exclude, Expose} from "class-transformer";

@Exclude()
export default class QuizQuestion {
	@Expose()
	readonly id!: string;
	@Expose()
	readonly content!: string;
}
