const express = require('express');
const router = express.Router();
const checkLogin = require('../middlewares/check').checkLogin;
const CommentModel = require('../models/comments');

// POST /comments 创建一条留言
router.post('/', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const postId = req.fields.postId;
    const content = req.fields.content;

    // 校验参数
    try {
        if (!content) throw new Error('请填写留言内容');
    } catch (err) {
        req.flash('error', err.message);
        res.redirect('back');
    }

    const comment = { author, postId, content };
    CommentModel.create(comment).then(function () {
        req.flash('success', '留言成功');
        res.redirect('back');
    }).catch(next);
});

// GET /comments/:commentId/remove 删除一条留言
router.get('/:commentId/remove', checkLogin, function (req, res, next) {
    const author = req.session.user._id;
    const commentId = req.fields.commentId;
    CommentModel.getCommentById(commentId).then(function (comment) {
        if (!comment) throw new Error('该留言不存在');
        if (author.toString() !== comment.author.toString()) throw new Error('权限不足');
        CommentModel.deleteCommentById(commentId).then(function () {
            req.flash('success', '留言删除成功');
            res.redirect('back');
        }).catch(next);
    }).catch(next);
});

module.exports = router;
