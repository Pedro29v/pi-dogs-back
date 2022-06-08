const { DataTypes } = require('sequelize');
const { v4: uuidv4 } = require('uuid');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Temperament', {

    id: {
      type: DataTypes.UUID,
      allowNull:false,
      primaryKey:true,
      defaultValue:uuidv4
    },

    temperament:{
      type:DataTypes.STRING,
      unique:true,
      allowNull: false
    },
    
  }, {timestamps:false});
};
