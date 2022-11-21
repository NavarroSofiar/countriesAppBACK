const { DataTypes } = require('sequelize');
// Exportamos una funcion que define el modelo
// Luego le injectamos la conexion a sequelize.
module.exports = (sequelize) => {
  // defino el modelo
  sequelize.define('activity', {

  name:{
    type: DataTypes.STRING,
    //unique:true
  },
  difficulty:{
    type: DataTypes.INTEGER,
    validate: {
        min:1, 
        max:5
    }
  },
  duration:{
    type: DataTypes.INTEGER
  },

  season:{
    type: DataTypes.ENUM('Summer', 'Autumn', 'Winter' , 'Spring'),
    
  },
  lugar:{
    type:DataTypes.ENUM('Playa','Montana')
  }

   });
};
