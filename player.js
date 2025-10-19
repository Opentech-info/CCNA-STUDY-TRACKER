document.addEventListener('DOMContentLoaded', () => {
    const videoContainer = document.getElementById('video-container');
    const video = document.getElementById('main-video');
    const playerWrapper = document.getElementById('player-wrapper');
    const videoTitleEl = document.getElementById('video-title');
    const videoChannelEl = document.getElementById('video-channel');
    const upNextContainer = document.getElementById('up-next-container');
    const commentSection = document.getElementById('comment-section');
    const commentForm = document.getElementById('comment-form');
    const commentList = document.getElementById('comment-list');

    // Controls
    const playPauseBtn = document.getElementById('play-pause-btn');
    const bigPlayBtn = document.getElementById('big-play-btn');
    const playIcon = document.getElementById('play-icon');
    const pauseIcon = document.getElementById('pause-icon');
    const muteBtn = document.getElementById('mute-btn');
    const volumeHighIcon = document.getElementById('volume-high-icon');
    const volumeMutedIcon = document.getElementById('volume-muted-icon');
    const volumeSlider = document.getElementById('volume-slider');
    const currentTimeEl = document.getElementById('current-time');
    const totalTimeEl = document.getElementById('total-time');
    const timelineContainer = document.querySelector('.timeline-container');
    const timelineProgress = document.getElementById('timeline-progress');
    const fullscreenBtn = document.getElementById('fullscreen-btn');

    const params = new URLSearchParams(window.location.search);
    const videoId = params.get('id');

    if (!videoId) {
        videoTitleEl.textContent = 'Error: No video specified.';
        return;
    }

    // --- Load All Page Data ---
    const loadPageData = async () => {
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
            document.title = `${videoData.title} - Opentech-info`;

            // Populate Up Next and Comments
            renderUpNext(allVideos, videoId);
            renderComments(comments);

        } catch (error) {
            videoTitleEl.textContent = 'Error loading video.';
            console.error(error);
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
            upNextContainer.appendChild(card);
        });
    };

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
        el.innerHTML = `
            <div class="comment-item">
                <img class="h-9 w-9 rounded-full flex-shrink-0" src="images/opentech.png" alt="User Avatar">
                <div class="flex-1">
                    <p class="text-xs text-gray-400 font-semibold">${comment.author} <span class="font-normal ml-2">${new Date(comment.timestamp).toLocaleDateString()}</span></p>
                    <div class="comment-body mt-1"><p class="text-sm">${comment.text}</p></div>
                    <div class="mt-2 flex items-center gap-4">
                        <button class="video-interaction-btn comment-like-btn" data-comment-id="${comment.id}">
                            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.562 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" /></svg>
                            <span class="comment-like-count">${comment.likes > 0 ? comment.likes : ''}</span>
                        </button>
                        <button class="video-interaction-btn reply-btn text-xs" data-comment-id="${comment.id}">Reply</button>
                    </div>
                </div>
            </div>
            <div class="replies-container hidden"></div>
        `;
        el.querySelector('.comment-like-btn').addEventListener('click', handleCommentLike);
        el.querySelector('.reply-btn').addEventListener('click', () => console.log('Reply clicked')); // Placeholder

        const replies = (allReplies[comment.id] || []).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        if (replies.length > 0) {
            const repliesContainer = el.querySelector('.replies-container');
            repliesContainer.classList.remove('hidden');
            replies.forEach(reply => {
                repliesContainer.appendChild(createCommentElement(reply, allReplies));
            });
        }
        return el;
    };

    // --- Player Logic ---
    const togglePlay = () => {
        video.paused ? video.play() : video.pause();
    };

    const updatePlayPauseIcon = () => {
        playIcon.classList.toggle('hidden', !video.paused);
        pauseIcon.classList.toggle('hidden', video.paused);
        videoContainer.classList.toggle('playing', !video.paused);
    };

    const toggleMute = () => {
        video.muted = !video.muted;
    };

    const updateMuteIcon = () => {
        volumeHighIcon.classList.toggle('hidden', video.muted || video.volume === 0);
        volumeMutedIcon.classList.toggle('hidden', !video.muted && video.volume > 0);
    };

    const formatTime = (timeInSeconds) => {
        const result = new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
        return {
            minutes: result.substr(3, 2),
            seconds: result.substr(6, 2),
        };
    };

    const updateTime = () => {
        const { minutes: currentMinutes, seconds: currentSeconds } = formatTime(video.currentTime);
        currentTimeEl.textContent = `${currentMinutes}:${currentSeconds}`;
        const percent = (video.currentTime / video.duration) * 100;
        timelineProgress.style.width = `${percent}%`;
    };

    const setTotalTime = () => {
        const { minutes, seconds } = formatTime(video.duration);
        totalTimeEl.textContent = `${minutes}:${seconds}`;
    };

    const scrubTimeline = (e) => {
        const timelineRect = timelineContainer.getBoundingClientRect();
        const percent = Math.min(Math.max(0, e.x - timelineRect.x), timelineRect.width) / timelineRect.width;
        video.currentTime = percent * video.duration;
    };

    const toggleFullscreen = () => {
        if (document.fullscreenElement == null) {
            videoContainer.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const handleCommentLike = async (e) => {
        const button = e.currentTarget;
        const commentId = button.dataset.commentId;
        button.disabled = true;

        try {
            const response = await fetch(`/api/comments/${commentId}/like`, { method: 'POST' });
            const data = await response.json();
            button.querySelector('.comment-like-count').textContent = data.likes;
            button.querySelector('svg').classList.add('text-blue-500');
        } catch (error) {
            console.error('Failed to like comment:', error);
            button.disabled = false;
        }
    };

    commentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('comment-text-input');
        const text = textInput.value.trim();
        if (!text) return;

        try {
            await fetch(`/api/videos/${videoId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text, author: '@CurrentUser' })
            });
            textInput.value = '';
            loadPageData(); // Reload all data to show the new comment
        } catch (error) { console.error('Failed to post comment:', error); }
    });

    // --- Event Listeners ---
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
        updateMuteIcon();
    });

    video.addEventListener('loadeddata', setTotalTime);
    video.addEventListener('timeupdate', updateTime);

    timelineContainer.addEventListener('mousedown', e => {
        e.preventDefault();
        scrubTimeline(e);
        document.addEventListener('mousemove', scrubTimeline);
        document.addEventListener('mouseup', () => {
            document.removeEventListener('mousemove', scrubTimeline);
        }, { once: true });
    });

    fullscreenBtn.addEventListener('click', toggleFullscreen);

    document.addEventListener('keydown', e => {
        const tagName = document.activeElement.tagName.toLowerCase();
        if (tagName === 'input') return;

        switch (e.key.toLowerCase()) {
            case ' ':
            case 'k':
                e.preventDefault();
                togglePlay();
                break;
            case 'm':
                toggleMute();
                break;
            case 'f':
                toggleFullscreen();
                break;
            case 'arrowleft':
                video.currentTime -= 5;
                break;
            case 'arrowright':
                video.currentTime += 5;
                break;
        }
    });

    loadPageData();
});