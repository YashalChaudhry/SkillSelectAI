const INTERVIEW_DIFFICULTY_DISTRIBUTION = {
	Easy: 3,
	Medium: 4,
	Hard: 3
};

const TOTAL_INTERVIEW_QUESTIONS = 10;

function normalizeDifficulty(value) {
	const raw = String(value || '').trim().toLowerCase();
	if (raw === 'easy') return 'Easy';
	if (raw === 'medium') return 'Medium';
	if (raw === 'hard') return 'Hard';
	return null;
}

function shuffle(items) {
	const copy = [...items];
	for (let i = copy.length - 1; i > 0; i -= 1) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

export function selectBalancedQuestionsForInterview(approvedQuestions) {
	if (!Array.isArray(approvedQuestions)) {
		throw new Error('approvedQuestions must be an array');
	}

	const pools = {
		Easy: [],
		Medium: [],
		Hard: []
	};

	for (const question of approvedQuestions) {
		const normalized = normalizeDifficulty(question?.difficulty);
		if (normalized) {
			pools[normalized].push(question);
		}
	}

	const missingByDifficulty = {
		Easy: Math.max(0, INTERVIEW_DIFFICULTY_DISTRIBUTION.Easy - pools.Easy.length),
		Medium: Math.max(0, INTERVIEW_DIFFICULTY_DISTRIBUTION.Medium - pools.Medium.length),
		Hard: Math.max(0, INTERVIEW_DIFFICULTY_DISTRIBUTION.Hard - pools.Hard.length)
	};

	const hasMissing = Object.values(missingByDifficulty).some(value => value > 0);
	if (hasMissing) {
		const detail = `Easy=${missingByDifficulty.Easy}, Medium=${missingByDifficulty.Medium}, Hard=${missingByDifficulty.Hard}`;
		throw new Error(`Approved pool cannot satisfy balanced interview distribution (3 Easy, 4 Medium, 3 Hard). Missing: ${detail}`);
	}

	const selected = [];
	for (const difficulty of ['Easy', 'Medium', 'Hard']) {
		const count = INTERVIEW_DIFFICULTY_DISTRIBUTION[difficulty];
		selected.push(...shuffle(pools[difficulty]).slice(0, count));
	}

	if (selected.length !== TOTAL_INTERVIEW_QUESTIONS) {
		throw new Error(`Balanced randomization failed. Expected ${TOTAL_INTERVIEW_QUESTIONS} questions, got ${selected.length}`);
	}

	return shuffle(selected);
}

export function getApprovedQuestionPoolStatus(approvedQuestions) {
	if (!Array.isArray(approvedQuestions)) {
		throw new Error('approvedQuestions must be an array');
	}

	const difficultyCounts = {
		Easy: 0,
		Medium: 0,
		Hard: 0
	};

	for (const question of approvedQuestions) {
		const normalized = normalizeDifficulty(question?.difficulty);
		if (normalized) {
			difficultyCounts[normalized] += 1;
		}
	}

	const requiredDistribution = { ...INTERVIEW_DIFFICULTY_DISTRIBUTION };
	const missingByDifficulty = {
		Easy: Math.max(0, requiredDistribution.Easy - difficultyCounts.Easy),
		Medium: Math.max(0, requiredDistribution.Medium - difficultyCounts.Medium),
		Hard: Math.max(0, requiredDistribution.Hard - difficultyCounts.Hard)
	};

	const minApprovedRequired = TOTAL_INTERVIEW_QUESTIONS;
	const approvedCount = approvedQuestions.length;
	const hasMinimumApproved = approvedCount >= minApprovedRequired;
	const hasBalancedDifficultySupport = Object.values(missingByDifficulty).every(v => v === 0);

	return {
		approvedCount,
		minApprovedRequired,
		hasMinimumApproved,
		difficultyCounts,
		requiredDistribution,
		missingByDifficulty,
		hasBalancedDifficultySupport,
		canSendInvites: hasMinimumApproved && hasBalancedDifficultySupport
	};
}

export { INTERVIEW_DIFFICULTY_DISTRIBUTION, TOTAL_INTERVIEW_QUESTIONS };
