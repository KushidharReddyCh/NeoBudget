import React from 'react';

const Footer = () => {
  return (
    <div style={{
      width: '99%',
    //   marginLeft: '1%',
    //   marginRight: '1%',
      display: 'flex',
      justifyContent: 'center',
      backgroundColor: 'rgb(39, 40, 40)',
      marginTop: '0px',
      borderTop: '1px solid #e5e7eb',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '1200px',
        padding: '20px',
        color: 'rgb(255, 255, 255)',
        fontSize: '0.9em',
        textAlign: 'center'
      }}>
        © {new Date().getFullYear()} Kushidhar. All rights reserved. kushidhar.dev@gmail.com +91 8688528841

      </div>
    </div>
  );
};

export default Footer; 