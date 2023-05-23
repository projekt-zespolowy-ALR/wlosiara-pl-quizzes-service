import {IsNotEmpty, IsString} from "class-validator";

export default class CreateQuestionAnswerRequestBody {
	@IsString()
	@IsNotEmpty()
	public readonly content!: string;

	@IsString()
	@IsNotEmpty()
	public readonly kind!: string;
}
