/**
 * StudentPulse Transparent Explainability Engine
 * Translates academic indicators and ML predictions into actionable human-readable explanations.
 */

function generateExplainabilityReport(academicData, riskLevel, riskScore) {
  const factors = [];
  const suggestions = [];

  const {
    attendancePercentage: attendance,
    internalMarksPercentage: internalMarks,
    assignmentSubmissionPercentage: assignmentSubmission,
    previousSemesterPercentage: previousPerf,
    recentPerformancePercentage: recentPerf
  } = academicData;

  const trend = recentPerf - previousPerf;

  // 1. Attendance Analysis
  if (attendance < 60) {
    factors.push({
      factor: 'Attendance',
      value: `${attendance}%`,
      impact: 'High',
      explanation: `Attendance (${attendance}%) is significantly below the institution's 60% threshold.`
    });
    suggestions.push('Faculty follow-up to discuss personal or attendance barriers.');
    suggestions.push('Monitor daily attendance for the next 2 weeks.');
  } else if (attendance < 75) {
    factors.push({
      factor: 'Attendance',
      value: `${attendance}%`,
      impact: 'Medium',
      explanation: `Attendance (${attendance}%) is below the recommended 75% target.`
    });
    suggestions.push('Issue attendance warning notification to student.');
  } else {
    factors.push({
      factor: 'Attendance',
      value: `${attendance}%`,
      impact: 'Positive',
      explanation: `Attendance (${attendance}%) meets institution standards.`
    });
  }

  // 2. Internal Marks Analysis
  if (internalMarks < 50) {
    factors.push({
      factor: 'Internal Marks',
      value: `${internalMarks}%`,
      impact: 'High',
      explanation: `Internal assessment performance (${internalMarks}%) indicates critical academic risk.`
    });
    suggestions.push('Enroll in remedial classes for core subjects.');
    suggestions.push('Assign a peer or faculty academic mentor.');
  } else if (internalMarks < 65) {
    factors.push({
      factor: 'Internal Marks',
      value: `${internalMarks}%`,
      impact: 'Medium',
      explanation: `Internal assessment performance (${internalMarks}%) is moderate.`
    });
    suggestions.push('Provide additional practice assignments and revision sessions.');
  } else {
    factors.push({
      factor: 'Internal Marks',
      value: `${internalMarks}%`,
      impact: 'Positive',
      explanation: `Internal assessment marks (${internalMarks}%) are satisfactory.`
    });
  }

  // 3. Assignment Submission Rate
  if (assignmentSubmission < 60) {
    factors.push({
      factor: 'Assignment Submission',
      value: `${assignmentSubmission}%`,
      impact: 'High',
      explanation: `Assignment submission rate (${assignmentSubmission}%) is dangerously low.`
    });
    suggestions.push('Schedule academic workload discussion and assignment deadline extension support.');
  } else if (assignmentSubmission < 75) {
    factors.push({
      factor: 'Assignment Submission',
      value: `${assignmentSubmission}%`,
      impact: 'Medium',
      explanation: `Assignment submission rate (${assignmentSubmission}%) is slightly lagging.`
    });
  }

  // 4. Performance Trend Analysis
  if (trend <= -10) {
    factors.push({
      factor: 'Academic Performance Trend',
      value: `${trend > 0 ? '+' : ''}${trend.toFixed(1)}%`,
      impact: 'High',
      explanation: `Significant academic drop observed: recent marks (${recentPerf}%) dropped by ${Math.abs(trend).toFixed(1)}% compared to previous semester (${previousPerf}%).`
    });
    suggestions.push('Schedule urgent 1-on-1 faculty counselling session.');
  } else if (trend < 0) {
    factors.push({
      factor: 'Academic Performance Trend',
      value: `${trend.toFixed(1)}%`,
      impact: 'Medium',
      explanation: `Slight decline in recent performance (${recentPerf}%) compared to previous semester (${previousPerf}%).`
    });
  } else {
    factors.push({
      factor: 'Academic Performance Trend',
      value: `+${trend.toFixed(1)}%`,
      impact: 'Positive',
      explanation: `Student shows steady or improving performance trend.`
    });
  }

  // Fallback suggestion if low risk
  if (suggestions.length === 0) {
    suggestions.push('Maintain regular academic performance monitoring.');
  }

  // Remove duplicate suggestions
  const uniqueSuggestions = [...new Set(suggestions)];

  return {
    contributingFactors: factors,
    suggestedInterventions: uniqueSuggestions
  };
}

module.exports = {
  generateExplainabilityReport
};
