# Cassette Exam

A tiny, browser-based quiz app where questions come in like a cassette tape and your brain has to survive the playback. 

If you’ve ever wanted to load a quiz from a JSON file, answer questions one by one, review wrong attempts, and download your mistakes like a dramatic movie montage, this is your app.

## What this project does

This app lets you:

- Load a quiz from pasted JSON or a `.json` / `.txt` file
- Answer multiple-choice or multi-select questions
- Submit answers and get instant feedback
- Review explanations
- Retake only the questions you got wrong
- Download incorrect attempts as a PDF for your own personal suffering
- Keep everything local in the browser, which is fancy and privacy-friendly


## Why it exists
Because life is already too hard, and apparently there was a need for a no-nonsense exam app that feels like a retro cassette player had a mid-life crisis and decided to become educational software.

Also: it is super easy to customize with your own question sets.

## Features

- Local-only quiz flow
- File upload support for question cassettes
- Raw JSON paste support
- Multiple correct answers with configurable choice count
- Score tracking
- Incorrect-attempt review
- Retake flow for only the wrong questions
- PDF export for failed attempts
- Clean retro aesthetic with a cassette-inspired UI
 


## Quiz JSON format

Your question data should be an array of objects like this:

```json
[
  {
    "id": "q1",
    "question": "Which of the following are prime numbers?",
    "options": ["2", "4", "9", "11", "15"],
    "correct_answers": ["2", "11"],
    "choose_x_options": 2,
    "explanation": "2 and 11 are prime numbers because they have exactly two positive divisors."
  },
  {
    "id": "q2",
    "question": "Which material is a good conductor of electricity?",
    "options": ["Copper", "Rubber", "Glass", "Aluminium"],
    "correct_answers": ["Copper"],
    "choose_x_options": 1,
    "explanation": "Copper has free electrons that allow electric current to flow easily."
  }
]
```

### Rules

- `question` must be a non-empty string
- `options` must be an array with at least 3 values and no more than 9
- `correct_answers` must match `choose_x_options`
- Every correct answer must exist in `options`
- `choose_x_options` must be a valid integer between 1 and the number of options

If this structure is violated, the app will politely throw a validation error and say, “Nope. Not today, buddy.”

## How to use the app

1. Open the app in the browser
2. Paste your JSON or upload a `.json` / `.txt` file
3. Click “PLAY CASSETTE →”
4. Answer the questions
5. Submit each answer like a responsible adult
6. Review explanations when the app finally decides to be helpful
7. On the summary screen, you can:
   - retake wrong questions
   - download incorrect attempts as a PDF
   - start over with a new cassette

## Retake and PDF features

The app has a very specific emotional arc:

- You get a question wrong
- The app says, “This is fine.”
- You get to retake only the bad ones
- You can print/download a PDF of all your tragic mistakes
- You go back and study like a champion

This is not therapy. It is just good exam design with a little bit of dramatic flair.

## Troubleshooting

### The app doesn’t load

- Make sure all files are in the project root
- Check that the browser can access `app.js` and `styles.css`
- Serve it through a local web server instead of opening the file directly if things act weird

### JSON won’t parse

- Check the JSON is valid
- Remove trailing commas
- Ensure the top-level value is an array
- Make sure strings are wrapped in double quotes

### PDF export does nothing

- Make sure there are some incorrect questions to print
- Use the browser’s print dialog and confirm the print layout is enabled

## Notes

This app is intentionally lightweight and easy to extend. If you want to add:

- more question types
- score analytics
- timers
- a randomizer
- a custom theme
- a fully dramatic intro screen with sound effects

...it is very possible without rewriting the entire project. The app is basically a clean little box of chaos and that is a compliment.

## Final thoughts

This project is a small but surprisingly useful quiz system, built with the energy of a student who forgot to study until the night before and then made a website out of panic.

It works, it’s easy to customize, and it is absolutely ready for your next little knowledge-based experiment.

If you are reading this, congrats. You have found the weird little exam app that somehow managed to become a functioning educational tool while looking like a cassette tape from a 90s sci-fi film.

Now go forth and quiz the world.

## License

No explicit license has been added yet. If you plan to share it publicly, consider adding one later.
