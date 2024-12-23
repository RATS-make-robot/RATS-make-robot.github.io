function initializeTypingAnimation() {
    const typingElement = document.getElementById("code-display");

    if (!typingElement) {
        console.error('Error: Element with ID "code-display" not found.');
        return;
    }

    // Programming languages and their respective code output formats
    const languages = [
        { 
            language: "C", 
            comment: "//", 
            output: `<span class='keyword'>printf</span>(<span class='string'>\"{sentence}\\n\"</span>);` 
        },
        { 
            language: "Python", 
            comment: "#", 
            output: `<span class='keyword'>print</span>(<span class='string'>\"{sentence}\"</span>)` 
        },
        { 
            language: "Java", 
            comment: "//", 
            output: `<span class='keyword'>System.out.println</span>(<span class='string'>\"{sentence}\"</span>);` 
        },
        { 
            language: "HTML", 
            comment: "&lt;!--", 
            outputs: [
                "<span class='tag'>&lt;h1&gt;</span>{sentence}<span class='tag'>&lt;/h1&gt;</span> <span class='language-comment'>--&gt;</span>",
                "<span class='tag'>&lt;p&gt;</span>{sentence}<span class='tag'>&lt;/p&gt;</span> <span class='language-comment'>--&gt;</span>",
                "<span class='tag'>&lt;div&gt;</span>{sentence}<span class='tag'>&lt;/div&gt;</span> <span class='language-comment'>--&gt;</span>",
                "<span class='tag'>&lt;span&gt;</span>{sentence}<span class='tag'>&lt;/span&gt;</span> <span class='language-comment'>--&gt;</span>",
                "<span class='tag'>&lt;strong&gt;</span>{sentence}<span class='tag'>&lt;/strong&gt;</span> <span class='language-comment'>--&gt;</span>"
            ]
        }
    ];

    // HTML element to display the typing effect
    //const typingElement = document.getElementById("code-display");
    const cursor = `<span class="cursor"></span>`;
    let currentSentenceIndex = 0;
    let currentLanguage = "";
    let charIndex = 0;
    let isDeleting = false;
    let currentOutput = "";

    function typeEffect() {
        // Ensure the cursor is correctly appended
        typingElement.innerHTML = typingElement.innerHTML.replace(cursor, "");

        const currentSentence = sentences[currentSentenceIndex];
        if (currentLanguage.language === "HTML") {
            // Randomly select an output format for HTML
            const randomOutput = currentLanguage.outputs[Math.floor(Math.random() * currentLanguage.outputs.length)];
            currentOutput = randomOutput.replace("{sentence}", currentSentence);
        } else {
            currentOutput = currentLanguage.output.replace("{sentence}", currentSentence);
        }

        if (!isDeleting && charIndex <= currentOutput.length) {
            // Typing forward
            typingElement.innerHTML =
                `<span class="language-comment">${currentLanguage.comment}</span> <span class="language-comment">${currentLanguage.language}</span>\n` +
                currentOutput.slice(0, charIndex) + cursor;
            charIndex++;
            setTimeout(typeEffect, 25); // Typing speed
        } else if (isDeleting && charIndex >= 0) {
            // Deleting backward
            typingElement.innerHTML =
                `<span class="language-comment">${currentLanguage.comment}</span> <span class="language-comment">${currentLanguage.language}</span>\n` +
                currentOutput.slice(0, charIndex) + cursor;
            charIndex--;
            setTimeout(typeEffect, 10); // Deleting speed
        } else {
            // Switching between typing and deleting
            isDeleting = !isDeleting;

            if (!isDeleting) {
                // Move to the next sentence and randomize the language
                currentSentenceIndex = (currentSentenceIndex + 1) % sentences.length;
                currentLanguage = languages[Math.floor(Math.random() * languages.length)];
                charIndex = 0;
                setTimeout(typeEffect, 250); // Pause before typing new line
            } else {
                setTimeout(typeEffect, 1000); // Pause before deleting
            }
        }
    }

    // Initialize the first sentence and language
    currentLanguage = languages[Math.floor(Math.random() * languages.length)];
    const firstSentence = sentences[currentSentenceIndex];
    if (currentLanguage.language === "HTML") {
        const randomOutput = currentLanguage.outputs[Math.floor(Math.random() * currentLanguage.outputs.length)];
        currentOutput = randomOutput.replace("{sentence}", firstSentence);
    } else {
        currentOutput = currentLanguage.output.replace("{sentence}", firstSentence);
    }
    typingElement.innerHTML = `<span class="language-comment">${currentLanguage.comment}</span> <span class="function">${currentLanguage.language}</span>\n` + cursor;
    typeEffect();
}