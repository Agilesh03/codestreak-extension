require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

const PORT =
    process.env.PORT || 3000;

const GITHUB_CLIENT_ID =
    process.env.GITHUB_CLIENT_ID;

const GITHUB_CLIENT_SECRET =
    process.env.GITHUB_CLIENT_SECRET;


/* =========================================
   CONFIGURATION
========================================= */

const EXTENSION_ID =
    "inpceobmmiadeohdngfcldkpopgkphbl";


const REDIRECT_URI =
    `https://${EXTENSION_ID}.chromiumapp.org/`;


const GITHUB_API =
    "https://api.github.com";


const GITHUB_API_VERSION =
    "2026-03-10";


const DEFAULT_REPOSITORY =
    "LeetCode-Solutions";


const DEFAULT_BRANCH =
    "master";


/* =========================================
   MIDDLEWARE
========================================= */

app.use(
    cors()
);


app.use(
    express.json({
        limit: "1mb"
    })
);


/* =========================================
   GITHUB HEADERS
========================================= */

function githubHeaders(accessToken) {

    return {

        "Accept":
            "application/vnd.github+json",

        "Authorization":
            `Bearer ${accessToken}`,

        "X-GitHub-Api-Version":
            GITHUB_API_VERSION,

        "Content-Type":
            "application/json"

    };

}


/* =========================================
   HEALTH CHECK
========================================= */

app.get(
    "/health",
    (req, res) => {

        res.json({

            success: true,

            message:
                "CodeStreak backend is running."

        });

    }
);


/* =========================================
   GITHUB OAUTH CODE EXCHANGE
========================================= */

app.post(
    "/github/exchange",
    async (req, res) => {

        try {

            const {
                code,
                code_verifier,
                redirect_uri
            } = req.body;


            /* -----------------------------
               VALIDATE REQUEST
            ----------------------------- */

            if (!code) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Authorization code is missing."

                });

            }


            if (!code_verifier) {

                return res.status(400).json({

                    success: false,

                    error:
                        "PKCE code verifier is missing."

                });

            }


            /* -----------------------------
               VALIDATE REDIRECT URI
            ----------------------------- */

            if (
                redirect_uri !==
                REDIRECT_URI
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Invalid redirect URI."

                });

            }


            /* -----------------------------
               VALIDATE ENVIRONMENT
            ----------------------------- */

            if (
                !GITHUB_CLIENT_ID ||
                !GITHUB_CLIENT_SECRET
            ) {

                console.error(
                    "GitHub credentials are missing."
                );


                return res.status(500).json({

                    success: false,

                    error:
                        "GitHub backend credentials are not configured."

                });

            }


            console.log(
                "CodeStreak: exchanging GitHub authorization code..."
            );


            /* -----------------------------
               EXCHANGE CODE WITH GITHUB
            ----------------------------- */

            const githubResponse =
                await fetch(
                    "https://github.com/login/oauth/access_token",
                    {

                        method: "POST",

                        headers: {

                            "Accept":
                                "application/json",

                            "Content-Type":
                                "application/json"

                        },

                        body:
                            JSON.stringify({

                                client_id:
                                    GITHUB_CLIENT_ID,

                                client_secret:
                                    GITHUB_CLIENT_SECRET,

                                code:
                                    code,

                                redirect_uri:
                                    REDIRECT_URI,

                                code_verifier:
                                    code_verifier

                            })

                    }
                );


            const githubData =
                await githubResponse.json();


            console.log(
                "GitHub response received."
            );


            /* -----------------------------
               GITHUB ERROR
            ----------------------------- */

            if (
                !githubResponse.ok ||
                githubData.error
            ) {

                console.error(
                    "GitHub OAuth error:",
                    githubData
                );


                return res.status(400).json({

                    success: false,

                    error:
                        githubData.error_description ||
                        githubData.error ||
                        "GitHub authorization failed."

                });

            }


            /* -----------------------------
               CHECK TOKEN
            ----------------------------- */

            if (
                !githubData.access_token
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "GitHub did not return an access token."

                });

            }


            /* -----------------------------
               RETURN TOKEN
            ----------------------------- */

            return res.json({

                success: true,

                access_token:
                    githubData.access_token,

                token_type:
                    githubData.token_type,

                expires_in:
                    githubData.expires_in,

                refresh_token:
                    githubData.refresh_token,

                refresh_token_expires_in:
                    githubData.refresh_token_expires_in

            });

        }

        catch (error) {

            console.error(
                "Backend OAuth error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    "Internal server error."

            });

        }

    }
);


/* =========================================
   SANITIZE FILE NAME
========================================= */

function sanitizeFileName(name) {

    return String(name)

        .trim()

        .replace(
            /[<>:"/\\|?*\x00-\x1F]/g,
            ""
        )

        .replace(
            /\s+/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        )

        .replace(
            /^[-.]+|[-.]+$/g,
            ""
        );

}


/* =========================================
   SANITIZE SLUG
========================================= */

function sanitizeSlug(slug) {

    return String(slug || "")

        .trim()

        .toLowerCase()

        .replace(
            /[^a-z0-9-]/g,
            "-"
        )

        .replace(
            /-+/g,
            "-"
        )

        .replace(
            /^-+|-+$/g,
            ""
        );

}


/* =========================================
   LANGUAGE INFORMATION
========================================= */

function getLanguageInfo(language) {

    const normalized =
        String(language || "")
            .trim()
            .toLowerCase();


    const languages = {

        python: {

            folder: "Python",

            extension: ".py"

        },

        python3: {

            folder: "Python",

            extension: ".py"

        },

        javascript: {

            folder: "JavaScript",

            extension: ".js"

        },

        typescript: {

            folder: "TypeScript",

            extension: ".ts"

        },

        java: {

            folder: "Java",

            extension: ".java"

        },

        cpp: {

            folder: "C++",

            extension: ".cpp"

        },

        "c++": {

            folder: "C++",

            extension: ".cpp"

        },

        c: {

            folder: "C",

            extension: ".c"

        },

        csharp: {

            folder: "CSharp",

            extension: ".cs"

        },

        "c#": {

            folder: "CSharp",

            extension: ".cs"

        },

        go: {

            folder: "Go",

            extension: ".go"

        },

        rust: {

            folder: "Rust",

            extension: ".rs"

        },

        kotlin: {

            folder: "Kotlin",

            extension: ".kt"

        },

        swift: {

            folder: "Swift",

            extension: ".swift"

        },

        php: {

            folder: "PHP",

            extension: ".php"

        },

        ruby: {

            folder: "Ruby",

            extension: ".rb"

        },

        scala: {

            folder: "Scala",

            extension: ".scala"

        }

    };


    return (
        languages[normalized] || {

            folder:
                sanitizeFileName(
                    language || "Other"
                ),

            extension:
                ".txt"

        }
    );

}


/* =========================================
   GET GITHUB USER
========================================= */

async function getGithubUser(
    accessToken
) {

    const response =
        await fetch(

            `${GITHUB_API}/user`,

            {

                method: "GET",

                headers:
                    githubHeaders(
                        accessToken
                    )

            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            "GitHub authentication failed."

        );

    }


    return data;

}


/* =========================================
   CHECK REPOSITORY
========================================= */

async function checkRepository(
    accessToken,
    owner,
    repository
) {

    const response =
        await fetch(

            `${GITHUB_API}/repos/${encodeURIComponent(
                owner
            )}/${encodeURIComponent(
                repository
            )}`,

            {

                method: "GET",

                headers:
                    githubHeaders(
                        accessToken
                    )

            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            `Repository "${repository}" was not found or is not accessible.`

        );

    }


    return data;

}


/* =========================================
   GET EXISTING FILE
========================================= */

async function getExistingFile(
    accessToken,
    owner,
    repository,
    path,
    branch
) {

    const url =

        `${GITHUB_API}/repos/` +

        `${encodeURIComponent(owner)}/` +

        `${encodeURIComponent(repository)}/` +

        `contents/${path.split("/").map(
            encodeURIComponent
        ).join("/")}` +

        `?ref=${encodeURIComponent(branch)}`;


    const response =
        await fetch(

            url,

            {

                method: "GET",

                headers:
                    githubHeaders(
                        accessToken
                    )

            }

        );


    if (
        response.status === 404
    ) {

        return null;

    }


    const data =
        await response.json();


    if (!response.ok) {

        throw new Error(

            data.message ||
            "Could not check existing GitHub file."

        );

    }


    return data;

}


/* =========================================
   CREATE / UPDATE GITHUB FILE
========================================= */

async function createOrUpdateFile({

    accessToken,

    owner,

    repository,

    path,

    content,

    branch,

    commitMessage,

    existingFile

}) {

    const url =

        `${GITHUB_API}/repos/` +

        `${encodeURIComponent(owner)}/` +

        `${encodeURIComponent(repository)}/` +

        `contents/${path.split("/").map(
            encodeURIComponent
        ).join("/")}`;


    const body = {

        message:
            commitMessage,

        content:
            Buffer.from(
                content,
                "utf8"
            ).toString("base64"),

        branch:
            branch

    };


    if (
        existingFile &&
        existingFile.sha
    ) {

        body.sha =
            existingFile.sha;

    }


    const response =
        await fetch(

            url,

            {

                method: "PUT",

                headers:
                    githubHeaders(
                        accessToken
                    ),

                body:
                    JSON.stringify(body)

            }

        );


    const data =
        await response.json();


    if (!response.ok) {

        console.error(
            "GitHub file API error:",
            data
        );


        throw new Error(

            data.message ||
            "GitHub could not create/update the file."

        );

    }


    return data;

}


/* =========================================
   PUSH SOLUTION
========================================= */

app.post(
    "/github/push",
    async (req, res) => {

        try {

            const {

                access_token,

                username,

                repository,

                problem_name,

                problem_slug,

                language,

                code,

                branch

            } = req.body;


            /* -----------------------------
               VALIDATE ACCESS TOKEN
            ----------------------------- */

            if (!access_token) {

                return res.status(401).json({

                    success: false,

                    error:
                        "GitHub access token is missing."

                });

            }


            /* -----------------------------
               VALIDATE CODE
            ----------------------------- */

            if (
                typeof code !== "string" ||
                !code.trim()
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Solution code is missing."

                });

            }


            /* -----------------------------
               VALIDATE PROBLEM
            ----------------------------- */

            if (!problem_name) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Problem name is missing."

                });

            }


            if (!language) {

                return res.status(400).json({

                    success: false,

                    error:
                        "Programming language is missing."

                });

            }


            /* -----------------------------
               VERIFY GITHUB USER
            ----------------------------- */

            const githubUser =
                await getGithubUser(
                    access_token
                );


            const owner =
                githubUser.login;


            /* -----------------------------
               OPTIONAL USERNAME CHECK
            ----------------------------- */

            if (
                username &&
                username.toLowerCase() !==
                owner.toLowerCase()
            ) {

                return res.status(403).json({

                    success: false,

                    error:
                        "GitHub username does not match the authenticated account."

                });

            }


            /* -----------------------------
               REPOSITORY
            ----------------------------- */

            const repo =
                repository ||
                DEFAULT_REPOSITORY;


            if (
                repo !==
                DEFAULT_REPOSITORY
            ) {

                return res.status(400).json({

                    success: false,

                    error:
                        `Only "${DEFAULT_REPOSITORY}" is supported.`

                });

            }


            /* -----------------------------
               BRANCH
            ----------------------------- */

            const targetBranch =
                branch ||
                DEFAULT_BRANCH;


            /* -----------------------------
               CHECK REPOSITORY
            ----------------------------- */

            await checkRepository(

                access_token,

                owner,

                repo

            );


            /* -----------------------------
               LANGUAGE
            ----------------------------- */

            const languageInfo =
                getLanguageInfo(
                    language
                );


            /* -----------------------------
               FILE NAME
            ----------------------------- */

            let fileName =
                sanitizeFileName(
                    problem_name
                );


            if (!fileName) {

                fileName =
                    sanitizeSlug(
                        problem_slug
                    );

            }


            if (!fileName) {

                fileName =
                    "leetcode-solution";

            }


            /* -----------------------------
               FILE PATH
            ----------------------------- */

            const path =

                `${languageInfo.folder}/` +

                `${fileName}` +

                `${languageInfo.extension}`;


            /* -----------------------------
               EXISTING FILE
            ----------------------------- */

            const existingFile =
                await getExistingFile(

                    access_token,

                    owner,

                    repo,

                    path,

                    targetBranch

                );


            /* -----------------------------
               COMMIT MESSAGE
            ----------------------------- */

            const commitMessage =

                existingFile

                    ? `Update ${problem_name} solution`

                    : `Solve: ${problem_name} solution`;


            /* -----------------------------
               CREATE / UPDATE
            ----------------------------- */

            const result =
                await createOrUpdateFile({

                    accessToken:
                        access_token,

                    owner:
                        owner,

                    repository:
                        repo,

                    path:
                        path,

                    content:
                        code,

                    branch:
                        targetBranch,

                    commitMessage:
                        commitMessage,

                    existingFile:
                        existingFile

                });


            /* -----------------------------
               SUCCESS
            ----------------------------- */

            console.log(
                "================================"
            );

            console.log(
                "CodeStreak GitHub push successful"
            );

            console.log(
                `User: ${owner}`
            );

            console.log(
                `Repository: ${repo}`
            );

            console.log(
                `Path: ${path}`
            );

            console.log(
                `Branch: ${targetBranch}`
            );

            console.log(
                "================================"
            );


            return res.status(
                existingFile
                    ? 200
                    : 201
            ).json({

                success: true,

                message:
                    existingFile
                        ? "Solution updated successfully."
                        : "Solution pushed successfully.",

                username:
                    owner,

                repository:
                    repo,

                branch:
                    targetBranch,

                path:
                    path,

                file_name:
                    `${fileName}${languageInfo.extension}`,

                language:
                    languageInfo.folder,

                created:
                    !existingFile,

                updated:
                    !!existingFile,

                commit_sha:
                    result.commit?.sha ||
                    null,

                commit_url:
                    result.commit?.html_url ||
                    null,

                file_url:
                    result.content?.html_url ||
                    null

            });

        }

        catch (error) {

            console.error(
                "CodeStreak GitHub push error:",
                error
            );


            return res.status(500).json({

                success: false,

                error:
                    error.message ||
                    "Failed to push solution to GitHub."

            });

        }

    }
);


/* =========================================
   404 HANDLER
========================================= */

app.use(
    (req, res) => {

        res.status(404).json({

            success: false,

            error:
                `Route not found: ${req.method} ${req.originalUrl}`

        });

    }
);


/* =========================================
   GLOBAL ERROR HANDLER
========================================= */

app.use(
    (error, req, res, next) => {

        console.error(
            "Unhandled backend error:",
            error
        );


        res.status(500).json({

            success: false,

            error:
                "Internal server error."

        });

    }
);


/* =========================================
   START SERVER
========================================= */

app.listen(
    PORT,
    () => {

        console.log(
            "================================"
        );

        console.log(
            "CodeStreak backend started"
        );

        console.log(
            `http://localhost:${PORT}`
        );

        console.log(
            `GitHub redirect URI: ${REDIRECT_URI}`
        );

        console.log(
            "GitHub push endpoint:"
        );

        console.log(
            `http://localhost:${PORT}/github/push`
        );

        console.log(
            "================================"
        );

    }
);