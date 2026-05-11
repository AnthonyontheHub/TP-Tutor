import React, { useState, useEffect } from 'react';
import { examData } from '../data/examQuestions';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolveApiKey } from '../services/linaService';

interface ExamActivityProps {
  nodeId: string;
  onComplete: () => void;
}

type ExamType = 'midterm' | 'final';

export const ExamActivity: React.FC<ExamActivityProps> = ({ nodeId, onComplete }) => {
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<'writing' | 'grading' | 'finished'>('writing');
  const [markdownResult, setMarkdownResult] = useState<string>('');

  const examType: ExamType = nodeId === 'midterm_exam' ? 'midterm' : 'final';
  const questions = examData[examType] || [];

  // Group questions by section
  const sections = questions.reduce((acc, q) => {
    if (!acc[q.section]) acc[q.section] = [];
    acc[q.section].push(q);
    return acc;
  }, {} as Record<string, typeof questions>);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setStatus('grading');

    try {
      const apiKey = resolveApiKey();
      if (!apiKey) throw new Error("No API key available");

      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

      let qaText = '';
      questions.forEach(q => {
        qaText += `Question: ${q.question}\nCorrect Answer: ${q.correctAnswer}\nStudent Answer: ${answers[q.id] || 'No answer'}\n\n`;
      });

      const prompt = `You are Jan Lina, a professional and encouraging Toki Pona tutor. 
Your goal is to grade the following exam strictly according to the provided Blueprint, but with a supportive, teacherly tone.

### GRADING PRINCIPLES:
1. STRICTNESS: Follow the 'Diagnostic Interpretation Guide' exactly. Do not award points for "close enough" answers. If a grammar particle is missing or incorrect, it is an error.
2. THRESHOLDS: Enforce the 70% total + 50% per-section pass rule. If the student fails, be clear that they cannot advance yet, but explain that this is part of the 'nasin' (way) of learning.
3. KINDNESS: Use "Secondbrain" callouts (> [!info], > [!tip]) to provide helpful hints for missed questions. Instead of just saying "Wrong," say "Not quite! In Toki Pona, we use [concept] here because..."

### DATA PROVIDED:
- EXAM SPECIFICATION: [Insert contents of toki_pona_intro_exams.md here]
- EXAM TYPE: ${examType}
- STUDENT ANSWERS: ${JSON.stringify(answers)}
- QUESTIONS & CORRECT ANSWERS:
${qaText}

### OUTPUT REQUIREMENT:
Generate ONLY a raw Markdown file. 
- Use YAML Frontmatter for metadata (score, status, etc.).
- Use Obsidian-style callouts (> [!check] for correct, > [!fail] for incorrect).
- End with the mandatory 7-point "Final Mastery Report" as specified in the blueprint.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Ensure no markdown block formatting escapes into the raw UI
      setMarkdownResult(text.replace(/^```markdown/i, '').replace(/^```/, '').replace(/```$/, '').trim());
      setStatus('finished');
    } catch (error) {
      console.error('Grading error:', error);
      // Fallback
      let result = `# Toki Pona ${examType === 'midterm' ? 'Midterm' : 'Final'} Exam Results\n\n`;
      questions.forEach(q => {
        result += `**Q:** ${q.question}\n`;
        result += `**Your Answer:** ${answers[q.id] || 'No answer provided'}\n\n`;
      });
      setMarkdownResult(result);
      setStatus('finished');
    }
  };

  const handleDownload = () => {
    const blob = new Blob([markdownResult], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `toki-pona-exam-${examType}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (status === 'grading') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">jan Lina is grading your exam...</h2>
        <p className="text-slate-600 dark:text-slate-400">Please wait while your answers are reviewed.</p>
      </div>
    );
  }

  if (status === 'finished') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center space-y-6">
        <h2 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">Mastery Report Ready</h2>
        <p className="text-lg text-slate-700 dark:text-slate-300 max-w-xl">
          jan Lina has finished grading your exam. You can now download your results as a Markdown file for your Secondbrain.
        </p>
        <div className="flex space-x-4 mt-8">
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md transition-colors"
          >
            Download Secondbrain (.md)
          </button>
          <button
            onClick={onComplete}
            className="px-6 py-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 rounded-lg overflow-hidden flex-grow flex-shrink-0">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 capitalize">{examType} Exam</h2>
        <p className="text-slate-500 mt-2">Answer the questions below to test your mastery.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-10">
        {Object.entries(sections).map(([sectionName, sectionQuestions]) => (
          <div key={sectionName} className="space-y-6">
            <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 border-b pb-2">{sectionName}</h3>
            {sectionQuestions.map((q, index) => (
              <div key={q.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-5 border border-slate-200 dark:border-slate-700">
                <p className="font-medium text-slate-800 dark:text-slate-200 mb-4">{index + 1}. {q.question} <span className="text-sm text-slate-400 font-normal">({q.points} pts)</span></p>
                
                {q.type === 'mcq' && q.options && (
                  <div className="space-y-3">
                    {q.options.map(opt => (
                      <label key={opt} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <input 
                          type="radio" 
                          name={q.id} 
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                          className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                        />
                        <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                      </label>
                    ))}
                  </div>
                )}

                {q.type === 'tf' && (
                  <div className="flex space-x-6">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value="true"
                        checked={answers[q.id] === 'true'}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-slate-700 dark:text-slate-300">True</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                      <input 
                        type="radio" 
                        name={q.id} 
                        value="false"
                        checked={answers[q.id] === 'false'}
                        onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                        className="text-emerald-500 focus:ring-emerald-500 w-4 h-4"
                      />
                      <span className="text-slate-700 dark:text-slate-300">False</span>
                    </label>
                  </div>
                )}

                {(q.type === 'text' || q.type === 'reorder') && (
                  <div>
                    <input 
                      type="text" 
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-md px-4 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    {q.type === 'reorder' && q.options && (
                      <p className="mt-2 text-sm text-slate-500">Available words: {q.options.join(', ')}</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-slate-900/50 flex justify-end">
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium shadow-md transition-colors"
        >
          Submit Final Exam
        </button>
      </div>
    </div>
  );
};
