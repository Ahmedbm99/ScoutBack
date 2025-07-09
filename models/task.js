module.exports = (sequelize, DataTypes) => {
    const Task = sequelize.define('Task', {
      id: {
        type:             DataTypes.INTEGER,
        allowNull:        false,
        primaryKey:       true,
        autoIncrement:    true
      },
      
      number:             DataTypes.INTEGER,
      description:              DataTypes.STRING,
      isCompleted:        {
                type:             DataTypes.BOOLEAN,
                defaultValue:     false
            },

      
    })
     Task.associate = function (models) {
      Task.belongsTo(models.Journey)
      Task.belongsToMany(models.Leader, { through: models.UserTask });
    }
    return Task
  }