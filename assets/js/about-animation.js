document.addEventListener("DOMContentLoaded", function () {
    const codeLines = [
        {
            language: "C",
            line: `<span class="keyword">printf</span>(<span class="string">"로봇을 개발합니다.\\n"</span>);`,
        },
        {
            language: "Python",
            line: `<span class="keyword">print</span>(<span class="string">"앱도 개발합니다."</span>)`,
        },
        {
            language: "Java",
            line: `<span class="keyword">System.out.println</span>(<span class="string">"임베디드 설계도 합니다."</span>);`,
        },
        {
            language: "HTML",
            line: `<span class="tag">&lt;h1&gt;</span>게임도 합니다<span class="tag">&lt;/h1&gt;</span>`,
        },
        {
            language: "C",
            line: `<span class="keyword">printf</span>(<span class="string">"세미나도 합니다.\\n"</span>);`,
        },
    ];

    const typingElement = document.getElementById("code-display");
    const cursor = `<span class="cursor"></span>`;
    let currentLine = "";
    let charIndex = 0;
    let currentLanguage = "";
    let isDeleting = false;

    const typingSpeed = 25;
    const deletingSpeed = 10;
    const pauseTime = 500;

    function typeEffect() {
        if (!isDeleting && charIndex < currentLine.length) {
            typingElement.innerHTML =
                typingElement.innerHTML.replace(cursor, "") +
                currentLine.slice(0, charIndex + 1) +
                cursor;
            charIndex++;
            setTimeout(typeEffect, typingSpeed);
        } else if (isDeleting && charIndex > 0) {
            typingElement.innerHTML =
                currentLanguage + currentLine.slice(0, charIndex - 1) + cursor;
            charIndex--;
            setTimeout(typeEffect, deletingSpeed);
        } else {
            if (!isDeleting) {
                isDeleting = true;
                setTimeout(typeEffect, pauseTime);
            } else {
                isDeleting = false;
                const randomLine = codeLines[Math.floor(Math.random() * codeLines.length)];
                currentLanguage = `<span class="function">// ${randomLine.language}</span>\n`;
                currentLine = randomLine.line;
                charIndex = 0;
                typingElement.innerHTML = currentLanguage + cursor;
                setTimeout(typeEffect, 500);
            }
        }
    }

    const initialLine = codeLines[Math.floor(Math.random() * codeLines.length)];
    currentLanguage = `<span class="function">// ${initialLine.language}</span>\n`;
    currentLine = initialLine.line;
    typingElement.innerHTML = currentLanguage + cursor;
    typeEffect();
});