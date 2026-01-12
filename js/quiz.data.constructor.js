"use strict";

// Constructor Quiz questions data - Questions about construction and technical topics
// TODO: Extract questions from "test kons.pdf" file

const constructorQuizData = [
    // Placeholder - will be populated with actual questions from PDF
    // Format should match architect quiz data structure:
    // {
    //     topic: "Topic name",
    //     materials: "Source materials",
    //     question: "Question text",
    //     answers: [
    //         "Answer 1",
    //         "Answer 2",
    //         "Answer 3",
    //         "Answer 4" // optional
    //     ],
    //     correct: 0 // Index of correct answer (0-based)
    // }
];

// Expose to window
if (typeof window !== 'undefined') {
    window.constructorQuizData = constructorQuizData;
}

