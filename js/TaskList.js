import { Task } from "./Task.js";
import { ProgressBar } from "./ProgressBar.js";
import { LocalTaskStorage } from "./LocalTaskStorage.js";


class TaskList {


   #taskList = [];
   #progressBar = new ProgressBar();
   #localTaskStorage = new LocalTaskStorage();
   #nextUnassignedTaskId = 1;
   #taskListHtmlContainer = null;


   constructor() {
      this.#taskList = this.#localTaskStorage.load();
      this.#nextUnassignedTaskId = this.#calculateNextUnassignedTaskId();
      this.#taskListHtmlContainer = document.getElementById('task-list-container');
      this.#updateHtmlTaskProgressBar();
      this.#updateHtmlTaskList();
   }


   get hasTask() {
      return this.#taskList.length > 0;
   }


   addNewTask(title, description, priority) {
      const task = new Task({ id: this.#nextUnassignedTaskId++, title, description, priority, done: false });
      this.#taskList.push(task);
      this.#localTaskStorage.save(this.#taskList);
      this.#updateHtmlTaskProgressBar();
      this.#updateHtmlTaskList();
   }


   deleteTask(id) {
      this.#taskList = this.#taskList.filter((task) => task.id !== id);
      this.#localTaskStorage.save(this.#taskList);
      this.#updateHtmlTaskProgressBar();
      this.#updateHtmlTaskList();
      this.#resetNextUnassignedTaskId();
   }


   clear() {
      this.#taskList = [];
      this.#localTaskStorage.save(this.#taskList);
      this.#updateHtmlTaskProgressBar();
      this.#clearHtmlTaskList();
      this.#resetNextUnassignedTaskId();
   }


   #calculateNextUnassignedTaskId() {
      const assignedIdList = this.#taskList.map((task) => task.id);
      assignedIdList.sort((id1, id2) => id2 - id1);
      const maximumAssignedId = assignedIdList[0] ?? 0;
      return maximumAssignedId + 1;
   }


   #resetNextUnassignedTaskId() {
      if (!this.hasTask) {
         this.#nextUnassignedTaskId = 1;
      }
   }


   #updateHtmlTaskList() {
      this.#clearHtmlTaskList();
      
      const deleteFn = (id) => this.deleteTask(id);
      const saveFn = () => {
         this.#localTaskStorage.save(this.#taskList)
         this.#updateHtmlTaskProgressBar();
         this.#updateHtmlTaskList();
      };
      
      this.#sortTaskList();
      for (const task of this.#taskList) {
         const taskHtmlElement = task.generateHtml(saveFn, deleteFn);
         this.#taskListHtmlContainer.appendChild(taskHtmlElement);
      }
   }


   #updateHtmlTaskProgressBar() {
      let completedTasksAmount = 0;
      let openTasksAmount = 0;

      for (const task of this.#taskList) {
         if (task.done) {
            completedTasksAmount++;
         } else {
            openTasksAmount++;
         }
      }

      this.#progressBar.display(completedTasksAmount, openTasksAmount);
   }


   #sortTaskList() {
      const sortedPendingTaskList = this.#getPendingTaskListSortedByDescendingPriority();
      const sortedDoneTaskList = this.#getDoneTaskListSortedByDescendingPriority();
      this.#taskList = sortedPendingTaskList.concat(sortedDoneTaskList);
   }


   #getPendingTaskListSortedByDescendingPriority() {
      const pendingTaskList = this.#taskList.filter((task) => !task.done);
      return pendingTaskList.sort((task1, task2) => task1.priority - task2.priority);
   }


   #getDoneTaskListSortedByDescendingPriority() {
      const doneTaskList = this.#taskList.filter((task) => task.done);
      return doneTaskList.sort((task1, task2) => task1.priority - task2.priority);
   }


   #clearHtmlTaskList() {
      while (this.#taskListHtmlContainer.firstChild) {
         const child = this.#taskListHtmlContainer.firstChild;
         this.#taskListHtmlContainer.removeChild(child);
      }
   }


}


export { TaskList };