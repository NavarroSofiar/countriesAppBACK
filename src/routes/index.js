const { Router } = require('express');
const { Op } = require('../db');

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');
const axios = require('axios')
const {Country, Activity } = require('../db')


const router = Router();

 
// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

const getApiInfo = async () => {
    const apiUrl = await axios.get( 'https://restcountries.com/v3/all')
    const apiInfo = await apiUrl.data.map(el=>{
     
        return {
            name: el.name.common,
            flag: el.flags[0],
            id: el.cca3,
            continent: el.continents[0],
            capital:el.capital ? el.capital[0] : 'No capital define',
            subregion: el.subregion,
            area: el.area,
            population: el.population,
            
        }
    })
    return apiInfo;
}

const getCountriesDbInfo = async () =>{
    return await Country.findAll({
        attributes: ["flag", "name", "continent","subregion", "capital","id", "population", "area"],
        through: {
            attributes: []
        },  
      include:{
        model: Activity,
        attributes:["name", "difficulty", "duration", "season","lugar"],
        through:{
            attributes:[],
        }
      }
    })
}

router.get('/countries', async(req, res) => {
    
    //Guardo en una constante la info requerida de mi API
    const apiCountries = await getApiInfo()
    try {
        //SI YA TENGO INFO EN MI BD NO HAGO NADA
        let hay = await Country.findAll(); // --> esto me da un arreglo de objetos (lee la tabla completa)
        // SI NO TENGO NADA EN MI DB LOS CREO CON bulkcreate, crea un objeto pais en mi BD por cada objeto de mi api
        if(!hay.length)  await Country.bulkCreate(apiCountries)
        
    } catch (error) {
        console.log(error)
    }
    
    const name = req.query.name
    const dbInfo = await getCountriesDbInfo() 
    if(name){      
     const responseByName = await Country.findAll({
            attributes: ["flag", "name", "continent", "capital","id", "population", "area"],
            through: {
                attributes: []
            },  
            where: {
                name: {
                    [Op.iLike]: `%${name}%`
                }
            }
        })
        responseByName.length? 
       res.json(responseByName) :
       res.status(404) .send('No existe el pais indicado, por favor inserte un nombre válido') 



    }  else {
   
        return res.json(dbInfo)
    }

})

router.get('/countries/:id', async(req, res) => {
   const id = req.params.id 
   const countriesTotal = await getCountriesDbInfo(); 
   if (id) {
    let countriesId = await countriesTotal.filter(el=> el.id == id)
    countriesId.length?
    res.status(200).json(countriesId) :
    res.status(404).send('No se encontró este pais o no existe')
   }


}) 

router.post('/activities', async(req,res) =>{
    const { name, difficulty, duration, season,lugar, countries  } = req.body
    const [newActivity, created] = await Activity.findOrCreate ({
        where: 
        {name},
        defaults: 
        {name,
        difficulty, 
        duration,
        season,
        lugar}
    }) 
  

    console.log(countries);
      
        const countriesIn = await Country.findAll({
          where: { 
           name: countries
          }
        });
        try {
          console.log(countriesIn);
          newActivity.addCountry(countriesIn) 
       
          return res.json(newActivity);
        } catch (error) {
          console.log(error)
        }
      
      
}) 

 router.get('/activities', async(req, res) => {
  try {
    const showActivities = await Activity.findAll({
      include: {
        model: Country,
        attributes: ["name", "id"],
        through: {
            attributes: []
        }
      }
    })
    console.log(showActivities);
    return res.json(showActivities)
  } catch (error) {
    res.status(404).send('No se encontró ninguna actividad')
  }
}) 




module.exports = router; 
