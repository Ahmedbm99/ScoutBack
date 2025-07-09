
module.exports = (sequelize, DataTypes) => {
  const UserTask = sequelize.define('UserTask', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    LeaderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    TaskId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
      approved: {
      type:             DataTypes.BOOLEAN,
      defaultValue:     false
    },
    justificationComment: {
      type:             DataTypes.TEXT, 
      allowNull:        true
    },
    justificationMedia: {
      type:             DataTypes.STRING,
      allowNull:        true
    },
    note: {
  type: DataTypes.INTEGER,
  validate: {
    min: 0,
    max: 2
  },
    },

  },{ 
    
      timestamps: false, 
    }
  );

  UserTask.associate = function(models) {
    UserTask.belongsTo(models.Leader, { foreignKey: 'LeaderId' });
    UserTask.belongsTo(models.Task, { foreignKey: 'TaskId' });
  };

  return UserTask;
};
