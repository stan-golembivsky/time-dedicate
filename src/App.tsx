import { useState } from 'react';

import { PlusOutlined } from '@ant-design/icons';
import { Slider, ConfigProvider, theme, Button, Select, Input } from 'antd';
import {type ITimeEntry, type TimeUnit, unitsInAUnit} from './model.ts';

import TimeEntry from './components/TimeEntry/TimeEntry.tsx';
import EditableText from './components/EditableText/EditableText.tsx';

import './App.css';

const testData: ITimeEntry = {
    color: '#ff0000',
    name: 'The Project',
    percentage: 100,
    children: [
        {
            color: '#b93232',
            name: 'Sub Project#1',
            percentage: 50,
        },
        {
            color: '#1e3373',
            name: 'Sub Project#2',
            percentage: 30,
        },
        {
            color: '#345227',
            name: 'Sub Project#3',
            percentage: 10,
        },
        {
            color: '#b99c20',
            name: 'Sub Project#4',
            percentage: 10,
        }
    ]
};

function App() {

    const [timeEntry, stTimeEntry] = useState(testData);
    const [total, setTotal] = useState(10);
    const [timeUnits, setTimeUnits] = useState('hour');
    const [perTimeUnit, setPerTimeUnit] = useState('week');

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
                    <EditableText
                        text={timeEntry.name}
                        onChange={(text) => {
                            stTimeEntry({...timeEntry, name: text});
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
                        stTimeEntry({ ...timeEntry, children: actualChildren });
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
                                style={ {width: '100px' }}
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
                            <span className='time-dedicate__control-label'>Add new entry </span>
                            <Button
                                onClick={() => {
                                    let percentage = 0;
                                    const children = [...(timeEntry.children || [])];
                                    if (children.length === 0) {
                                        percentage = 100;
                                    } else {
                                        children.forEach(entry => {
                                            if (entry.percentage > 1) {
                                                entry.percentage -= 1;
                                                percentage++;
                                            }
                                        });
                                    }
                                    children.push({
                                        color: '#' + Math.floor(Math.random() * 16777215).toString(16),
                                        name: 'New Entry',
                                        percentage
                                    });
                                    stTimeEntry({...timeEntry, children});
                                }}
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
                                        stTimeEntry({...timeEntry, children});
                                    }
                                }}
                                moveEntryUp={(ent) => {
                                    const children = [...(timeEntry.children || [])];
                                    const idx = children.indexOf(ent);
                                    if (idx > 0) {
                                        const temp = children[idx - 1];
                                        children[idx - 1] = children[idx];
                                        children[idx] = temp;
                                        stTimeEntry({...timeEntry, children});
                                    }
                                }}
                                nameChanged={(name: string) => {
                                    const children = [...(timeEntry.children || [])];
                                    const idx = children.indexOf(entry);
                                    children[idx] = {...children[idx], name};
                                    stTimeEntry({...timeEntry, children});
                                }}
                                deleteEntry={(ent) => {
                                    const children = [...(timeEntry.children || [])];
                                    if (children.length === 1) {
                                        stTimeEntry({
                                            ...timeEntry,
                                            children: []
                                        });
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
                                    stTimeEntry({
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
