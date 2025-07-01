import React from 'react';

const CountdownCircle = ({ remaining }) => {
  const getColor = () => {
    if (remaining > 10) return '#28a745';
    if (remaining > 5) return '#ffc107';
    return '#dc3545';
  };

  return (
    <div 
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        backgroundColor: getColor(),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
        color: 'white',
        margin: '0 auto'
      }}
    >
      {remaining}
    </div>
  );
};

export default CountdownCircle;