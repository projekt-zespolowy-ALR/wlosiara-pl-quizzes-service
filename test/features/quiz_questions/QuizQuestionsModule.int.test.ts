import {Test} from "@nestjs/testing";
import {describe, test, expect, beforeEach, afterEach, beforeAll} from "@jest/globals";
import type {NestFastifyApplication} from "@nestjs/platform-fastify";
import * as Testcontainers from "testcontainers";
import AppOrmModule from "../../../src/app_orm/AppOrmModule.js";
import AppConfig from "../../../src/app_config/AppConfig.js";
import {TypedConfigModule} from "nest-typed-config";
import * as Fs from "fs/promises";

import testsConfig from "../../app_config/testsConfig.js";
import generatePostgresqlPassword from "../../utils/generatePostgresqlPassword.js";
import createTestingApp from "../../utils/createTestingApp.js";
import FeaturesModule from "../../../src/features/FeaturesModule.js";

// describe("Database with one brand", () => {
// 	test("GET /brands", async () => {
// 		const addBrandRequestBody = {
// 			name: "test2",
// 			slug: "test2",
// 		} as const;
// 		await app.inject({
// 			method: "POST",
// 			url: "/v1/brands",
// 			payload: addBrandRequestBody,
// 		});
// 		const response = await app.inject({
// 			method: "GET",
// 			url: "/v1/brands",
// 		});
// 		expect(response.statusCode).toBe(200);
// 		const responseJson = response.json();
// 		expect(responseJson).toHaveProperty("items");
// 		expect(responseJson).toHaveProperty("meta");
// 		expect(responseJson.meta).toEqual({
// 			skip: 0,
// 			take: 10,
// 			totalItemsCount: 1,
// 			pageItemsCount: 1,
// 		});
// 		expect(responseJson.items).toHaveLength(1);
// 		expect(responseJson.items[0]).toHaveProperty("id");
// 		expect(typeof responseJson.items[0].id).toBe("string");
// 		expect(responseJson.items[0].id).not.toHaveLength(0);
// 		expect((({id, ...rest}) => rest)(responseJson.items[0])).toEqual(addBrandRequestBody);
// 	});
// });
describe("QuizQuestionsModule", () => {
	let postgresqlContainer: Testcontainers.StartedPostgreSqlContainer;
	let app: NestFastifyApplication;
	let postgresqlInitializationSqlScript: string;

	beforeAll(async () => {
		postgresqlInitializationSqlScript = await Fs.readFile(
			testsConfig.TESTS_POSTGRESQL_INITIALIZATION_SQL_SCRIPT_PATH,
			"utf-8"
		);
	});

	beforeEach(async () => {
		const postgresqlContainerPassword = generatePostgresqlPassword();

		postgresqlContainer = await new Testcontainers.PostgreSqlContainer(
			testsConfig.TESTS_POSTGRESQL_CONTAINER_IMAGE_NAME
		)
			.withPassword(postgresqlContainerPassword)
			.withEnvironment({"PGPASSWORD": postgresqlContainerPassword})
			.withDatabase(testsConfig.TESTS_POSTGRESQL_CONTAINER_DATABASE_NAME)
			.start();

		await postgresqlContainer.exec([
			"psql",
			`--host=localhost`,
			`--port=5432`,
			`--username=${postgresqlContainer.getUsername()}`,
			`--dbname=${postgresqlContainer.getDatabase()}`,
			`--no-password`,
			`--command`,
			`${postgresqlInitializationSqlScript}`,
		]);

		const AppConfigModule = TypedConfigModule.forRoot({
			schema: AppConfig,
			load: () => ({
				POSTGRES_HOST: postgresqlContainer.getHost(),
				POSTGRES_PORT: postgresqlContainer.getPort(),
				POSTGRES_USERNAME: postgresqlContainer.getUsername(),
				POSTGRES_PASSWORD: postgresqlContainer.getPassword(),
				POSTGRES_DATABASE: postgresqlContainer.getDatabase(),
			}),
		});
		const appModule = await Test.createTestingModule({
			imports: [FeaturesModule, AppOrmModule, AppConfigModule],
		}).compile();

		app = await createTestingApp(appModule);
	}, testsConfig.TESTS_INTEGRATION_TEST_BEFORE_EACH_TIMEOUT * 1000);

	afterEach(async () => {
		await Promise.all([postgresqlContainer.stop(), app.close()]);
	});
	describe("v1", () => {
		describe("No quizzes in database", () => {
			describe("GET /quizzes/[quizId]/questions/[quizQuestionId]", () => {
				test("Should return 404 with an error", async () => {
					const quizId = "effd00d7-4390-4361-bc3a-e038a0debc35";
					const quizQuestionId = "a4bd7449-9359-4b00-ae92-d06d45db911a";

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quizId}/questions/${quizQuestionId}`,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						statusCode: 404,
						message: `Quiz with id "${quizId}" not found`,
						error: "Not Found",
					});
				});
			});
			describe("GET /quizzes/[quizId]/questions", () => {
				test("Should return 404 with an error", async () => {
					const quizId = "effd00d7-4390-4361-bc3a-e038a0debc35";

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quizId}/questions`,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						statusCode: 404,
						message: `Quiz with id "${quizId}" not found`,
						error: "Not Found",
					});
				});
			});
			describe("POST /quizzes/[quizId]/questions", () => {
				test("Should return 404 with an error", async () => {
					const quizId = "effd00d7-4390-4361-bc3a-e038a0debc35";
					const addQuizQuestionRequestBody = {
						content: "What is the capital of France?",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quizId}/questions`,
						payload: addQuizQuestionRequestBody,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						statusCode: 404,
						message: `Quiz with id "${quizId}" not found`,
						error: "Not Found",
					});
				});
			});
		});
		describe("One quiz with no questions in database", () => {
			const addTestQuiz = async () => {
				// const addQuizRequestBody = {
				// 	name: "Quiz 1",
				// 	slug: "quiz-1",
				// };
				// const result = await app.inject({
				// 	method: "POST",
				// 	url: "/v1/quizzes",
				// 	payload: addQuizRequestBody,
				// });
				// const resultJson = result.json();
				// if (result.statusCode !== 201) {
				// 	throw new Error(`Failed to add test quiz: ${resultJson}`);
				// }
				// console.log("DODALEM", resultJson);

				// const someQuizQuestion = {
				// 	content: "What is the capital of France?",
				// };
				// await app.inject({
				// 	method: "POST",
				// 	url: `/v1/quizzes/${resultJson.id}/questions`,
				// 	payload: someQuizQuestion,
				// });

				// same as above, but inject 2 quizzes, first with 1 question, second with 2 questions
				const added = [];
				for (let i = 0; i < 2; i++) {
					const addQuizRequestBody = {
						name: `Quiz ${i + 1}`,
						slug: `quiz-${i + 1}`,
					};
					const result = await app.inject({
						method: "POST",
						url: "/v1/quizzes",
						payload: addQuizRequestBody,
					});
					const resultJson = result.json();
					if (result.statusCode !== 201) {
						throw new Error(`Failed to add test quiz: ${resultJson}`);
					}
					console.log("DODALEM", resultJson);

					for (let j = 0; j < i + 1; j++) {
						const someQuizQuestion = {
							content: `What is the capital of France? ${j}`,
						};
						await app.inject({
							method: "POST",
							url: `/v1/quizzes/${resultJson.id}/questions`,
							payload: someQuizQuestion,
						});
						console.log("DODALEM PYTANIE", someQuizQuestion);
					}
					added.push(resultJson);
				}

				return added;
			};

			describe("GET /quizzes/[quizId]/questions", () => {
				test.only("Should return 200 and empty page", async () => {
					const a = await addTestQuiz();
					console.log(a);

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${a[1].id}/questions`,
					});
					console.log(response);
					expect(response.statusCode).toBe(200);
					const responseJson = response.json();
					expect(responseJson).toHaveProperty("items");
					expect(responseJson).toHaveProperty("meta");
					expect(responseJson.meta).toEqual({
						skip: 0,
						take: 10,
						totalItemsCount: 0,
						pageItemsCount: 0,
					});
					expect(responseJson.items).toHaveLength(0);
				});
			});

			describe("GET /quizzes/[quizId]/questions/[quizQuestionId]", () => {
				test("Should return 404 with an error", async () => {
					const {id: quizId} = (await addTestQuiz())[0];
					const quizQuestionId = "a4bd7449-9359-4b00-ae92-d06d45db911a";

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quizId}/questions/${quizQuestionId}`,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						statusCode: 404,
						message: `Quiz question with id "${quizQuestionId}" not found`,
						error: "Not Found",
					});
				});
			});
		});
	});
});
