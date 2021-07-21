const path = require('path');
const assert = require('assert');
const request = require('supertest');
const { describe, beforeEach, after, afterEach, it } = require('mocha');
const app = require('../index');
const User = require('../lib/mongo').User;

const testName1 = 'testName1';
const testName2 = 'testName2';

/**
 * HOOKS:
 * With its default “BDD”-style interface, 
 * Mocha provides the hooks before(), after(), beforeEach(), and afterEach(). 
 * These should be used to set up preconditions and clean up after your tests.
 * 
 * before: runs once before the first test in this block
 * after: runs once after the last test in this block
 * beforeEach: runs before each test in this block
 * afterEach: runs after each test in this block
 */

describe('signup', function () {
    describe('POST /signup', function () {
        // persist cookie when redirect
        const agent = request.agent(app);
        beforeEach(function (done) {
            // 创建一个用户
            User.create({
                name: testName1,
                password: 123456,
                avatar: '',
                gender: 'x',
                bio: ''
            }).exec().then(function () {
                done();
            }).catch(done);
        });
        afterEach(function (done) {
            // 测试删除用户
            User.deleteMany({ name: { $in: [ testName1, testName2 ] } })
                .exec().then(function () {
                    done();
                }).catch(done);
        });
        after(function () {
            process.exit();
        });

        // 用户名错误的情况
        it('wrong name', function (done) {
            agent.post('/signup')
                 .type('form')
                 .field({ name: '' })
                 .attach('avater', path.join(__dirname, 'img/avatar.jpg'))
                 .redirects()
                 .end(function (err, res) {
                        if (err) return done(err);
                        assert(res.text.match(/名字请限制在 1-10 个字符/));
                        done();
                 });
        });

        // // 性别错误的情况
        // it('wrong gender', function (done) {
        //     agent
        //         .post('/signup')
        //         .type('form')
        //         .field({ name: testName2, gender: 'a' })
        //         .attach('avatar', path.join(__dirname, 'img/avatar.png'))
        //         .redirects()
        //         .end(function (err, res) {
        //             if (err) return done(err);
        //             assert(res.text.match(/性别只能是 m、f 或 x/));
        //             done();
        //         });
        // })
        // // 其余的参数测试自行补充
        // // 用户名被占用的情况
        // it('duplicate name', function (done) {
        //     agent
        //     .post('/signup')
        //     .type('form')
        //     .field({ name: testName1, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        //     .attach('avatar', path.join(__dirname, 'avatar.png'))
        //     .redirects()
        //     .end(function (err, res) {
        //         if (err) return done(err)
        //         assert(res.text.match(/用户名已被占用/))
        //         done()
        //     })
        // })
    
        // // 注册成功的情况
        // it('success', function (done) {
        //     agent
        //     .post('/signup')
        //     .type('form')
        //     .field({ name: testName2, gender: 'm', bio: 'noder', password: '123456', repassword: '123456' })
        //     .attach('avatar', path.join(__dirname, 'avatar.png'))
        //     .redirects()
        //     .end(function (err, res) {
        //         if (err) return done(err)
        //         assert(res.text.match(/注册成功/))
        //         done()
        //     })
        // })
    });
});
