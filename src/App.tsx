import { useState } from 'react';

import { PlusOutlined, RollbackOutlined } from '@ant-design/icons';
import { Slider, ConfigProvider, theme, Button, Select, Input } from 'antd';
import { type ITimeEntry, type TimeUnit, unitsInAUnit } from './model.ts';

import TimeEntry from './components/TimeEntry/TimeEntry.tsx';
import EditableText from './components/EditableText/EditableText.tsx';

import './App.css';

import {type ITimeEntryItems, Store} from './state/store.ts';
import {convertToTimeEntry, generateUniqueUUID} from './state/state.util.ts';
const store = Store.getInstance();

function App() {

    const projects: ITimeEntryItems = store.getProjects();

    const initialTimeEntry: ITimeEntry = convertToTimeEntry(projects, 'root', true) as ITimeEntry;
    const [timeEntry, setTimeEntry] = useState(initialTimeEntry);
    const [total, setTotal] = useState(10);
    const [timeUnits, setTimeUnits] = useState('hour');
    const [perTimeUnit, setPerTimeUnit] = useState('week');
    const [
        parentId,
        setParentId
    ] = useState(projects[initialTimeEntry.id].parentId || null);

    let percentSum = 0;

    const gradientBg = (timeEntries: ITimeEntry[] | null): string => {
        if (timeEntries == null || timeEntries.length === 0) {
            return `${timeEntry.color} 0%, ${timeEntry.color} 100%`;
        }
        let accum = 0;
        return timeEntries.map((entry: ITimeEntry, index: number) => {
            const color = entry.color;

            let leftPercentage = 0;
            if (index > 0) {
                leftPercentage = accum;
            }

            let rightPercentage = 100;
            const actualChildren: ITimeEntry[] = timeEntry.children || [];
            if (actualChildren && index < actualChildren.length - 1) {
                rightPercentage = accum + entry.percentage;
            }

            accum += entry.percentage;

            return `${color} ${leftPercentage}%, ${color} ${rightPercentage}%`;
        }).join(',');
    };

    const actualChildren: ITimeEntry[] = timeEntry.children || [];

    return <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
        <section className='time-dedicate'>
            <section className='time-dedicate__page'>
                <section className='time-dedicate__title'>
                    {
                        parentId != null ?
                            <Button
                                onClick={() => {
                                    const items: ITimeEntryItems = store.getProjects();
                                    const parentEntry = convertToTimeEntry(items, parentId, true);
                                    if (parentEntry) {
                                        setTimeEntry(parentEntry);
                                        setParentId(items[parentEntry.id].parentId || null);
                                    }
                                }}
                                icon={<RollbackOutlined />}
                                variant='outlined'
                                type='text'
                                shape='circle'/> : null
                    }
                    <EditableText
                        text={timeEntry.name}
                        onChange={(text) => {
                            const newTimeEntry: ITimeEntry = {...timeEntry, name: text};
                            store.updateProject(newTimeEntry.id, newTimeEntry);
                            setTimeEntry(newTimeEntry);
                        }}/>
                </section>
                <section
                    className='time-dedicate__pie-chart'
                    style={{background: 'conic-gradient(' + gradientBg(actualChildren) + ')'}}></section>
                <Slider
                    range={true}
                    value={actualChildren.slice(0, actualChildren.length - 1).map(entry => {
                        percentSum += entry.percentage;
                        return percentSum;
                    })}
                    onChange={(values: number[]) => {
                        const actualChildren: ITimeEntry[] = timeEntry.children || [];
                        [...values, 100].forEach((v, index) => {
                            actualChildren[index].percentage = index > 0 ? v - values[index - 1] : v;
                        });
                        const newTimeEntry: ITimeEntry = { ...timeEntry, children: actualChildren };
                        store.updateProject(newTimeEntry.id, newTimeEntry);
                        setTimeEntry({ ...timeEntry, children: actualChildren });
                    }}
                    styles={{
                        track: { background: 'transparent' },
                        tracks: { background: 'transparent' },
                        rail: { background: 'linear-gradient(to right, ' + gradientBg(actualChildren) + ')' }
                    }}
                />
                <div>
                    <div className='time-dedicate__controls'>
                        <div>
                            <span className='time-dedicate__control-label'>Total </span>
                            <Input
                                style={{ width: '65px' }}
                                value={total}
                                type='number'
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    if (!isNaN(val) && val >= 0) {
                                        setTotal(val);
                                        return;
                                    }
                                    alert('Please enter a valid number');
                                }}/>
                            <Select
                                style={{ width: '100px' }}
                                value={timeUnits}
                                onChange={(value) => {
                                    setTimeUnits(value);
                                    setPerTimeUnit(unitsInAUnit[value as keyof typeof unitsInAUnit].default);
                                }}>
                                <Select.Option value='minute'>Minutes</Select.Option>
                                <Select.Option value='hour'>Hours</Select.Option>
                                <Select.Option value='day'>Days</Select.Option>
                                <Select.Option value='week'>Weeks</Select.Option>
                                <Select.Option value='month'>Months</Select.Option>
                                <Select.Option value='year'>Years</Select.Option>
                            </Select>
                            <span className='time-dedicate__control-label'> per </span>
                            <Select
                                style={{ width: '100px ' }}
                                value={perTimeUnit}
                                onChange={setPerTimeUnit}>
                                {
                                    unitsInAUnit[timeUnits as keyof typeof unitsInAUnit].list.map(unit =>
                                        <Select.Option
                                            key={unit}
                                            value={unit}>
                                            {unit.charAt(0).toUpperCase() + unit.slice(1)}
                                        </Select.Option>
                                    )
                                }
                            </Select>
                        </div>

                        <div style={{ float: 'right' }}>
                            <span className='time-dedicate__control-label'>Add new entry</span>
                            <Button
                                onClick={() => {
                                    let percentage = 0;
                                    const children = [...(timeEntry.children || [])];
                                    if (children.length === 0) {
                                        percentage = 100;
                                    } else {
                                        let maxIndex = 0;
                                        let maxPercentage = 0;
                                        children.forEach(child => {
                                            if (child.percentage > maxPercentage) {
                                                maxPercentage = child.percentage;
                                                maxIndex = children.indexOf(child);
                                            }
                                        });
                                        percentage = Math.floor(maxPercentage / 2);
                                        children[maxIndex].percentage -= percentage;
                                    }
                                    children.push({
                                        id: generateUniqueUUID(),
                                        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                                        name: 'New SubProject' + (children.length + 1),
                                        percentage
                                    });
                                    const newTimeEntry: ITimeEntry = {...timeEntry, children};
                                    store.updateProject(newTimeEntry.id, newTimeEntry);
                                    setTimeEntry(newTimeEntry);
                                }}
                                disabled={timeEntry.children != null && timeEntry.children.length === 15}
                                icon={<PlusOutlined/>}
                                variant='outlined'
                                type='text'
                                shape='circle'/>
                        </div>
                    </div>
                    {
                        actualChildren.map((entry: ITimeEntry, index: number) =>
                            <TimeEntry
                                isLast={index === actualChildren.length - 1}
                                isFirst={index === 0}
                                key={index}
                                timeEntry={entry}
                                moveEntryDown={(ent) => {
                                    const children = [...(timeEntry.children || [])];
                                    const idx = children.indexOf(ent);
                                    if (idx < children.length - 1) {
                                        const temp = children[idx + 1];
                                        children[idx + 1] = children[idx];
                                        children[idx] = temp;
                                        setTimeEntry({...timeEntry, children});
                                    }
                                }}
                                moveEntryUp={(ent) => {
                                    const children: ITimeEntry[] = [...(timeEntry.children || [])];
                                    const idx: number = children.indexOf(ent);
                                    if (idx > 0) {
                                        const temp = children[idx - 1];
                                        children[idx - 1] = children[idx];
                                        children[idx] = temp;
                                        const newTimeEntry: ITimeEntry = { ...timeEntry, children };
                                        store.updateProject(newTimeEntry.id, newTimeEntry);
                                        setTimeEntry({ ...timeEntry, children });
                                    }
                                }}
                                nameChanged={(name: string) => {
                                    const children: ITimeEntry[] = [...(timeEntry.children || [])];
                                    const idx: number = children.indexOf(entry);
                                    children[idx] = {...children[idx], name};
                                    const newTimeEntry = {...timeEntry, children};
                                    store.updateProject(newTimeEntry.id, newTimeEntry);
                                    setTimeEntry({...timeEntry, children});
                                }}
                                goToEntry={(ent: ITimeEntry) => {
                                    const items: ITimeEntryItems = store.getProjects();
                                    setTimeEntry(convertToTimeEntry(items, ent.id, true) as ITimeEntry);
                                    setParentId(items[ent.id].parentId || null);
                                }}
                                deleteEntry={(ent) => {
                                    const children = [...(timeEntry.children || [])];
                                    if (children.length === 1) {
                                        const newTimeEntry = { ...timeEntry, children: [] };
                                        store.updateProject(newTimeEntry.id, newTimeEntry);
                                        setTimeEntry({ ...timeEntry, children: [] });
                                        return;
                                    }
                                    let percentage = ent.percentage;
                                    while (percentage > 0) {
                                        for (let i = 0; i < children.length; i++) {
                                            if (children[i].name !== ent.name && children[i].percentage < 100) {
                                                children[i].percentage++;
                                                percentage--;
                                                if (percentage === 0) {
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                    const newTimeEntry = {
                                        ...timeEntry,
                                        children: children.filter(e => e.id !== ent.id)
                                    };
                                    store.updateProject(newTimeEntry.id, newTimeEntry);
                                    setTimeEntry({
                                        ...timeEntry,
                                        children: children.filter(e => e.name !== ent.name)
                                    });
                                }}
                                timeUnit={timeUnits as TimeUnit}
                                dedicatedTime={total}/>
                        )
                    }
                </div>
            </section>
        </section>
    </ConfigProvider>
}

export default App
