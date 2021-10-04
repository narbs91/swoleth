const fs = require('fs');
const csv = require('fast-csv');
const swoleth = artifacts.require("Swoleth");

const rinkeby_contract_address = "0x0F811E45dfd3c50fd9f4fdEaE3051f4B89107f5f";

module.exports = async (callback) => {
    async function getSwoleth(network) {
        console.log("------------- Creating instance ------------");

        let instance = await swoleth.at(network);
        
        console.log(`Instance created for contract ${instance.address}`);

        return instance;
    }     

    async function uploadExercises(exercises, network) {
        let exerciseCounter = 0;
        let swolethInstance = await getSwoleth(network);

        exercises.forEach( async (exercise) => {
            console.log("----------------------");
            console.log(`processing exercise ...`);

            const res = await swolethInstance.upsertExercise(exercise.key, exercise.name, exercise.description, exercise.category, exercise.muscleGroup)
            exerciseCounter = exerciseCounter + 1;
            console.log(`exercise #${exerciseCounter} upserted with tx.hash=${res.tx}, status=${res.receipt.status}, exercise=${JSON.stringify(exercise)}`);
        });
    }

    function parseExercisesFromFile() {
        let exercises = [];

        const stream = fs.createReadStream('resources/sample.csv');

        csv.parseStream(stream)
            .on('error', error => console.error(error))
            .on('data', ( (row) => {
                console.log(`Processing Exercise: ${JSON.stringify(row)}`)

                const key = JSON.stringify(row[0]).replace(/"/g, '');
                const category = JSON.stringify(row[1]).replace(/"/g, '');
                const muscleGroup = JSON.stringify(row[2]).replace(/"/g, '');
                const name = JSON.stringify(row[3]).replace(/"/g, '');
                const description = JSON.stringify(row[4]).replace(/"/g, '');

                const exercise = {
                    key: key,
                    name: name,
                    description: description,
                    category: category,
                    muscleGroup: muscleGroup
                }

                exercises.push(exercise);
                
            }))
            .on('end', rowCount => {
                console.log(`CSV processing completed. Parsed ${rowCount} rows`)
            });
        
        return exercises;
    }

    let exercises = parseExercisesFromFile();
    await uploadExercises(exercises, rinkeby_contract_address);
    
    //Callback function needs to be called for the script to properly exit
    //callback();
}
