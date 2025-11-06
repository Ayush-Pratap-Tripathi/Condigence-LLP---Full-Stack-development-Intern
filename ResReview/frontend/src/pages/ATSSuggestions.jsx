// src/pages/ATSSuggestions.jsx
import React from "react";
import { Lightbulb, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ATSSuggestions() {
  const criteria = [
    {
      title: "Keyword Optimization",
      description:
        "Ensure that your resume includes keywords and phrases from the job description. Use both full forms and abbreviations when relevant.",
      example:
        'If the job description says "Search Engine Optimization (SEO)", include both "SEO" and "Search Engine Optimization".',
    },
    {
      title: "Role Relevance",
      description:
        "Tailor your resume for the specific job role. Highlight achievements that directly align with the required skills and responsibilities.",
      example:
        'For a “Frontend Developer” role, emphasize JavaScript, React.js, and UI/UX design projects.',
    },
    {
      title: "Proper Formatting",
      description:
        "Use clean and simple layouts. Avoid tables, columns, or graphics that may confuse ATS parsers.",
      example:
        "Save your resume as a plain PDF or DOCX file using standard fonts like Arial or Calibri.",
    },
    {
      title: "Action-Oriented Language",
      description:
        "Use strong action verbs to describe accomplishments. Quantify results wherever possible.",
      example:
        'Instead of "Responsible for website redesign", write "Redesigned company website, improving load speed by 40%."',
    },
    {
      title: "No Unnecessary Graphics or Tables",
      description:
        "ATS systems may not read text within images or tables correctly. Keep resume sections simple and text-based.",
      example: "Avoid using icons or text boxes for key sections like experience or education.",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-6 md:px-16 lg:px-32">
      <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 p-8 md:p-12">
        <h1 className="text-3xl md:text-4xl font-bold text-blue-800 mb-4 flex items-center gap-3">
          <Lightbulb className="text-yellow-400 w-8 h-8" />
          Improve Your Resume’s ATS Score
        </h1>
        <p className="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
          Here are some guidelines and optimization strategies that can help improve a
          resume’s Applicant Tracking System (ATS) compatibility. You can update these
          suggestions anytime to adapt to evolving ATS algorithms or HR requirements.
        </p>

        <div className="grid gap-6 md:grid-cols-2">
          {criteria.map((tip, idx) => (
            <div
              key={idx}
              className="p-6 bg-white/80 backdrop-blur-md border border-blue-100 rounded-2xl shadow-md hover:shadow-blue-200/60 transition-all duration-500"
            >
              <h3 className="text-xl font-semibold text-blue-800 mb-2 flex items-center gap-2">
                <CheckCircle2 className="text-green-500 w-5 h-5" />
                {tip.title}
              </h3>
              <p className="text-gray-700 text-sm md:text-base mb-2">{tip.description}</p>
              <div className="text-sm text-gray-500 italic">
                <AlertTriangle className="inline-block text-yellow-500 w-4 h-4 mr-1" />
                Example: {tip.example}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 bg-blue-50 border border-blue-100 rounded-2xl p-6 text-center shadow-inner">
          <h2 className="text-2xl font-bold text-blue-700 mb-2">
            🔍 Sample ATS Scoring Criteria
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            Below is an example breakdown of how ATS score might be calculated.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse text-gray-700">
              <thead>
                <tr className="bg-blue-100 text-blue-800">
                  <th className="p-3 border border-blue-200">Criteria</th>
                  <th className="p-3 border border-blue-200">Weight (%)</th>
                  <th className="p-3 border border-blue-200">Description</th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-blue-50">
                  <td className="p-3 border border-blue-100">Keyword Match</td>
                  <td className="p-3 border border-blue-100 text-center">40%</td>
                  <td className="p-3 border border-blue-100">
                    How well the resume text matches required job keywords.
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="p-3 border border-blue-100">Experience Relevance</td>
                  <td className="p-3 border border-blue-100 text-center">30%</td>
                  <td className="p-3 border border-blue-100">
                    Experience and projects aligning with the job description.
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="p-3 border border-blue-100">Formatting & Structure</td>
                  <td className="p-3 border border-blue-100 text-center">20%</td>
                  <td className="p-3 border border-blue-100">
                    ATS readability and layout compliance.
                  </td>
                </tr>
                <tr className="hover:bg-blue-50">
                  <td className="p-3 border border-blue-100">Skills Match</td>
                  <td className="p-3 border border-blue-100 text-center">10%</td>
                  <td className="p-3 border border-blue-100">
                    Matching listed skills to job requirements.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <footer className="mt-12 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ResReview | ATS Score Tips Page
        </footer>
      </div>
    </section>
  );
}
