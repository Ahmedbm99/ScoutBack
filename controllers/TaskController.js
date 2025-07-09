const { Task } = require('../models')
const TaskController = {
    // Créer une nouvelle tâche
    async createTask(req, res) {
        try {
            const task = new Task(req.body);
            await task.save();
            res.status(201).json(task);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Obtenir toutes les tâches
    async getTasks(req, res) {
        try {
            const tasks = await Task.findAll();
            res.json(tasks);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Obtenir une tâche par ID
    async getTaskById(req, res) {
        try {
            const task = await Task.findById(req.params.id);
            if (!task) return res.status(404).json({ error: 'Task not found' });
            res.json(task);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

async updateTask(req, res) {
  try {
    const [updatedRowsCount] = await Task.update(req.body, {
      where: { id: req.params.id }
    });

    if (updatedRowsCount === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    // Optionnel : retourner la tâche mise à jour
    const updatedTask = await Task.findByPk(req.params.id);

    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
},
async submitJustification(req, res){
  const { taskId } = req.params;
  const { comment } = req.body;
  const mediaFile = req.file;

  try {
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ message: 'Tâche non trouvée.' });
    }

    task.justificationComment = comment || null;
    task.justificationMedia = mediaFile ? `/uploads/${mediaFile.filename}` : null;
    task.isCompleted = true;
    await task.save();

    return res.status(200).json({ message: 'Justification soumise avec succès.', task });
  } catch (error) {
    console.error('Erreur de justification :', error);
    return res.status(500).json({ message: 'Erreur lors de la soumission de la justification.' });
  }
},


// Supprimer une tâche avec Sequelize
async deleteTask(req, res) {
  try {
    const taskId = req.params.id;

    // Vérifie si la tâche existe
    const task = await Task.findByPk(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Tâche non trouvée' });
    }

    // Supprimer la tâche
    await task.destroy();

    res.json({ message: 'Tâche supprimée avec succès' });
  } catch (err) {
    console.error('Erreur lors de la suppression de la tâche :', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
}

};

module.exports = TaskController;
