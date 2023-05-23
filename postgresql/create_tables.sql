CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE quizzes (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	PRIMARY KEY (id)
);

CREATE TABLE quiz_questions (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	quiz_id UUID NOT NULL,
	content TEXT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (quiz_id) REFERENCES quizzes(id)
);

CREATE TABLE question_answers (
	id UUID DEFAULT uuid_generate_v4() NOT NULL,
	question_id UUID NOT NULL,
	content TEXT NOT NULL,
	kind TEXT NOT NULL,
	PRIMARY KEY (id),
	FOREIGN KEY (question_id) REFERENCES quiz_questions(id)
);
