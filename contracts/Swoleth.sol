// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
    @dev contract representing an database for exercises meant to be the decentralized source of truth for fitness based dApps
 */
contract Swoleth is Ownable {

    event NewExerciseAdded(string muscleGroup, string category, string name, string description);

    // Respesents a single exercise
    struct Exercise {
        string muscleGroup;
        string category;
        string name;
        string description;
    }

    mapping (string => Exercise) public exercises;

    // Metadata for exercises
    mapping (string => string) public exerciseCategory;
    mapping (string => string) public exerciseMuscleGroup;

    address public _owner;

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
        exerciseMuscleGroup["SHOULDERS"] = "SHOULDERS";
        exerciseMuscleGroup["CORE"] = "CORE";
    }

    /**
        @dev function to add an exercise with a name, description, category and muscle group
     */
    function addExercise(string memory _name, 
                        string memory _description, 
                        string memory _category, 
                        string memory _muscleGroupName) public onlyOwner {
        require(keccak256(abi.encodePacked(exercises[_name].name)) != keccak256(abi.encodePacked(_name)));
        require(keccak256(abi.encodePacked(exerciseCategory[_category])) == keccak256(abi.encodePacked(_category)));
        require(keccak256(abi.encodePacked(exerciseMuscleGroup[_muscleGroupName])) == keccak256(abi.encodePacked(_muscleGroupName)));

        Exercise memory exercise = Exercise(_muscleGroupName, _category, _name, _description);
        exercises[_name] = exercise;

        emit NewExerciseAdded(_muscleGroupName, _category, _name, _description);
    }

    function getExercise(string memory _name) public view returns (string memory, string memory, string memory, string memory) {
        Exercise storage exercise = exercises[_name];
        return (exercise.muscleGroup, exercise.category, exercise.name, exercise.description);
    }

    function ownerOf() public view returns (address) {
        return _owner;
    }
}