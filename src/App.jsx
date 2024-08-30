import React, { useState, useEffect, useRef } from 'react';
import IconComponent from './components/icon-component';
import { initializeClient, mqttSub, mqttUnsub } from './Subscribe';
import icon1 from './icons/icon-grey.svg';
import icon2 from './icons/hangout-grey.svg';
import icon3 from './icons/planner-grey.svg';

// Example icon mapping
const iconMapping = {
  'icon1': { grey: icon1 },
  'icon2': { grey: icon2 },
  'icon3': { grey: icon3 },
};

function App() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [subscribedTopics, setSubscribedTopics] = useState([]);
  const [droppedIcons, setDroppedIcons] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    initializeClient();
  }, []);

  useEffect(() => {
    if (dialogOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [dialogOpen]);

  const handleTopicChange = (event) => {
    setNewTopic(event.target.value);
  };

  const handleSubscribe = () => {
    if (newTopic && !subscribedTopics.includes(newTopic)) {
      setSubscribedTopics((prevTopics) => [...prevTopics, newTopic]);
      mqttSub(newTopic, (receivedTopic, message) => {
        const value = parseFloat(message);
        setDroppedIcons((prev) =>
          prev.map((icon) =>
            icon.topic === receivedTopic
              ? { ...icon, latestValue: value }
              : icon
          )
        );
      });
    }
  };

  const handleUnsubscribe = (topicToUnsubscribe) => {
    setSubscribedTopics((prevTopics) => prevTopics.filter((t) => t !== topicToUnsubscribe));
    setDroppedIcons((prev) => prev.filter((icon) => icon.topic !== topicToUnsubscribe));
    mqttUnsub(topicToUnsubscribe);
  };

  const handleDragStart = (event, icon) => {
    event.dataTransfer.setData('icon', JSON.stringify(icon));
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const icon = JSON.parse(event.dataTransfer.getData('icon'));
    const dropBoxRect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - dropBoxRect.left;
    const y = event.clientY - dropBoxRect.top;

    if (icon) {
      setIcons((prev) => [...prev, { topic: "", icon: selectedIcon }])
      setSelectedIcon({ ...icon, position: { x, y }, topic: '' });
      setDialogOpen(true);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleIconContextMenu = (event) => {
    event.preventDefault();
  };

  const handleTopicSubmit = () => {
    if (selectedIcon && newTopic.trim()) {
      setIcons()
      const iconKey = selectedIcon.icon.includes('icon1') ? 'icon1' : selectedIcon.icon.includes('icon2') ? 'icon2' : 'icon3';

      const mappedIcon = iconMapping[iconKey]?.grey || selectedIcon.icon;

      console.log('iconKey:', iconKey);
      console.log('mappedIcon:', mappedIcon);

      setDroppedIcons((prev) => [
        ...prev,
        { ...selectedIcon, topic: newTopic.trim(), icon: mappedIcon, id: Date.now() },
      ]);

      if (!subscribedTopics.includes(newTopic.trim())) {
        setSubscribedTopics((prevTopics) => [...prevTopics, newTopic.trim()]);
        mqttSub(newTopic.trim(), (receivedTopic, message) => {
          const value = parseFloat(message);
          setDroppedIcons((prev) =>
            prev.map((droppedIcon) =>
              droppedIcon.topic === receivedTopic
                ? { ...droppedIcon, latestValue: value }
                : droppedIcon
            )
          );
        });
      }
    }
    setDialogOpen(false);
    setNewTopic('');
  };

  const TopicDialog = ({ open, onClose, onSubmit }) => (
    open ? (
      <div className="dialog-overlay">
        <div className="dialog-content">
          <h2>Enter Topic Name</h2>
          <input
            ref={inputRef}
            type="text"
            value={newTopic}
            onChange={handleTopicChange}
            autoFocus
          />
          <button onClick={handleTopicSubmit} className='dialogBoxSubmitButton'> Submit </button>
          <button onClick={onClose} className='dialogBoxCancelButton'> Cancel </button>
        </div>
      </div>
    ) : null
  );

  return (
    <div className="App">
      <div className="subscription-container">
        <h1>MQTT Subscription</h1>
        <input
          type="text"
          placeholder="Enter topic to subscribe"
          value={newTopic}
          onChange={handleTopicChange}
        />
        <button className="subscribeButton" onClick={handleSubscribe}> Subscribe </button>
      </div>

      <div className="drag-container">
        <img
          src={icon1}
          alt="icon-1"
          draggable
          onDragStart={(event) => handleDragStart(event, { icon: icon1, topic: 'temporary' })}
          onContextMenu={handleIconContextMenu}
        />
        <img
          src={icon2}
          alt="icon-2"
          draggable
          onDragStart={(event) => handleDragStart(event, { icon: icon2, topic: 'temporary' })}
          onContextMenu={handleIconContextMenu}
        />
        <img
          src={icon3}
          alt="icon-3"
          draggable
          onDragStart={(event) => handleDragStart(event, { icon: icon3, topic: 'temporary' })}
          onContextMenu={handleIconContextMenu}
        />
      </div>

      <div
        className="dropbox"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <h3>Drop Icons Here</h3>
        {droppedIcons.map((icon) => (
          <IconComponent
            key={icon.id}
            topic={icon.topic}
            hoverText={`Topic: ${icon.topic}`}
            latestValue={icon.latestValue}
            position={icon.position}
            icon={icon.topic ? icon.icon : icon1}
            onPositionChange={(newPosition) => handleIconPositionChange(icon.id, newPosition)}
          />
        ))}
      </div>

      {subscribedTopics.length > 0 && (
        <div>
          <h3>Subscribed Topics</h3>
          {subscribedTopics.map((subscribedTopic, index) => (
            <div key={index}>
              <span>{subscribedTopic}</span>
              <button
                className="unsubscribeButton"
                onClick={() => handleUnsubscribe(subscribedTopic)}
              >
                Unsubscribe
              </button>
            </div>
          ))}
        </div>
      )}

      <TopicDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSubmit={handleTopicSubmit}
      />
    </div>
  );
}

export default App;