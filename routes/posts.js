const express = require('express');
const router = express.Router();
const PostModel = require('../models/post');
const CommentModel = require('../models/comments');

const checkLogin = require('../middlewares/check').checkLogin;

// GET /posts 所有用户或者特定用户的文章页
// eg: GET /posts?author=xxx
router.get('/', function (req, res, next) {
    const author = req.query.author;
    PostModel.getPosts(author).then(function (posts) {
        res.render('posts', { posts })
    }).catch(next);
});

// GET /posts/create 发表文章页
router.get('/create', checkLogin, function (req, res, next) {
    res.render('create');
});

// POST /posts/create 发表一篇文章
router.post('/create', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    // 检验参数
    try {
        if (!title) {
            throw new Error('请填写标题');
        }
        if (!content) {
            throw new Error('请填写内容');
        }
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }

    let post = { author, title, content };

    PostModel.create(post).then(function (result) {
        // 此 post 是插入 mongodb 后的值，包含 _id
        post = result.ops[0];
        req.flash('success', '发表成功');
        // 发表成功后跳转到该文章页
        res.redirect(`/posts/${post._id}`);
    }).catch(next);
});

// GET /posts/:postId 单独一篇的文章页
router.get('/:postId', function (req, res, next) {
    const postId = req.params.postId;
    Promise.all([
        PostModel.getPostById(postId),
        CommentModel.getComments(postId),
        PostModel.incPv(postId)
    ]).then(function (result) {
        const post = result[0];
        const comments = result[1] || [];
        if (!post) {
            throw new Error('文章不存在');
        }

        res.render('post', { post, comments });
    }).catch(next);
});

// GET /posts/:postId/edit 更新文章页
router.get('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;
    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) throw new Error('该文章不存在');
        if (author.toString() !== post.author._id.toString()) throw new Error('权限不足');
        res.render('edit', { post });
    }).catch(next);
});

// POST /posts/:postId/edit 更新一篇文章
router.post('/:postId/edit', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;
    const title = req.fields.title;
    const content = req.fields.content;

    // 参数校验
    try {
        if (!title) throw new Error('请填写标题');
        if (!content) throw new Error('请填写内容');
    } catch (err) {
        req.flash('error', err.message);
        return res.redirect('back');
    }

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) throw new Error('文章不存在');
        if (author.toString() !== post.author._id.toString()) throw new Error('权限不足');

        PostModel.updatePostById(postId, { title, content })
                .then(function () {
                    req.flash('success', '文章编辑成功');
                    res.redirect(`/posts/${postId}`);
                }).catch(next);
    }).catch(next);
});

// GET /posts/:postId/remove 删除一篇文章
router.get('/:postId/remove', checkLogin, function (req, res, next) {
    const postId = req.params.postId;
    const author = req.session.user._id;

    PostModel.getRawPostById(postId).then(function (post) {
        if (!post) throw new Error('该文章不存在');
        if (author.toString() !== post.author._id.toString()) throw new Error('权限不足');
        PostModel.deletePostById(postId).then(function () {
            req.flash('success', '删除成功');
            res.redirect('/posts');
        }).catch(next);
    }).catch(next);
});

module.exports = router;
