document.addEventListener('DOMContentLoaded', () => {
    const videoGrid = document.getElementById('video-grid');
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
    const upNextContainer = document.getElementById('up-next-container');
    const commentForm = document.getElementById('comment-form');
    const commentList = document.getElementById('comment-list');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const bigPlayBtn = document.getElementById('big-play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteBtn = document.getElementById('mute-btn');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.getElementById('timeline-progress');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    let allVideos = [];
    let currentFilter = 'all';

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
        const searchTerm = searchInput.value.toLowerCase();
        
        const filteredVideos = allVideos.filter(video => {
            const matchesSearch = video.title.toLowerCase().includes(searchTerm) || video.tags.some(tag => tag.includes(searchTerm));
            const matchesCategory = currentFilter === 'all' || video.tags.includes(currentFilter);
            return matchesSearch && matchesCategory;
        });

        videoGrid.innerHTML = '';

        if (filteredVideos.length === 0) {
            noResultsEl.classList.remove('hidden');
            videoGrid.classList.add('hidden');
        } else {
            noResultsEl.classList.add('hidden');
            videoGrid.classList.remove('hidden');
            filteredVideos.forEach(video => {
                const videoCard = createVideoCard(video);
                videoGrid.appendChild(videoCard);
            });
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
        
        // Reset state
        videoTitleEl.textContent = 'Loading...';
        videoChannelEl.textContent = '';
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
            videoChannelEl.textContent = videoData.channel;
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
        playerModalOverlay.classList.add('hidden');
        document.body.style.overflow = '';
        video.pause();
        video.src = '';
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
            card.href = `player.html?id=${video.id}`;
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
        videoContainer.classList.toggle('playing', !video.paused);
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

    // --- Comment Logic (now inside player modal context) ---
    const renderComments = (comments) => {
        commentList.innerHTML = '';
        if (comments.length === 0) {
            commentList.innerHTML = '<p class="text-gray-400 text-center py-8">No comments yet. Be the first to comment!</p>';
        } else {
            // This is a simplified render. The full reply logic can be re-added here.
            comments.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).forEach(comment => {
                const el = document.createElement('div');
                el.className = 'comment-item';
                el.innerHTML = `
                    <img class="h-9 w-9 rounded-full flex-shrink-0" src="images/opentech.png" alt="User Avatar">
                    <div class="flex-1">
                        <p class="text-xs text-gray-400 font-semibold">${comment.author} <span class="font-normal ml-2">${new Date(comment.timestamp).toLocaleDateString()}</span></p>
                        <div class="comment-body mt-1"><p class="text-sm">${comment.text}</p></div>
                    </div>
                `;
                commentList.appendChild(el);
            });
        }
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

    // --- Player Event Listeners ---
    playPauseBtn.addEventListener('click', togglePlay);
    bigPlayBtn.addEventListener('click', togglePlay);
    video.addEventListener('click', togglePlay);
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

        // Set initial active filter
        categoryFilters.querySelector('[data-filter="all"]').classList.add('active');

        fetchVideos();
    };

    initialize();
});