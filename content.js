console.log("CodeStreak content.js loaded");


/* =========================================
   PROBLEM INFORMATION
========================================= */

function getProblemSlug() {

    const path =
        window.location.pathname;

    const match =
        path.match(/\/problems\/([^/]+)/);

    return match
        ? match[1]
        : null;
}


function getProblemName() {

    const heading =
        document.querySelector("h1");

    if (
        heading &&
        heading.innerText.trim()
    ) {

        const text =
            heading.innerText.trim();

        const numberedMatch =
            text.match(/^(\d+)\.\s*(.+)$/);

        if (numberedMatch) {
            return numberedMatch[2].trim();
        }

        return text;
    }


    const title =
        document.title;

    if (title) {

        const match =
            title.match(
                /^(.+?)\s*-\s*LeetCode/
            );

        if (match) {
            return match[1].trim();
        }
    }


    const slug =
        getProblemSlug();

    if (slug) {

        return slug
            .split("-")
            .map(
                word =>
                    word.charAt(0).toUpperCase()
                    + word.slice(1)
            )
            .join(" ");
    }


    return null;
}


function getProblemNumber() {

    const headings =
        document.querySelectorAll("h1");

    for (const heading of headings) {

        const text =
            heading.innerText.trim();

        const match =
            text.match(/^(\d+)\.\s*/);

        if (match) {
            return Number(match[1]);
        }
    }

    return null;
}


function getDifficulty() {

    const elements =
        document.querySelectorAll(
            "span, div, button"
        );

    for (const element of elements) {

        const text =
            element.innerText?.trim();

        if (text === "Easy") {
            return "Easy";
        }

        if (text === "Medium") {
            return "Medium";
        }

        if (text === "Hard") {
            return "Hard";
        }
    }

    return null;
}


/* =========================================
   READ CODE FROM MONACO DOM
========================================= */

function getEditorCode() {

    console.log(
        "CodeStreak: Looking for Monaco editor..."
    );


    /*
     * Monaco renders the visible code inside:
     *
     * .view-lines
     *     .view-line
     */

    const editor =
        document.querySelector(
            ".monaco-editor"
        );


    if (!editor) {

        return {

            success: false,

            error:
                "Monaco editor not found."
        };
    }


    const lineElements =
        editor.querySelectorAll(
            ".view-lines .view-line"
        );


    if (
        !lineElements ||
        lineElements.length === 0
    ) {

        return {

            success: false,

            error:
                "Could not find code lines."
        };
    }


    const lines = [];


    lineElements.forEach(
        (line) => {

            /*
             * innerText gives us the visible
             * code on each Monaco line.
             */

            lines.push(
                line.innerText || ""
            );
        }
    );


    const code =
        lines.join("\n");


    console.log(
        "CodeStreak: Code extracted:"
    );

    console.log(code);


    return {

        success: true,

        code: code,

        lines: lines.length,

        language:
            detectLanguage()
    };
}


/* =========================================
   DETECT PROGRAMMING LANGUAGE
========================================= */

function detectLanguage() {

    /*
     * Look for common LeetCode language
     * selector text.
     */

    const elements =
        document.querySelectorAll(
            "button, span, div"
        );


    const languages = [

        "Python",

        "Python3",

        "Java",

        "JavaScript",

        "TypeScript",

        "C++",

        "C",

        "C#",

        "Go",

        "Rust",

        "Kotlin",

        "Swift",

        "PHP",

        "Ruby",

        "Dart"

    ];


    for (const element of elements) {

        const text =
            element.innerText?.trim();


        if (!text) {
            continue;
        }


        for (const language of languages) {

            if (
                text === language ||
                text.startsWith(
                    language + " "
                )
            ) {

                return language;
            }
        }
    }


    return "Unknown";
}


/* =========================================
   GET PROBLEM
========================================= */

function detectProblem() {

    return {

        success: true,

        number:
            getProblemNumber(),

        name:
            getProblemName(),

        slug:
            getProblemSlug(),

        difficulty:
            getDifficulty(),

        url:
            window.location.href
    };
}


/* =========================================
   MESSAGE LISTENER
========================================= */

chrome.runtime.onMessage.addListener(

    function (
        message,
        sender,
        sendResponse
    ) {

        console.log(
            "CodeStreak received message:",
            message
        );


        /* -----------------------------
           GET PROBLEM
        ------------------------------ */

        if (
            message.type ===
            "GET_PROBLEM"
        ) {

            sendResponse(
                detectProblem()
            );

            return true;
        }


        /* -----------------------------
           GET CODE
        ------------------------------ */

        if (
            message.type ===
            "GET_CODE"
        ) {

            console.log(
                "CodeStreak: GET_CODE received."
            );


            const result =
                getEditorCode();


            console.log(
                "CodeStreak: Sending code result:",
                result
            );


            sendResponse(
                result
            );


            return true;
        }


        /* -----------------------------
           PING
        ------------------------------ */

        if (
            message.type ===
            "PING"
        ) {

            sendResponse({

                success: true,

                message:
                    "Content script is alive."

            });


            return true;
        }


        return false;
    }
);