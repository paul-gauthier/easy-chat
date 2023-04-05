const markdownToHtmlWithWordSpans = (markdown) => {
    const html = marked.parse(markdown);
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const elements = doc.querySelectorAll('p, li');
    elements.forEach(element => {
        const words = element.textContent.split(' ');
        element.innerHTML = words.map(word => `<span>${word}</span>`).join(' ');
    });
    return doc.body.innerHTML;
};

const chatBox = document.querySelector('.chat-box');
const inputBox = document.querySelector('.input-box textarea');
const sendButton = document.querySelector('.input-box button');
const spinner = document.querySelector('.spinner');

const sendMessage = () => {
    if (inputBox.value !== '') {
        spinner.style.display = 'inline-block';
        sendButton.style.display = 'none';
        const message = document.createElement('p');
        message.innerHTML = inputBox.value.split(' ').map(word => `<span>${word}</span>`).join(' ');
        message.classList.add('user');
        chatBox.insertBefore(message, document.getElementById('bottom'));
        addUserSpeakerIcon(message);
        inputBox.value = '';
        document.getElementById('bottom').scrollIntoView();

        const systemPrompt = "You are a helpful assistant. You are speaking to a child. Use common words. Use short sentences. Use short paragraphs. Start by asking if they want you to tell a story."
        const messages = [];
        messages.push({ role: 'system', content: systemPrompt });
        const chatMessages = chatBox.querySelectorAll('.user, .assistant, .assistant');
        for (let i = 0; i < chatMessages.length; i++) {
            const role = chatMessages[i].classList.contains('user') ? 'user' : 'assistant';
            const content = chatMessages[i].textContent;
            messages.push({ role, content });
        }

        const requestOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: messages
            })
        };

        fetch('https://cloud-proxy-35h462xo6a-uw.a.run.app/v1/chat/completions', requestOptions)
            .then(response => response.json())
            .then(data => {
                const assistantMessage = document.createElement('p');
                assistantMessage.innerHTML = markdownToHtmlWithWordSpans(data.choices[0].message.content)
                assistantMessage.classList.add('assistant');
                chatBox.insertBefore(assistantMessage, document.getElementById('bottom'));
                document.getElementById('bottom').scrollIntoView();
                inputBox.blur();
                spinner.style.display = 'none';
                sendButton.style.display = 'inline-block';
                inputBox.focus();
                addUserSpeakerIcon(assistantMessage);
            })
            .catch(error => console.log(error));
    }
};

sendButton.addEventListener('click', sendMessage);

inputBox.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && inputBox.value !== '') {
        sendMessage();
        event.preventDefault();
    }
});

chatBox.addEventListener('click', (event) => {
    if (event.target.tagName === 'SPAN' && !event.target.classList.contains('fa')) {
        const highlightedWords = chatBox.querySelectorAll('.highlight');
        highlightedWords.forEach(word => word.classList.remove('highlight'));
        event.target.classList.add('highlight');
        const textToSpeak = event.target.textContent;
        const speech = new SpeechSynthesisUtterance(textToSpeak);
        speechSynthesis.speak(speech);
    }
});

const highlight = (element) => {
    element.classList.add('highlight');
};

const removeHighlight = (element) => {
    element.classList.remove('highlight');
};

const speak = (element) => {
    if ('speechSynthesis' in window) {
        const textElements = element.querySelectorAll('span');
        const textContent = Array.from(textElements).map(el => el.textContent).join(' ');

        const utterance = new SpeechSynthesisUtterance(textContent);
        utterance.rate = 0.75;
        utterance.onboundary = (event) => {
            if (event.name === 'word') {
                const charIndex = event.charIndex;
                const wordIndex = getWordIndexByCharIndex(textElements, charIndex);
                if (wordIndex !== -1) {
                    removeHighlights(textElements);
                    highlight(textElements[wordIndex]);
                }
            }
        };
        utterance.onend = () => {
            removeHighlights(textElements);
        };

        window.speechSynthesis.speak(utterance);
    } else {
        alert('Speech Synthesis not supported in your browser');
    }
};

const removeHighlights = (elements) => {
    elements.forEach(removeHighlight);
};

const getWordIndexByCharIndex = (textElements, charIndex) => {
    let currentCharIndex = 0;
    for (let i = 0; i < textElements.length; i++) {
        currentCharIndex += textElements[i].textContent.length + 1; // Add 1 for the space between words
        if (currentCharIndex > charIndex) {
            return i;
        }
    }
    return -1;
};

const addUserSpeakerIcon = (message) => {
    const speakerIcon = document.createElement('span');
    speakerIcon.classList.add('fa', 'fa-volume-up');
    speakerIcon.onclick = () => speak(message);
    message.insertBefore(speakerIcon, message.firstChild);
};