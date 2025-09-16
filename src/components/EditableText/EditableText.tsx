import { useState } from 'react';
import { Button, Input } from 'antd';
import { EditOutlined, CheckOutlined, CloseOutlined } from '@ant-design/icons';

import './EditableText.css';

interface IEditableTextProps {
    text: string;
    size?: 'small' | 'middle' | 'large';
    isEditing?: boolean;
    onChange?: (newText: string) => void;
}

function EditableText(props: IEditableTextProps) {
    const [isEditing, setIsEditing] = useState(props.isEditing || false);
    const [value, setValue] = useState(props.text);
    if (isEditing) {
        return <div className={'editable-text editable-text_' + (props.size || 'middle')}>
            <Input
                value={value}
                className='editable-text__grow'
                size={props.size || 'middle'}
                variant='borderless'
                onChange={(e) => setValue(e.target.value)}/>
            <Button
                onClick={() => {
                    setIsEditing(!isEditing);
                    props.onChange && props.onChange(value);
                }}
                icon={<CheckOutlined/>}
                variant='outlined'
                type='text'
                shape='circle'/>
            <Button
                onClick={() => {
                    setIsEditing(false);
                }}
                icon={<CloseOutlined/>}
                variant='outlined'
                type='text'
                shape='circle'/>
        </div>
    }
    return <div className={'editable-text editable-text_' + (props.size || 'middle')}>
        <div className='editable-text__text editable-text__grow'>{props.text}</div>
        <Button
            onClick={() => {
                setIsEditing(!isEditing);
            }}
            icon={<EditOutlined/>}
            variant='outlined'
            type='text'
            shape='circle'/>
    </div>
}

export default EditableText;
