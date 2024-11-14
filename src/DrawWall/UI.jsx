import React, { useEffect } from 'react';
import { useAtom } from 'jotai';
import { is2DAtom, newLineAtom } from './utils/jotai';

const UI = () => {
  const [is2D, setIs2D] = useAtom(is2DAtom);
  const [newLine, setNewLine] = useAtom(newLineAtom);

  return (
    <div className='fixed top-0 right-0  p-4 bg-purple-500 m-2 rounded-lg shadow-lg text-white'>
      <div className='flex justify-center  items-center '>
        <label className="flex items-center">
          <input
            type="radio"
            name="view"
            value="2D"
            checked={is2D}
            onChange={() => setIs2D(true)}
            className="w-6 h-6 mr-2 cursor-pointer" // Increased size
          />
          2D
        </label>
        <label className="flex items-center ml-4">
          <input
            type="radio"
            name="view"
            value="3D"
            checked={!is2D}
            onChange={() => setIs2D(false)}
            className="w-6 h-6 mr-2 cursor-pointer" // Increased size
          />
          3D
        </label>
      </div>
      <div>
        <button
          className='w-full px-4 py-2 bg-green-600 hover:bg-green-800 rounded-lg text-white mt-2 shadow-md'
          onClick={() => setNewLine(true)} // Add your handler here
        >
          New Line
        </button>
      </div>
    </div>
  );
};

export default UI;
