const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const settingsController = require('../controllers/settingsController');
const feeRuleController = require('../controllers/feeRuleController');
const parkingRecordsController = require('../controllers/parkingRecordsController');
const memberVehiclesController = require('../controllers/memberVehiclesController');
const usersController = require('../controllers/usersController');
const logsController = require('../controllers/logsController');
const { authMiddleware } = require('../middleware/auth');

// 所有API都需要认证
router.use(authMiddleware);

// Dashboard
router.get('/dashboard/summary', dashboardController.getSummary);
router.get('/dashboard/charts', dashboardController.getCharts);

// 系统设置
router.get('/settings', settingsController.getSettings);
router.post('/settings', settingsController.updateSettings);

// 收费规则
router.get('/fee-rule', feeRuleController.getFeeRule);
router.post('/fee-rule', feeRuleController.updateFeeRule);

// 进出场记录
router.get('/parking-records', parkingRecordsController.getParkingRecords);
router.post('/parking-records/mock-generate', parkingRecordsController.mockGenerate);

// 会员车辆
router.get('/member-vehicles', memberVehiclesController.getMemberVehicles);
router.post('/member-vehicles', memberVehiclesController.createMemberVehicle);
router.put('/member-vehicles/:id', memberVehiclesController.updateMemberVehicle);
router.delete('/member-vehicles/:id', memberVehiclesController.deleteMemberVehicle);

// 用户管理
router.get('/users', usersController.getUsers);
router.post('/users', usersController.createUser);
router.put('/users/:id', usersController.updateUser);
router.delete('/users/:id', usersController.deleteUser);

// 日志管理
router.get('/logs/login', logsController.getLoginLogs);
router.get('/logs/ops', logsController.getOpLogs);

module.exports = router;
