module.exports = {
    // 未登录，跳往登录页
    // 用于需要用户登录才能操作的页面，如发布博客页面
    checkLogin: function checkLogin (req, res, next) {
        if (!req.session.user) {
            req.flash('error', '未登录');
            return res.redirect('/signin');
        }
        next();
    },
    // 已登录，跳回之前的页面
    // 如已登录用户就禁止访问登录、注册页面
    checkNotLogin: function checkNotLogin (req, res, next) {
        if (req.session.user) {
            req.flash('error', '已登录');
            return res.redirect('back');    // 返回之前的页面
        }
        next();
    }
}
