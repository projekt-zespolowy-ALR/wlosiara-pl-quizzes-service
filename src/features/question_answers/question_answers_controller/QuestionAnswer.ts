import {Exclude, Expose} from "class-transformer";

@Exclude()
export default class QuestionAnswer {
	@Expose()
	readonly id!: string;
	@Expose()
	readonly content!: string;

	@Expose()
	readonly kind!: string;
}
