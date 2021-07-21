const express = require('express');
const router = express.Router();

const checkLogin = require('../middlewares/check').checkLogin;

// GET /signout 退出登录
router.get('/', checkLogin, function (req, res, next) {
    // 清空 session 中的用户信息
    req.session.user = null;
    req.flash('success', '退出登录成功');
    // 退出登录成功后跳往主页
    res.redirect('/posts');
});

module.exports = router;
