//react-app\src\components\TopicDialog.jsx
import React, { useState } from 'react';

const TopicDialog = ({ onSubmit, onClose }) => {
  const [topic, setTopic] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault(); 
    console.log('Form submitted:', topic); 

    
    if (topic.trim()) {
      onSubmit(topic.trim()); 
      setTopic(''); 
    } else {
      alert('Please enter a valid topic name.'); 
    }
  };

  return (
    <div className="dialog-overlay">
      <div className="dialog-content">
        <h3>Enter Topic Name</h3>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)} 
            placeholder="Enter topic name"
            autoFocus
          />
          <div className="dialog-buttons">
            <button type="submit">Submit</button> {//calls onSubmit fxn
            }
            <button type="button" onClick={onClose}>Cancel</button> {//call onClose fxn

            }
          </div>
        </form>
      </div>
    </div>
  );
};

export default TopicDialog;
