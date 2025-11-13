import React from 'react';

const ThreadsBackground: React.FC = () => {
  return (
    <div className="threads-bg">
      {[...Array(10)].map((_, i) => (
        <div key={i} className="thread-line" />
      ))}
    </div>
  );
};

export default ThreadsBackground;
