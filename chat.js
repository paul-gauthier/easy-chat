
    function markdownToHtmlWithWordSpans(markdownText) {
      // Convert markdown to HTML
      var html = marked.parse(markdownText);

      // Split HTML into words
      var words = html.split(/\s+/);

      // Loop through each word and wrap in span if it's made up of alpha characters
      for (var i = 0; i < words.length; i++) {
        var word = words[i];
        if (/^[a-zA-Z]+$/.test(word)) {
          words[i] = '<span class="word">' + word + '</span>';
        }
      }

      // Join words back into HTML
      html = words.join(' ');

      return html;
    }
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
				
				const messages = [];
				const chatMessages = chatBox.querySelectorAll('.user, .assistant, .machine-user');
				for (let i = 0; i < chatMessages.length; i++) {
					const role = chatMessages[i].classList.contains('user') ? 'user' : 'assistant';
					const content = chatMessages[i].textContent;
					messages.push({ role, content });
				}
				
				const requestOptions = {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						'Authorization': 'Bearer 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'
					},
					body: JSON.stringify({
						model: 'gpt-3.5-turbo',
						messages: messages
					})
				};
				
				fetch('https://api.openai.com/v1/chat/completions', requestOptions)
					.then(response => response.json())
					.then(data => {
						const machineUserMessage = document.createElement('p');
						machineUserMessage.innerHTML = markdownToHtmlWithWordSpans(data.choices[0].message.content)
						machineUserMessage.classList.add('machine-user');
						chatBox.insertBefore(machineUserMessage, document.getElementById('bottom'));
						document.getElementById('bottom').scrollIntoView();
                                                inputBox.blur();
                                                spinner.style.display = 'none';
                                                sendButton.style.display = 'inline-block';
                                                inputBox.focus();
                                                const speakButton = document.createElement('span');
                                                speakButton.classList.add('fa', 'fa-volume-up');
                                                speakButton.onclick = () => speak(machineUserMessage);
                                                machineUserMessage.appendChild(speakButton);
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
                
                /* New code for word highlighting */
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
                                  
        function highlight(element) {
            element.classList.add('highlight');
        }

        function removeHighlight(element) {
            element.classList.remove('highlight');
        }

        function speak(element) {
            if ('speechSynthesis' in window) {
                const textElements = element.querySelectorAll('span');
                const textContent = Array.from(textElements).map(el => el.textContent).join(' ');

                const utterance = new SpeechSynthesisUtterance(textContent);
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
        }

        function removeHighlights(elements) {
            elements.forEach(removeHighlight);
        }

        function getWordIndexByCharIndex(textElements, charIndex) {
            let currentCharIndex = 0;
            for (let i = 0; i < textElements.length; i++) {
                currentCharIndex += textElements[i].textContent.length + 1; // Add 1 for the space between words
                if (currentCharIndex > charIndex) {
                    return i;
                }
            }
            return -1;
        }
                /* New code for adding speaker icon to user message */
                const addUserSpeakerIcon = (message) => {
                    const speakerIcon = document.createElement('span');
                    speakerIcon.classList.add('fa', 'fa-volume-up');
                    speakerIcon.onclick = () => speak(message);
                    message.appendChild(speakerIcon);
                };
	
