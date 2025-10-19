const express = require('express');
const cors = require('cors');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const videosDbPath = path.join(__dirname, 'videos.json');
const commentsDbPath = path.join(__dirname, 'comments.json');

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '..'))); // Serve static files from the root

// --- Helper Functions ---
const readDb = async (filePath) => JSON.parse(await fs.readFile(filePath, 'utf-8'));
const writeDb = async (filePath, data) => fs.writeFile(filePath, JSON.stringify(data, null, 4));

// --- API Endpoints ---

// GET all videos
app.get('/api/videos', async (req, res) => {
    try {
        const videos = await readDb(videosDbPath);
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos' });
    }
});

// GET a single video by ID
app.get('/api/videos/:id', async (req, res) => {
    try {
        const videos = await readDb(videosDbPath);
        const video = videos.find(v => v.id === req.params.id);
        if (video) {
            res.json(video);
        } else {
            res.status(404).json({ message: 'Video not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error fetching video' });
    }
});

// GET comments for a video
app.get('/api/videos/:id/comments', async (req, res) => {
    try {
        const comments = await readDb(commentsDbPath);
        const videoComments = Object.values(comments).filter(c => c.videoId === req.params.id);
        res.json(videoComments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments' });
    }
});

// POST a new comment
app.post('/api/videos/:id/comments', async (req, res) => {
    try {
        const { text, author } = req.body;
        if (!text || !author) return res.status(400).json({ message: 'Author and text are required.' });

        const comments = await readDb(commentsDbPath);
        const videos = await readDb(videosDbPath);

        const newCommentId = `c${Date.now()}`;
        const newComment = {
            id: newCommentId,
            videoId: req.params.id,
            author,
            text,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        comments[newCommentId] = newComment;

        // Update comment count on the video
        const video = videos.find(v => v.id === req.params.id);
        if (video) video.comments++;

        await writeDb(commentsDbPath, comments);
        await writeDb(videosDbPath, videos);

        res.status(201).json(newComment);
    } catch (error) {
        res.status(500).json({ message: 'Error posting comment' });
    }
});

// POST to like/love a video
app.post('/api/videos/:id/react', async (req, res) => {
    try {
        const { reaction } = req.body; // 'like' or 'love'
        if (!['likes', 'loves'].includes(reaction)) {
            return res.status(400).json({ message: 'Invalid reaction.' });
        }

        const videos = await readDb(videosDbPath);
        const video = videos.find(v => v.id === req.params.id);

        if (!video) return res.status(404).json({ message: 'Video not found.' });

        video[reaction]++;
        await writeDb(videosDbPath, videos);
        res.json({ [reaction]: video[reaction] });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reaction' });
    }
});

// POST to like a comment
app.post('/api/comments/:id/like', async (req, res) => {
    try {
        const comments = await readDb(commentsDbPath);
        const comment = comments[req.params.id];

        if (!comment) return res.status(404).json({ message: 'Comment not found.' });

        comment.likes++;
        await writeDb(commentsDbPath, comments);
        res.json({ likes: comment.likes });
    } catch (error) {
        res.status(500).json({ message: 'Error liking comment' });
    }
});

// POST a reply to a comment
app.post('/api/comments/:id/reply', async (req, res) => {
    try {
        const { text, author } = req.body;
        const parentId = req.params.id;
        if (!text || !author) return res.status(400).json({ message: 'Author and text are required.' });

        const comments = await readDb(commentsDbPath);
        if (!comments[parentId]) return res.status(404).json({ message: 'Parent comment not found.' });

        const newReplyId = `c${Date.now()}`;
        const newReply = {
            id: newReplyId,
            videoId: comments[parentId].videoId,
            parentId: parentId,
            author,
            text,
            timestamp: new Date().toISOString(),
            likes: 0
        };
        comments[newReplyId] = newReply;
        await writeDb(commentsDbPath, comments);
        res.status(201).json(newReply);
    } catch (error) {
        res.status(500).json({ message: 'Error posting reply' });
    }
});

// Fallback to serve index.html for any other route
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});