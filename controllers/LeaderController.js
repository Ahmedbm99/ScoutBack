const { Leader, Task, UserTask } = require('../models');

const getSupervisedUsers = async (req, res) => {
  const supervisorId = req.user?.id;
  console.log("ID du superviseur :", supervisorId);
  if (!supervisorId) {
    return res.status(401).json({ message: "Utilisateur non authentifié" });
  }

  try {
    const users = await Leader.findAll({
      where: {
        supervisorId,
        role: 'user'
      },
      attributes: { exclude: ['password'] }
    });

    res.json(users);
  } catch (err) {
    console.error("Erreur :", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

const getAllScouts = async (req, res) => {
  try {
    const scouts = await Leader.findAll({
      where: { role: 'user' },
      attributes: { exclude: ['password'] },
      include: [
        {
          model: Task,
          through: {
            model: UserTask,
            attributes: ['note', 'justificationComment', 'justificationMedia'],
          },
        },
      ],
    });

    res.status(200).json(scouts);
  } catch (err) {
    console.error("Erreur dans getAllScouts:", err);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération des scouts' });
  }
};


const getLeaderById = async (req, res) => {
  try {
    const leader = await Leader.findByPk(req.params.id);
    if (!leader) return res.status(404).json({ message: 'Leader not found' });
    res.json(leader);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getSuperviseUsers = async (req, res) => {
  try {
    const supervisors = await Leader.findAll({
      where: {
        role: "supervisor", // Vérifie l'orthographe
      },
      attributes: ["id", "username", "firstName", "lastName"] // ajuste les champs retournés
    });

    res.status(200).json(supervisors);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des superviseurs" });
  }
};

const getAccomplishedTasksBySupervisor = async (req, res) => {
  try {

    const supervisorId = req.user.id;

    if (!supervisorId) {
      return res.status(400).json({ message: "supervisorId est requis" });
    }

    const scouts = await Leader.findAll({
      where: { supervisorId },
      include: [
        {
          model: Task,
          through: {
            model: UserTask,
            attributes: ["note", "justificationComment", "justificationMedia"],
          },
        },
      ],
    });

    res.json(scouts);
  } catch (error) {
    console.error("Erreur dans getAccomplishedTasksBySupervisor:", error);
    res.status(500).json({ error: "Erreur serveur" });
  }
};

const createSupervisorSelfSupervised = async (req, res) => {
  try {
    const { supervisorId, ...leaderData } = req.body;

    leaderData.role = 'supervisor'; 
    // Création sans supervisorId
    const newLeader = await Leader.create({
      ...leaderData,
      supervisorId: null, // temporairement null
    });

    // Mise à jour pour que supervisorId soit son propre id
    newLeader.supervisorId = newLeader.id;
    await newLeader.save();

    res.status(201).json(newLeader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const updateLeader = async (req, res) => {
  try {
    console.log("Payload updateLeader:", req.body);
    const [updatedRowsCount, [updatedLeader]] = await Leader.update(req.body, {
      where: { id: req.params.id },
      returning: true,
    });
    if (updatedRowsCount === 0) return res.status(404).json({ message: 'Leader not found' });
    res.json(updatedLeader);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

const deleteLeader = async (req, res) => {
  try {
    const deletedRowsCount = await Leader.destroy({
      where: { id: req.params.id }
    });
    if (deletedRowsCount === 0) return res.status(404).json({ message: 'Leader not found' });
    res.json({ message: 'Leader deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createSupervisorSelfSupervised,
  getLeaderById,
  getAllScouts,
  getAccomplishedTasksBySupervisor,
  updateLeader,
  deleteLeader,
  getSuperviseUsers,
  getSupervisedUsers
};
