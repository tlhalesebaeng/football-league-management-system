import { useState } from 'react';
import Input from '../../utils/Input.jsx';
import pencilImg from '../../assets/pencil.png';
import closeImg from '../../assets/close.png';
import './EditField.css';

// tag allows us to render an dynamic jsx tag
const EditField = ({ name, tag: Tag = 'p' }) => {
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState(name);

    const handleChange = (value) => {
        setInputValue(value);
    };

    if (showInput) {
        return (
            <section className="edit-field">
                <Input
                    onInputChange={(event) => handleChange(event.target.value)}
                    placeholder={name}
                    value={inputValue}
                />
                <img onClick={() => setShowInput(false)} src={closeImg} />
            </section>
        );
    }

    return (
        <div className="edit-field">
            <Tag>{inputValue || name}</Tag>
            <img onClick={() => setShowInput(true)} src={pencilImg} />
        </div>
    );
};

export default EditField;
