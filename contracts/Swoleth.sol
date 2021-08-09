// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
    @dev contract representing an database for exercises meant to be the decentralized source of truth for fitness based dApps
 */
contract Swoleth is Ownable {

    event NewExercise(string muscleGroup, string name);

    // Represents the muscle groups of the human body with corresponding exercies
    struct ExercisesByMuscleGroup {
        // name
        string muscleGroup;
        uint32 exerciseCount;
        mapping (uint=>Exercise) exercies;
    }

    // Respesents a single exercise
    struct Exercise {
        // name, description, category
        string name;
        string description;
        string category;
    }

    // Represents the human body made up of muscle groups
    mapping (string => ExercisesByMuscleGroup) anatomy;
    mapping (string => Exercise) public exercises;

    // Metadata for exercises
    mapping (string => string) public exerciseCategory;
    mapping (string => string) public exerciseMuscleGroup;

    address private _owner;

    constructor() {
        _owner  = msg.sender;

        exerciseCategory["MACHINE"] = "MACHINE";
        exerciseCategory["BARBELL"] = "BARBELL";
        exerciseCategory["DUMBBELL"] = "DUMBBELL";
        exerciseCategory["BODYWEIGHT"] = "BODYWEIGHT";
        exerciseCategory["BANDS"] = "BANDS";
        
        exerciseMuscleGroup["BACK"] = "BACK";
        exerciseMuscleGroup["CHEST"] = "CHEST";
        exerciseMuscleGroup["LEGS"] = "LEGS";
        exerciseMuscleGroup["ARMS"] = "ARMS";
        exerciseMuscleGroup["CORE"] = "CORE";
    }

    /**
        @dev function to add an exercise with a name, description, category and muscle group
     */
    function addExercise(string memory _name, 
                        string memory _description, 
                        string memory _category, 
                        string memory _muscleGroup) public onlyOwner {
        require(keccak256(abi.encodePacked(exercises[_name].name)) != keccak256(abi.encodePacked(_name)));
        require(keccak256(abi.encodePacked(exerciseCategory[_category])) == keccak256(abi.encodePacked(_category)));
        require(keccak256(abi.encodePacked(exerciseMuscleGroup[_muscleGroup])) == keccak256(abi.encodePacked(_muscleGroup)));

        Exercise memory exercise = Exercise(_name, _description, _category);
        exercises[_name] = exercise;

        //addExerciseToMuscleGroup(_muscleGroup, exercise);
        emit NewExercise(_muscleGroup, _name);
    }

    /**
        @dev function to add an exercise to a muscle group
     */
    function addExerciseToMuscleGroup(string memory _muscleGroup, Exercise memory _exercise) private onlyOwner {
        ExercisesByMuscleGroup storage exerciseByMuscleGroup = anatomy[_muscleGroup];
        uint32 exerciseLength = exerciseByMuscleGroup.exerciseCount;

        if (exerciseLength == 0) {
            exerciseByMuscleGroup.exercies[exerciseLength] = _exercise;
        } else {
            exerciseByMuscleGroup.exercies[exerciseLength+1] = _exercise;
        }

        exerciseLength++;
        exerciseByMuscleGroup.exerciseCount = exerciseLength;

        emit NewExercise(_muscleGroup, _exercise.name);
    }

    function getExerciseCategory(string memory _category) public view returns (string memory) {
        return exerciseCategory[_category];
    }

    function getExerciseMuscleGroup(string memory _muscleGroup) public view returns (string memory) {
        return exerciseMuscleGroup[_muscleGroup];
    }

    function getExercise(string memory _name) public view returns (string memory, string memory, string memory) {
        Exercise storage exercise = exercises[_name];
        return (exercise.name, exercise.description, exercise.category);
    }

    function ownerOf() public view returns (address) {
        return _owner;
    }
}