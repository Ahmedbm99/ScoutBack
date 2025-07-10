const { UserTask, User, Task, Leader } = require('../models');

module.exports = {
  // Récupérer toutes les tâches cochées (soumis/approuvées) par un leader/utilisateur
  async getUserTasks(req, res) {
    const leaderId = req.params.leaderId || req.params.userId;
    if (!leaderId) return res.status(400).json({ error: "ID utilisateur manquant" });

    try {
      const userTasks = await UserTask.findAll({
        where: { LeaderId: leaderId },
        include: [{ model: Task }],
        order: [['createdAt', 'DESC']],
      });
      res.json(userTasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Ajouter une tâche cochée pour un utilisateur + incrémenter progression
  async addUserTask(req, res) {
    const { LeaderId, TaskId } = req.body;
    if (!LeaderId || !TaskId) return res.status(400).json({ error: "Paramètres manquants" });

    try {
      const exists = await UserTask.findOne({ where: { LeaderId, TaskId } });
      if (exists) {
        return res.status(400).json({ error: "Tâche déjà cochée" });
      }

      await UserTask.create({ LeaderId, TaskId, approved: false });

      // Incrémenter progression utilisateur (optionnel ici selon ta logique)
      const leader = await Leader.findByPk(LeaderId);
      if (leader) {
        leader.progression = (leader.progression ?? 0) + 1;
        await leader.save();
      }

      res.status(201).json({ message: "Tâche cochée et progression mise à jour" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Supprimer une tâche cochée + décrémenter progression
  async deleteUserTask(req, res) {
    const { leaderId, taskId } = req.params;
    if (!leaderId || !taskId) return res.status(400).json({ error: "Paramètres manquants" });

    try {
      const deleted = await UserTask.destroy({ where: { LeaderId: leaderId, TaskId: taskId } });
      if (!deleted) return res.status(404).json({ error: "Tâche non trouvée" });

      const leader = await Leader.findByPk(leaderId);
      if (leader) {
        leader.progression = Math.max((leader.progression ?? 0) - 1, 0);
        await leader.save();
      }

      res.status(204).send();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Ajouter une tâche cochée à plusieurs utilisateurs (bulk)
  async addUserTaskToMultipleUsers(req, res) {
    const { userIds, TaskId } = req.body;
    if (!Array.isArray(userIds) || !TaskId) {
      return res.status(400).json({ error: "Paramètres invalides" });
    }

    try {
      // Trouver les UserTasks existants pour éviter doublons
      const existingUserTasks = await UserTask.findAll({
        where: { LeaderId: userIds, TaskId }
      });
      const existingUserIds = existingUserTasks.map(ut => ut.LeaderId);

      const toCreate = userIds
        .filter(id => !existingUserIds.includes(id))
        .map(id => ({ LeaderId: id, TaskId, approved: false }));

      const created = await UserTask.bulkCreate(toCreate);

      // Incrémenter la progression des leaders concernés
      for (const id of toCreate.map(u => u.LeaderId)) {
        await Leader.increment('progression', { by: 1, where: { id } });
      }

      res.status(201).json(created);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Approuver ou refuser une tâche avec note
  async approbation (req, res) {
 try {
    const { id } = req.params;
    const { approved, note } = req.body;

    const userTask = await UserTask.findByPk(id);
    if (!userTask) return res.status(404).json({ message: "Tâche non trouvée" });

    userTask.approved = approved;     // true ou false
    userTask.note = note;   
   
    const leader = await Leader.findByPk(userTask.LeaderId);
        if (leader) {
          leader.progression = (leader.progression ?? 0) + note;
          await leader.save();
        }
    await userTask.save();

    return res.json({ message: "Tâche mise à jour avec succès", userTask });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
},

  // Récupérer les tâches en attente d'approbation
  async getPendingTasks(req, res) {
    try {
      const pendingTasks = await UserTask.findAll({
        where: { approved: false },
        include: [{ model: Leader }, { model: Task }],
        attributes: ['id', 'justificationComment', 'justificationMedia', 'note', 'approved', 'LeaderId', 'TaskId']
      });
      res.json(pendingTasks);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Erreur serveur" });
    }
  },

  // Soumettre une tâche accomplie avec justification
  async submitTaskWithJustification(req, res) {
    try {
      const { LeaderId, TaskId, justificationComment } = req.body;
      const justificationMedia = req.file ? req.file.filename : null;

      const exists = await UserTask.findOne({ where: { LeaderId, TaskId } });
      if (exists) {
        return res.status(400).json({ error: "Tâche déjà soumise" });
      }

      const newUserTask = await UserTask.create({
        LeaderId,
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

 async getUsersProgressions(req, res) {
  const userIds = req.params.ids?.split(',').map(Number);

  if (!userIds || userIds.length === 0) {
    return res.status(400).json({ error: "userIds manquants" });
  }

  try {
    const usersData = await Promise.all(
      userIds.map(async (userId) => {
        // Récupérer l'utilisateur avec son superviseur inclus
        const user = await Leader.findByPk(userId, {
          include: [{ model: Leader, as: 'Supervisor', attributes: ['username'] }]
        });
        if (!user) return null;

        // Récupérer les tâches accomplies et approuvées par cet utilisateur
        const userTasks = await UserTask.findAll({
          where: { LeaderId: userId, approved: true },
          include: [{ model: Task, attributes: ['id', 'description'] }],
        });

        // Somme des notes (progression)
        const progression = userTasks.reduce((sum, ut) => sum + (ut.note ?? 0), 0);

        return {
          id: user.id,
          username: user.username,
          supervisorUsername: user.Supervisor ? user.Supervisor.username : null,
          progression,
          completedTasks: userTasks.map(ut => ({
            id: ut.Task.id,
            description: ut.Task.description,
            note: ut.note ?? 0,
            justificationComment: ut.justificationComment || '',
          })),
        };
      })
    );

    res.json(usersData.filter(u => u !== null));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
},



  async  getUserDoneTasks(req, res) {
  const leaderId = req.params.leaderId;
  try {
    const doneTasks = await UserTask.findAll({
      where: {
        LeaderId: leaderId,
        approved: true  // uniquement tâches approuvées / faites
      },
      attributes: ['id', 'note', 'approved','justificationComment' , 'justificationMedia'],
      include: [{
        model: Task,
        attributes: ['id', 'description', 'number']
      },
     {
          model: Leader, // inclure l'utilisateur/leader
          attributes: ['id', 'username', 'supervisorId', 'progression'] // ajoute supervisorId ici
        }
    ],
  
    });

    res.json(doneTasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erreur serveur" });
  }
}

};
