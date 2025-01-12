import React from 'react';
import './style.css';

function DrawButton({ onClick }) {
  return (
    <button onClick={onClick} className='custom-button' style={{ position: 'fixed', top: '10px', right: '10px', }}>
      Draw
    </button>
  );
}

export default DrawButton;
