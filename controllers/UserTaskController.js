const { UserTask, User, Task, Leader } = require('../models');

module.exports = {
  // Récupérer toutes les tâches cochées par un utilisateur
  async getUserTasks(req, res) {
    const userId = req.params.userId;
    try {
      const userTasks = await UserTask.findAll({
        where: { UserId: userId },
        include: [{ model: Task }],
      });
      res.json(userTasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Ajouter une tâche cochée pour un utilisateur et incrémenter progression
  async addUserTask(req, res) {
    const { UserId, TaskId } = req.body;
    try {
      // Vérifier si la relation existe déjà (éviter doublons)
      const exists = await UserTask.findOne({ where: { UserId, TaskId } });
      if (exists) {
        return res.status(400).json({ error: "Tâche déjà cochée" });
      }

      await UserTask.create({ UserId, TaskId });

      // Incrémenter progression utilisateur
      const user = await User.findByPk(UserId);
      if (user) {
        // Logique d'incrémentation (ici +1, à adapter selon ton modèle)
        user.progression = (user.progression ?? 0) + 1;
        await user.save();
      }

      res.status(201).json({ message: "Tâche cochée et progression mise à jour" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Supprimer une tâche cochée et décrémenter progression
  async deleteUserTask(req, res) {
    const { userId, taskId } = req.params;
    try {
      const deletedCount = await UserTask.destroy({
        where: { UserId: userId, TaskId: taskId },
      });
      if (deletedCount === 0) {
        return res.status(404).json({ error: "Association non trouvée" });
      }

      // Décrémenter progression utilisateur
      const user = await User.findByPk(userId);
      if (user) {
        user.progression = Math.max((user.progression ?? 0) - 1, 0);
        await user.save();
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

// Ajouter une tâche cochée à plusieurs utilisateurs
async addUserTaskToMultipleUsers(req, res) {
  const { userIds, TaskId } = req.body; // userIds = array of user IDs
  try {
    if (!Array.isArray(userIds) || !TaskId) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    // Préparer les entrées à créer, en évitant les doublons existants
    const existingUserTasks = await UserTask.findAll({
      where: { LeaderId: userIds, TaskId }
    });

    const existingUserIds = existingUserTasks.map(ut => ut.UserId);

    const toCreate = userIds
      .filter(id => !existingUserIds.includes(id))
      .map(id => ({ LeaderId: id, TaskId }));

    const created = await UserTask.bulkCreate(toCreate);
    for (const id of toCreate.map(u => u.LeaderId)) {
      await Leader.increment('progression', { by: 1, where: { id } });
    }
    res.status(201).json(created);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
},

 async deleteUserTask(req, res) {
    const { leaderId, taskId } = req.params;
    try {
      const deleted = await UserTask.destroy({
        where: { LeaderId: leaderId, TaskId: taskId }
      });

      if (!deleted) {
        return res.status(404).json({ error: "Aucune tâche trouvée" });
      }

      const leader = await Leader.findByPk(leaderId);
      if (leader) {
        leader.progression = Math.max((leader.progression ?? 0) - 1, 0);
        await leader.save();
      }

      res.status(204).send();
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

   async approveTask(req, res) {
    const { userTaskId } = req.params;
    const { approved, note } = req.body; // note ∈ [0, 5]

    try {
      const userTask = await UserTask.findByPk(userTaskId);
      if (!userTask) {
        return res.status(404).json({ error: "UserTask introuvable" });
      }

      userTask.approved = approved;
      if (approved) {
        userTask.note = note;
        const leader = await Leader.findByPk(userTask.LeaderId);
        if (leader) {
          leader.progression = (leader.progression ?? 0) + 1;
          await leader.save();
        }
      }

      await userTask.save();
      res.json({ message: approved ? "Tâche approuvée" : "Tâche refusée" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

    async getPendingTasks(req, res) {
    try {
      const pendingTasks = await UserTask.findAll({
        where: { approved: false },
        include: [{ model: Leader }, { model: Task }],
        attributes: ['id', 'justificationComment', 'justificationMedia', 'note', 'approved', 'LeaderId', 'TaskId']

      });

      res.json(pendingTasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
    // Côté utilisateur : Soumettre une tâche accomplie avec justification
  async submitTask(req, res) {
    const { LeaderId, TaskId, justificationComment, justificationMedia } = req.body;

    try {
      const exists = await UserTask.findOne({ where: { LeaderId, TaskId } });
      if (exists) {
        return res.status(400).json({ error: "Tâche déjà soumise" });
      }

      await UserTask.create({
        LeaderId,
        TaskId,
        justificationComment,
        justificationMedia,
        approved: false, // par défaut en attente
      });

      res.status(201).json({ message: "Tâche soumise avec justification" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
    async getUserTasks(req, res) {
    const leaderId = req.params.leaderId;
    try {
      const tasks = await UserTask.findAll({
        where: { LeaderId: leaderId },
        include: [{ model: Task }]
      });
      res.json(tasks);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },
  async submitTaskWithJustification(req, res) {
    try {
      const { UserId, TaskId, justificationComment } = req.body;
      const justificationMedia = req.file ? req.file.filename : null;

      const newUserTask = await UserTask.create({
        LeaderId: UserId,
        TaskId,
        justificationComment,
        justificationMedia,
        approved: false,
      });

      res.status(201).json(newUserTask);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Erreur serveur lors de la soumission' });
    }
  },
 async approbation (req, res) {
 try {
    const { id } = req.params;
    const { approved, note } = req.body;

    const userTask = await UserTask.findByPk(id);
    if (!userTask) return res.status(404).json({ message: "Tâche non trouvée" });

    userTask.approved = approved;     // true ou false
    userTask.note = note;              // note sur 5
    await userTask.save();

    return res.json({ message: "Tâche mise à jour avec succès", userTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
},
async getUsersProgressions(req, res) {
  const userIds = req.params.ids?.split(',').map(Number);

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({ error: "userIds manquants" });
  }

  try {
    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        const user = await Leader.findByPk(userId);
        if (!user) return null;

        // Total tâches disponibles (global)
        const totalTasks = await Task.count();

        // Tâches accomplies ET approuvées par cet utilisateur
        const userTasks = await UserTask.findAll({
          where: { LeaderId: userId, approved: true },
          include: [{ model: Task }]
        });
const totalNote = userTasks.reduce((acc, ut) => acc + (ut.note ?? 0), 0);
const maxNote = 9 * 5; // 9 tâches max * note max 5
const progression = totalNote / maxNote;

 

        return {
          id: user.id,
          username: user.username,
          progression: progression.toFixed(1),
          completedTasks: userTasks.map(ut => ({
            id: ut.Task.id,
            description: ut.Task.description,
            
          }))
        };
      })
    );

    res.json(usersData.filter(u => u !== null));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

};
