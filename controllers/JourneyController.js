const { Journey } = require('../models')


const JourneyController = {
    // Get all journeys
    getAllJourneys: async (req, res) => {
        try {
            const journeys = await Journey.findAll();
            res.json(journeys);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Get journey by ID
    getJourneyById: async (req, res) => {
        try {
            const journey = await Journey.findByPk(req.params.id); // Si Sequelize
            if (!journey) {
                return res.status(404).json({ error: 'Journey not found' });
            }
            res.json(journey);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Create a new journey (admin only)
    createJourney: async (req, res) => {
        try {
            const newJourney = await Journey.create(req.body);
            res.status(201).json(newJourney);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Update a journey (admin only)
    updateJourney: async (req, res) => {
        try {
            const [updated] = await Journey.update(req.body, {
                where: { id: req.params.id }
            });

            if (!updated) {
                return res.status(404).json({ error: 'Journey not found' });
            }

            const updatedJourney = await Journey.findByPk(req.params.id);
            res.json(updatedJourney);
        } catch (err) {
            res.status(400).json({ error: err.message });
        }
    },

    // Delete a journey (admin only)
    deleteJourney: async (req, res) => {
        try {
            const deleted = await Journey.destroy({
                where: { id: req.params.id }
            });

            if (!deleted) {
                return res.status(404).json({ error: 'Journey not found' });
            }

            res.json({ message: 'Journey deleted successfully' });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },

    // Update user task status (admin only)
    updateUserTaskStatus: async (req, res) => {
        try {
            const { journeyId, taskIndex, userId, done } = req.body;

            const result = await journeyService.updateUserTaskStatus(journeyId, taskIndex, userId, done);
            if (!result) {
                return res.status(404).json({ error: 'Journey or task not found' });
            }

            res.json({
                message: 'Task status updated successfully',
                data: result
            });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
};

module.exports = JourneyController;
