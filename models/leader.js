module.exports = (sequelize, DataTypes) => {
  const Leader = sequelize.define('Leader', {
    id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true,
    },

    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,

    username: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },

    phoneNo: DataTypes.STRING,
    password: DataTypes.STRING,

    progression: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },

    role: {
      type: DataTypes.ENUM('user', 'supervisor', 'consultant'),
      defaultValue: 'user',
    },

    supervisorId: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    isAdmin: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  });

  Leader.associate = function (models) {
    // Un Leader (utilisateur) appartient à un superviseur
    Leader.belongsTo(models.Leader, {
      as: 'Supervisor',
      foreignKey: 'supervisorId',
    });

    // Un superviseur a plusieurs utilisateurs
    Leader.hasMany(models.Leader, {
      as: 'SupervisedUsers',
      foreignKey: 'supervisorId',
    });

    // Un utilisateur peut être lié à une Task
    Leader.belongsToMany(models.Task, { through: models.UserTask });
  };

  return Leader;
};
