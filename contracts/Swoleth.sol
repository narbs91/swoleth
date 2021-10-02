// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
    @dev A smart contract to represent a decentralized database of exercises for fitness dApps to use as a datasource
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

    constructor() {

        exerciseCategoryMap["MACHINE"] = "MACHINE";
        exerciseCategoryMap["BARBELL"] = "BARBELL";
        exerciseCategoryMap["DUMBBELL"] = "DUMBBELL";
        exerciseCategoryMap["BODYWEIGHT"] = "BODYWEIGHT";
        exerciseCategoryMap["BANDS"] = "BANDS";
        exerciseCategoryMap["CARDIO"] = "CARDIO";
        exerciseCategoryMap["TIMED"] = "TIMED";
        exerciseCategoryMap["OTHER"] = "OTHER";
        
        exerciseMuscleGroupMap["BACK"] = "BACK";
        exerciseMuscleGroupMap["CHEST"] = "CHEST";
        exerciseMuscleGroupMap["LEGS"] = "LEGS";
        exerciseMuscleGroupMap["ARMS"] = "ARMS";
        exerciseMuscleGroupMap["SHOULDERS"] = "SHOULDERS";
        exerciseMuscleGroupMap["CORE"] = "CORE";
    }

    /**
        @dev Add/update an exercise with a name, description, category and muscle group given a _key.  A update in this scenario is a full replace.

        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
        _name: The Name of the exercise, i.e. Biscep Curl
        _description: The description of how to preform the exercise
        _category: The category of exercise which corresponds to the what will be used to preform it, i.e DUMBBELL
        _muscleGroupName: The name of the main muscle group the exercise targets, i.e CHEST
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
        @dev Delete the exercise corresponding to _key

        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
     */
    function deleteExercise(string memory _key) public onlyOwner returns (bool) {
        require(exercises[_key].isCreated == true, "Exercise must exist to be deleted");

        delete exercises[_key];

        emit ExerciseDeleted(_key);

        return true;
    }

    /**
        @dev Return the core components of an exercise corresponding to the _key.  The order of the exercise elements returned is
        muscleGroup, category, name and description
        
        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
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

    /**
        @dev Return the name of an exercise corresponding to the _key.
        
        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
     */
    function getExerciseName(string memory _key) public view returns (string memory)
    {
        Exercise storage exercise = exercises[_key];
        return exercise.name;
    }

    /**
        @dev Return the description of how to prefrom an exercise corresponding to the _key

        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
     */
    function getExerciseDescription(string memory _key) public view returns (string memory)
    {
        Exercise storage exercise = exercises[_key];
        return exercise.description;
    }

    /**
        @dev Return the targeted muscle group of an exercise corresponding to the _key.

        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
     */
    function getExerciseMuscleGroup(string memory _key) public view returns (string memory)
    {
        Exercise storage exercise = exercises[_key];
        return exercise.muscleGroup;
    }

    /**
        @dev Return the category of an exercise corresponding to the _key.

        @param
        _key: The index to the exercise.  All _key's are of the format {Exercise name}-{Category} in lowercase, i.e bicep-curl-dumbbell or flat-bench-barbell
     */
    function getExerciseCategory(string memory _key) public view returns (string memory)
    {
        Exercise storage exercise = exercises[_key];
        return exercise.category;
    }
}