const { expect } = require("chai");
const { expectRevert } = require('@openzeppelin/test-helpers');

var Swoleth = artifacts.require("./Swoleth.sol");

contract('Swoleth', accounts => {
    const ExerciseUpsertedEvent = "ExerciseUpserted";
    const ExerciseDeletedEvent = "ExerciseDeleted";

    let swolethInstance;
    let [alice, bob] = accounts;

    beforeEach(async () => {
      swolethInstance = await Swoleth.new({from: alice});
    })

    context("Fresh contract deployment scenario", async () => {
      it("It should have categories", async () => {
        const machineCategory = await swolethInstance.exerciseCategoryMap.call("MACHINE");
        expect(machineCategory).to.equal("MACHINE", "Categories not properly loaded");
      });


      it("should have muscle groups", async () => {
        const chestMuscleGroup = await swolethInstance.exerciseMuscleGroupMap.call("CHEST");
        expect(chestMuscleGroup).to.equal("CHEST", "MusclesGroups not properly set");
      });

      it("should have the correct owner", async () => {
        const owner = await swolethInstance.owner();
        expect(owner).to.equal(alice);
      })
    })

    context("Creating new exercise and muscle group by owner", async () => {
      it("should insert an exercise and new muscle group", async () => {
        const exercise = {
          name: "Bicep curl",
          description: "Arm exercise",
          category: "DUMBBELL",
          muscleGroup: "ARMS"
        };

        const key = "bicep-curl-dumbbell";

        let result = await swolethInstance.upsertExercise(key, exercise.name, exercise.description, exercise.category, exercise.muscleGroup);

        let exerciseName = await swolethInstance.getExerciseName(key);
        let exerciseDescription = await swolethInstance.getExerciseDescription(key);
        let exerciseMuscleGroup = await swolethInstance.getExerciseMuscleGroup(key);
        let exerciseCategory = await swolethInstance.getExerciseCategory(key);
        
        // Test add call response
        expect(result.receipt.status).to.equal(true, "Transaction was not successful");
        expect(result.logs[0].args.key).to.equal(key, "Incorrect exercise key was returned");
        expect(result.logs[0].args.muscleGroup).to.equal(exercise.muscleGroup, "Incorrect muscle group was returned");
        expect(result.logs[0].args.category).to.equal(exercise.category, "Incorrect exercise name was returned");
        expect(result.logs[0].args.name).to.equal(exercise.name, "Incorrect exercise name was returned");
        expect(result.logs[0].args.description).to.equal(exercise.description, "Incorrect exercise description was returned");

        // Test fetching individual components of an exercise
        expect(exerciseMuscleGroup).to.equal(exercise.muscleGroup, "Incorrect muscle group was returned");
        expect(exerciseCategory).to.equal(exercise.category, "Incorrect exercise name was returned");
        expect(exerciseName).to.equal(exercise.name, "Incorrect exercise name was returned");
        expect(exerciseDescription).to.equal(exercise.description, "Incorrect exercise description was returned");

      });

      it("Creates multiple exercises for a single muscleGroup", async () => {
        const CHEST = "CHEST";
        const instance = swolethInstance;

        let exercise1, exercise2;
        let result1, result2;

        const flatBenchPress = {
          name: "Bench press(flat)",
          description: "Flat dumbbell bench press",
          category: "DUMBBELL",
          muscleGroup: CHEST
        };

        const inclineBenchPress = {
          name: "Bench press(incline)",
          description: "Incline dumbbell bench press",
          category: "DUMBBELL",
          muscleGroup: CHEST
        };

        const flatBenchKey = "flat-bench-DUMBBELL";
        const inclineBenchKey = "incline-bench-DUMBBELL";

        result1 = await instance.upsertExercise(flatBenchKey, flatBenchPress.name, flatBenchPress.description, flatBenchPress.category, flatBenchPress.muscleGroup);
        expect(result1.logs[0].event).to.equal(ExerciseUpsertedEvent, "Incorrect event emitted for upsert event");
        exercise1 = await instance.getExercise(flatBenchKey);

        result2 = await instance.upsertExercise(inclineBenchKey, inclineBenchPress.name, inclineBenchPress.description, inclineBenchPress.category, inclineBenchPress.muscleGroup);
        expect(result2.logs[0].event).to.equal(ExerciseUpsertedEvent, "Incorrect event emitted for upsert event");
        exercise2 = await instance.getExercise(inclineBenchKey);

        // Test individual exercises were added correctly
        expect(exercise1[0]).to.equal(flatBenchPress.muscleGroup, "Exercise musclegroup not properly added");
        expect(exercise1[1]).to.equal(flatBenchPress.category, "Exercise category not properly added");
        expect(exercise1[2]).to.equal(flatBenchPress.name, "Exercise name not properly added");
        expect(exercise1[3]).to.equal(flatBenchPress.description, "Exercise description not properly added");
        
        expect(exercise2[0]).to.equal(inclineBenchPress.muscleGroup, "Exercise musclegroup not properly added");
        expect(exercise2[1]).to.equal(inclineBenchPress.category, "Exercise category not properly added");
        expect(exercise2[2]).to.equal(inclineBenchPress.name, "Exercise name not properly added");
        expect(exercise2[3]).to.equal(inclineBenchPress.description, "Exercise description not properly added");
      });


      it("Creates multiple exercises for a different muscleGroup", async () => {
        const CHEST = "CHEST";
        const BACK = "BACK";
        const instance = swolethInstance;

        let exercise1, exercise2;
        let result1, result2;

        const flatBenchPress = {
          name: "Bench press(flat)",
          description: "Flat dumbbell bench press",
          category: "DUMBBELL",
          muscleGroup: CHEST
        };

        const deadlift = {
          name: "deadlift",
          description: "Conventional deadlift",
          category: "BARBELL",
          muscleGroup: BACK
        };

        const flatBenchKey = "flat-bench-dumbbell";
        const deadliftKey = "deadlift-barbell";

        result1 = await instance.upsertExercise(flatBenchKey, flatBenchPress.name, flatBenchPress.description, flatBenchPress.category, flatBenchPress.muscleGroup);
        expect(result1.logs[0].event).to.equal(ExerciseUpsertedEvent, "Incorrect event emitted for upsert event");
        exercise1 = await instance.getExercise(flatBenchKey);

        result2 = await instance.upsertExercise(deadliftKey, deadlift.name, deadlift.description, deadlift.category, deadlift.muscleGroup);
        expect(result2.logs[0].event).to.equal(ExerciseUpsertedEvent, "Incorrect event emitted for upsert event");
        exercise2 = await instance.getExercise(deadliftKey);

        // Test individual exercises were added correctly
        expect(exercise1[0]).to.equal(flatBenchPress.muscleGroup, "Exercise musclegroup not properly added");
        expect(exercise1[1]).to.equal(flatBenchPress.category, "Exercise category not properly added");
        expect(exercise1[2]).to.equal(flatBenchPress.name, "Exercise name not properly added");
        expect(exercise1[3]).to.equal(flatBenchPress.description, "Exercise description not properly added");

        expect(exercise2[0]).to.equal(deadlift.muscleGroup, "Exercise musclegroup not properly added");
        expect(exercise2[1]).to.equal(deadlift.category, "Exercise category not properly added");
        expect(exercise2[2]).to.equal(deadlift.name, "Exercise name not properly added");
        expect(exercise2[3]).to.equal(deadlift.description, "Exercise description not properly added");
      });
    })


    context("Testing updating an exercise", async () => {

      const flatBenchPressVersion1 = {
        name: "Bench press(flat)",
        description: "Flat dumbbell bench press",
        category: "DUMBBELL",
        muscleGroup: "CHEST"
      };

      const flatBenchPressVersion2 = {
        name: "Bench press(flat)",
        description: "Flat dumbbell bench press updated",
        category: "DUMBBELL",
        muscleGroup: "CHEST"
      };

      const flatBenchKey = "flat-bench-dumbbell";

      it("should update an exercise", async () => {
        const instance = swolethInstance;
        let exercise;

        await instance.upsertExercise(flatBenchKey, flatBenchPressVersion1.name, flatBenchPressVersion1.description, flatBenchPressVersion1.category, flatBenchPressVersion1.muscleGroup);
        await instance.upsertExercise(flatBenchKey, flatBenchPressVersion2.name, flatBenchPressVersion2.description, flatBenchPressVersion2.category, flatBenchPressVersion2.muscleGroup);
        
        exercise = await instance.getExercise(flatBenchKey);
        expect(exercise[0]).to.equal(flatBenchPressVersion2.muscleGroup, "Exercise musclegroup not properly updated");
        expect(exercise[1]).to.equal(flatBenchPressVersion2.category, "Exercise category not properly updated");
        expect(exercise[2]).to.equal(flatBenchPressVersion2.name, "Exercise name not properly updated");
        expect(exercise[3]).to.equal(flatBenchPressVersion2.description, "Exercise description not properly updated");
      });
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

      const goodExerciseKey = "good-exercise-key";
      const badExerciseKey = "bad-exercise-key";

      it("should not insert an exercise by non-owner", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(badExerciseKey, badExercise.name, badExercise.description, badExercise.category, badExercise.muscleGroup, {from: bob}), "Ownable: caller is not the owner");
      });

      it("should not insert an exercise when name is empty string", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(goodExerciseKey, "", goodExercise.description, goodExercise.category, goodExercise.muscleGroup), "revert");
      });

      it("should not insert an exercise when category is empty string", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(goodExerciseKey, goodExercise.name, goodExercise.description, "", goodExercise.muscleGroup), "revert");
      });

      it("should not insert an exercise when musclegroup is empty string", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(goodExerciseKey, goodExercise.name, goodExercise.description, goodExercise.category, ""), "revert");
      });

      it("should not insert an exercise with a non-existent category", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(badExerciseKey, badExercise.name, badExercise.description, badExercise.category, "ARMS"), "revert");
      });

      it("should not insert an exercise with a non-existent muscle group", async () => {
        await expectRevert(swolethInstance.upsertExercise.call(badExerciseKey, badExercise.name, badExercise.description, "MACHINE", badExercise.muscleGroup), "revert");
      });
    })

    context("Testing exercise deletion", async () => {
      const squat = {
        name: "Squat",
        description: "Barbell squat",
        category: "BARBELL",
        muscleGroup: "BACK"
      }

      const squatKey = "squat-barbell"

      it("deletes an exercise", async () => {
        const instance = swolethInstance;

        await instance.upsertExercise(squatKey, squat.name, squat.description, squat.category, squat.muscleGroup);

        const result = await instance.deleteExercise(squatKey);

        expect(result.receipt.status).to.equal(true, "Exercise was not deleted");
        expect(result.logs[0].event).to.equal(ExerciseDeletedEvent, "Incorrect event emitted after exercise was deleted");
        expect(result.logs[0].args[0]).to.equal(squatKey, "Incorrect exercise key was emitted after deletion");

        await expectRevert(swolethInstance.deleteExercise(squatKey), "revert");
      });

      it("doesn't delete an exercise that doesn't exist", async () => {
        await expectRevert(swolethInstance.deleteExercise(squatKey), "revert");
      });
    })
})