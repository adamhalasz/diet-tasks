# Diet: Tasks
With tasks.js you can schedule events in node.js.  

### Install
If you have `dietjs` then it's already installed.
```
npm install diet-tasks
```

### Notes
- When you create a task it will be saved to the task.json file too so the tasks will be saved even after you restared your node app.
- Overdue tasks will fire imediately when you start your nodejs app.

### Usage
```javascript

// Initialize Dietjs App
var app = new Application(options);

// Initialize Tasks
tasks.init();
tasks.check();

// CREATE a task
tasks.create({
	id		 : 'MyTask', 			// A unique name is required
	seconds	 : +5, 					// Run function after 5 seconds
	repeat	 : true, 				// Re-create the task after completion
	function : 'MyTaskFunction' 	// Runs tasks.functions.MyTaskFunction
});
```
### Task Functions
These are callbacks when the task finished.
```javascript
tasks.functions.MyTaskFunction = function(task){
	console.log('Task completed: ', task.id);
};
```
### COMPLETE a task by running then deleting it
```javascript
tasks.complete('MyTask')
```

### DELETE a task without running it
```javascript
tasks.delete('MyTask');
```

### API for `tasks.create`
Basic and date arguments are restricted and should never be used to pass data with them.
- Basic arguments
	- id: A unique identifier for the task (required)
	- repeat: Repeat the task upon completion or not. (false, optional)
	- function: A callback function name that represents a function from tasks.functions like tasks.functions.MyTaskFunction which will be called upon task completion. (required)
- Date arguments (at least one is required)
	- years
	- months
	- days
	- hours
	- minutes
	- seconds
	- milliseconds
- Custom arguments
	- Everything else you add is a custom argument and can be used to pass additional data to the callback function.