const { Router } = require('express');
const axios = require('axios');
const {Dog,Temperament} = require('../db');
const concat = require('../tools/concat.js');
const { API_KEY } = process.env;
const toLower = require('../tools/toLower')

// Importar todos los routers;
// Ejemplo: const authRouter = require('./auth.js');


const router = Router();

// Configurar los routers
// Ejemplo: router.use('/auth', authRouter);

//Creacion de las razas-----------------------------------------------------

router.post('/dog', async (req, res, next) => {

    const {name, heightMin, heightMax, weightMin, weightMax, life_span_min, life_span_max, image, temperament} = req.body;

    let height = concat(heightMin,heightMax) 
    let weight = concat(weightMin,weightMax)
    let life_span = concat(life_span_min,life_span_max)
    let nameUpper = toLower(name)

    try {

        let dogyDataBase = await Dog.findOne({where:{name:nameUpper}});
        if(dogyDataBase !== null){
            return  res.status(400).json("The dog breed already exists");
        }
        else{
            const newDog = await Dog.create({     
                name:nameUpper,
                height,
                weight,
                life_span,
                image
            });
    
           let upperTemp = temperament.map(e => e[0].toUpperCase()+e.substring(1))

            for(i=0; i < upperTemp.length; i++){
    
                let temp = await Temperament.findAll({
                    where:{
                        temperament:upperTemp[i]
                    }
                });
        
               await newDog.addTemperament(temp);
            }
        
            res.status(200).json({data:"The new breed was successfully created"});
        }
        
    } catch (error) {
        next(error)
    }
});

//Me traigo todas las razas de perros y tambien filtro por nombre-----------------------------------------

router.get('/home', async(req, res, next) => {

    try {

        let dogAp = (await axios(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)).data;

        let dogApi =  dogAp.filter(e => parseInt(e.weight.metric))
        
        let razas = [];

        for(i=0; i < dogApi.length; i++){
            let raza = {
                id:dogApi[i].id,
                name:dogApi[i].name,
                height:dogApi[i].height.metric,
                weight:dogApi[i].weight.metric ,
                temperament:dogApi[i].temperament,
                lifeSpan:dogApi[i].life_span,
                image:dogApi[i].image.url
            } 
            razas.push(raza)
     }
     let dogiBDNuevo = []
     let dogiBD = await Dog.findAll({include:Temperament});
     for(i=0; i<dogiBD.length; i++){

       let doginho = {
        height:dogiBD[i].height,
        weight:dogiBD[i].weight,
        lifeSpan:dogiBD[i].lifeSpan,
        name:dogiBD[i].name,
        id:dogiBD[i].id,
        image:dogiBD[i].image,
        temperament:dogiBD[i].Temperaments.map(e => e.temperament).join(', ')
     }
      dogiBDNuevo.push(doginho)
    }
     let allRazas = dogiBDNuevo.concat(razas);

     const {name} = req.query;
    
    if(name){
        const namelower = name.toLowerCase();
        const separado = namelower.split(' ')
        const nameDog= separado.map(p => p[0].toUpperCase() + p.substring(1)).join(' ')

        let filtrado = allRazas.filter(e => {

            return e.name.includes(nameDog)
        });
                       
        if(filtrado.length === 0){
            return  res.status(400).send('DOG NOT FOUND')
        }
        
      return  res.status(200).json(filtrado);
    }

    return res.status(200).json(allRazas);

    } catch (error) {

        next(error)
    }
});

//RUTA DE LOS TEMPERAMENTO----------------------------------------------------------------

router.get('/home/temperament', async (req,res,next) => {

try {

    let dogs = (await axios(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)).data;
    let temps = [];
    let aux = '';
    let filtrado = [];

    for(i=0; i < dogs.length; i++){

        if(dogs[i].temperament){

            let arr = {
                temperament: dogs[i].temperament
            }
            
            aux = arr.temperament.split(', ')
            temps.push(aux)
        }     
    }

    temps.forEach(e => {
        e.forEach(t => {
            filtrado.push(t)
        })     
    })
 
    let filtradoEnd = [...new Set(filtrado)];

    filtradoEnd.forEach(async e => {

     await Temperament.findOrCreate({
        where: {temperament: e},
              
          })     
      })
    
    /* LLAMADA A LA BASE DE DATOS PARA TRAER LOS TEMPERAENTOS --------------------------------- */

        let temp = await Temperament.findAll({
            attributes:['id','temperament'],
            order: [['temperament', 'ASC']]
        });
        res.status(200).json(temp)

} catch (error) {
    next(error)
}

})

//Filtrado por ID-------------------------------------------------------

router.get('/home/:id',async (req,res,next) => {

    try {
        
        const {id} = req.params;
        let dogyApi = (await axios(`https://api.thedogapi.com/v1/breeds?api_key=${API_KEY}`)).data;
        let dogFound= {}

        if(id.length < 4){
            dogyApi.forEach(e => {

                if(e.id == id){
                    dogFound = {
                        id: e.id,
                        name:e.name,
                        height:e.height.metric,
                        weight:e.weight.metric,
                        life_span:e.life_span,
                        image:e.image.url,
                        temperament:e.temperament
    
                    }
                }
            })
            res.status(200).json(dogFound)
        }

        if(id.length > 4){

            let dogBD = await Dog.findByPk(id);
            let dogyBD = dogBD.dataValues;
            let temps = await dogBD.getTemperaments();
            let tempes = temps.map(e => e.dataValues.temperament);
            dogyBD.temperament  = tempes.join(', ')
         
            res.status(200).json(dogyBD)
        }
   

} catch (error) {
    next(error)
}

})

router.delete('/home/delete/:id',async (req,res,next) => {

    try {

       const id = req.params.id
       await Dog.destroy({where: {id : id}})

       res.status(200).json({data:'Deleted Successfully'})
    } catch (error) {
        res.status(400).json(error)
    }

})


module.exports = router;
