document.addEventListener('DOMContentLoaded', () => {
    const topicTitleEl = document.getElementById('topic-title');
    const topicDescriptionEl = document.getElementById('topic-description');
    const commandListEl = document.getElementById('command-list');
    const searchInput = document.getElementById('command-search-input');
    const noResultsEl = document.getElementById('no-results');
    const relatedTopicsContainer = document.getElementById('related-topics-container');
    const relatedTopicsList = document.getElementById('related-topics-list');
    const progressBar = document.getElementById('progress-bar');
    const backToTopBtn = document.getElementById('back-to-top');

    let commandElements = []; // To store command step elements for filtering

    const loadCommandDetails = async () => {
        // Get the topic ID from the URL (e.g., ?topic=s1)
        const params = new URLSearchParams(window.location.search);
        const topicId = params.get('topic');

        if (!topicId) {
            topicTitleEl.textContent = 'Error: No Topic Specified';
            topicDescriptionEl.textContent = 'Please return to the tracker and select a topic.';
            return;
        }

        try {
            const response = await fetch('commands.json');
            if (!response.ok) throw new Error('Could not load command database.');
            
            const commandsDb = await response.json();
            const topicData = commandsDb[topicId];

            if (!topicData) {
                topicTitleEl.textContent = `Commands for "${topicId}" not found`;
                topicDescriptionEl.textContent = 'This topic does not have any commands in the database yet.';
                return;
            }

            // Populate the page with the fetched data
            topicTitleEl.textContent = topicData.title;
            topicDescriptionEl.textContent = topicData.description;

            commandListEl.innerHTML = ''; // Clear loading state
            commandElements = []; // Reset the array

            topicData.commands.forEach((cmd, index) => {
                const commandEl = document.createElement('div');
                commandEl.className = 'command-step bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden';
                commandEl.innerHTML = `
                    <div class="command-header flex justify-between items-center p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Step ${index + 1}: ${cmd.step}</h3>
                        <svg class="expand-arrow w-5 h-5 text-gray-500 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                    </div>
                    <div class="command-details max-h-0 overflow-hidden transition-all duration-500 ease-in-out">
                        <p class="mt-1 mb-3 text-sm opacity-80 px-4">${cmd.explanation}</p>
                        <pre class="rounded-none overflow-hidden">
                            <button class="copy-btn" title="Copy to clipboard">Copy</button>
                            <code class="language-cisco hljs"><span class="hljs-meta">${cmd.prompt}</span> <span class="typewriter"></span></code>
                        </pre>
                    </div>
                `;
                commandListEl.appendChild(commandEl);
                commandElements.push(commandEl);

                // Accordion logic
                const header = commandEl.querySelector('.command-header');
                header.addEventListener('click', () => {
                    toggleAccordion(commandEl, cmd.command);
                });

                // Add event listener for the copy button
                const copyBtn = commandEl.querySelector('.copy-btn');
                copyBtn.addEventListener('click', () => {
                    navigator.clipboard.writeText(cmd.command).then(() => {
                        copyBtn.textContent = 'Copied!';
                        copyBtn.classList.add('copied');
                        setTimeout(() => {
                            copyBtn.textContent = 'Copy';
                            copyBtn.classList.remove('copied');
                        }, 2000);
                    });
                });
            });

            // Populate Related Topics
            if (topicData.related && topicData.related.length > 0) {
                relatedTopicsList.innerHTML = '';
                topicData.related.forEach(relatedId => {
                    const relatedTopic = commandsDb[relatedId];
                    if (relatedTopic) {
                        const li = document.createElement('li');
                        li.innerHTML = `<a href="command.html?topic=${relatedId}" class="text-blue-500 hover:underline text-sm">${relatedTopic.title}</a>`;
                        relatedTopicsList.appendChild(li);
                    }
                });
                relatedTopicsContainer.style.display = 'block';
            } else {
                relatedTopicsContainer.style.display = 'none';
            }

            // Handle dark mode from localStorage
            const isDark = localStorage.getItem('ccna_dark_mode') === 'true';
            if (isDark) document.documentElement.classList.add('dark');

        } catch (error) {
            topicTitleEl.textContent = 'Error Loading Commands';
            topicDescriptionEl.textContent = error.message;
        }
    };

    const toggleAccordion = (element, commandText) => {
        const details = element.querySelector('.command-details');
        const arrow = element.querySelector('.expand-arrow');
        const codeEl = element.querySelector('.typewriter');

        if (details.style.maxHeight && details.style.maxHeight !== '0px') {
            details.style.maxHeight = '0px';
            arrow.classList.remove('rotate-180');
        } else {
            details.style.maxHeight = details.scrollHeight + 'px';
            arrow.classList.add('rotate-180');
            typewriterEffect(codeEl, commandText);
            // Re-highlight after typewriter effect
            setTimeout(() => hljs.highlightElement(element.querySelector('code')), commandText.length * 50 + 200);
        }
    };

    const typewriterEffect = (element, text) => {
        element.innerHTML = ''; // Clear previous text
        let i = 0;
        const speed = 40; // milliseconds
        function type() {
            if (i < text.length) {
                // Handle newlines correctly
                if (text.charAt(i) === '\n') {
                    element.innerHTML += '<br>';
                } else {
                    element.innerHTML += text.charAt(i);
                }
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    };

    loadCommandDetails();

    // Search/Filter functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        let visibleCount = 0;

        commandElements.forEach(step => {
            const stepText = step.textContent.toLowerCase();
            if (stepText.includes(searchTerm)) {
                step.style.display = 'block';
                visibleCount++;
            } else {
                step.style.display = 'none';
            }
        });

        if (visibleCount === 0) {
            noResultsEl.style.display = 'block';
        } else {
            noResultsEl.style.display = 'none';
        }
    });

    // Progress bar and Back to Top button on scroll
    window.addEventListener('scroll', () => {
        const scrollTop = window.scrollY;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = (scrollTop / docHeight) * 100;
        
        if (progressBar) {
            progressBar.style.width = scrollPercent + '%';
        }

        if (backToTopBtn) {
            if (scrollTop > 300) {
                backToTopBtn.classList.remove('opacity-0', 'pointer-events-none');
            } else {
                backToTopBtn.classList.add('opacity-0', 'pointer-events-none');
            }
        }
    });

    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
});