import {IsNotEmpty, IsString} from "class-validator";

export default class CreateQuizRequestBody {
	@IsNotEmpty()
	@IsString()
	public readonly name!: string;
	@IsNotEmpty()
	@IsString()
	public readonly slug!: string;
}
