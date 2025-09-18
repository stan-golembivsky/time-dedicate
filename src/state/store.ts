import type { ITimeEntry } from '../model.ts';

export interface ITimeEntryItem extends Omit<ITimeEntry, 'children'> {
    children?: string[];
    parentId?: string;
}

export type ITimeEntryItems = { [key: string]: ITimeEntryItem };

const defaultTimeEntries: ITimeEntryItems = {
    root: {
        id: 'root',
        color: '#935656',
        name: 'My Free Time',
        percentage: 100,
        children: ['child1', 'child2', 'child3', 'child4']
    },
    child1: {
        id: 'child1',
        color: '#485d8d',
        name: 'Spanish classes',
        parentId: 'root',
        percentage: 25,
    },
    child2: {
        id: 'child2',
        color: '#633e77',
        name: 'Practice Guitar',
        parentId: 'root',
        percentage: 25,
    },
    child3: {
        id: 'child3',
        color: '#37572b',
        name: 'Workout',
        parentId: 'root',
        percentage: 25,
    },
    child4: {
        id: 'child4',
        color: '#8c792b',
        name: 'Read a book',
        parentId: 'root',
        percentage: 25,
    }
};


export class Store {
    private static instance: Store;

    private timeEntryItems: ITimeEntryItems = defaultTimeEntries;

    public static getInstance(): Store {
        if (!Store.instance) {
            Store.instance = new Store();
        }
        return Store.instance;
    }

    public getProjects(): ITimeEntryItems {
        return this.timeEntryItems;
    }

    public updateProject(id: string, timeEntry: ITimeEntry): void {
        const childrenIs: string[] = [];
        if (timeEntry.children) {
            timeEntry.children.forEach((child) => {
                if (!this.timeEntryItems[child.id]) {
                    this.timeEntryItems[child.id] = { ...child, parentId: id, children: [] };
                } else {
                    this.timeEntryItems[child.id] = {
                        ...this.timeEntryItems[child.id],
                        ...child,
                        parentId: id,
                        children: this.timeEntryItems[child.id].children || []
                    };
                }
                childrenIs.push(child.id);
            });
        }
        this.timeEntryItems[id] = {
            ...timeEntry,
            parentId: this.timeEntryItems[id].parentId,
            children: childrenIs
        };
    }

    public deleteProject(id: string): void {
        const projectToDelete = this.timeEntryItems[id];
        if (projectToDelete) {
            // Remove reference from parent
            if (projectToDelete.parentId) {
                const parent = this.timeEntryItems[projectToDelete.parentId];
                if (parent && parent.children) {
                    parent.children = parent.children.filter(childId => childId !== id);
                }
            }
            // Recursively delete children
            if (projectToDelete.children) {
                projectToDelete.children.forEach(childId => this.deleteProject(childId));
            }
            // Delete the project itself
            delete this.timeEntryItems[id];
        }
    }
}