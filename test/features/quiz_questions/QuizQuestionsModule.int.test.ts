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
		});
		describe("One quiz with no questions in database", () => {
			const addTestQuiz = async () => {
				const addQuizRequestBody = {
					name: "Quiz 1",
					slug: "quiz-1",
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
				return resultJson;
			};

			describe("POST /quizzes/[quizId]/questions", () => {
				test("Should return 201 with the added quiz question", async () => {
					const {id: quizId} = await addTestQuiz();
					const addQuizQuestionRequestBody = {
						content: "What is the capital of France?",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quizId}/questions`,
						payload: addQuizQuestionRequestBody,
					});
					expect(response.statusCode).toBe(201);
					expect(response.json()).toEqual({
						id: expect.any(String),
						...addQuizQuestionRequestBody,
					});
				});
			});

			describe("GET /quizzes/[quizId]/questions/[quizQuestionId]", () => {
				test("Should return 404 with an error", async () => {
					const quiz = await addTestQuiz();
					const quizQuestionId = "a4bd7449-9359-4b00-ae92-d06d45db911a";

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quiz.id}/questions/${quizQuestionId}`,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						statusCode: 404,
						message: `Quiz question with id "${quizQuestionId}" not found`,
						error: "Not Found",
					});
				});
			});
			describe("GET /quizzes/[quizId]/questions", () => {
				test("Should return 200 with an empty array", async () => {
					const quiz = await addTestQuiz();

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quiz.id}/questions`,
					});
					expect(response.statusCode).toBe(200);
					expect(response.json()).toEqual({
						items: [],
						meta: {
							skip: 0,
							take: 10,
							totalItemsCount: 0,
							pageItemsCount: 0,
						},
					});
				});
			});
		});

		describe("One quiz with one question in database", () => {
			const addTestQuizWithQuestion = async () => {
				const addQuizRequestBody = {
					name: "Quiz 1",
					slug: "quiz-1",
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
				const addQuizQuestionRequestBody = {
					content: "What is the capital of France?",
				};
				const result2 = await app.inject({
					method: "POST",
					url: `/v1/quizzes/${resultJson.id}/questions`,
					payload: addQuizQuestionRequestBody,
				});
				const resultJson2 = result2.json();
				if (result2.statusCode !== 201) {
					throw new Error(`Failed to add test quiz question: ${resultJson2}`);
				}
				return {
					quiz: resultJson,
					question: resultJson2,
				};
			};

			describe("POST /quizzes/[quizId]/questions", () => {
				test("Should return 201 with the added quiz question", async () => {
					const {
						quiz: {id: quizId},
					} = await addTestQuizWithQuestion();
					const addQuizQuestionRequestBody = {
						content: "What is the capital of Germany?",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quizId}/questions`,
						payload: addQuizQuestionRequestBody,
					});
					expect(response.statusCode).toBe(201);
					expect(response.json()).toEqual({
						id: expect.any(String),
						...addQuizQuestionRequestBody,
					});
				});
			});

			describe("GET /quizzes/[quizId]/questions/[quizQuestionId]", () => {
				test("Should return 200 with the quiz question", async () => {
					const {quiz, question} = await addTestQuizWithQuestion();

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quiz.id}/questions/${question.id}`,
					});
					expect(response.statusCode).toBe(200);
					expect(response.json()).toEqual(question);
				});
			});

			describe("GET /quizzes/[quizId]/questions", () => {
				test("Should return 200 with an array containing the quiz question", async () => {
					const {quiz, question} = await addTestQuizWithQuestion();

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quiz.id}/questions`,
					});
					expect(response.statusCode).toBe(200);
					expect(response.json()).toEqual({
						items: [question],
						meta: {
							skip: 0,
							take: 10,
							totalItemsCount: 1,
							pageItemsCount: 1,
						},
					});
				});
			});
		});
		describe("One quiz with 20 questions in database", () => {
			const addTestQuizWithQuestions = async () => {
				const addQuizRequestBody = {
					name: "Quiz 1",
					slug: "quiz-1",
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
				const addQuizQuestionRequestBody = {
					content: "What is the capital of France?",
				};
				const questions = await Promise.all(
					Array(20)
						.fill(addQuizQuestionRequestBody)
						.map((addQuizQuestionRequestBody) =>
							app
								.inject({
									method: "POST",
									url: `/v1/quizzes/${resultJson.id}/questions`,
									payload: addQuizQuestionRequestBody,
								})
								.then((result) => {
									const resultJson = result.json();
									if (result.statusCode !== 201) {
										throw new Error(`Failed to add test quiz question: ${resultJson}`);
									}
									return resultJson;
								})
						)
				);
				return {
					quiz: resultJson,
					questions: questions,
				};
			};

			describe("GET /quizzes/[quizId]/questions", () => {
				test("Should return 200 with an array containing the quiz questions", async () => {
					const {quiz, questions} = await addTestQuizWithQuestions();

					const response = await app.inject({
						method: "GET",
						url: `/v1/quizzes/${quiz.id}/questions`,
					});

					expect(response.statusCode).toBe(200);
					const responseJson = response.json();
					expect(responseJson).toEqual({
						items: expect.any(Array),
						meta: {
							skip: 0,
							take: 10,
							totalItemsCount: 20,
							pageItemsCount: 10,
						},
					});
					expect(responseJson.items).toHaveLength(10);

					const originalQuestionsById = questions.reduce((acc, question) => {
						if (acc.has(question.id)) {
							throw new Error(`Duplicate question id: ${question.id}`);
						}
						acc.set(question.id, question);
						return acc;
					}, new Map());

					const returnedQuestionsById = responseJson.items.reduce(
						(
							acc: Map<string, object>,
							question: {
								id: string;
							}
						) => {
							if (acc.has(question.id)) {
								throw new Error(`Duplicate question id: ${question.id}`);
							}
							acc.set(question.id, question);
							return acc;
						},
						new Map()
					);

					for (const [id, question] of returnedQuestionsById) {
						expect(question).toEqual(originalQuestionsById.get(id));
					}
				});
			});
		});
	});
});
