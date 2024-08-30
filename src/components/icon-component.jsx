import React, { useEffect, useState } from 'react';
import { mqttSub, mqttUnsub } from '../Subscribe';

import Icon1Grey from '../icons/icon-grey.svg';
import Icon1Red from '../icons/icon-red.svg';
import Icon1Blue from '../icons/icon-blue.svg';
import Icon1Green from '../icons/icon-green.svg';

import Icon2Grey from '../icons/hangout-grey.svg';
import Icon2Red from '../icons/hangout-red.svg';
import Icon2Blue from '../icons/hangout-blue.svg';
import Icon2Green from '../icons/hangout-green.svg';

import Icon3Grey from '../icons/planner-grey.svg';
import Icon3Red from '../icons/planner-red.svg';
import Icon3Blue from '../icons/planner-blue.svg';
import Icon3Green from '../icons/planner-green.svg';

const iconMapping = {
  'icon1': {
    grey: Icon1Grey,
    red: Icon1Red,
    blue: Icon1Blue,
    green: Icon1Green,
  },
  'icon2': {
    grey: Icon2Grey,
    red: Icon2Red,
    blue: Icon2Blue,
    green: Icon2Green,
  },
  'icon3': {
    grey: Icon3Grey,
    red: Icon3Red,
    blue: Icon3Blue,
    green: Icon3Green,
  },
};

const IconComponent = ({ topic, hoverText, latestValue, position, onPositionChange }) => {
  const [icon, setIcon] = useState(null); 
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const iconKey = topic.split('/')[0];
    if (iconMapping[iconKey]) {
      setIcon(iconMapping[iconKey].grey);
    } else {
      console.error(`Icon mapping for topic "${topic}" not found.`);
    }
  }, [topic]);

  useEffect(() => {
    if (isSubscribed) {
      const handleMessage = (receivedTopic, message) => {
        if (receivedTopic === topic) {
          const value = parseFloat(message);
          updateIconColor(value);
        }
      };

      mqttSub(topic, handleMessage);

      return () => {
        mqttUnsub(topic);
        setIsSubscribed(false);
        setIcon(iconMapping[topic.split('/')[0]]?.grey);
      };
    }
  }, [isSubscribed, topic]);

  useEffect(() => {
    if (latestValue !== null) {
      updateIconColor(latestValue);
    }
  }, [latestValue]);

  const updateIconColor = (value) => {
    const iconKey = topic.split('/')[0];
    if (!iconMapping[iconKey]) {
      console.error(`Icon mapping for topic "${topic}" not found.`);
      return;
    }

    if (value >= 0 && value <= 30) {
      setIcon(iconMapping[iconKey]?.red);
    } else if (value >= 31 && value <= 70) {
      setIcon(iconMapping[iconKey]?.blue);
    } else if (value > 70) {
      setIcon(iconMapping[iconKey]?.green);
    } else {
      setIcon(iconMapping[iconKey]?.grey);
    }
  };

  const handleIconClick = () => {
    if (!isSubscribed) {
      setIsSubscribed(true);
      console.log(`Subscribed to topic: ${topic}`);
    }
  };

  const handleUnsubscribe = () => {
    mqttUnsub(topic);
    setIsSubscribed(false);
    setIcon(iconMapping[topic.split('/')[0]]?.grey);
  };

  const handleDragStart = (event) => {
    event.dataTransfer.setData('icon', JSON.stringify({ icon, topic }));
  };

  const handleDrag = (event) => {
    const x = event.clientX;
    const y = event.clientY;
    onPositionChange({ x, y });
  };

  return (
    <div
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        cursor: 'move',
      }}
      draggable
      onDrag={(e) => handleDrag(e)}
      onDragEnd={(e) => handleDrag(e)}
    >
      {icon ? (
        <img
          src={icon}
          alt="Icon"
          style={{ width: '50px', height: '50px', cursor: 'pointer' }}
          onClick={handleIconClick}
          title={hoverText}
        />
      ) : (
        <div style={{ width: '50px', height: '50px', backgroundColor: 'grey' }} title="Icon not found" />
      )}
      <p style={{ margin: '5px 0' }}>{latestValue !== null ? latestValue : 'No Data'}</p>
      {isSubscribed && (
        <button
          className="unsubscribeButton"
          onClick={handleUnsubscribe}
          style={{ position: 'absolute', bottom: '-30px' }}
        >
          Unsubscribe
        </button>
      )}
    </div>
  );
};

export default IconComponent;
