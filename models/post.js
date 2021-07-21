const marked = require('marked');
const Post = require('../lib/mongo').Post;
const Comment = require('../models/comments');

// 将 post 的 content 从 markdown 转为 html
// 在 PostModel 上注册了 contentToHtml，contentToHtml 只针对 PostModel 有效
Post.plugin('contentToHtml', {
    afterFind: function (posts) {
        return posts.map(function (post) {
            post.content = marked(post.content);
            return post;
        });
    },
    afterFindOne: function (post) {
        if (post) {
            post.content = marked(post.content);
        }
        return post;
    }
});

// 给 Post 标上留言数
Post.plugin('attachCommentsCount', {
    afterFind: function (posts) {
        if (posts) {
            return Promise.all(posts.map(function (post) {
                return Comment.getCommentsCount(post._id).then(function (count) {
                    post.commentsCount = count;
                    return post;
                })
            }));
        }
    },
    afterFindOne: function (post) {
        if (post) {
            return Comment.getCommentsCount(post._id).then(function (count) {
                post.commentsCount = count;
                return post;
            });
        }
    }
});

module.exports = {
    // 创建一篇文章
    create: function (post) {
        return Post.create(post).exec();
    },
    // 通过 ID 获取文章（转成 HTML）
    getPostById: function (postId) {
        return Post
                .findOne({ _id: postId })
                .populate({ path: 'author', model: 'User' })
                .addCreatedAt()
                .attachCommentsCount()
                .contentToHtml()
                .exec();
    },
    // 按创建时间降序获取所有用户文章或者某个特定用户的所有文章
    getPosts: function (author) {
        const query = {};
        if (author) {
            query.author = author;
        }
        return Post
                .find(query)
                .populate({ path: 'author', model: 'User' })
                .sort({ _id: -1 })
                .addCreatedAt()
                .attachCommentsCount()
                .contentToHtml()
                .exec();
    },
    // 通过文章 id 给 pv 加 1
    incPv: function (postId) {
        return Post
                .update({ _id: postId }, { $inc: { pv: 1 } })
                .exec();
    },
    // 通过文章 id 获取一篇原生文章（编辑文章）
    getRawPostById: function (postId) {
        return Post
                .findOne({ _id: postId })
                .populate({ path: 'author', model: 'User' })
                .exec();
    },
    // 通过文章 id 更新一篇文章
    updatePostById: function (postId, data) {
        return Post.update({ _id: postId }, { $set: data });
    },
    // 通过用户 ID 和 文章 id 删除一篇文章
    deletePostById: function (postId, author) {
        return Post.deleteOne({ _id: postId, author: author })
                .exec()
                .then(function (res) {
                    if (res.result.ok && res.result.n > 0) {
                        return Comment.deleteCommentsByPostId(postId);
                    }
                });
    }
};
