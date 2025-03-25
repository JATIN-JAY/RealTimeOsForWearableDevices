let tasks = [
    { name: "Heartbeat Sensor", priority: 1, burstTime: 3, arrivalTime: 0, deadline: 10 },
    { name: "Step Counter", priority: 2, burstTime: 5, arrivalTime: 2, deadline: 15 },
    { name: "Temperature Monitor", priority: 3, burstTime: 7, arrivalTime: 4, deadline: 20 }
];

function priorityScheduling() {
    console.log("🔵 Priority Scheduling");
    let sortedTasks = [...tasks].sort((a, b) => a.priority - b.priority);
    executeTasks(sortedTasks);
}

function roundRobinScheduling(timeQuantum = 2) {
    console.log(`🟢 Round Robin Scheduling (Time Quantum: ${timeQuantum})`);
    let queue = [...tasks.map(task => ({ ...task }))]; // Create a deep copy of tasks
    let time = 0;

    while (queue.length > 0) {
        let task = queue.shift();
        if (task.burstTime > timeQuantum) {
            console.log(`Executing ${task.name} for ${timeQuantum} units`);
            task.burstTime -= timeQuantum;
            queue.push(task);
        } else {
            console.log(`Finished ${task.name} in ${task.burstTime} units`);
        }
        time += timeQuantum;
    }
}

function shortestJobFirst() {
    console.log("🟠 Shortest Job First (SJF)");
    let sortedTasks = [...tasks].sort((a, b) => a.burstTime - b.burstTime);
    executeTasks(sortedTasks);
}

function earliestDeadlineFirst() {
    console.log("🔴 Earliest Deadline First (EDF)");
    let sortedTasks = [...tasks].sort((a, b) => a.deadline - b.deadline);
    executeTasks(sortedTasks);
}

function executeTasks(taskList) {
    let currentTime = 0;
    taskList.forEach(task => {
        console.log(`Executing ${task.name} at time ${currentTime}`);
        currentTime += task.burstTime;
    });
}

// Run different scheduling algorithms
priorityScheduling();
roundRobinScheduling();
shortestJobFirst();
earliestDeadlineFirst();
