(() => {
    console.log("CodeStreak: Page bridge loaded.");

    function findEditor() {
        if (
            window.monaco &&
            window.monaco.editor &&
            typeof window.monaco.editor.getEditors === "function"
        ) {
            const editors = window.monaco.editor.getEditors();

            if (editors.length > 0) {
                return editors[0];
            }
        }

        return null;
    }


    function getCode() {
        const editor = findEditor();

        if (!editor) {
            return {
                success: false,
                error: "Monaco editor not found."
            };
        }


        const model = editor.getModel();

        if (!model) {
            return {
                success: false,
                error: "Monaco editor model not found."
            };
        }


        const code = model.getValue();

        const language = model.getLanguageId();


        return {
            success: true,
            code: code,
            language: language,
            lines: code.split("\n").length
        };
    }


    window.addEventListener(
        "CodeStreakGetCode",
        () => {

            console.log(
                "CodeStreak: Reading Monaco editor..."
            );


            const result = getCode();


            console.log(
                "CodeStreak: Monaco result:",
                result
            );


            window.postMessage(
                {
                    source: "CodeStreakPage",
                    type: "CODE_RESULT",
                    data: result
                },
                "*"
            );
        }
    );


    console.log(
        "CodeStreak: Monaco bridge ready."
    );
})();