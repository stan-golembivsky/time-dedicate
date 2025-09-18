import type {ITimeEntry} from "../model.ts";
import type {ITimeEntryItem, ITimeEntryItems} from "./store.ts";

const uuids = new Set<string>();

const generateUUID = (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export const generateUniqueUUID = (): string => {
    const uuid: string = generateUUID();
    if (uuids.has(uuid)) {
        return generateUUID();
    }
    uuids.add(uuid);
    return uuid;
}

export const convertToTimeEntry = (projects: ITimeEntryItems, id: string, withChildren: boolean = false): ITimeEntry | null => {
    const timeEntryItem: ITimeEntryItem = projects[id];
    if (!timeEntryItem) {
        return null;
    }

    const children: ITimeEntry[] = [];

    if (withChildren && timeEntryItem.children) {
        for (const childId of timeEntryItem.children) {
            const child: ITimeEntry | null = convertToTimeEntry(projects, childId, false);
            if (child) {
                children.push(child);
            }
        }
    }

    return {
        id: timeEntryItem.id,
        name: timeEntryItem.name,
        color: timeEntryItem.color,
        percentage: timeEntryItem.percentage,
        children: children
    };
}