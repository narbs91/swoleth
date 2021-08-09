const { assert, expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');

var Swoleth = artifacts.require("./Swoleth.sol");

contract('Swoleth', accounts => {
    let swolethInstance;
    let [alice, bob] = accounts;

    beforeEach(async () => {
      swolethInstance = await Swoleth.new({from: alice});
    })

    context("Fresh contract deployment scenario", async () => {
      it("It should have categories", async () => {
        const machineCategory = await swolethInstance.getExerciseCategory.call("MACHINE");
        expect(machineCategory).to.equal("MACHINE", "Categories not properly loaded");
      });


      it("should have muscle groups", async () => {
        const chestMuscleGorup = await swolethInstance.getExerciseMuscleGroup.call("CHEST");
        expect(chestMuscleGorup).to.equal("CHEST", "MusclesGroups not properly set");
      });

      it("should have the correct owner", async () => {
        const owner = await swolethInstance.ownerOf.call();
        expect(owner).to.equal(alice);
      })
    })

    context("Creating exercises by owner", async () => {
      it("should insert an exercise", async () => {
        const exercise = {
          name: "Biscep curl",
          description: "Arm exercise",
          category: "DUMBBELL",
          muscleGroup: "ARMS"
        };

        await swolethInstance.addExercise(exercise.name, exercise.description, exercise.category, exercise.muscleGroup)
        .then(function(result) {
          expect(result.receipt.status).to.equal(true, "Transaction was not successful");
          //console.log(result);
          expect(result.logs[0].args.muscleGroup).to.equal(exercise.muscleGroup, "Incorrect muscle group was returned");
          expect(result.logs[0].args.name).to.equal(exercise.name, "Incorrect exercise name was returned");
        })
      });
    })


    context("Testing bad exercise creations", async () => {

      const exercise = {
        name: "Biscep curl",
        description: "Arm exercise",
        category: "fake",
        muscleGroup: "fake"
      };

      it("should not insert an exercise by bob", async () => {
        await expectRevert(swolethInstance.addExercise.call(exercise.name, exercise.description, exercise.category, exercise.muscleGroup, {from: bob}), "Ownable: caller is not the owner");
      });

      it("should not insert an exercise with a non-existent category", async () => {
        await expectRevert(swolethInstance.addExercise.call(exercise.name, exercise.description, exercise.category, exercise.muscleGroup), "revert");
      });

      it("should not insert an exercise with a non-existent muscle group", async () => {
        await expectRevert(swolethInstance.addExercise.call(exercise.name, exercise.description, exercise.category, exercise.muscleGroup), "revert");
      });

      //TODO: how to test a duplicate exercise entry?
    })
})