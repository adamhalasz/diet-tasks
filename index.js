/* 
	Tasks.js v0.1
	==========================
	With tasks.js you can schedule events in node.js.  
	
	Notes
	==========================
	- When you create a task it will be saved to the task.json file too so the tasks will be saved even after you restared your node app.
	- Overdue tasks will fire imediately when you start your nodejs app.
	
	Usage
	==========================	
	
	// Initialize
	tasks.init();
	tasks.check();
	
	// CREATE a task
	tasks.create({
		id		 : 'MyTask', 			// A unique name is required
		seconds	 : +5, 					// Run function after 5 seconds
		repeat	 : true, 				// Re-create the task after completion
		function : 'MyTaskFunction' 	// Runs tasks.functions.MyTaskFunction
	});
	
	// Task Functions
	tasks.functions.MyTaskFunction = function(task){
		console.log('Task completed: ', task.id);
	};
	
	// COMPLETE a task by running then deleting it
	tasks.complete('MyTask')
	
	// DELETE a task without running it
	tasks.delete('MyTask');
	
	API: tasks.create
	==========================
	Basic and date parameters are restricted and should never be used to pass data with them.
	- Basic parameters
		- id: A unique identifier for the task (required)
		- repeat: Repeat the task upon completion or not. (false, optional)
		- function: A callback function name that represents a function from tasks.functions like tasks.functions.MyTaskFunction which will be called upon task completion. (required)
	- Date parameters (at least one is required)
		- years
		- months
		- days
		- hours
		- minutes
		- seconds
		- milliseconds
	- Custom parameters
		- Everything else you add is a custom parameter and can be used to pass additional data to the callback function.
	
*/
var file = __dirname+'/tasks.json';
function TaskObject(){}
//for(prop in tasks){ TaskObject.prototype[prop] = tasks[prop]; }

var tasks = TaskObject.prototype;

// ACTIONS
tasks.create = function(options){
	tasks.delete(options.id, function(){
		// CREATE task entry in memory
		//console.log('create task', tasks);
		if(!options.id){ throw new Error('ID was not defined for the task'); return;}
		TaskObject[options.id] = {
			// BASICS
			id			: options.id,
			function	: options.function,
			repeat		: isset(options.repeat) ? options.repeat : false ,
			// ORIGINALS
			options		: options,
			// DATE
			date		: scheduler(
				options.years, options.months , options.days, 
				options.hours, options.minutes, options.seconds,
				options.milliseconds
			)
		};
		//console.log('TASK created: #' + options.id, TaskObject[options.id]);
		tasks.saveToFile(TaskObject[options.id]);
		tasks.schedule(TaskObject[options.id]);
	});
}

tasks.schedule = function(task){
	//console.log('TASKS scheduled #' + task.id, 
	//	'\n\tcurrent date: ' + new Date(), 
	//	'\n\ttask date:' + task.date);
	
	var time = new Date(task.date).getTime() - new Date().getTime();
	//console.log(time);
	task.timeoutID = timeout(function(){ 
		tasks.complete(task);
	}, time);
}
tasks.saveToFile = function(input_task){
	var task = hook(input_task, {});
	delete task.timeoutID;
	// SAVE to File System
	var data = fs.readFileSync(file);
	
	//console.log('TASK save to file('+file+') STARTED: #' + task.id, data);
	var data = JSON.parse(data.toString());
	data[task.id] = task;
	
	//console.log('\n\n::DATA::\n',data,'\n::DATE END::\n\n');
	fs.writeFileSync(file, JSON.stringify(data));
	console.log('TASK save to file ENDED: #' + task.id);
}
tasks.complete = function(task){
	//console.log('TASK completed: #' + task.id);
	//console.log(tasks.functions);
	tasks.functions[task.function](task); 
	if(!task.repeat){
		tasks.delete(task.id);
	} else {
		tasks.create(task.options);
	}
}
tasks.delete = function(id, callback){
	// DELETE task from File System
	fs.readFile(file, function(error, data){
		//console.log('TASK STARTED to delete from file : #' + id);
		var data = JSON.parse(data.toString());
		delete data[id];
		fs.writeFile(file, JSON.stringify(data), function(error){
			if(error) throw error;
			console.log('TASK ENDED to delete from file: #' + id);
			
			// CLEAR timeout
			//console.log('$#$#!$!#$@$@$!@$!@', id);
			if(isset(TaskObject[id])){
				clearTimeout(TaskObject[id].timeoutID);
			}
			
			// DELETE task from memory
			delete TaskObject[id];
			
			if(isset(callback)){ callback(); }
		});
	});
	
	
}

tasks.functions = {};


function scheduler(years, months, days, hours, minutes, seconds, milli){
	var years 			= isset(years) 	 		? years 		: 0 ;
	var months 			= isset(months)	 		? months 		: 0 ;
	var days 			= isset(days) 	 		? days 			: 0 ;
	var hours 			= isset(hours) 			? hours 		: 0 ;
	var minutes  		= isset(minutes) 		? minutes 		: 0 ;
	var seconds  		= isset(seconds) 		? seconds 		: 0 ;
	var milliseconds 	= isset(milliseconds) 	? milliseconds 	: 0 ;
	var now 			= new Date();
	return new Date(
		now.getFullYear() 		+ years, 
		now.getMonth() 	  		+ months, 
		now.getDate() 	  		+ days, 
		now.getHours() 	  		+ hours, 
		now.getMinutes()  		+ minutes, 
		now.getSeconds()  		+ seconds,
		now.getMilliseconds()  	+ milliseconds
	);
}

tasks.check = function(){
	//console.log('{\nTASKS check all tasks', TaskObject);
	for(index in TaskObject){
		var task = TaskObject[index];
		
		if(TaskObject.hasOwnProperty(index)){
			//console.log('@@TASK:::', index, task);
			tasks.schedule(task);
		}
	}
	//console.log('END} \n');
}
tasks.init = function(){
	var data = JSON.parse(fs.readFileSync(__dirname+'/tasks.json').toString());
	for(index in data){ 
		//console.log('$$$$$$$', index, data[index]); 
		TaskObject[index] = data[index]; }
}


// RETURN




/*
Tasks.create({
	id		 : 'john_doe_paypal_subscription', 	// this works
	seconds	 : +5, 								// this probably works
	repeat	 : true, 							// this DOESN'T works
	function : 'paypal_subscribe' 				// this works
});
Tasks.create({
	id		 : 'hello', 						// this works
	seconds	 : +10, 							// this probably works
	repeat	 : true, 							// this DOESN'T works
	function : 'hello_world' 					// this works
});


Tasks.functions.paypal_subscribe = function(task){
	console.log('\n\n@@@@@@@@@@@@@@ task #paypal_subscribe completed', task.id);
};
Tasks.functions.hello_world = function(task){
	console.log('\n\n@@@@@@@@@@@@@@ task #BOOM completed', task.id);
};*/

module.exports = new TaskObject();