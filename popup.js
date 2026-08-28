/* =========================================
   CODESTREAK
   LeetCode → GitHub
========================================= */


/* =========================================
   DOM ELEMENTS
========================================= */

const problemContainer =
    document.getElementById("problem");

const codeStatus =
    document.getElementById("code-status");

const getCodeButton =
    document.getElementById("get-code");

const codePreview =
    document.getElementById("code-preview");

const hideCodeButton =
    document.getElementById("hide-code");

const pushGithubButton =
    document.getElementById("push-github");

const pushStatus =
    document.getElementById("push-status");

const githubStatus =
    document.getElementById("github-status");

const connectGithubButton =
    document.getElementById("connect-github");

const disconnectGithubButton =
    document.getElementById("disconnect-github");


/* =========================================
   GITHUB CONFIGURATION
========================================= */

const GITHUB_CLIENT_ID =
    "Iv23libW7yKRUdVv0Jb8";

const BACKEND_URL =
    "http://localhost:3000";

const GITHUB_REDIRECT_URI =
    chrome.identity.getRedirectURL();


/* =========================================
   CURRENT SOLUTION
========================================= */

let currentSolutionCode = "";

let currentSolutionLanguage = "";

let currentProblem = null;


/* =========================================
   GET ACTIVE TAB
========================================= */

async function getCurrentTab() {

    const tabs =
        await chrome.tabs.query({

            active: true,

            currentWindow: true

        });


    if (!tabs || !tabs.length) {

        return null;

    }


    return tabs[0];

}


/* =========================================
   HTML ESCAPE
========================================= */

function escapeHtml(value) {

    return String(value ?? "")

        .replaceAll("&", "&amp;")

        .replaceAll("<", "&lt;")

        .replaceAll(">", "&gt;")

        .replaceAll('"', "&quot;")

        .replaceAll("'", "&#039;");

}


/* =========================================
   SHOW PROBLEM
========================================= */

function showProblem(problem) {

    if (
        !problem ||
        !problem.name
    ) {

        problemContainer.innerHTML = `

            <div class="error">

                Could not detect a
                LeetCode problem.

            </div>

        `;

        return;

    }


    currentProblem =
        problem;


    const number =
        problem.number
            ? `#${problem.number}`
            : "#?";


    const difficulty =
        problem.difficulty ||
        "Unknown";


    let difficultyClass =
        "difficulty-unknown";


    if (difficulty === "Easy") {

        difficultyClass =
            "difficulty-easy";

    }


    if (difficulty === "Medium") {

        difficultyClass =
            "difficulty-medium";

    }


    if (difficulty === "Hard") {

        difficultyClass =
            "difficulty-hard";

    }


    problemContainer.innerHTML = `

        <div class="problem-number">

            ${escapeHtml(number)}

        </div>


        <div class="problem-name">

            ${escapeHtml(problem.name)}

        </div>


        <div class="problem-meta">

            <span
                class="${difficultyClass}"
            >

                ${escapeHtml(difficulty)}

            </span>

        </div>


        <div class="problem-slug">

            ${escapeHtml(problem.slug || "")}

        </div>

    `;

}


/* =========================================
   SHOW ERROR
========================================= */

function showError(message) {

    if (!problemContainer) {

        return;

    }


    problemContainer.innerHTML = `

        <div class="error">

            ${escapeHtml(message)}

        </div>

    `;

}


/* =========================================
   GET CURRENT PROBLEM
========================================= */

async function getCurrentProblem() {

    try {

        const tab =
            await getCurrentTab();


        if (!tab) {

            showError(
                "No active tab found."
            );

            return;

        }


        if (
            !tab.url ||
            !tab.url.startsWith(
                "https://leetcode.com/problems/"
            )
        ) {

            showError(
                "Open a LeetCode problem first."
            );

            return;

        }


        chrome.tabs.sendMessage(

            tab.id,

            {
                type: "GET_PROBLEM"
            },

            (response) => {

                if (
                    chrome.runtime.lastError
                ) {

                    console.error(
                        "CodeStreak:",
                        chrome.runtime.lastError.message
                    );


                    showError(
                        "Please refresh the LeetCode page."
                    );


                    return;

                }


                if (!response) {

                    showError(
                        "Could not detect the problem."
                    );


                    return;

                }


                showProblem(
                    response
                );

            }

        );

    }

    catch (error) {

        console.error(
            "CodeStreak:",
            error
        );


        showError(
            error.message
        );

    }

}


/* =========================================
   GET PROBLEM DATA
========================================= */

async function getProblemData() {

    const tab =
        await getCurrentTab();


    if (!tab) {

        throw new Error(
            "No active tab."
        );

    }


    return new Promise(
        (resolve, reject) => {

            chrome.tabs.sendMessage(

                tab.id,

                {
                    type: "GET_PROBLEM"
                },

                (response) => {

                    if (
                        chrome.runtime.lastError
                    ) {

                        reject(
                            new Error(
                                chrome.runtime
                                    .lastError
                                    .message
                            )
                        );

                        return;

                    }


                    if (!response) {

                        reject(
                            new Error(
                                "Could not detect the problem."
                            )
                        );

                        return;

                    }


                    resolve(response);

                }

            );

        }
    );

}


/* =========================================
   GET MY CODE
========================================= */

async function getMyCode() {

    if (!codeStatus) {

        return;

    }


    codeStatus.innerHTML = `

        <div class="loading">

            Reading Monaco editor...

        </div>

    `;


    if (getCodeButton) {

        getCodeButton.disabled =
            true;

    }


    try {

        const tab =
            await getCurrentTab();


        if (!tab) {

            throw new Error(
                "No active tab found."
            );

        }


        if (
            !tab.url ||
            !tab.url.startsWith(
                "https://leetcode.com/problems/"
            )
        ) {

            throw new Error(
                "Open a LeetCode problem first."
            );

        }


        chrome.tabs.sendMessage(

            tab.id,

            {
                type: "GET_CODE"
            },

            (response) => {

                if (getCodeButton) {

                    getCodeButton.disabled =
                        false;

                }


                if (
                    chrome.runtime.lastError
                ) {

                    codeStatus.innerHTML = `

                        <div class="code-error">

                            Please refresh the
                            LeetCode page.

                        </div>

                    `;


                    return;

                }


                if (!response) {

                    codeStatus.innerHTML = `

                        <div class="code-error">

                            No response received.

                        </div>

                    `;


                    return;

                }


                if (!response.success) {

                    codeStatus.innerHTML = `

                        <div class="code-error">

                            ${escapeHtml(
                                response.error ||
                                "Could not read editor."
                            )}

                        </div>

                    `;


                    return;

                }


                showCodeInfo(
                    response
                );

            }

        );

    }

    catch (error) {

        console.error(
            "CodeStreak:",
            error
        );


        if (getCodeButton) {

            getCodeButton.disabled =
                false;

        }


        codeStatus.innerHTML = `

            <div class="code-error">

                ${escapeHtml(
                    error.message
                )}

            </div>

        `;

    }

}


/* =========================================
   SHOW CODE INFORMATION
========================================= */

function showCodeInfo(data) {

    currentSolutionCode =
        data.code || "";


    currentSolutionLanguage =
        data.language || "Unknown";


    codeStatus.innerHTML = `

        <div class="code-success">

            ✓ Code captured

        </div>


        <div class="code-info">

            <div class="code-language">

                Language:
                ${escapeHtml(
                    currentSolutionLanguage
                )}

            </div>


            <div class="code-lines">

                Lines:
                ${data.lines || 0}

            </div>

        </div>

    `;


    if (codePreview) {

        codePreview.textContent =
            currentSolutionCode;


        codePreview.style.display =
            "block";

    }


    if (hideCodeButton) {

        hideCodeButton.style.display =
            "block";


        hideCodeButton.textContent =
            "Hide Code";

    }


    if (pushGithubButton) {

        pushGithubButton.style.display =
            "block";

    }


    if (pushStatus) {

        pushStatus.innerHTML = "";

    }


    console.log(
        "CodeStreak captured code:",
        currentSolutionCode
    );

}


/* =========================================
   SHOW / HIDE CODE
========================================= */

function toggleCode() {

    if (
        !codePreview ||
        !hideCodeButton
    ) {

        return;

    }


    const display =
        window.getComputedStyle(
            codePreview
        ).display;


    if (display === "none") {

        codePreview.style.display =
            "block";


        hideCodeButton.textContent =
            "Hide Code";

    }

    else {

        codePreview.style.display =
            "none";


        hideCodeButton.textContent =
            "Show Code";

    }

}


/* =========================================
   RANDOM STRING
========================================= */

function generateRandomString(
    length = 64
) {

    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~";


    let result = "";


    const randomValues =
        new Uint8Array(length);


    crypto.getRandomValues(
        randomValues
    );


    for (
        let i = 0;
        i < randomValues.length;
        i++
    ) {

        result +=
            characters[
                randomValues[i] %
                characters.length
            ];

    }


    return result;

}


/* =========================================
   SHA-256
========================================= */

async function sha256(text) {

    const encoder =
        new TextEncoder();


    const data =
        encoder.encode(text);


    return crypto.subtle.digest(
        "SHA-256",
        data
    );

}


/* =========================================
   BASE64 URL ENCODE
========================================= */

function base64UrlEncode(buffer) {

    const bytes =
        new Uint8Array(buffer);


    let binary = "";


    bytes.forEach(
        (byte) => {

            binary +=
                String.fromCharCode(
                    byte
                );

        }
    );


    return btoa(binary)

        .replace(
            /\+/g,
            "-"
        )

        .replace(
            /\//g,
            "_"
        )

        .replace(
            /=+$/,
            ""
        );

}


/* =========================================
   CREATE PKCE
========================================= */

async function createPKCE() {

    const codeVerifier =
        generateRandomString(64);


    const hashed =
        await sha256(
            codeVerifier
        );


    const codeChallenge =
        base64UrlEncode(
            hashed
        );


    return {

        codeVerifier,

        codeChallenge

    };

}


/* =========================================
   SHOW GITHUB CONNECTED
========================================= */

function showGithubConnected(
    username
) {

    if (githubStatus) {

        githubStatus.innerHTML = `

            <span class="github-connected">

                ● Connected

            </span>


            <span class="github-username">

                ${escapeHtml(username)}

            </span>

        `;

    }


    if (connectGithubButton) {

        connectGithubButton.style.display =
            "none";

    }


    if (disconnectGithubButton) {

        disconnectGithubButton.style.display =
            "block";

    }

}


/* =========================================
   SHOW GITHUB DISCONNECTED
========================================= */

function showGithubDisconnected() {

    if (githubStatus) {

        githubStatus.innerHTML =
            "Not connected";

    }


    if (connectGithubButton) {

        connectGithubButton.style.display =
            "block";

    }


    if (disconnectGithubButton) {

        disconnectGithubButton.style.display =
            "none";

    }

}


/* =========================================
   CONNECT GITHUB
========================================= */

async function connectGithub() {

    try {

        if (
            !GITHUB_CLIENT_ID ||
            GITHUB_CLIENT_ID ===
            "PASTE_YOUR_CLIENT_ID_HERE"
        ) {

            throw new Error(
                "GitHub Client ID is not configured."
            );

        }


        if (connectGithubButton) {

            connectGithubButton.disabled =
                true;

        }


        if (githubStatus) {

            githubStatus.innerHTML = `

                <span class="github-loading">

                    Connecting to GitHub...

                </span>

            `;

        }


        const {
            codeVerifier,
            codeChallenge
        } =
            await createPKCE();


        const state =
            generateRandomString(32);


        await chrome.storage.session.set({

            github_oauth_state:
                state,

            github_code_verifier:
                codeVerifier

        });


        const params =
            new URLSearchParams({

                client_id:
                    GITHUB_CLIENT_ID,

                redirect_uri:
                    GITHUB_REDIRECT_URI,

                state:
                    state,

                code_challenge:
                    codeChallenge,

                code_challenge_method:
                    "S256",

                allow_signup:
                    "false"

            });


        const authorizationUrl =
            "https://github.com/login/oauth/authorize?" +
            params.toString();


        const callbackUrl =
            await chrome.identity.launchWebAuthFlow({

                url:
                    authorizationUrl,

                interactive:
                    true

            });


        if (!callbackUrl) {

            throw new Error(
                "GitHub authorization was cancelled."
            );

        }


        const callback =
            new URL(callbackUrl);


        const returnedState =
            callback.searchParams.get(
                "state"
            );


        const code =
            callback.searchParams.get(
                "code"
            );


        const githubError =
            callback.searchParams.get(
                "error"
            );


        const githubErrorDescription =
            callback.searchParams.get(
                "error_description"
            );


        if (githubError) {

            throw new Error(

                githubErrorDescription ||
                githubError

            );

        }


        if (
            returnedState !==
            state
        ) {

            throw new Error(
                "OAuth state verification failed."
            );

        }


        if (!code) {

            throw new Error(
                "GitHub did not return an authorization code."
            );

        }


        const response =
            await fetch(

                `${BACKEND_URL}/github/exchange`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            code:
                                code,

                            code_verifier:
                                codeVerifier,

                            redirect_uri:
                                GITHUB_REDIRECT_URI

                        })

                }

            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.error ||
                "GitHub token exchange failed."

            );

        }


        await chrome.storage.local.set({

            github_access_token:
                data.access_token,

            github_refresh_token:
                data.refresh_token || "",

            github_token_expires_in:
                data.expires_in || 0,

            github_token_saved_at:
                Date.now()

        });


        const userResponse =
            await fetch(

                "https://api.github.com/user",

                {

                    headers: {

                        "Authorization":
                            `Bearer ${data.access_token}`,

                        "Accept":
                            "application/vnd.github+json",

                        "X-GitHub-Api-Version":
                            "2022-11-28"

                    }

                }

            );


        if (!userResponse.ok) {

            throw new Error(
                "Could not verify GitHub account."
            );

        }


        const user =
            await userResponse.json();


        await chrome.storage.local.set({

            github_username:
                user.login,

            github_user_id:
                user.id

        });


        await chrome.storage.session.remove([

            "github_oauth_state",

            "github_code_verifier"

        ]);


        showGithubConnected(
            user.login
        );

    }

    catch (error) {

        console.error(
            "CodeStreak GitHub error:",
            error
        );


        if (githubStatus) {

            githubStatus.innerHTML = `

                <span class="github-error">

                    ${escapeHtml(
                        error.message
                    )}

                </span>

            `;

        }

    }

    finally {

        if (connectGithubButton) {

            connectGithubButton.disabled =
                false;

        }

    }

}


/* =========================================
   DISCONNECT GITHUB
========================================= */

async function disconnectGithub() {

    await chrome.storage.local.remove([

        "github_access_token",

        "github_refresh_token",

        "github_token_expires_in",

        "github_token_saved_at",

        "github_username",

        "github_user_id"

    ]);


    await chrome.storage.session.remove([

        "github_oauth_state",

        "github_code_verifier"

    ]);


    showGithubDisconnected();

}


/* =========================================
   RESTORE GITHUB CONNECTION
========================================= */

async function restoreGithubConnection() {

    try {

        const data =
            await chrome.storage.local.get([

                "github_access_token",

                "github_username"

            ]);


        if (
            data.github_access_token &&
            data.github_username
        ) {

            showGithubConnected(
                data.github_username
            );

        }

        else {

            showGithubDisconnected();

        }

    }

    catch (error) {

        console.error(
            "Restore GitHub error:",
            error
        );


        showGithubDisconnected();

    }

}


/* =========================================
   PUSH TO GITHUB
========================================= */

async function pushToGithub() {

    try {

        /* -----------------------------
           CHECK CODE
        ----------------------------- */

        if (!currentSolutionCode) {

            throw new Error(
                "Click Get My Code first."
            );

        }


        /* -----------------------------
           CHECK GITHUB
        ----------------------------- */

        const githubData =
            await chrome.storage.local.get([

                "github_access_token",

                "github_username"

            ]);


        if (
            !githubData.github_access_token
        ) {

            throw new Error(
                "Please connect GitHub first."
            );

        }


        /* -----------------------------
           GET PROBLEM
        ----------------------------- */

        const problem =
            currentProblem ||
            await getProblemData();


        if (
            !problem ||
            !problem.name
        ) {

            throw new Error(
                "Could not detect LeetCode problem."
            );

        }


        if (pushGithubButton) {

            pushGithubButton.disabled =
                true;

        }


        if (pushStatus) {

            pushStatus.innerHTML = `

                <div class="push-loading">

                    Uploading to GitHub...

                </div>

            `;

        }


        /* -----------------------------
           SEND TO BACKEND
        ----------------------------- */

        const response =
            await fetch(

                `${BACKEND_URL}/github/push`,

                {

                    method:
                        "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        JSON.stringify({

                            access_token:
                                githubData.github_access_token,

                            username:
                                githubData.github_username,

                            repository:
                                "LeetCode-Solutions",

                            problem_name:
                                problem.name,

                            problem_slug:
                                problem.slug,

                            language:
                                currentSolutionLanguage,

                            code:
                                currentSolutionCode

                        })

                }

            );


        const data =
            await response.json();


        if (
            !response.ok ||
            !data.success
        ) {

            throw new Error(

                data.error ||
                "Failed to push solution."

            );

        }


        if (pushStatus) {

            pushStatus.innerHTML = `

                <div class="push-success">

                    ✅ Successfully pushed!

                    <br><br>

                    <strong>
                        ${escapeHtml(
                            data.file_name
                        )}
                    </strong>

                    <br>

                    ${escapeHtml(
                        data.path
                    )}

                    <br><br>

                    Commit created successfully.

                </div>

            `;

        }

    }

    catch (error) {

        console.error(
            "CodeStreak push error:",
            error
        );


        if (pushStatus) {

            pushStatus.innerHTML = `

                <div class="push-error">

                    ❌ ${escapeHtml(
                        error.message
                    )}

                </div>

            `;

        }

    }

    finally {

        if (pushGithubButton) {

            pushGithubButton.disabled =
                false;

        }

    }

}


/* =========================================
   EVENT LISTENERS
========================================= */

if (getCodeButton) {

    getCodeButton.addEventListener(
        "click",
        getMyCode
    );

}


if (hideCodeButton) {

    hideCodeButton.addEventListener(
        "click",
        toggleCode
    );

}


if (connectGithubButton) {

    connectGithubButton.addEventListener(
        "click",
        connectGithub
    );

}


if (disconnectGithubButton) {

    disconnectGithubButton.addEventListener(
        "click",
        disconnectGithub
    );

}


if (pushGithubButton) {

    pushGithubButton.addEventListener(
        "click",
        pushToGithub
    );

}


/* =========================================
   INITIALIZE
========================================= */

getCurrentProblem();

restoreGithubConnection();