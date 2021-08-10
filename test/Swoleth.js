const { assert, expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');

var Swoleth = artifacts.require("./Swoleth.sol");

contract('Swoleth', accounts => {
    let swolethInstance;
    let [alice, bob] = accounts;

    beforeEach(async () => {
      swolethInstance = await Swoleth.new({from: alice});
      //const gasPriceCreateContract = await Swoleth.new.estimateGas();
      //console.log(gasPriceCreateContract);
    })

    context("Fresh contract deployment scenario", async () => {
      it("It should have categories", async () => {
        const machineCategory = await swolethInstance.exerciseCategory.call("MACHINE");
        expect(machineCategory).to.equal("MACHINE", "Categories not properly loaded");
      });


      it("should have muscle groups", async () => {
        const chestMuscleGroup = await swolethInstance.exerciseMuscleGroup.call("CHEST");
        expect(chestMuscleGroup).to.equal("CHEST", "MusclesGroups not properly set");
      });

      it("should have the correct owner", async () => {
        const owner = await swolethInstance.ownerOf.call();
        expect(owner).to.equal(alice);
      })
    })

    context("Creating new exercise and muscle group by owner", async () => {
      it("should insert an exercise and new muscle group", async () => {
        const exercise = {
          name: "Biscep curl",
          description: "Arm exercise",
          category: "DUMBBELL",
          muscleGroup: "ARMS"
        };

        // const gasPriceCreateExercise = await swolethInstance.addExercise.estimateGas(exercise.name, exercise.description, exercise.category, exercise.muscleGroup);
        // console.log(gasPriceCreateExercise);

        await swolethInstance.addExercise(exercise.name, exercise.description, exercise.category, exercise.muscleGroup)
        .then(function(result) {
          expect(result.receipt.status).to.equal(true, "Transaction was not successful");
          expect(result.logs[0].args.muscleGroup).to.equal(exercise.muscleGroup, "Incorrect muscle group was returned");
          expect(result.logs[0].args.category).to.equal(exercise.category, "Incorrect exercise name was returned");
          expect(result.logs[0].args.name).to.equal(exercise.name, "Incorrect exercise name was returned");
        })
      });

      //TODO:  Create multiple exercises for a given musclegroup and make sure they are added properly
    })


    context("Testing bad exercise creations", async () => {

      const badExercise = {
        name: "Biscep curl",
        description: "Arm exercise",
        category: "fake",
        muscleGroup: "fake"
      };

      const goodExercise = {
        name: "Biscep curl",
        description: "Arm exercise",
        category: "DUMBBELL",
        muscleGroup: "ARMS"
      };

      it("should not insert an exercise by non-owner", async () => {
        await expectRevert(swolethInstance.addExercise.call(badExercise.name, badExercise.description, badExercise.category, badExercise.muscleGroup, {from: bob}), "Ownable: caller is not the owner");
      });

      it("should not insert an exercise with a non-existent category", async () => {
        await expectRevert(swolethInstance.addExercise.call(badExercise.name, badExercise.description, badExercise.category, badExercise.muscleGroup), "revert");
      });

      it("should not insert an exercise with a non-existent muscle group", async () => {
        await expectRevert(swolethInstance.addExercise.call(badExercise.name, badExercise.description, badExercise.category, badExercise.muscleGroup), "revert");
      });

      it("should not insert a duplicate exercise", async () => {
        const instance = swolethInstance;
        let exercise;

        await instance.addExercise(goodExercise.name, goodExercise.description, goodExercise.category, goodExercise.muscleGroup);
        exercise = await instance.getExercise(goodExercise.name);
        expect(exercise[0]).to.equal(goodExercise.name, "Exercise name not properly added");
        expect(exercise[1]).to.equal(goodExercise.description, "Exercise description not properly added");
        expect(exercise[2]).to.equal(goodExercise.category, "Exercise category not properly added");

        await expectRevert(instance.addExercise(goodExercise.name, goodExercise.description, goodExercise.category, goodExercise.muscleGroup), "revert");
      });
    })
})