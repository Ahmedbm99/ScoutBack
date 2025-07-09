module.exports = (sequelize, DataTypes) => {
    const Journey = sequelize.define('Journey', {
      id: {
        type:             DataTypes.INTEGER,
        allowNull:        false,
        primaryKey:       true,
        autoIncrement:    true
      },
      
      number:             DataTypes.INTEGER,
      tasksNumber:      DataTypes.INTEGER,
      theme:              DataTypes.STRING,
      date:              DataTypes.DATE,
    })
    Journey.associate = function (models) {
  Journey.hasMany(models.Task)
}
    return Journey
  }