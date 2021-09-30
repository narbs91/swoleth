// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
    @dev contract representing a decentralized database for exercises meant to be the source of truth for fitness based dApps
 */
contract Swoleth is Ownable {

    event ExerciseUpserted(string key, string muscleGroup, string category, string name, string description);
    event ExerciseDeleted(string key);

    // Respesents a single exercise
    struct Exercise {
        string muscleGroup;
        string category;
        string name;
        string description;
        bool isCreated;
    }

    mapping (string => Exercise) public exercises;

    // Metadata for related to exercises
    mapping (string => string) public exerciseCategoryMap;
    mapping (string => string) public exerciseMuscleGroupMap;

    address public _owner;

    constructor() {
        _owner  = msg.sender;

        exerciseCategoryMap["MACHINE"] = "MACHINE";
        exerciseCategoryMap["BARBELL"] = "BARBELL";
        exerciseCategoryMap["DUMBBELL"] = "DUMBBELL";
        exerciseCategoryMap["BODYWEIGHT"] = "BODYWEIGHT";
        exerciseCategoryMap["BANDS"] = "BANDS";
        
        exerciseMuscleGroupMap["BACK"] = "BACK";
        exerciseMuscleGroupMap["CHEST"] = "CHEST";
        exerciseMuscleGroupMap["LEGS"] = "LEGS";
        exerciseMuscleGroupMap["ARMS"] = "ARMS";
        exerciseMuscleGroupMap["SHOULDERS"] = "SHOULDERS";
        exerciseMuscleGroupMap["CORE"] = "CORE";
    }

    /**
        @dev function to add/update an exercise with a name, description, category and muscle group given a _key
     */
    function upsertExercise(
        string memory _key,
        string memory _name, 
        string memory _description, 
        string memory _category, 
        string memory _muscleGroupName
    ) 
        public 
        onlyOwner
    {
        require(bytes(_key).length > 0, "_key is a required field and cannot be empty");
        require(bytes(_name).length > 0, "_name is a required field and cannot be empty");
        require(bytes(_category).length > 0, "_category is a requires field and cannot be empty");
        require(bytes(_muscleGroupName).length > 0, "_muscleGroupName is a required field and cannot be empty");

        require(keccak256(abi.encodePacked(exerciseCategoryMap[_category])) == keccak256(abi.encodePacked(_category)), "_category must match predfined set contained in exerciseCategory");
        require(keccak256(abi.encodePacked(exerciseMuscleGroupMap[_muscleGroupName])) == keccak256(abi.encodePacked(_muscleGroupName)), "_muscleGroupName must match predfined set contained in exerciseMuscleGroup");

        Exercise memory exercise = Exercise(_muscleGroupName, _category, _name, _description, true);
        exercises[_key] = exercise;

        emit ExerciseUpserted(_key, _muscleGroupName, _category, _name, _description);
    }

    /**
        @dev delete the exercise corresponding to _key
     */
    function deleteExercise(string memory _key) public onlyOwner returns (bool) {
        require(exercises[_key].isCreated == true, "Exercise must exist to be deleted");

        delete exercises[_key];

        emit ExerciseDeleted(_key);

        return true;
    }

    /**
        @dev return an exercise corresponding to the _key.  The order of the exercise elements returned is
        muscleGroup, category, name and description
     */
    function getExercise(string memory _key) 
        public 
        view 
        returns (
            string memory,
            string memory, 
            string memory, 
            string memory
        )
    {
        Exercise storage exercise = exercises[_key];
        return (exercise.muscleGroup, exercise.category, exercise.name, exercise.description);
    }

    function ownerOf() public view returns (address) {
        return _owner;
    }
}