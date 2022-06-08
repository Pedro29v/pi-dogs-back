const { DataTypes } = require('sequelize');
const { v4: uuidv4} = require('uuid');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('Dog', {

    id: {
      type: DataTypes.UUID,
      allowNull:false,
      primaryKey:true,
      defaultValue:uuidv4
      
    },

    name:{
      type:DataTypes.STRING,
      unique:true,
      allowNull:false
    },

    height:{
      type:DataTypes.STRING,
      allowNull:false
    },

    weight:{
      type:DataTypes.STRING,
      allowNull:false
    },

    life_span:{
      type:DataTypes.STRING,
    },

    image:{
      type:DataTypes.STRING(100000)
    }

    
  }, {timestamps:false});
};


/* El modelo de la base de datos deberá tener las siguientes entidades (Aquellas propiedades marcadas con asterísco deben ser obligatorias):
[ ] Raza con las siguientes propiedades:
ID *
Nombre *
Altura *
Peso *
Años de vida
[ ] Temperamento con las siguientes propiedades:
ID
Nombre */
