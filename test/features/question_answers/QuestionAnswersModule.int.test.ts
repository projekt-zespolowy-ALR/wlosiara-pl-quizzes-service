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

describe("QuestionAnswersModule", () => {
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
			describe("POST /quizzes/[quizId]/questions/[questionId]/answers", () => {
				test("Should return 404", async () => {
					const quizId = "e05fc2f9-12a1-4f58-a3b9-ca9105b3b699";
					const questionId = "02bdb86a-3a0d-46c6-be24-858079461eaa";

					const createQuestionAnswerRequestBody = {
						content: "Paris",
						kind: "FRANCE_LOVER",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quizId}/questions/${questionId}/answers`,
						payload: createQuestionAnswerRequestBody,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						error: "Not Found",
						message: `Quiz with id "${quizId}" not found`,
						statusCode: 404,
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
			describe("POST /quizzes/[quizId]/questions/[questionId]/answers", () => {
				test("Should return 404", async () => {
					const quiz = await addTestQuiz();
					const questionId = "02bdb86a-3a0d-46c6-be24-858079461eaa";
					const createQuestionAnswerRequestBody = {
						content: "Paris",
						kind: "FRANCE_LOVER",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quiz.id}/questions/${questionId}/answers`,
						payload: createQuestionAnswerRequestBody,
					});
					expect(response.statusCode).toBe(404);
					expect(response.json()).toEqual({
						error: "Not Found",
						message: `Question with id "${questionId}" not found`,
						statusCode: 404,
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
				const addQuestionRequestBody = {
					content: "What is the capital of France?",
				};
				const questionResult = await app.inject({
					method: "POST",
					url: `/v1/quizzes/${resultJson.id}/questions`,
					payload: addQuestionRequestBody,
				});
				const questionResultJson = questionResult.json();
				if (questionResult.statusCode !== 201) {
					throw new Error(`Failed to add test question: ${questionResultJson}`);
				}
				return {
					quiz: resultJson,
					question: questionResultJson,
				};
			};

			describe("POST /quizzes/[quizId]/questions/[questionId]/answers", () => {
				test("Should return 201", async () => {
					const {quiz, question} = await addTestQuizWithQuestion();
					const createQuestionAnswerRequestBody = {
						content: "Paris",
						kind: "FRANCE_LOVER",
					};

					const response = await app.inject({
						method: "POST",
						url: `/v1/quizzes/${quiz.id}/questions/${question.id}/answers`,
						payload: createQuestionAnswerRequestBody,
					});
					expect(response.statusCode).toBe(201);
					const responseJson = response.json();
					expect(responseJson).toEqual({
						...createQuestionAnswerRequestBody,
						id: expect.any(String),
					});
				});
			});
		});
	});
});
