import {Module} from "@nestjs/common";
import QuizzesModule from "./quizzes/quizzes_module/QuizzesModule.js";

@Module({
	imports: [QuizzesModule],
	controllers: [],
	providers: [],
})
class FeaturesModule {
	public constructor() {}
}

export default FeaturesModule;
