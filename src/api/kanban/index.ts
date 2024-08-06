import axios from 'axios';
import type { Board, CheckItem, Checklist, Column, Comment, Task } from 'src/types/kanban';
import { createResourceId } from 'src/utils/create-resource-id';
import { deepCopy } from 'src/utils/deep-copy';
import { data } from './data';

// On server get current identity (user) from the request
const user = {
  id: '5e86809283e28b96d2d38537',
  avatar: '/assets/avatars/avatar-anika-visser.png',
  name: 'Anika Visser',
};

type GetBoardRequest = object;
type GetBoardResponse = Promise<Board>;

type CreateColumnRequest = { name: string };
type CreateColumnResponse = Promise<Column>;

type UpdateColumnRequest = { columnId: string; update: { name: string } };
type UpdateColumnResponse = Promise<Column>;

type ClearColumnRequest = { columnId: string };
type ClearColumnResponse = Promise<true>;

type DeleteColumnRequest = { columnId: string };
type DeleteColumnResponse = Promise<true>;

type CreateTaskRequest = { columnId: string; name: string };
type CreateTaskResponse = Promise<Task>;

type UpdateTaskRequest = {
  taskId: string;
  update: {
    name?: string;
    description?: string;
    isSubscribed?: boolean;
    labels?: string[];
  };
};
type UpdateTaskResponse = Promise<Task>;

type MoveTaskRequest = { taskId: string; position: number; columnId?: string };
type MoveTaskResponse = Promise<true>;

type DeleteTaskRequest = { taskId: string };
type DeleteTaskResponse = Promise<true>;

type AddCommentRequest = { taskId: string; message: string };
type AddCommentResponse = Promise<Comment>;

type AddChecklistRequest = { taskId: string; name: string };
type AddChecklistResponse = Promise<Checklist>;

type UpdateChecklistRequest = { taskId: string; checklistId: string; update: { name: string } };
type UpdateChecklistResponse = Promise<Checklist>;

type DeleteChecklistRequest = { taskId: string; checklistId: string };
type DeleteChecklistResponse = Promise<true>;

type AddCheckItemRequest = { taskId: string; checklistId: string; name: string };
type AddCheckItemResponse = Promise<CheckItem>;

type UpdateCheckItemRequest = {
  taskId: string;
  checklistId: string;
  checkItemId: string;
  update: {
    name?: string;
    state?: 'complete' | 'incomplete';
  };
};
type UpdateCheckItemResponse = Promise<CheckItem>;

type DeleteCheckItemRequest = { taskId: string; checklistId: string; checkItemId: string };
type DeleteCheckItemResponse = Promise<true>;

class KanbanApi {
  async getBoard(request: GetBoardRequest = {}): GetBoardResponse {
    const response = await axios.get('https://devo-casa-de-mi-padre.onrender.com/devocionales-list');
    const devotionals = response.data.data.results;

    console.log(devotionals)
    // Transform the devotionals data to match the Board type
    const columns = devotionals.map(devotional => ({
      id: devotional.id,
      name: devotional.titulo,
      taskIds: [devotional.id],  // Here we use the devotional ID for tasks
  }));
  const tasks = devotionals.map(devotional => ({
    id: devotional.id,
    columnId: devotional.id,
    name: devotional.titulo,
    assigneesIds: [

    ],
    attachments: [
        {
            name: "Podcast",
            url: devotional.soundcloud_link || "",
        },
        {
            name: "Video",
            url: devotional.video_link || "",
        }
    ],
    authorId: devotional.fecha,  // Assuming you have the user ID available
    checklists: [],
        comments: [],
    description: 
    devotional.fecha +
    devotional.devocional|| '',
    due: null,
    isSubscribed: false,
    labels: [
        devotional.video_link,
        devotional.soundcloud_link
    ],
}));

    const board: Board = {
      columns,
      tasks,
      members: [],
    };

    return Promise.resolve(deepCopy(board));
  }

  createColumn(request: CreateColumnRequest): CreateColumnResponse {
    const { name } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard = deepCopy(data.board);
        const column: Column = {
          id: createResourceId(),
          name,
          taskIds: [],
        };
        clonedBoard.columns.push(column);
        data.board = clonedBoard;
        resolve(deepCopy(column));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateColumn(request: UpdateColumnRequest): UpdateColumnResponse {
    const { columnId, update } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const column = clonedBoard.columns.find((column) => column.id === columnId);

        if (!column) {
          reject(new Error('Column not found'));
          return;
        }

        Object.assign(column, update);
        data.board = clonedBoard;
        resolve(deepCopy(column));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  clearColumn(request: ClearColumnRequest): ClearColumnResponse {
    const { columnId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const column = clonedBoard.columns.find((column) => column.id === columnId);

        if (!column) {
          reject(new Error('Column not found'));
          return;
        }

        const taskIds = column.taskIds;
        clonedBoard.tasks = clonedBoard.tasks.filter((task) => !taskIds.includes(task.id));
        column.taskIds = [];
        data.board = clonedBoard;

        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteColumn(request: DeleteColumnRequest): DeleteColumnResponse {
    const { columnId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const column = clonedBoard.columns.find((column) => column.id === columnId);

        if (!column) {
          reject(new Error('Column not found'));
          return;
        }

        clonedBoard.tasks = clonedBoard.tasks.filter((task) => task.columnId !== columnId);
        clonedBoard.columns = clonedBoard.columns.filter((column) => column.id !== columnId);
        data.board = clonedBoard;

        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  createTask(request: CreateTaskRequest): CreateTaskResponse {
    const { columnId, name } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const column = clonedBoard.columns.find((column) => column.id === columnId);

        if (!column) {
          reject(new Error('Column not found'));
          return;
        }

        const task: Task = {
          id: createResourceId(),
          assigneesIds: [],
          attachments: [],
          authorId: user.id,
          checklists: [],
          columnId,
          comments: [],
          description: null,
          due: null,
          isSubscribed: false,
          labels: [],
          name,
        };

        clonedBoard.tasks.push(task);
        column.taskIds.push(task.id);
        data.board = clonedBoard;

        resolve(deepCopy(task));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateTask(request: UpdateTaskRequest): UpdateTaskResponse {
    const { taskId, update } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        Object.assign(task, update);
        data.board = clonedBoard;
        resolve(deepCopy(task));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  moveTask(request: MoveTaskRequest): MoveTaskResponse {
    const { taskId, position, columnId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const sourceColumn = clonedBoard.columns.find((column) => column.id === task.columnId);

        if (!sourceColumn) {
          reject(new Error('Column not found'));
          return;
        }

        sourceColumn.taskIds = sourceColumn.taskIds.filter((id) => taskId !== id);

        if (!columnId) {
          sourceColumn.taskIds.splice(position, 0, task.id);
        } else {
          const destinationColumn = clonedBoard.columns.find((column) => column.id === columnId);

          if (!destinationColumn) {
            reject(new Error('Column not found'));
            return;
          }

          destinationColumn.taskIds.splice(position, 0, task.id);
          task.columnId = destinationColumn.id;
        }

        data.board = clonedBoard;
        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteTask(request: DeleteTaskRequest): DeleteTaskResponse {
    const { taskId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        clonedBoard.tasks = clonedBoard.tasks.filter((task) => task.id !== taskId);

        const column = clonedBoard.columns.find((column) => column.id === task.columnId);

        if (column) {
          column.taskIds = column.taskIds.filter((_taskId) => _taskId !== taskId);
        }

        data.board = clonedBoard;
        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  addComment(request: AddCommentRequest): AddCommentResponse {
    const { taskId, message } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const comment = {
          id: createResourceId(),
          authorId: user.id,
          createdAt: new Date().getTime(),
          message,
        };

        task.comments.push(comment);
        data.board = clonedBoard;
        resolve(deepCopy(comment));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  addChecklist(request: AddChecklistRequest): AddChecklistResponse {
    const { taskId, name } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const checklist: Checklist = {
          id: createResourceId(),
          name,
          checkItems: [],
        };

        task.checklists.push(checklist);
        data.board = clonedBoard;
        resolve(deepCopy(checklist));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateChecklist(request: UpdateChecklistRequest): UpdateChecklistResponse {
    const { taskId, checklistId, update } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const checklist = task.checklists.find((checklist) => checklist.id === checklistId);

        if (!checklist) {
          reject(new Error('Checklist not found'));
          return;
        }

        Object.assign(checklist, update);
        data.board = clonedBoard;
        resolve(deepCopy(checklist));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteChecklist(request: DeleteChecklistRequest): DeleteChecklistResponse {
    const { taskId, checklistId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        task.checklists = task.checklists.filter((checklists) => checklists.id !== checklistId);
        data.board = clonedBoard;
        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  addCheckItem(request: AddCheckItemRequest): AddCheckItemResponse {
    const { taskId, checklistId, name } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const checklist = task.checklists.find((checklist) => checklist.id === checklistId);

        if (!checklist) {
          reject(new Error('Checklist not found'));
          return;
        }

        const checkItem: CheckItem = {
          id: createResourceId(),
          name,
          state: 'incomplete',
        };

        checklist.checkItems.push(checkItem);
        data.board = clonedBoard;
        resolve(deepCopy(checkItem));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  updateCheckItem(request: UpdateCheckItemRequest): UpdateCheckItemResponse {
    const { taskId, checklistId, checkItemId, update } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const checklist = task.checklists.find((checklist) => checklist.id === checklistId);

        if (!checklist) {
          reject(new Error('Checklist not found'));
          return;
        }

        const checkItem = checklist.checkItems.find((checkItem) => checkItem.id === checkItemId);

        if (!checkItem) {
          reject(new Error('Check item not found'));
          return;
        }

        Object.assign(checkItem, update);
        data.board = clonedBoard;
        resolve(deepCopy(checkItem));
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }

  deleteCheckItem(request: DeleteCheckItemRequest): DeleteCheckItemResponse {
    const { taskId, checklistId, checkItemId } = request;

    return new Promise((resolve, reject) => {
      try {
        const clonedBoard: Board = deepCopy(data.board);
        const task = clonedBoard.tasks.find((task) => task.id === taskId);

        if (!task) {
          reject(new Error('Task not found'));
          return;
        }

        const checklist = task.checklists.find((checklist) => checklist.id === checklistId);

        if (!checklist) {
          reject(new Error('Checklist not found'));
          return;
        }

        checklist.checkItems = checklist.checkItems.filter(
          (checkItem) => checkItem.id !== checkItemId
        );

        data.board = clonedBoard;
        resolve(true);
      } catch (err) {
        console.error('[Kanban Api]: ', err);
        reject(new Error('Internal server error'));
      }
    });
  }
}

export const kanbanApi = new KanbanApi();
