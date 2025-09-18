import { Button, ColorPicker } from 'antd';
import type { ITimeEntry, TimeUnit } from '../../model.ts';
import { DeleteOutlined, ArrowUpOutlined, ArrowDownOutlined, EnterOutlined } from '@ant-design/icons';
import { Duration } from 'luxon';

import './TimeEntry.css'

import EditableText from '../EditableText/EditableText.tsx';

interface ITimeEntryProps {
    timeEntry: ITimeEntry;
    timeUnit: TimeUnit;
    dedicatedTime: number;
    deleteEntry?: (entry: ITimeEntry) => void;
    moveEntryUp?: (entry: ITimeEntry) => void;
    moveEntryDown?: (entry: ITimeEntry) => void;
    nameChanged?: (name: string) => void;
    goToEntry?: (entry: ITimeEntry) => void;

    isFirst: boolean;
    isLast: boolean;
}

function TimeEntry(props: ITimeEntryProps) {
    const composeDedicatedTime = (dedicatedTime: number, percentage: number, timeUnit: TimeUnit) => {
        let time = (dedicatedTime * percentage) / 100;
        switch (timeUnit) {
            case 'minute':
                time = time * 60;
                break;
            case 'hour':
                time = time * 3600;
                break;
            case 'day':
                time = time * 86400;
                break;
            case 'week':
                time = time * 604800;
                break;
            case 'month':
                time = time * 2592000;
                break;
            case 'year':
                time = time * 31536000;
                break;
        }

        const  d = Duration.fromObject({ second: time }).rescale();

        let result = '';

        if (d.years > 0) {
            result += `${d.years}y `;
        }

        if (d.months > 0) {
            result += `${d.months}m `;
        }

        if (d.weeks > 0) {
            result += `${d.weeks}w `;
        }

        if (d.days > 0) {
            result += `${d.days}d `;
        }

        if (d.hours > 0 || d.minutes > 0) {
            result += `${d.hours.toString().padStart(2, '0')}:${d.minutes.toString().padStart(2, '0')}`;
        }

        return result.trim();

    }

    return (
        <section className='time-entry'>
            <Button
                onClick={() => props.moveEntryUp && props.moveEntryUp(props.timeEntry)}
                disabled={props.isFirst}
                icon={<ArrowUpOutlined />}
                variant='outlined'
                type='text'
                shape='circle'/>
            <Button
                onClick={() => props.moveEntryDown && props.moveEntryDown(props.timeEntry)}
                disabled={props.isLast}
                icon={<ArrowDownOutlined />}
                variant='outlined'
                type='text'
                shape='circle'/>
            <div className='time-entry__color'>
                <ColorPicker value={props.timeEntry.color}/>
            </div>
            <div className='time-entry__details'>
                <div className='time-entry__cell time-entry__cell_name'>
                    <EditableText
                        text={props.timeEntry.name}
                        onChange={(text) => props.nameChanged && props.nameChanged(text)}/>
                </div>
                <div className='time-entry__cell'>{props.timeEntry.percentage}%</div>
                <div className='time-entry__cell time-entry__cell_wide'>
                    {
                        composeDedicatedTime(props.dedicatedTime, props.timeEntry.percentage, props.timeUnit)
                    }
                </div>
            </div>
            <Button
                onClick={() => props.goToEntry && props.goToEntry(props.timeEntry)}
                icon={<EnterOutlined/>}
                variant='outlined'
                type='text'
                shape='circle'/>
            <Button
                onClick={() => props.deleteEntry && props.deleteEntry(props.timeEntry)}
                icon={<DeleteOutlined />}
                variant='outlined'
                type='text'
                shape='circle'/>
        </section>
    )
}

export default TimeEntry;
