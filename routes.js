const express = require('express');
const router = express.Router();
const upload = require('./middlewares/upload'); // pour gérer l'upload du fichier
const { isAuthenticated } = require('./middlewares/auth');

// Controllers
const AuthenticationController = require('./controllers/AuthenticationController');
const JourneyController = require('./controllers/JourneyController');
const LeaderController = require('./controllers/LeaderController');
const TaskController = require('./controllers/TaskController');
const UserTaskController = require('./controllers/UserTaskController');




// ==== Auth & Users ====
router.post('/register', AuthenticationController.register); // Register admin
router.post('/register-member', AuthenticationController.registerMember); // Register member
router.post('/login', AuthenticationController.login);
router.put('/update-password', AuthenticationController.updatePassword); // User updates their password

// ==== Journeys ====
router.get('/journey/getJourneyList', JourneyController.getAllJourneys);
router.get('/journey/getJourneyById/:id', JourneyController.getJourneyById);
router.post('/journey/createJourney', JourneyController.createJourney); // Admin only
router.put('/journey/updateJourney/:id', JourneyController.updateJourney); // Admin only
router.delete('/journey/deleteJourney/:id', JourneyController.deleteJourney); // Admin only

// Update task status for a user (admin use only)
router.post('/journeys/update-task-status', JourneyController.updateUserTaskStatus);
router.patch('/tasks/:taskId/justify', upload.single('media'), UserTaskController.submitTaskWithJustification);
router.get('/scout/getPendingUserTasks', UserTaskController.getPendingTasks);
router.put("/scout-task/:id/approve", UserTaskController.approbation);
router.get(`/scout-task/users-progressions/:ids`, UserTaskController.getUsersProgressions);


// ==== Leaders ====
router.get('/scout/getSupervisedUsers',isAuthenticated ,LeaderController.getSupervisedUsers );
router.get('/scout/getSuperviseUsers',isAuthenticated ,LeaderController.getSuperviseUsers);
router.post('/scout/addSupervisor',isAuthenticated ,LeaderController.createSupervisorSelfSupervised);
router.get('/scout/getScoutBySupervisor', LeaderController.getAccomplishedTasksBySupervisor);
router.get('/scout/getScoutById/:id', LeaderController.getLeaderById);
router.put('/scout/updateScout/:id', LeaderController.updateLeader);
router.delete('/scout/deleteScout/:id', LeaderController.deleteLeader);
router.get('/scout/getUserTasks/:userId', UserTaskController.getUserTasks);
router.post('/scout/addUserTask', UserTaskController.addUserTask);
router.delete('/scout/deleteUserTask/:userId/:taskId', UserTaskController.deleteUserTask);
router.post('/scout/addUserTaskToMultipleUsers', UserTaskController.addUserTaskToMultipleUsers);

// ==== Tasks ====
router.post('/task/createTask', TaskController.createTask); // create new task
router.get('/task/getTaskList', TaskController.getTasks);
router.get('/task/getTaskyById/:id', TaskController.getTaskById);
router.put('/task/updateTask/:id', TaskController.updateTask);
router.delete('/task/deleteTask/:id', TaskController.deleteTask);

module.exports = router;
