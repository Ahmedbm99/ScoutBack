const express = require('express');
const router = express.Router();
const upload = require('./middlewares/upload'); // pour gérer l'upload du fichier
const  isAuthenticated  = require('./middlewares/auth');

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
router.get('/journey/getJourneyList',isAuthenticated, JourneyController.getAllJourneys);
router.get('/journey/getJourneyById/:id',isAuthenticated, JourneyController.getJourneyById);
router.post('/journey/createJourney', isAuthenticated,JourneyController.createJourney); // Admin only
router.put('/journey/updateJourney/:id', JourneyController.updateJourney); // Admin only
router.delete('/journey/deleteJourney/:id', JourneyController.deleteJourney); // Admin only

// Update task status for a user (admin use only)
router.post('/journeys/update-task-status', JourneyController.updateUserTaskStatus);
router.patch('/tasks/:taskId/justify',isAuthenticated,  upload.single('media'), UserTaskController.submitTaskWithJustification);
router.get('/scout/getPendingUserTasks', isAuthenticated,UserTaskController.getPendingTasks);
router.put("/scout-task/:id/approve",isAuthenticated, UserTaskController.approbation);
router.get(`/scout-task/users-progressions/:ids`,isAuthenticated, UserTaskController.getUsersProgressions);
router.get('/user-tasks/done/:leaderId', UserTaskController.getUserDoneTasks);


// ==== Leaders ====
router.get('/scout/getSupervisedUsers',isAuthenticated ,LeaderController.getSupervisedUsers );
router.get('/scout/getSuperviseUsers',isAuthenticated ,LeaderController.getSuperviseUsers);
router.post('/scout/addSupervisor' ,isAuthenticated,LeaderController.createSupervisorSelfSupervised);
router.get('/scout/getScoutBySupervisor',isAuthenticated, LeaderController.getAccomplishedTasksBySupervisor);
router.get('/scout/getScoutById/:id',isAuthenticated, LeaderController.getLeaderById);
router.put('/scout/updateScout/:id', isAuthenticated, (req, res) => {res.json({ message: "Requête reçue", params: req.params, body: req.body });
});router.delete('/scout/deleteScout/:id',isAuthenticated, LeaderController.deleteLeader);
router.get('/scout/getUserTasks/:userId',isAuthenticated, UserTaskController.getUserTasks);
router.post('/scout/addUserTask',isAuthenticated, UserTaskController.addUserTask);
router.delete('/scout/deleteUserTask/:userId/:taskId',isAuthenticated, UserTaskController.deleteUserTask);
router.post('/scout/addUserTaskToMultipleUsers',isAuthenticated, UserTaskController.addUserTaskToMultipleUsers);

// ==== Tasks ====
router.post('/task/createTask',isAuthenticated, TaskController.createTask); // create new task
router.get('/task/getTaskList',isAuthenticated, TaskController.getTasks);
router.get('/task/getTaskyById/:id',isAuthenticated, TaskController.getTaskById);
router.put('/task/updateTask/:id',isAuthenticated, TaskController.updateTask);
router.delete('/task/deleteTask/:id',isAuthenticated, TaskController.deleteTask);

module.exports = router;
