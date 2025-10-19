document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchInput = document.getElementById('video-search-input');
    const noResultsEl = document.getElementById('no-results');
    const categoryFilters = document.getElementById('category-filters');
    const sidebar = document.getElementById('tutorials-sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- Player Modal Elements ---
    const playerModalOverlay = document.getElementById('player-modal-overlay');
    const closePlayerModalBtn = document.getElementById('close-player-modal');
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('main-video');
    const videoTitleEl = document.getElementById('video-title');
    const videoChannelEl = document.getElementById('video-channel');
    const videoDescriptionEl = document.getElementById('video-description');
    const videoInfoContainer = document.getElementById('video-info-container');
    const upNextContainer = document.getElementById('up-next-container');
    const commentForm = document.getElementById('comment-form');
    const commentList = document.getElementById('comment-list');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteBtn = document.getElementById('mute-btn');
    const nextVideoBtn = document.getElementById('next-video-btn');
    const prevVideoBtn = document.getElementById('prev-video-btn');
    const pipBtn = document.getElementById('pip-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.getElementById('timeline-progress');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    let allVideos = [];
    let currentFilter = 'all';
    let videoHistory = [];
    let pipVideoId = null; // To store the ID of the video in PiP mode
    let isAutoplayEnabled = true;

    const fetchVideos = async () => {
        try {
            const response = await fetch('/api/videos');
            if (!response.ok) throw new Error('Network response was not ok.');
            allVideos = await response.json();
            renderVideos();
        } catch (error) {
            console.error('Failed to fetch videos:', error);
            videoGrid.innerHTML = '<p class="text-red-400 col-span-full text-center">Could not load video tutorials.</p>';
        }
    };

    const renderVideos = () => {
        const searchTerm = searchInput.value.trim().toLowerCase();

        // If there's a search term, render the special search results view
        if (searchTerm) {
            renderSearchResults(searchTerm);
            return;
        }

        // Otherwise, render the default grid view
        searchResultsContainer.classList.add('hidden');
        videoGrid.classList.remove('hidden');

        const filteredVideos = allVideos.filter(video => {
            const matchesCategory = currentFilter === 'all' || video.tags.includes(currentFilter);
            return matchesCategory;
        });

        videoGrid.innerHTML = '';

        if (filteredVideos.length === 0) {
            noResultsEl.classList.remove('hidden');
        } else {
            noResultsEl.classList.add('hidden');
            filteredVideos.forEach(video => {
                const videoCard = createVideoCard(video);
                videoGrid.appendChild(videoCard);
            });
        }
    };

    const renderSearchResults = (searchTerm) => {
        // When searching, hide the grid and show the results container
        videoGrid.classList.add('hidden');
        searchResultsContainer.classList.remove('hidden');
        searchResultsContainer.innerHTML = '';

        const results = allVideos.filter(video => 
            video.title.toLowerCase().includes(searchTerm) || 
            (video.description && video.description.toLowerCase().includes(searchTerm)) ||
            video.tags.some(tag => tag.includes(searchTerm))
        );

        if (results.length === 0) {
            noResultsEl.classList.remove('hidden');
        } else {
            noResultsEl.classList.add('hidden');
            results.forEach(video => {
                const resultCard = createSearchResultCard(video);
                searchResultsContainer.appendChild(resultCard);
            });
        }

        // If the player is open, trigger PiP mode
        if (!playerModalOverlay.classList.contains('hidden') && !document.pictureInPictureElement) {
            togglePip();
        }
    };

    const createVideoCard = (video) => {
        const card = document.createElement('div');
        card.className = 'video-card flex flex-col';
        card.innerHTML = `
            <a href="#" class="relative block video-thumbnail-link" data-video-id="${video.id}">
                <img src="${video.thumbnail}" alt="${video.title}" class="w-full h-auto object-cover rounded-xl transition-all duration-300 pointer-events-none">
                <span class="absolute bottom-2 right-2 bg-black/80 text-white text-xs font-semibold px-2 py-1 rounded">${video.duration}</span>
            </a>
            <div class="flex items-start mt-3">
                <div class="flex-shrink-0">
                    <img class="h-9 w-9 rounded-full" src="images/opentech.png" alt="${video.channel}">
                </div>
                <div class="ml-3 flex-1 min-w-0" data-video-id="${video.id}">
                    <h3 class="text-sm font-semibold leading-tight text-white line-clamp-2">${video.title}</h3>
                    <p class="text-xs text-gray-400 mt-1">${video.channel}</p>
                    <p class="text-xs text-gray-400">${video.views} &bull; ${video.timestamp}</p>
                    <div class="flex items-center gap-4 mt-2">
                        <button class="video-interaction-btn like-btn" title="Like" data-reaction="likes">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                            <span class="like-count">${formatCount(video.likes)}</span>
                        </button>
                        <button class="video-interaction-btn love-btn" title="Love" data-reaction="loves">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
                            <span class="love-count">${video.loves}</span>
                        </button>
                        <button class="video-interaction-btn comment-btn" title="Comments" data-video-id="${video.id}" data-video-title="${video.title}">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zM7 8H5v2h2V8zm2 0h2v2H9V8zm6 0h-2v2h2V8z" clip-rule="evenodd" /></svg>
                            <span class="comment-count">${video.comments}</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
        // Add event listeners for interactions
        card.querySelector('.like-btn').addEventListener('click', handleReaction);
        card.querySelector('.love-btn').addEventListener('click', handleReaction);
        card.querySelector('.video-thumbnail-link').addEventListener('click', (e) => {
            e.preventDefault();
            openPlayerModal(video.id);
        });
        card.querySelector('.comment-btn').addEventListener('click', (e) => {
            e.preventDefault();
            openPlayerModal(video.id);
        });
        return card;
    };

    const createSearchResultCard = (video) => {
        const card = document.createElement('a');
        card.href = '#';
        card.className = 'search-result-card';
        card.addEventListener('click', (e) => {
            e.preventDefault();
            openPlayerModal(video.id);
        });

        card.innerHTML = `
            <img src="${video.thumbnail}" alt="${video.title}">
            <div class="min-w-0">
                <h3 class="text-md font-semibold leading-tight text-white">${video.title}</h3>
                <p class="text-sm text-gray-400 mt-1">${video.views} &bull; ${video.timestamp}</p>
                <div class="flex items-center gap-2 mt-2">
                    <img class="h-5 w-5 rounded-full" src="images/opentech.png" alt="${video.channel}">
                    <span class="text-xs text-gray-400">${video.channel}</span>
                </div>
                <p class="text-xs text-gray-400 mt-2 line-clamp-2">${video.description || 'No description available.'}</p>
            </div>
        `;
        return card;
    };


    // --- Event Listeners ---

    searchInput.addEventListener('input', () => {
        // Debounce search input
        setTimeout(renderVideos, 300);
    });

    categoryFilters.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
            currentFilter = e.target.dataset.filter;
            // Update active state for buttons
            categoryFilters.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
            e.target.classList.add('active');
            renderVideos();
        }
    });

    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        sidebarOverlay.classList.toggle('hidden');
    });
    sidebarOverlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        sidebarOverlay.classList.add('hidden');
    });

    // --- Player Modal Logic ---
    const openPlayerModal = async (videoId) => {
        playerModalOverlay.classList.remove('hidden');
        document.body.style.overflow = 'hidden';

        // Add to history if it's a new video
        if (videoHistory[videoHistory.length - 1] !== videoId) {
            videoHistory.push(videoId);
        }
        updatePrevNextButtons();
        
        // Reset state
        videoTitleEl.textContent = 'Loading...';
        videoChannelEl.textContent = '';
        videoDescriptionEl.innerHTML = '';
        upNextContainer.innerHTML = '';
        commentList.innerHTML = '<p class="text-gray-400 text-center py-8">Loading comments...</p>';
        
        try {
            const [videoRes, allVideosRes, commentsRes] = await Promise.all([
                fetch(`/api/videos/${videoId}`),
                fetch('/api/videos'),
                fetch(`/api/videos/${videoId}/comments`)
            ]);

            if (!videoRes.ok || !allVideosRes.ok) throw new Error('Failed to load video data.');

            const videoData = await videoRes.json();
            const allVideos = await allVideosRes.json();
            const comments = await commentsRes.ok ? await commentsRes.json() : [];

            // Populate player
            video.src = videoData.src;
            videoTitleEl.textContent = videoData.title;
            videoChannelEl.textContent = `${videoData.channel} • ${videoData.views} • ${videoData.timestamp}`;
            renderDescription(videoData.description);
            commentForm.dataset.videoId = videoId;

            // Populate Up Next and Comments
            renderUpNext(allVideos, videoId);
            renderComments(comments);

            video.play();

        } catch (error) {
            videoTitleEl.textContent = 'Error loading video.';
            console.error(error);
        }
    };

    const closePlayerModal = () => {
        // If we are not in PiP mode, stop the video and clear history
        if (document.pictureInPictureElement === null) {
            video.pause();
            video.src = '';
            videoHistory = [];
            updatePrevNextButtons();
        }
        playerModalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    };

    const renderDescription = (description) => {
        if (!description) {
            videoInfoContainer.style.display = 'none';
            return;
        }
        videoInfoContainer.style.display = 'block';

        const maxLength = 150; // Max characters before truncating
        if (description.length <= maxLength) {
            videoDescriptionEl.textContent = description;
        } else {
            const truncated = description.substring(0, maxLength);
            videoDescriptionEl.innerHTML = `
                <span>${truncated}</span><span class="description-read-more">...read more</span>
            `;
            
            const readMoreBtn = videoDescriptionEl.querySelector('.description-read-more');
            readMoreBtn.addEventListener('click', () => {
                videoDescriptionEl.innerHTML = `
                    <span>${description}</span><span class="description-read-more"> show less</span>
                `;
                videoDescriptionEl.querySelector('.description-read-more').addEventListener('click', () => renderDescription(description));
            }, { once: true });
        }
    };

    const renderUpNext = (allVideos, currentVideoId) => {
        upNextContainer.innerHTML = '';
        const upNextHeading = document.createElement('h2');
        upNextHeading.className = 'text-lg font-semibold mb-4';
        upNextHeading.textContent = 'Up Next';
        upNextContainer.appendChild(upNextHeading);

        const otherVideos = allVideos.filter(v => v.id !== currentVideoId);
        otherVideos.forEach(video => {
            const card = document.createElement('a');
            card.href = `#`; // The href is not used for navigation
            card.dataset.videoId = video.id; // Store the ID for easy access
            card.className = 'up-next-card';
            card.innerHTML = `
                <img src="${video.thumbnail}" alt="${video.title}">
                <div class="min-w-0">
                    <h3 class="text-sm font-semibold leading-tight text-white line-clamp-2">${video.title}</h3>
                    <p class="text-xs text-gray-400 mt-1">${video.channel}</p>
                    <p class="text-xs text-gray-400">${video.views}</p>
                </div>
            `;
            card.addEventListener('click', (e) => {
                e.preventDefault();
                openPlayerModal(video.id);
            });
            upNextContainer.appendChild(card);
        });
    };

    // --- All player control logic from player.js goes here ---
    const togglePlay = () => video.paused ? video.play() : video.pause();
    const updatePlayPauseIcon = () => {
        playIcon.classList.toggle('hidden', !video.paused);
        pauseIcon.classList.toggle('hidden', video.paused);
    };
    const toggleMute = () => video.muted = !video.muted;
    const formatTime = (time) => new Date(time * 1000).toISOString().substr(11, 8);
    const updateTime = () => {
        currentTimeEl.textContent = formatTime(video.currentTime);
        timelineProgress.style.width = `${(video.currentTime / video.duration) * 100}%`;
    };
    const setTotalTime = () => totalTimeEl.textContent = formatTime(video.duration);
    const scrubTimeline = (e) => {
        const rect = timelineContainer.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.x - rect.x), rect.width) / rect.width;
        video.currentTime = percent * video.duration;
    };
    const toggleFullscreen = () => {
        if (document.fullscreenElement == null) videoContainer.requestFullscreen();
        else document.exitFullscreen();
    };

    const togglePip = async () => {
        if (!document.pictureInPictureEnabled) {
            pipBtn.disabled = true;
            return;
        }
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                pipVideoId = commentForm.dataset.videoId;
                await video.requestPictureInPicture();
                closePlayerModal();
            }
        } catch (error) {
            console.error("PiP Error:", error);
        }
    };

    const playNextVideo = () => {
        const nextVideoCard = upNextContainer.querySelector('.up-next-card');
        if (nextVideoCard && nextVideoCard.dataset.videoId) {
            openPlayerModal(nextVideoCard.dataset.videoId);
        }
    };

    const playPrevVideo = () => {
        if (videoHistory.length > 1) {
            videoHistory.pop(); // Remove current video
            const prevVideoId = videoHistory.pop(); // Get the previous one
            if (prevVideoId) {
                openPlayerModal(prevVideoId);
            }
        }
    };

    const updatePrevNextButtons = () => {
        // Previous button is enabled if there's history
        prevVideoBtn.disabled = videoHistory.length <= 1;
        // Next button is enabled if there's a video in the "Up Next" list
        nextVideoBtn.disabled = !upNextContainer.querySelector('.up-next-card');
    };

    // --- Comment Logic (now inside player modal context) ---
    const renderComments = (comments) => {
        commentList.innerHTML = '';
        if (comments.length === 0) {
            commentList.innerHTML = '<p class="text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>';
        } else {
            const commentsByParent = comments.reduce((acc, comment) => {
                const parentId = comment.parentId || 'root';
                if (!acc[parentId]) acc[parentId] = [];
                acc[parentId].push(comment);
                return acc;
            }, {});
            (commentsByParent['root'] || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(comment => {
                commentList.appendChild(createCommentElement(comment, commentsByParent));
            });
        }
    };

    const createCommentElement = (comment, allReplies) => {
        const el = document.createElement('div');
        el.className = 'comment-thread';
        const replies = (allReplies[comment.id] || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));

        el.innerHTML = `
            <div class="comment-item" data-comment-id="${comment.id}">
                <img class="h-9 w-9 rounded-full flex-shrink-0" src="images/opentech.png" alt="User Avatar">
                <div class="flex-1">
                    <p class="text-xs text-gray-400 font-semibold">${comment.author} <span class="font-normal ml-2">${new Date(comment.timestamp).toLocaleDateString()}</span></p>
                    <div class="comment-body mt-1"><p class="text-sm">${comment.text}</p></div>
                    <div class="comment-actions-wrapper mt-2 flex items-center gap-4">
                        <button class="video-interaction-btn comment-interaction-btn like-btn" data-reaction="likes">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                            <span class="count">${comment.likes > 0 ? formatCount(comment.likes) : ''}</span>
                        </button>
                        <button class="video-interaction-btn comment-interaction-btn love-btn" data-reaction="loves">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd" /></svg>
                            <span class="count">${comment.loves > 0 ? comment.loves : ''}</span>
                        </button>
                        <button class="video-interaction-btn reply-btn text-xs">Reply</button>
                    </div>
                </div>
            </div>
            ${replies.length > 0 ? `
                <div class="pl-12">
                    <button class="view-replies-btn flex items-center gap-2 text-sm font-semibold text-blue-400 hover:bg-blue-400/10 px-3 py-1 rounded-full">
                        <svg class="toggle-arrow w-4 h-4 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                        <span>${replies.length} ${replies.length > 1 ? 'replies' : 'reply'}</span>
                    </button>
                </div>
            ` : ''}
            <div class="replies-container hidden"></div>
        `;
        
        el.querySelectorAll('.comment-interaction-btn').forEach(btn => btn.addEventListener('click', handleCommentReaction));
        el.querySelector('.reply-btn').addEventListener('click', handleReplyButtonClick);

        if (replies.length > 0) {
            const repliesContainer = el.querySelector('.replies-container');
            const viewRepliesBtn = el.querySelector('.view-replies-btn');
            
            viewRepliesBtn.addEventListener('click', () => {
                const isHidden = repliesContainer.classList.toggle('hidden');
                viewRepliesBtn.querySelector('.toggle-arrow').classList.toggle('rotate-180', !isHidden);
                viewRepliesBtn.querySelector('span').textContent = isHidden ? `${replies.length} ${replies.length > 1 ? 'replies' : 'reply'}` : 'Hide replies';

                // Only render replies when they are shown for the first time for performance
                if (!isHidden && repliesContainer.innerHTML === '') {
                    replies.forEach(reply => {
                        repliesContainer.appendChild(createCommentElement(reply, allReplies));
                    });
                }
            });
        }
        return el;
    };

    const handleCommentReaction = async (e) => {
        const button = e.currentTarget;
        const interactionWrapper = button.closest('.comment-actions-wrapper');
        const commentId = button.closest('[data-comment-id]').dataset.commentId;
        const reaction = button.dataset.reaction;

        // Prevent multiple reactions on the same comment
        if (interactionWrapper.dataset.reacted) return;

        try {
            const response = await fetch(`/api/comments/${commentId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reaction })
            });
            if (!response.ok) throw new Error('Comment reaction failed');
            const data = await response.json();
            
            button.querySelector('.count').textContent = formatCount(data[reaction]);
            button.classList.add('reacted');
            // Mark this comment's actions as reacted to prevent further clicks
            interactionWrapper.dataset.reacted = 'true';
        } catch (error) {
            console.error('Failed to submit comment reaction:', error);
        }
    };

    const handleReplyButtonClick = (e) => {
        const replyBtn = e.currentTarget;
        const commentThread = replyBtn.closest('.comment-thread');

        // Prevent adding multiple reply forms
        if (commentThread.querySelector('.reply-form-container')) {
            return;
        }

        const replyFormContainer = document.createElement('div');
        replyFormContainer.className = 'reply-form-container';
        replyFormContainer.innerHTML = `
            <form class="reply-form">
                <div class="comment-input-form pb-1">
                    <input type="text" placeholder="Add a reply..." required class="reply-input text-sm">
                </div>
                <div class="flex justify-between items-center mt-2">
                    <button type="button" class="reply-emoji-btn p-2 rounded-full hover:bg-white/10 text-gray-400"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 100-2 1 1 0 000 2zm7-1a1 1 0 11-2 0 1 1 0 012 0zm-.464 5.535a.75.75 0 01.088 1.054l-1.96 2.063a.75.75 0 01-1.142-.98l1.96-2.063a.75.75 0 011.054-.088z" clip-rule="evenodd" /></svg></button>
                    <div class="flex gap-2">
                        <button type="button" class="cancel-reply-btn px-3 py-1 text-xs rounded-full hover:bg-gray-700">Cancel</button>
                        <button type="submit" class="px-3 py-1 text-xs rounded-full bg-blue-600 hover:bg-blue-700">Reply</button>
                    </div>
                </div>
            </form>
        `;

        commentThread.appendChild(replyFormContainer);
        const input = replyFormContainer.querySelector('input');
        input.focus();

        replyFormContainer.querySelector('.cancel-reply-btn').addEventListener('click', () => {
            replyFormContainer.remove();
        });

        replyFormContainer.querySelector('.reply-emoji-btn').addEventListener('click', (e) => {
            showEmojiPicker(e.currentTarget, input);
        });

        replyFormContainer.querySelector('.reply-form').addEventListener('submit', async (submitEvent) => {
            submitEvent.preventDefault();
            const parentId = replyBtn.closest('[data-comment-id]').dataset.commentId;
            const videoId = commentForm.dataset.videoId;
            const text = input.value.trim();

            if (!text) return;

            await fetch(`/api/comments/${parentId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, author: '@CurrentUser' })
            });

            // Refresh the entire modal to show the new reply in its proper place
            openPlayerModal(videoId);
        });
    };

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('comment-text-input');
        const text = textInput.value.trim();
        const videoId = e.currentTarget.dataset.videoId;

        if (!text || !videoId) return;

        try {
            await fetch(`/api/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, author: '@CurrentUser' }) // Hardcoded author for now
            });
            textInput.value = '';
            // Re-fetch comments for the current video
            const commentsRes = await fetch(`/api/videos/${videoId}/comments`);
            const comments = await commentsRes.json();
            renderComments(comments);
        } catch (error) { console.error('Failed to post comment:', error); }
    });

    const handleReaction = async (e) => {
        const button = e.currentTarget;
        const interactionWrapper = button.closest('.flex');
        const videoId = button.closest('[data-video-id]').dataset.videoId;
        const reaction = button.dataset.reaction;

        // Prevent multiple reactions on the same card
        if (interactionWrapper.dataset.reacted) return;

        try {
            const response = await fetch(`/api/videos/${videoId}/react`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reaction })
            });
            if (!response.ok) throw new Error('Reaction failed on server');

            const data = await response.json();
            const countEl = button.querySelector('span');
            countEl.textContent = reaction === 'likes' ? formatCount(data[reaction]) : data[reaction];

            // Add visual feedback and disable further reactions
            button.classList.add('reacted');
            interactionWrapper.dataset.reacted = 'true';
        } catch (error) {
            console.error('Failed to submit reaction:', error);
        }
    };

    const formatCount = (num) => {
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num;
    };

    // --- Emoji Picker Logic ---
    const showEmojiPicker = (button, input) => {
        const picker = document.createElement('emoji-picker');
        picker.classList.add('dark'); // Use dark theme for the picker
        picker.style.position = 'absolute';
        picker.style.zIndex = '100';
        document.body.appendChild(picker);

        const rect = button.getBoundingClientRect();
        picker.style.top = `${rect.bottom + window.scrollY}px`;
        picker.style.left = `${rect.left + window.scrollX}px`;

        picker.addEventListener('emoji-click', event => {
            input.value += event.detail.unicode;
            picker.remove();
        });
        // Remove picker if clicked outside
        setTimeout(() => document.addEventListener('click', () => picker.remove(), { once: true }), 0);
    };

    // --- Player Event Listeners ---
    playPauseBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
    video.addEventListener('ended', () => {
        // Autoplay next video
        if (isAutoplayEnabled) {
            playNextVideo();
        }
    });
    video.addEventListener('play', updatePlayPauseIcon);
    video.addEventListener('pause', updatePlayPauseIcon);
    muteBtn.addEventListener('click', toggleMute);
    volumeSlider.addEventListener('input', e => {
        video.volume = e.target.value;
        video.muted = e.target.value === 0;
    });
    video.addEventListener('volumechange', () => {
        volumeSlider.value = video.volume;
        const volumeHighIcon = document.getElementById('volume-high-icon');
        const volumeMutedIcon = document.getElementById('volume-muted-icon');
        volumeHighIcon.classList.toggle('hidden', video.muted || video.volume === 0);
        volumeMutedIcon.classList.toggle('hidden', !video.muted && video.volume > 0);
    });
    video.addEventListener('loadeddata', setTotalTime);
    video.addEventListener('timeupdate', updateTime);
    timelineContainer.addEventListener('mousedown', e => {
        e.preventDefault();
        scrubTimeline(e);
        document.addEventListener('mousemove', scrubTimeline);
        document.addEventListener('mouseup', () => document.removeEventListener('mousemove', scrubTimeline), { once: true });
    });
    fullscreenBtn.addEventListener('click', toggleFullscreen);
    closePlayerModalBtn.addEventListener('click', closePlayerModal);
    playerModalOverlay.addEventListener('click', (e) => {
        if (e.target === playerModalOverlay) closePlayerModal();
    });
    nextVideoBtn.addEventListener('click', playNextVideo);
    prevVideoBtn.addEventListener('click', playPrevVideo);
    document.addEventListener('keydown', e => {
        if (playerModalOverlay.classList.contains('hidden')) return; // Only act if modal is open
        const tagName = document.activeElement.tagName.toLowerCase();
        if (tagName === 'input') return;
        switch (e.key.toLowerCase()) {
            case ' ': case 'k': e.preventDefault(); togglePlay(); break;
            case 'm': toggleMute(); break;
            case 'f': toggleFullscreen(); break;
        }
    });

    document.getElementById('comment-emoji-btn').addEventListener('click', (e) => {
        const input = document.getElementById('comment-text-input');
        showEmojiPicker(e.currentTarget, input);
    });

    // --- PiP Event Listeners ---
    pipBtn.addEventListener('click', togglePip);
    video.addEventListener('leavepictureinpicture', () => {
        if (pipVideoId) {
            openPlayerModal(pipVideoId);
        }
        pipVideoId = null;
    });

    // Dark Mode
    const applyDarkMode = (isDark) => {
        if (isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    darkModeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('ccna_dark_mode', isDark);
    });

    // --- Initialization ---

    const initialize = () => {
        // Set initial dark mode state
        const isDark = localStorage.getItem('ccna_dark_mode') === 'true';
        applyDarkMode(isDark);

        // Set initial autoplay state
        const savedAutoplay = localStorage.getItem('autoplay_enabled');
        isAutoplayEnabled = savedAutoplay !== null ? JSON.parse(savedAutoplay) : true;

        // Set initial active filter
        categoryFilters.querySelector('[data-filter="all"]').classList.add('active');

        fetchVideos();
    };

    initialize();
});