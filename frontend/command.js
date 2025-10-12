document.addEventListener('DOMContentLoaded', () => {
    const topicTitleEl = document.getElementById('topic-title');
    const topicDescriptionEl = document.getElementById('topic-description');
    const commandListEl = document.getElementById('command-list');
    const searchInput = document.getElementById('command-search-input');
    const noResultsEl = document.getElementById('no-results');
    const relatedTopicsContainer = document.getElementById('related-topics-container');
    const relatedTopicsList = document.getElementById('related-topics-list');

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
            topicData.commands.forEach((cmd, index) => {
                const commandEl = document.createElement('div');
                commandEl.className = 'command-step bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md';
                commandEl.innerHTML = `
                    <div class="flex justify-between items-start">
                        <div>
                            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">Step ${index + 1}: ${cmd.step}</h3>
                            <p class="mt-1 mb-3 text-sm opacity-80">${cmd.explanation}</p>
                        </div>
                    </div>
                    <pre class="rounded-lg overflow-hidden">
                        <button class="copy-btn" title="Copy to clipboard">Copy</button>
                        <code class="language-cisco"><span class="hljs-meta">${cmd.prompt}</span> ${cmd.command}</code>
                    </pre>
                `;
                commandListEl.appendChild(commandEl);

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

            // Apply syntax highlighting
            hljs.highlightAll();

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

    loadCommandDetails();

    // Search/Filter functionality
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allSteps = document.querySelectorAll('.command-step');
        let visibleCount = 0;

        allSteps.forEach(step => {
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
});