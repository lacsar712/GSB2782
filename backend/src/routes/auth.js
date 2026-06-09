const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// 登录（不需要认证）
router.post('/login', authController.login);

// 登出（需要认证）
router.post('/logout', authMiddleware, authController.logout);

// 获取当前用户信息（需要认证）
router.get('/me', authMiddleware, authController.getCurrentUser);

module.exports = router;
