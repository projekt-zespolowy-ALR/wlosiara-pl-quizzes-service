import {IsNotEmpty, IsString} from "class-validator";

export default class CreateQuizQuestionRequestBody {
	@IsString()
	@IsNotEmpty()
	public readonly content!: string;
}
