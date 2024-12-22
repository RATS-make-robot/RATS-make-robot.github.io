document.addEventListener('DOMContentLoaded', () => {
    const sentences = [
        "로봇을 개발합니다.",
        "임베디드 설계도 합니다.",
        "앱도 개발합니다.",
        "게임도 합니다.",
        "세미나도 합니다."
    ];

    function initializeTypingAnimation() {
        const typingElement = document.getElementById('typing-text');
        if (!typingElement) return;

        let sentenceIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeEffect() {
            const currentSentence = sentences[sentenceIndex];
            if (!isDeleting) {
                typingElement.textContent += currentSentence[charIndex];
                charIndex++;
                if (charIndex === currentSentence.length) {
                    isDeleting = true;
                    setTimeout(typeEffect, 1000); // Pause before deleting
                    return;
                }
            } else {
                typingElement.textContent = currentSentence.substring(0, charIndex - 1);
                charIndex--;
                if (charIndex === 0) {
                    isDeleting = false;
                    sentenceIndex = (sentenceIndex + 1) % sentences.length; // Move to next sentence
                }
            }
            setTimeout(typeEffect, isDeleting ? 50 : 100); // Typing speed
        }

        typeEffect();
    }

    // Export the function to be used after fetching about.html
    window.initializeTypingAnimation = initializeTypingAnimation;
});
